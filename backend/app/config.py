import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = BACKEND_DIR / "dairypulse.db"
DEFAULT_SUPABASE_DB_URL = "postgresql://postgres.vgpflayyocspsrakuvvs:riteshtayade68@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require"

class Settings(BaseSettings):
    PROJECT_NAME: str = "DairyPulse API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database URL: Primary is live Supabase PostgreSQL, fallback to SQLite if needed
    DATABASE_URL: str = os.getenv("DATABASE_URL", DEFAULT_SUPABASE_DB_URL)
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dairypulse-secret-key-development-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    TIMEZONE: str = "Asia/Kolkata"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "*")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
