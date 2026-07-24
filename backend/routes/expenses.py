import sqlite3
from flask import Blueprint, request, jsonify
from datetime import date
from config.settings import DB_PATH

expenses_bp = Blueprint('expenses', __name__)

@expenses_bp.route('/api/expenses', methods=['GET'])
def get_expenses():
    user_id = request.args.get('user_id', 0)
    start = request.args.get('start')
    end = request.args.get('end')
    cat = request.args.get('category')
    search = request.args.get('search')

    conn = sqlite3.connect(DB_PATH)
    q = "SELECT id, date, category, amount, note FROM expenses WHERE user_id=?"
    params = [user_id]
    if start:
        q += " AND date >= ?"
        params.append(start)
    if end:
        q += " AND date <= ?"
        params.append(end)
    if cat and cat != "All":
        q += " AND category = ?"
        params.append(cat)
    if search:
        q += " AND (note LIKE ? OR category LIKE ?)"
        params.extend([f'%{search}%', f'%{search}%'])
    q += " ORDER BY date DESC, id DESC"

    rows = conn.execute(q, params).fetchall()
    conn.close()

    expenses = [{"id": r[0], "date": r[1], "category": r[2], "amount": r[3], "note": r[4]} for r in rows]
    return jsonify(expenses)

@expenses_bp.route('/api/expenses', methods=['POST'])
def add_expense():
    data = request.json
    user_id = data.get('user_id', 0)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("INSERT INTO expenses (user_id, date, category, amount, note) VALUES (?, ?, ?, ?, ?)",
                 (user_id, data['date'], data['category'], data['amount'], data.get('note', '')))
    conn.commit()

    # Check budgets and create notifications
    month = data['date'][:7]
    budgets = conn.execute(
        "SELECT category, limit_amount FROM budgets WHERE user_id=? AND month=?",
        (user_id, month)
    ).fetchall()
    for b in budgets:
        if b[0] == data['category']:
            spent = conn.execute(
                "SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE user_id=? AND category=? AND strftime('%Y-%m', date)=?",
                (user_id, b[0], month)
            ).fetchone()[0]
            pct = (spent / b[1]) * 100 if b[1] > 0 else 0
            if pct >= 100:
                conn.execute("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
                             (user_id, f"🚨 Budget exceeded for {b[0]}! Spent ₹{spent:.0f} of ₹{b[1]:.0f}", "danger"))
            elif pct >= 80:
                conn.execute("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
                             (user_id, f"⚠️ {b[0]} budget at {pct:.0f}% — ₹{spent:.0f} of ₹{b[1]:.0f}", "warning"))
    conn.commit()
    conn.close()
    return jsonify({"message": "Expense added successfully"}), 201

@expenses_bp.route('/api/expenses/<int:id>', methods=['PUT'])
def update_expense(id):
    data = request.json
    user_id = data.get('user_id', 0)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("UPDATE expenses SET date=?, category=?, amount=?, note=? WHERE id=? AND user_id=?",
                 (data['date'], data['category'], data['amount'], data.get('note', ''), id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Expense updated successfully"})

@expenses_bp.route('/api/expenses/<int:id>', methods=['DELETE'])
def delete_expense(id):
    user_id = request.args.get('user_id', 0)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM expenses WHERE id=? AND user_id=?", (id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Expense deleted successfully"})

@expenses_bp.route('/api/summary', methods=['GET'])
def get_summary():
    user_id = request.args.get('user_id', 0)
    start = request.args.get('start')
    end = request.args.get('end')

    conn = sqlite3.connect(DB_PATH)
    q = "SELECT category, SUM(amount) FROM expenses WHERE user_id=?"
    params = [user_id]
    if start:
        q += " AND date >= ?"
        params.append(start)
    if end:
        q += " AND date <= ?"
        params.append(end)
    q += " GROUP BY category ORDER BY SUM(amount) DESC"

    rows = conn.execute(q, params).fetchall()
    conn.close()

    summary = [{"category": r[0], "total": r[1]} for r in rows]
    return jsonify(summary)

@expenses_bp.route('/api/monthly', methods=['GET'])
def get_monthly():
    user_id = request.args.get('user_id', 0)
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        "SELECT strftime('%Y-%m', date) as m, SUM(amount) FROM expenses WHERE user_id=? "
        "GROUP BY m ORDER BY m DESC LIMIT 12",
        (user_id,)
    ).fetchall()
    conn.close()
    monthly = [{"month": r[0], "total": r[1]} for r in reversed(rows)]
    return jsonify(monthly)

@expenses_bp.route('/api/daily', methods=['GET'])
def get_daily():
    user_id = request.args.get('user_id', 0)
    days = int(request.args.get('days', 30))
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        "SELECT date, SUM(amount) FROM expenses "
        "WHERE user_id=? AND date >= date('now', ?) "
        "GROUP BY date ORDER BY date",
        (user_id, f'-{days} days')
    ).fetchall()
    conn.close()
    return jsonify([{"date": r[0], "total": r[1]} for r in rows])
