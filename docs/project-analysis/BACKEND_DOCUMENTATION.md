# Backend Technical Documentation — DairyPulse

> **Document Version:** 1.0.0  
> **Team:** NEXURA  
> **Framework:** Python 3.10 | FastAPI 0.115+ | SQLAlchemy 2.0+ | Pydantic 2.10+ | Uvicorn  

---

## 1. Backend Architecture Overview

The DairyPulse backend is implemented as a high-performance asynchronous REST service built on **FastAPI**. It manages enterprise business logic, database transactions, route sequencing, heuristic analytics, and multi-tenant farm operations.

### Key Backend Architectural Principles
1. **Pydantic v2 Schema Validation:** Strict serialization, deserialization, and schema validation with `model_config = ConfigDict(from_attributes=True)` enabling direct ORM model to JSON mapping.
2. **Database Engine Agnosticism:** SQLAlchemy 2.0 declarative models work interchangeably on embedded SQLite3 for development/testing and PostgreSQL (via `psycopg2-binary`) for cloud deployments.
3. **Automated Schema Evolution:** `ensure_db_columns()` inspects database tables at startup and executes non-destructive `ALTER TABLE ADD COLUMN` statements, eliminating startup crashes from missing columns during iterative development.
4. **Resilient Session Lifecycle:** FastAPI dependency injection (`Depends(get_db)`) enforces strict per-request database sessions with guaranteed closure.
5. **Standardized Error Handling:** Global exception handlers capture Starlette HTTP exceptions, Pydantic 422 validation errors, and SQLAlchemy internal errors, formatting them into consistent JSON envelopes.

---

## 2. Directory Structure of `backend/`

```
backend/
├── Dockerfile                         # Production container definition (Python 3.10 slim)
├── Procfile                           # Render/Heroku web command (uvicorn app.main:app)
├── pytest.ini                         # Pytest configuration and test runner options
├── requirements.txt                   # Frozen dependency list
├── seed_supabase.py                   # Direct Supabase PostgreSQL seeder
├── dairypulse.db                      # Local SQLite development database
├── app/
│   ├── __init__.py
│   ├── config.py                      # Pydantic BaseSettings configuration loader
│   ├── database.py                    # Engine initialization, SessionLocal, get_db
│   ├── main.py                        # FastAPI app instance, CORS, error handlers, startup
│   ├── seed.py                        # Database seeder (3 farms, 100+ entities)
│   ├── models/
│   │   ├── __init__.py
│   │   └── models.py                  # 17 SQLAlchemy ORM model classes
│   ├── routers/
│   │   ├── __init__.py
│   │   └── api_v1.py                  # 74 API endpoint implementations (3,001 lines)
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── schemas.py                 # 50+ Pydantic request and response schemas (738 lines)
│   └── utils/
│       ├── __init__.py
│       └── phone.py                   # Indian phone pattern normalizer & search utility
└── tests/
    ├── conftest.py                    # Pytest SQLite test engine & FastAPI TestClient
    ├── test_api.py                    # 32 core REST endpoint tests
    ├── test_delivery_billing.py       # Delivery completion balance offset tests
    ├── test_new_customer_notification.py # Self-registration owner alert tests
    ├── test_routing_system.py         # Route creation & customer stop mapping tests
    └── test_whatsapp_reminders.py     # Month-end billing WhatsApp link generator tests
```

---

## 3. Application Initialization & Startup Sequence (`app/main.py`)

When the Uvicorn ASGI server boots the application (`app.main:app`), it executes the following verified sequence:

```mermaid
sequenceDiagram
    autonumber
    participant Server as Uvicorn ASGI Server
    participant Main as app/main.py
    participant DB as SQLAlchemy Engine
    participant Seeder as app/seed.py
    participant Router as app/routers/api_v1.py

    Server->>Main: Load app module
    Main->>DB: Base.metadata.create_all(bind=engine)
    Note over DB: Creates all 17 tables if they do not exist
    Main->>Main: ensure_db_columns()
    Note over Main: Runs PRAGMA checks & adds missing columns<br/>(daily_salary, upi_id, expiry_date, route, etc.)
    Main->>Seeder: seed_initial_data(db)
    Note over Seeder: Checks if products exist; if empty, seeds core catalog
    Main->>Main: Instantiate FastAPI(title, version)
    Main->>Main: Register CORS Middleware (ALLOWED_ORIGINS + Vercel regex)
    Main->>Main: Register Global Exception Handlers (422, 500, Starlette)
    Main->>Router: app.include_router(api_router, prefix="/api/v1")
    Main-->>Server: Application Ready for Requests
```

### Code Reference: Schema Column Verification (`app/main.py#L27-L113`)
The `ensure_db_columns()` function performs self-healing schema migrations for databases that were created before recent model additions:
- **`staff`:** Adds `daily_salary`, `pending_salary`, `total_salary_paid`.
- **`staff_attendance`:** Adds `shift_completed`, `deliveries_completed`, `daily_salary_earned`, `salary_credited`, `payout_status`, `payout_id`.
- **`stock_receipts` & `inventory_transactions`:** Adds `expiry_date`.
- **`customers`:** Adds `last_reminder_sent`.
- **`dairies`:** Adds `upi_id`, `auto_reminders`.
- **`routes` & `delivery_tasks`:** Adds `dairy_name`, `route`.
- **Backfill query:** Links existing `delivery_tasks.route` by matching customer phone numbers.

