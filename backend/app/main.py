import os
import sys
from pathlib import Path

# Ensure 'backend' directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers.api_v1 import api_router
from app.seed import seed_initial_data

# Create tables on startup (PostgreSQL / SQLite)
Base.metadata.create_all(bind=engine)

def ensure_db_columns():
    try:
        with engine.connect() as conn:
            # Check staff columns
            cols = [r[1] for r in conn.exec_driver_sql("PRAGMA table_info(staff)").fetchall()]
            if cols:
                if "daily_salary" not in cols:
                    conn.exec_driver_sql("ALTER TABLE staff ADD COLUMN daily_salary FLOAT DEFAULT 500.0")
                if "pending_salary" not in cols:
                    conn.exec_driver_sql("ALTER TABLE staff ADD COLUMN pending_salary FLOAT DEFAULT 0.0")
                if "total_salary_paid" not in cols:
                    conn.exec_driver_sql("ALTER TABLE staff ADD COLUMN total_salary_paid FLOAT DEFAULT 0.0")

            # Check staff_attendance columns
            att_cols = [r[1] for r in conn.exec_driver_sql("PRAGMA table_info(staff_attendance)").fetchall()]
            if att_cols:
                if "shift_completed" not in att_cols:
                    conn.exec_driver_sql("ALTER TABLE staff_attendance ADD COLUMN shift_completed BOOLEAN DEFAULT 0")
                if "shift_completed_time" not in att_cols:
                    conn.exec_driver_sql("ALTER TABLE staff_attendance ADD COLUMN shift_completed_time VARCHAR")
                if "deliveries_completed" not in att_cols:
                    conn.exec_driver_sql("ALTER TABLE staff_attendance ADD COLUMN deliveries_completed INTEGER DEFAULT 0")
                if "daily_salary_earned" not in att_cols:
                    conn.exec_driver_sql("ALTER TABLE staff_attendance ADD COLUMN daily_salary_earned FLOAT DEFAULT 0.0")
                if "salary_credited" not in att_cols:
                    conn.exec_driver_sql("ALTER TABLE staff_attendance ADD COLUMN salary_credited BOOLEAN DEFAULT 0")
                if "payout_status" not in att_cols:
                    conn.exec_driver_sql("ALTER TABLE staff_attendance ADD COLUMN payout_status VARCHAR DEFAULT 'PENDING'")
                if "payout_id" not in att_cols:
                    conn.exec_driver_sql("ALTER TABLE staff_attendance ADD COLUMN payout_id VARCHAR")
            conn.commit()
    except Exception as e:
        print(f"Column check migration warning: {e}")

ensure_db_columns()

# Auto-seed core product catalog and default farm if empty
with SessionLocal() as db:
    seed_initial_data(db)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise REST API for DairyPulse Dairy Distribution & Management Platform (NEXURA)",
)

# CORS middleware configuration
# Flexible for Vercel production & preview deployments, local Next.js, and custom domains
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env.strip():
    allowed_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Development / Permissive Mode
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Mount API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    db_scheme = settings.DATABASE_URL.split("://")[0]
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "postgresql" if "postgres" in db_scheme else "sqlite",
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to DairyPulse API",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR,
    }
