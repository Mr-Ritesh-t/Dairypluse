import os
import sys
import logging
from pathlib import Path

# Ensure 'backend' directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import SQLAlchemyError
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers.api_v1 import api_router
from app.seed import seed_initial_data

logger = logging.getLogger("dairypulse.api")

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

# Global Exception Handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status_code": exc.status_code},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error for {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": exc.errors(),
            "message": "Invalid request parameters.",
            "status_code": 422,
        },
    )

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal database error occurred. Please try again.",
            "status_code": 500,
        },
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected error occurred on the server.",
            "status_code": 500,
        },
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
