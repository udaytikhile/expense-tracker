import sqlite3
from flask import Blueprint, request, jsonify
from datetime import date, datetime, timedelta
from config.settings import DB_PATH

recurring_bp = Blueprint('recurring', __name__)

@recurring_bp.route('/api/recurring', methods=['GET'])
def get_recurring():
    user_id = request.args.get('user_id', 0)
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        "SELECT id, category, amount, note, frequency, next_date, active FROM recurring_expenses WHERE user_id=? ORDER BY next_date",
        (user_id,)
    ).fetchall()
    conn.close()
    return jsonify([{
        "id": r[0], "category": r[1], "amount": r[2], "note": r[3],
        "frequency": r[4], "next_date": r[5], "active": bool(r[6])
    } for r in rows])

@recurring_bp.route('/api/recurring', methods=['POST'])
def add_recurring():
    data = request.json
    if not data:
        return jsonify({"error": "Missing request payload"}), 400

    required = ['category', 'amount', 'next_date']
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    try:
        amount = float(data['amount'])
        if amount <= 0:
            return jsonify({"error": "Amount must be a positive number greater than 0"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Amount must be a valid number"}), 400

    next_date = data['next_date']
    try:
        from datetime import datetime
        datetime.strptime(next_date, '%Y-%m-%d')
    except (ValueError, TypeError):
        return jsonify({"error": "next_date must be in YYYY-MM-DD format"}), 400

    freq = data.get('frequency', 'monthly')
    if freq not in ['daily', 'weekly', 'monthly']:
        return jsonify({"error": "frequency must be daily, weekly, or monthly"}), 400

    user_id = data.get('user_id', 0)
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT INTO recurring_expenses (user_id, category, amount, note, frequency, next_date) VALUES (?, ?, ?, ?, ?, ?)",
        (user_id, data['category'], amount, data.get('note', ''), freq, next_date)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Recurring expense added"}), 201

@recurring_bp.route('/api/recurring/<int:id>', methods=['DELETE'])
def delete_recurring(id):
    user_id = request.args.get('user_id', 0)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM recurring_expenses WHERE id=? AND user_id=?", (id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Recurring expense deleted"})

@recurring_bp.route('/api/recurring/<int:id>/toggle', methods=['PUT'])
def toggle_recurring(id):
    user_id = request.args.get('user_id', 0)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("UPDATE recurring_expenses SET active = NOT active WHERE id=? AND user_id=?", (id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Toggled"})

@recurring_bp.route('/api/recurring/process', methods=['POST'])
def process_recurring():
    user_id = request.json.get('user_id', 0) if request.json else 0
    today = date.today().isoformat()
    conn = sqlite3.connect(DB_PATH)
    due = conn.execute(
        "SELECT id, category, amount, note, frequency, next_date FROM recurring_expenses WHERE user_id=? AND active=1 AND next_date <= ?",
        (user_id, today)
    ).fetchall()

    added = 0
    for r in due:
        rid, cat, amt, note, freq, nd = r
        conn.execute("INSERT INTO expenses (user_id, date, category, amount, note) VALUES (?, ?, ?, ?, ?)",
                     (user_id, nd, cat, amt, f"[Recurring] {note or ''}"))
        nd_date = datetime.strptime(nd, '%Y-%m-%d').date()
        if freq == 'daily':
            next_d = nd_date + timedelta(days=1)
        elif freq == 'weekly':
            next_d = nd_date + timedelta(weeks=1)
        else:
            month = nd_date.month + 1
            year = nd_date.year
            if month > 12:
                month = 1
                year += 1
            day = min(nd_date.day, 28)
            next_d = nd_date.replace(year=year, month=month, day=day)
        conn.execute("UPDATE recurring_expenses SET next_date=? WHERE id=?", (next_d.isoformat(), rid))
        added += 1

    if added > 0:
        conn.execute("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
                     (user_id, f"✅ {added} recurring expense(s) processed", "success"))

    conn.commit()
    conn.close()
    return jsonify({"message": f"{added} recurring expenses processed", "added": added})
