import sqlite3
import csv
import io
from flask import Blueprint, request, Response
from config.settings import DB_PATH

export_bp = Blueprint('export', __name__)

@export_bp.route('/api/export/csv', methods=['GET'])
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
