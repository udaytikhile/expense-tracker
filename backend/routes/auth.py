import sqlite3
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from config.settings import DB_PATH

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/register', methods=['POST'])
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

@auth_bp.route('/api/login', methods=['POST'])
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
