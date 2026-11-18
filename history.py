
import sqlite3
from datetime import datetime

DATABASE = "upi_rakshak.db"


def get_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_history():

    connection = get_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS analysis_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message TEXT NOT NULL,
            risk_level TEXT NOT NULL,
            risk_score INTEGER NOT NULL,
            ai_explanation TEXT,
            analyzed_at TEXT NOT NULL
        )
    """)

    connection.commit()
    connection.close()


def save_analysis(message, risk_level, risk_score, ai_explanation):

    connection = get_connection()

    connection.execute("""
        INSERT INTO analysis_history
        (message, risk_level, risk_score, ai_explanation, analyzed_at)
        VALUES (?, ?, ?, ?, ?)
    """, (
        message,
        risk_level,
        risk_score,
        ai_explanation,
        datetime.now().strftime("%d-%m-%Y %I:%M %p")
    ))

    connection.commit()
    connection.close()


def get_history():

    connection = get_connection()

    records = connection.execute("""
        SELECT * FROM analysis_history
        ORDER BY id DESC
    """).fetchall()

    connection.close()

    return [dict(record) for record in records]
