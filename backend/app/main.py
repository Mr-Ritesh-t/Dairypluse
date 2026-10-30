import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers.api_v1 import api_router
from app.seed import seed_initial_data

# Create tables on startup (PostgreSQL / SQLite)
Base.metadata.create_all(bind=engine)

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
