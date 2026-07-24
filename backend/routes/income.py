import sqlite3
from flask import Blueprint, request, jsonify
from config.settings import DB_PATH

income_bp = Blueprint('income', __name__)

@income_bp.route('/api/income', methods=['GET'])
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

@income_bp.route('/api/income', methods=['POST'])
def add_income():
    data = request.json
    user_id = data.get('user_id', 0)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("INSERT INTO income (user_id, date, source, amount, note) VALUES (?, ?, ?, ?, ?)",
                 (user_id, data['date'], data['source'], data['amount'], data.get('note', '')))
    conn.commit()
    conn.close()
    return jsonify({"message": "Income added"}), 201

@income_bp.route('/api/income/<int:id>', methods=['DELETE'])
def delete_income(id):
    user_id = request.args.get('user_id', 0)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM income WHERE id=? AND user_id=?", (id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Income deleted"})

@income_bp.route('/api/income/summary', methods=['GET'])
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
