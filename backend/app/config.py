import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "DairyPulse API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database URL: uses PostgreSQL if provided, defaults to SQLite for instant local dev
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./dairypulse.db")
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dairypulse-secret-key-development-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    TIMEZONE: str = "Asia/Kolkata"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
