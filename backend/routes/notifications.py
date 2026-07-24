import sqlite3
from flask import Blueprint, request, jsonify
from config.settings import DB_PATH

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/api/notifications', methods=['GET'])
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

@notifications_bp.route('/api/notifications', methods=['POST'])
def add_notification():
    data = request.json
    conn = sqlite3.connect(DB_PATH)
    conn.execute("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
                 (data['user_id'], data['message'], data.get('type', 'info')))
    conn.commit()
    conn.close()
    return jsonify({"message": "Notification added"}), 201

@notifications_bp.route('/api/notifications/<int:nid>/read', methods=['PUT'])
def mark_notification_read(nid):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("UPDATE notifications SET read=1 WHERE id=?", (nid,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Marked as read"})

@notifications_bp.route('/api/notifications/clear', methods=['DELETE'])
def clear_notifications():
    user_id = request.args.get('user_id')
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM notifications WHERE user_id=?", (user_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "All notifications cleared"})
