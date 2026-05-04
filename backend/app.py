import sqlite3
import os
import csv
import io
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from datetime import datetime, date, timedelta
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.expanduser("~"), "expenses.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id  INTEGER NOT NULL DEFAULT 0,
            date     TEXT    NOT NULL,
            category TEXT    NOT NULL,
            amount   REAL    NOT NULL,
            note     TEXT,
            created  TEXT    DEFAULT (datetime('now'))
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS budgets (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL DEFAULT 0,
            category    TEXT    NOT NULL,
            limit_amount REAL   NOT NULL,
            month       TEXT    NOT NULL,
            created     TEXT    DEFAULT (datetime('now')),
            UNIQUE(user_id, category, month)
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS income (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id  INTEGER NOT NULL DEFAULT 0,
            date     TEXT    NOT NULL,
            source   TEXT    NOT NULL,
            amount   REAL    NOT NULL,
            note     TEXT,
            created  TEXT    DEFAULT (datetime('now'))
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS recurring_expenses (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL DEFAULT 0,
            category    TEXT    NOT NULL,
            amount      REAL    NOT NULL,
            note        TEXT,
            frequency   TEXT    NOT NULL DEFAULT 'monthly',
            next_date   TEXT    NOT NULL,
            active      INTEGER NOT NULL DEFAULT 1,
            created     TEXT    DEFAULT (datetime('now'))
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            name     TEXT    NOT NULL,
            email    TEXT    NOT NULL UNIQUE,
            password TEXT    NOT NULL,
            currency TEXT    NOT NULL DEFAULT 'INR',
            created  TEXT    DEFAULT (datetime('now'))
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id  INTEGER NOT NULL,
            message  TEXT    NOT NULL,
            type     TEXT    NOT NULL DEFAULT 'info',
            read     INTEGER NOT NULL DEFAULT 0,
            created  TEXT    DEFAULT (datetime('now'))
        )
    """)
    # Migrate existing tables — add user_id if missing
    for table in ['expenses', 'budgets', 'income', 'recurring_expenses']:
        try:
            c.execute(f"ALTER TABLE {table} ADD COLUMN user_id INTEGER NOT NULL DEFAULT 0")
        except:
            pass  # column already exists
    # Add currency to users if missing
    try:
        c.execute("ALTER TABLE users ADD COLUMN currency TEXT NOT NULL DEFAULT 'INR'")
    except:
        pass
    conn.commit()
    conn.close()

init_db()

# ══════════════════════════════════════════════════════════════════════════════
# AUTHENTICATION
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    conn = sqlite3.connect(DB_PATH)
    existing = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if existing:
        conn.close()
        return jsonify({"error": "Email already registered"}), 409

    hashed = generate_password_hash(password)
    cur = conn.execute("INSERT INTO users (name, email, password, currency) VALUES (?, ?, ?, ?)",
                       (name, email, hashed, 'INR'))
    user_id = cur.lastrowid
    conn.commit()
    conn.close()
    return jsonify({"id": user_id, "name": name, "email": email, "currency": "INR"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = sqlite3.connect(DB_PATH)
    row = conn.execute("SELECT id, name, email, password, currency FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()

    if not row or not check_password_hash(row[3], password):
        return jsonify({"error": "Invalid email or password"}), 401

    return jsonify({"id": row[0], "name": row[1], "email": row[2], "currency": row[4]})

# ══════════════════════════════════════════════════════════════════════════════
# USER PROFILE
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/api/user/profile', methods=['PUT'])
def update_profile():
    data = request.json
    user_id = data.get('user_id')
    name = data.get('name', '').strip()
    currency = data.get('currency', 'INR')

    if not user_id or not name:
        return jsonify({"error": "User ID and name are required"}), 400

    valid_currencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY']
    if currency not in valid_currencies:
        return jsonify({"error": f"Currency must be one of: {', '.join(valid_currencies)}"}), 400

    conn = sqlite3.connect(DB_PATH)
    conn.execute("UPDATE users SET name=?, currency=? WHERE id=?", (name, currency, user_id))
    conn.commit()
    row = conn.execute("SELECT id, name, email, currency FROM users WHERE id=?", (user_id,)).fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"id": row[0], "name": row[1], "email": row[2], "currency": row[3]})

# ══════════════════════════════════════════════════════════════════════════════
# NOTIFICATIONS
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify([])
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        "SELECT id, message, type, read, created FROM notifications WHERE user_id=? ORDER BY created DESC LIMIT 50",
        (user_id,)
    ).fetchall()
    conn.close()
    return jsonify([{"id": r[0], "message": r[1], "type": r[2], "read": bool(r[3]), "created": r[4]} for r in rows])

@app.route('/api/notifications', methods=['POST'])
def add_notification():
    data = request.json
    conn = sqlite3.connect(DB_PATH)
    conn.execute("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
                 (data['user_id'], data['message'], data.get('type', 'info')))
    conn.commit()
    conn.close()
    return jsonify({"message": "Notification added"}), 201

@app.route('/api/notifications/<int:nid>/read', methods=['PUT'])
def mark_notification_read(nid):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("UPDATE notifications SET read=1 WHERE id=?", (nid,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Marked as read"})

@app.route('/api/notifications/clear', methods=['DELETE'])
def clear_notifications():
    user_id = request.args.get('user_id')
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM notifications WHERE user_id=?", (user_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "All notifications cleared"})

# ══════════════════════════════════════════════════════════════════════════════
# EXPENSES
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/api/expenses', methods=['GET'])
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

@app.route('/api/expenses', methods=['POST'])
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

@app.route('/api/expenses/<int:id>', methods=['PUT'])
def update_expense(id):
    data = request.json
    user_id = data.get('user_id', 0)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("UPDATE expenses SET date=?, category=?, amount=?, note=? WHERE id=? AND user_id=?",
                 (data['date'], data['category'], data['amount'], data.get('note', ''), id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Expense updated successfully"})

@app.route('/api/expenses/<int:id>', methods=['DELETE'])
def delete_expense(id):
    user_id = request.args.get('user_id', 0)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM expenses WHERE id=? AND user_id=?", (id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Expense deleted successfully"})

# ══════════════════════════════════════════════════════════════════════════════
# SUMMARY & MONTHLY
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/api/summary', methods=['GET'])
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

@app.route('/api/monthly', methods=['GET'])
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

@app.route('/api/daily', methods=['GET'])
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

# ══════════════════════════════════════════════════════════════════════════════
# BUDGETS
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/api/budgets', methods=['GET'])
def get_budgets():
    user_id = request.args.get('user_id', 0)
    month = request.args.get('month', date.today().strftime('%Y-%m'))
    conn = sqlite3.connect(DB_PATH)

    budgets = conn.execute(
        "SELECT id, category, limit_amount, month FROM budgets WHERE user_id=? AND month = ?", (user_id, month)
    ).fetchall()

    result = []
    for b in budgets:
        spent = conn.execute(
            "SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE user_id=? AND category = ? AND strftime('%Y-%m', date) = ?",
            (user_id, b[1], month)
        ).fetchone()[0]
        result.append({
            "id": b[0], "category": b[1], "limit_amount": b[2],
            "month": b[3], "spent": spent,
            "percentage": round((spent / b[2]) * 100, 1) if b[2] > 0 else 0
        })

    conn.close()
    return jsonify(result)

@app.route('/api/budgets', methods=['POST'])
def save_budget():
    data = request.json
    user_id = data.get('user_id', 0)
    month = data.get('month', date.today().strftime('%Y-%m'))
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT OR REPLACE INTO budgets (user_id, category, limit_amount, month) VALUES (?, ?, ?, ?)",
        (user_id, data['category'], data['limit_amount'], month)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Budget saved"}), 201

@app.route('/api/budgets/<int:id>', methods=['DELETE'])
def delete_budget(id):
    user_id = request.args.get('user_id', 0)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM budgets WHERE id=? AND user_id=?", (id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Budget deleted"})

# ══════════════════════════════════════════════════════════════════════════════
# INCOME
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/api/income', methods=['GET'])
def get_income():
    user_id = request.args.get('user_id', 0)
    start = request.args.get('start')
    end = request.args.get('end')

    conn = sqlite3.connect(DB_PATH)
    q = "SELECT id, date, source, amount, note FROM income WHERE user_id=?"
    params = [user_id]
    if start:
        q += " AND date >= ?"
        params.append(start)
    if end:
        q += " AND date <= ?"
        params.append(end)
    q += " ORDER BY date DESC, id DESC"

    rows = conn.execute(q, params).fetchall()
    conn.close()
    return jsonify([{"id": r[0], "date": r[1], "source": r[2], "amount": r[3], "note": r[4]} for r in rows])

@app.route('/api/income', methods=['POST'])
def add_income():
    data = request.json
    user_id = data.get('user_id', 0)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("INSERT INTO income (user_id, date, source, amount, note) VALUES (?, ?, ?, ?, ?)",
                 (user_id, data['date'], data['source'], data['amount'], data.get('note', '')))
    conn.commit()
    conn.close()
    return jsonify({"message": "Income added"}), 201

@app.route('/api/income/<int:id>', methods=['DELETE'])
def delete_income(id):
    user_id = request.args.get('user_id', 0)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM income WHERE id=? AND user_id=?", (id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Income deleted"})

@app.route('/api/income/summary', methods=['GET'])
def income_summary():
    user_id = request.args.get('user_id', 0)
    start = request.args.get('start')
    end = request.args.get('end')

    conn = sqlite3.connect(DB_PATH)
    q_income = "SELECT COALESCE(SUM(amount), 0) FROM income WHERE user_id=?"
    q_expense = "SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE user_id=?"
    params = [user_id]
    if start:
        q_income += " AND date >= ?"
        q_expense += " AND date >= ?"
        params.append(start)
    if end:
        q_income += " AND date <= ?"
        q_expense += " AND date <= ?"
        params.append(end)

    total_income = conn.execute(q_income, params).fetchone()[0]
    total_expense = conn.execute(q_expense, params).fetchone()[0]
    conn.close()

    return jsonify({
        "total_income": total_income,
        "total_expense": total_expense,
        "net_savings": total_income - total_expense
    })

# ══════════════════════════════════════════════════════════════════════════════
# RECURRING EXPENSES
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/api/recurring', methods=['GET'])
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

@app.route('/api/recurring', methods=['POST'])
def add_recurring():
    data = request.json
    user_id = data.get('user_id', 0)
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT INTO recurring_expenses (user_id, category, amount, note, frequency, next_date) VALUES (?, ?, ?, ?, ?, ?)",
        (user_id, data['category'], data['amount'], data.get('note', ''), data.get('frequency', 'monthly'), data['next_date'])
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Recurring expense added"}), 201

@app.route('/api/recurring/<int:id>', methods=['DELETE'])
def delete_recurring(id):
    user_id = request.args.get('user_id', 0)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM recurring_expenses WHERE id=? AND user_id=?", (id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Recurring expense deleted"})

@app.route('/api/recurring/<int:id>/toggle', methods=['PUT'])
def toggle_recurring(id):
    user_id = request.args.get('user_id', 0)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("UPDATE recurring_expenses SET active = NOT active WHERE id=? AND user_id=?", (id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Toggled"})

@app.route('/api/recurring/process', methods=['POST'])
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

# ══════════════════════════════════════════════════════════════════════════════
# EXPORT
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/api/export/csv', methods=['GET'])
def export_csv():
    user_id = request.args.get('user_id', 0)
    start = request.args.get('start')
    end = request.args.get('end')

    conn = sqlite3.connect(DB_PATH)
    q = "SELECT id, date, category, amount, note FROM expenses WHERE user_id=?"
    params = [user_id]
    if start:
        q += " AND date >= ?"
        params.append(start)
    if end:
        q += " AND date <= ?"
        params.append(end)
    q += " ORDER BY date DESC"

    rows = conn.execute(q, params).fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Date", "Category", "Amount", "Note"])
    for r in rows:
        writer.writerow(r)

    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={"Content-Disposition": "attachment;filename=expenses.csv"}
    )

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
