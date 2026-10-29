import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app
from app.seed import seed_database

TEST_DB_PATH = "test_dairypulse.db"
TEST_DATABASE_URL = f"sqlite:///./{TEST_DB_PATH}"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    # Setup isolated test database tables
    Base.metadata.create_all(bind=test_engine)
    
    # Seed the isolated test database
    db = TestingSessionLocal()
    seed_database(clear_existing=True, db_session=db)
    db.close()

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    yield

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists(TEST_DB_PATH):
        try:
            os.remove(TEST_DB_PATH)
        except Exception:
            pass

