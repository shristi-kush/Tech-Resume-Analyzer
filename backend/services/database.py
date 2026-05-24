import sqlite3
from contextlib import contextmanager
from datetime import datetime
from typing import Optional

from config import BASE_DIR, DATABASE_URL

DB_PATH = BASE_DIR / "resume_analyzer.db"


def _use_sqlite() -> bool:
    return DATABASE_URL.startswith("sqlite")


@contextmanager
def get_connection():
    # MVP: always SQLite. Render Postgres DATABASE_URL is ignored until Postgres support is added.
    if not _use_sqlite():
        import warnings

        warnings.warn(
            "DATABASE_URL is not sqlite; using resume_analyzer.db instead. "
            "Remove DATABASE_URL on Render if you do not need Postgres.",
            stacklevel=2,
        )
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    with get_connection() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS user_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                act_name TEXT,
                act_mail TEXT,
                act_mob TEXT,
                name TEXT,
                email TEXT,
                resume_score INTEGER,
                timestamp TEXT,
                page_no TEXT,
                predicted_field TEXT,
                user_level TEXT,
                actual_skills TEXT,
                recommended_skills TEXT,
                recommended_courses TEXT,
                pdf_name TEXT
            );

            CREATE TABLE IF NOT EXISTS user_feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                feed_name TEXT,
                feed_email TEXT,
                feed_score INTEGER,
                comments TEXT,
                timestamp TEXT
            );
            """
        )
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS app_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT,
                created_at TEXT
            );
            """
        )
        _migrate_user_data(conn)


def _migrate_user_data(conn):
    existing = {row[1] for row in conn.execute("PRAGMA table_info(user_data)")}
    for col, typ in [
        ("ip_address", "TEXT"),
        ("country", "TEXT"),
        ("region", "TEXT"),
        ("city", "TEXT"),
        ("upload_source", "TEXT"),
        ("user_id", "INTEGER"),
    ]:
        if col not in existing:
            conn.execute(f"ALTER TABLE user_data ADD COLUMN {col} {typ}")


def create_app_user(email: str, password_hash: str, name: Optional[str] = None) -> int:
    ts = datetime.utcnow().strftime("%Y-%m-%d_%H:%M:%S")
    with get_connection() as conn:
        cur = conn.execute(
            "INSERT INTO app_users (email, password_hash, name, created_at) VALUES (?,?,?,?)",
            (email, password_hash, name, ts),
        )
        return int(cur.lastrowid)


def get_user_by_email(email: str):
    with get_connection() as conn:
        row = conn.execute(
            "SELECT id, email, password_hash, name FROM app_users WHERE email = ?",
            (email.strip().lower(),),
        ).fetchone()
    return dict(row) if row else None


def save_analysis(
    act_name,
    act_mail,
    act_mob,
    name,
    email,
    resume_score,
    pages,
    predicted_field,
    user_level,
    skills,
    recommended_skills,
    courses,
    pdf_name,
    ip_address=None,
    country=None,
    region=None,
    city=None,
    upload_source=None,
    user_id=None,
):
    ts = datetime.utcnow().strftime("%Y-%m-%d_%H:%M:%S")
    with get_connection() as conn:
        _migrate_user_data(conn)
        conn.execute(
            """
            INSERT INTO user_data (
                act_name, act_mail, act_mob, name, email, resume_score, timestamp,
                page_no, predicted_field, user_level, actual_skills,
                recommended_skills, recommended_courses, pdf_name,
                ip_address, country, region, city, upload_source, user_id
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            (
                act_name,
                act_mail,
                act_mob,
                name,
                email,
                resume_score,
                ts,
                str(pages),
                predicted_field,
                user_level,
                str(skills),
                str(recommended_skills),
                str(courses),
                pdf_name,
                ip_address,
                country,
                region,
                city,
                upload_source,
                user_id,
            ),
        )


def save_feedback(name, email, score, comments):
    ts = datetime.utcnow().strftime("%Y-%m-%d_%H:%M:%S")
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO user_feedback (feed_name, feed_email, feed_score, comments, timestamp) VALUES (?,?,?,?,?)",
            (name, email, score, comments, ts),
        )


def fetch_feedback():
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM user_feedback ORDER BY id DESC").fetchall()
    return [dict(r) for r in rows]


def fetch_all_analyses(user_id: Optional[int] = None):
    with get_connection() as conn:
        if user_id is not None:
            rows = conn.execute(
                "SELECT * FROM user_data WHERE user_id = ? ORDER BY id DESC",
                (user_id,),
            ).fetchall()
        else:
            rows = conn.execute("SELECT * FROM user_data ORDER BY id DESC").fetchall()
    return [dict(r) for r in rows]


def fetch_analytics(user_id: Optional[int] = None, include_feedback: bool = True):
    analyses = fetch_all_analyses(user_id=user_id)
    feedback_scores = []
    if include_feedback:
        with get_connection() as conn:
            feedback = conn.execute("SELECT feed_score FROM user_feedback").fetchall()
        feedback_scores = [r["feed_score"] for r in feedback]
    return {
        "total_users": len(analyses),
        "analyses": analyses,
        "feedback_scores": feedback_scores,
    }
