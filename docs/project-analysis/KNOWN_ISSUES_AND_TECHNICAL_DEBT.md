# Known Issues, Technical Debt & Discrepancy Report — DairyPulse

> **Document Version:** 1.0.0  
> **Team:** NEXURA  
> **Purpose:** Transparent Audit of Architectural Gaps, Spec vs Reality Discrepancies, and Engineering Debt  

---

## 1. Discrepancy Report (Assumptions vs Actual Code Evidence)

The following discrepancies were discovered when auditing the actual source code against common design assumptions and documentation claims:

| Feature / Technology | Initial Assumption / Claim | Actual Implementation Verified in Code | Exact Source Code Citation |
|---|---|---|---|
| **Offline Storage Mechanism** | "Offline support: IndexedDB" | **Actually implemented using browser `localStorage`**. Actions are serialized into a JSON array under `dairypulse_offline_delivery_queue_v1`. No IndexedDB or Dexie.js library is present. | `frontend/src/lib/offlineSync.ts#L7-L18` |
| **Session Authentication Token** | Cryptographically signed, dynamic JWT tokens | **Static dummy string token**. The API returns `"token": "dairypulse_session_token"` on every login regardless of user. No signature generation is executed during login. | `backend/app/schemas/schemas.py#L425` & `api_v1.py#L1829` |
| **Password Hashing** | Bcrypt salted password hashes | **Plaintext string storage and comparison**. Passwords in `seed.py` and `api_v1.py` are compared directly using plain string equality (`!=`). `passlib` is in dependencies but unused in auth handler. | `backend/app/routers/api_v1.py#L1757` & `seed.py#L101` |
| **Notifications Persistence** | Database-backed notification records | **In-memory ring buffer**. Notifications live in a Python list inside `api_v1.py`. When the backend restarts or scales across multiple workers, all notifications reset to initial mock data. | `backend/app/routers/api_v1.py#L2540` |
| **AI Demand Forecasting** | Machine Learning model (Scikit-Learn/TensorFlow) | **Heuristic mathematical formula**. Forecasts demand using current subscriptions multiplied by weekday scalars (1.1 for Saturday/Sunday) and a 15% safety buffer. No trained ML model file is used. | `backend/app/routers/api_v1.py#L1980-L2080` |
| **Online Payment Gateway** | Automated online payment processing | **Manual UPI QR and WhatsApp links only**. No payment gateway SDK (Razorpay/Cashfree/Stripe) is installed. Payments must be manually confirmed and marked by the owner. | `backend/requirements.txt` & `api_v1.py#L1404` |
| **Customer Refunds** | Automated gateway refund workflow | **Not implemented**. Handled solely by manual balance adjustments via `PATCH /customers/{id}`. | `backend/app/routers/api_v1.py` |

---

## 2. Technical Debt Catalog

### 2.1 Monolithic Router File (`api_v1.py`)
- **Severity:** High Architectural Debt
- **Description:** `backend/app/routers/api_v1.py` contains 3,001 lines with 74 endpoints bundled into a single file.
- **Risk:** High merge conflict probability, slower developer onboarding, and difficulty implementing granular dependency injection across sub-modules.
- **Recommended Refactoring:** Decompose into 7 domain-specific router files (`auth.py`, `inventory.py`, `deliveries.py`, `customers.py`, `billing.py`, `staff.py`, `analytics.py`).

### 2.2 Monolithic Client State (`DairyPulseContext.tsx`)
- **Severity:** High Frontend Debt
- **Description:** `frontend/src/context/DairyPulseContext.tsx` spans 1,939 lines, maintaining 10 state arrays (`products`, `customers`, `subscriptions`, `shopOrders`, `deliveries`, `invoices`, `expenses`, `staff`, `dairies`, `routes`).
- **Risk:** Any state change triggers re-renders across all consumer components.
- **Recommended Refactoring:** Split into focused domain hooks (`useDeliveries`, `useBilling`, `useInventory`).

### 2.3 Runtime SQLite PRAGMA Migrations vs Alembic
- **Severity:** Medium Database Debt
- **Description:** `ensure_db_columns()` in `main.py` executes raw SQLite PRAGMA table checks and direct `ALTER TABLE` queries on startup. While convenient for SQLite prototyping, PRAGMAs are SQLite-specific and do not provide rollback or version tracking.
- **Recommended Refactoring:** Formalize migrations using Alembic revision scripts (`alembic revision --autogenerate`).

### 2.4 In-Memory Notifications Reset
- **Severity:** Medium Reliability Debt
- **Description:** Notifications reside in an ephemeral Python list. When deployed to serverless environments (like AWS Lambda) or multi-worker ASGI instances (Uvicorn `--workers 4`), workers will have desynchronized notification states.
- **Recommended Refactoring:** Add a `Notification` model to `models.py` and persist notifications in PostgreSQL.

---

## 3. Prioritized Technical Debt Remediation Roadmap

```
+-------------------------------------------------------------------------------------------------+
|                                 TECHNICAL DEBT REMEDIATION PHASES                               |
+--------------------------+-------------------------------------+--------------------------------+
| Priority                 | Target Fix                          | Estimated Effort               |
+--------------------------+-------------------------------------+--------------------------------+
| 1. Immediate (Security)  | Implement Bcrypt hashing and JWT    | 1 Day                          |
| 2. Immediate (Security)  | Close password bypass on /login     | 2 Hours                        |
| 3. High (Architecture)   | Split api_v1.py into modular files  | 2 Days                         |
| 4. High (Feature)        | Online Gateway SDK Integration      | 3 Days                         |
| 5. Medium (Architecture) | Split DairyPulseContext into hooks  | 2 Days                         |
| 6. Medium (Database)     | Migrate PRAGMAs to Alembic scripts  | 1 Day                          |
| 7. Low (Reliability)     | Persist notifications to database   | 1 Day                          |
+--------------------------+-------------------------------------+--------------------------------+
```

This catalog establishes an honest, verifiable baseline of the technical debt in DairyPulse to guide future engineering sprints.
