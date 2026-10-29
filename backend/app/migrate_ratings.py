import sqlite3
from app.database import engine, Base
import app.models

Base.metadata.create_all(bind=engine)

conn = sqlite3.connect('dairypulse.db')
cursor = conn.cursor()

# Check and add columns
cols = [c[1] for c in cursor.execute('PRAGMA table_info(delivery_tasks)').fetchall()]
if 'driver_rating' not in cols:
    cursor.execute('ALTER TABLE delivery_tasks ADD COLUMN driver_rating INTEGER')
    print("Added driver_rating")
if 'driver_rating_feedback' not in cols:
    cursor.execute('ALTER TABLE delivery_tasks ADD COLUMN driver_rating_feedback TEXT')
    print("Added driver_rating_feedback")
if 'rated_at' not in cols:
    cursor.execute('ALTER TABLE delivery_tasks ADD COLUMN rated_at TEXT')
    print("Added rated_at")

conn.commit()
tables = [t[0] for t in cursor.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print("Current tables:", tables)
print("Migration completed!")

