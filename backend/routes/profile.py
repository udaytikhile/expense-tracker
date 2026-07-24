import sqlite3
from flask import Blueprint, request, jsonify
from config.settings import DB_PATH

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/api/user/profile', methods=['PUT'])
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
