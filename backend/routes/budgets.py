import sqlite3
from flask import Blueprint, request, jsonify
from datetime import date
from config.settings import DB_PATH

budgets_bp = Blueprint('budgets', __name__)

@budgets_bp.route('/api/budgets', methods=['GET'])
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
        limit_val = b[2] or 0
        result.append({
            "id": b[0], "category": b[1], "limit_amount": limit_val, "amount": limit_val,
            "month": b[3], "spent": spent,
            "percentage": round((spent / limit_val) * 100, 1) if limit_val > 0 else 0
        })

    conn.close()
    return jsonify(result)

@budgets_bp.route('/api/budgets', methods=['POST'])
def save_budget():
    data = request.json
    user_id = data.get('user_id', 0)
    month = data.get('month', date.today().strftime('%Y-%m'))
    limit_val = data.get('limit_amount') if data.get('limit_amount') is not None else data.get('amount', 0)
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT OR REPLACE INTO budgets (user_id, category, limit_amount, month) VALUES (?, ?, ?, ?)",
        (user_id, data['category'], limit_val, month)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Budget saved"}), 201

@budgets_bp.route('/api/budgets/<int:id>', methods=['DELETE'])
def delete_budget(id):
    user_id = request.args.get('user_id', 0)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM budgets WHERE id=? AND user_id=?", (id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Budget deleted"})