---

## 4. Configuration Management (`app/config.py`)

Configuration is managed using Pydantic's `BaseSettings` (`SettingsConfigDict(env_file=".env", extra="ignore")`):

| Setting | Type | Default Value | Description |
|---|---|---|---|
| `PROJECT_NAME` | `str` | `"DairyPulse API"` | Swagger documentation title |
| `VERSION` | `str` | `"1.0.0"` | API version identifier |
| `API_V1_STR` | `str` | `"/api/v1"` | URL prefix for all primary API routes |
| `DATABASE_URL` | `str` | `sqlite:///{BACKEND_DIR}/dairypulse.db` | Database connection URI (auto-configured for SQLite or PostgreSQL) |
| `SECRET_KEY` | `str` | `"dairypulse-secret-key-development-2026"` | Cryptographic key for JWT token signing |
| `ALGORITHM` | `str` | `"HS256"` | JWT HMAC-SHA256 signature algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `int` | `10080` (7 days) | Session token validity duration |
| `TIMEZONE` | `str` | `"Asia/Kolkata"` | Standard operational timezone for dates |

---

## 5. Database Session Management (`app/database.py`)

The database connection handles both local and production workloads seamlessly:

```python
# Dialect Normalization (database.py lines 6-10)
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

is_sqlite = db_url.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine_kwargs = {
    "connect_args": connect_args,
    "echo": False,
}

if not is_sqlite:
    # Production connection pool settings for Supabase / Render
    engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "pool_size": 10,
        "max_overflow": 20,
    })

engine = create_engine(db_url, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

### Dependency Injection Pattern:
```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```
Every endpoint receives `db: Session = Depends(get_db)`, ensuring transactions are cleanly scoped to the HTTP request and connections are never leaked.

---

## 6. Authentication Architecture & Mechanics

### 6.1 Multi-Role Resolution Logic (`app/routers/api_v1.py#L1701-L1744`)
The `/auth/login` endpoint accepts an email or phone number and a role string (`OWNER`, `DELIVERY`, or `CUSTOMER`).
1. **Cross-Role Database Lookup:** Searches `User`, `Staff`, `Dairy`, and `Customer` tables using normalized phone patterns (via `app/utils/phone.py`).
2. **Effective Role Assignment:** If a user exists in multiple entities, their explicitly requested role takes precedence.
3. **Password Verification:** Checks `user.password_hash`.
   > *Security Audit Note:* In the current codebase, passwords are compared via plain string equality (`user.password_hash.strip() != login_req.password.strip()`), and password is bypassed if omitted in the payload. See `AUTHENTICATION_SECURITY_AUDIT.md` for the recommended remediation.
4. **Token Generation:** Returns an `AuthUserResponse` containing user profile data and session token.

### 6.2 Supabase OAuth Sync Endpoint (`POST /auth/supabase-sync`)
When users sign in via Google OAuth or Supabase Phone OTP on the frontend, the frontend invokes `POST /auth/supabase-sync`.
- If the user exists, their local profile is retrieved and linked.
- If the user is new, an account record is automatically provisioned in the local database, ensuring synchronization between Supabase Auth and the FastAPI backend.

---

## 7. Business Logic & Domain Services Overview

The backend business logic in `api_v1.py` is organized into distinct operational domains:

1. **Dashboard Analytics Service (`GET /dashboard/summary`):** Computes aggregated metrics: today's milk collected, milk in stock, active subscriptions count, scheduled dispatches, and daily revenue sum.
2. **Daily Delivery Generator (`POST /deliveries/generate-daily`):**
   - Queries all active subscriptions (`status == 'Active'`).
   - Filters out paused subscriptions (`paused_until >= today`).
   - Checks if a delivery task already exists for each customer today (idempotency check to avoid duplicate deliveries).
   - Links the customer's assigned route and creates sequenced `DeliveryTask` records.
3. **Delivery Status & Ledger Offset (`PATCH /deliveries/{id}/status`):**
   - When a delivery is marked `Delivered`, the backend automatically calculates the delivered milk's line total (`quantity_liters * unit_price`) and increments the customer's running balance (`customer.balance += line_total`).
   - Increments the assigned rider's completed deliveries counter (`staff.deliveries_today += 1`).
4. **Staff Shift & Salary Engine (`/attendance/*`, `/salary/*`):**
   - Riders check in in the morning (`POST /attendance/check-in`).
   - Riders confirm milk crate pickup (`POST /attendance/pickup`).
   - Upon route completion, riders complete their shift (`POST /attendance/complete-shift`), which credits their daily salary (`staff.pending_salary += daily_salary`).
   - Owners record salary payouts (`POST /salary/payout`), which logs a `StaffSalaryPayment` and debits `pending_salary`.
5. **Month-End WhatsApp Link Generator (`GET /billing/monthly-due-reminders`):**
   - Scans all customers with positive balance dues (`balance > 0`).
   - Cleans the customer's phone number to 10-digit Indian format.
   - Generates a standard UPI intent URL: `upi://pay?pa={upi_id}&pn={dairy_name}&am={balance}&cu=INR`.
   - Generates a prefilled, friendly WhatsApp message text and constructs a direct `https://wa.me/91{clean_phone}?text={encoded_message}` link.

---

## 8. Global Exception Handling & Logging

All errors pass through standardized middleware handlers in `app/main.py`:

```python
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
```

This prevents database connection details or stack traces from ever leaking to external clients.
