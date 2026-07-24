import sqlite3
from config.settings import DB_PATH

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
