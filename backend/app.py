from flask import Flask
from flask_cors import CORS
from models.database import init_db
from routes.auth import auth_bp
from routes.profile import profile_bp
from routes.notifications import notifications_bp
from routes.expenses import expenses_bp
from routes.budgets import budgets_bp
from routes.income import income_bp
from routes.recurring import recurring_bp
from routes.export import export_bp

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://expense-tracker-projectcom.netlify.app",
])

# Initialize database schema and migrations
init_db()

# Register blueprint routes
app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(notifications_bp)
app.register_blueprint(expenses_bp)
app.register_blueprint(budgets_bp)
app.register_blueprint(income_bp)
app.register_blueprint(recurring_bp)
app.register_blueprint(export_bp)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
