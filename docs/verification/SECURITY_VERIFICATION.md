# DairyPulse Security Verification & Endpoint Authorization Audit

**Auditor:** Application Security Engineer (Agent 31) & QA Lead (Agent 28)  
**Date:** November 14, 2026  
**Scope:** `backend/app/routers/api_v1.py`, `backend/app/main.py`, `backend/app/models/models.py`  

---

## 1. Security Architecture Assessment

### What Has Been Fixed (Verified):
- **Bcrypt Password Hashing:** Salted `bcrypt` hashing is active in `api_v1.py#L115-L130`. User passwords created via registration or sync are no longer stored in plaintext.
- **Dynamic JWT Minting:** Authentication endpoints (`/auth/login`, `/auth/supabase-sync`) issue signed HS256 JWT tokens containing `sub`, `role`, `name`, and `dairy_name`.

### What Remains Vulnerable (Critical Gaps):
- **100% of API Endpoints Lack Authorization Guards:**
  - While JWT tokens are minted, **not a single endpoint in `api_v1.py` validates the token**!
  - Every route signature accepts only `db: Session = Depends(get_db)`.
  - There is no `Depends(get_current_user)` or `Depends(require_role(["OWNER"]))`.
  - Consequently, anyone with network access to the API can call administrative, salary, financial, and deletion endpoints without supplying a token.

---

## 2. Endpoint Vulnerability & Authorization Matrix

| Endpoint Path | HTTP Method | Intended Role | Current Auth Requirement | Risk Assessment & Impact |
| :--- | :---: | :---: | :---: | :--- |
| `/api/v1/salary/payout` | `POST` | `OWNER` | **None** (`db` only) | **CRITICAL:** Unauthenticated users can trigger and record driver salary payouts. |
| `/api/v1/staff/{id}/daily-salary` | `PATCH` | `OWNER` | **None** (`db` only) | **CRITICAL:** Unauthenticated users can inflate or deflate staff salary rates. |
| `/api/v1/customers/{id}` | `DELETE` | `OWNER` | **None** (`db` only) | **CRITICAL:** Unauthenticated users can permanently delete customer subscriber accounts. |
| `/api/v1/products/{id}` | `DELETE` | `OWNER` | **None** (`db` only) | **CRITICAL:** Unauthenticated users can delete inventory milk products and catalog. |
| `/api/v1/invoices` | `POST` | `OWNER` | **None** (`db` only) | **HIGH:** Any client can fabricate bills and assign arbitrary amounts to customers. |
| `/api/v1/billing/settings/reminders`| `POST` | `OWNER` | **None** (`db` only) | **CRITICAL:** Hijacking risk: Anyone can overwrite the dairy's official `upi_id` to divert funds! |
| `/api/v1/payments/verify` | `POST` | `CUSTOMER` / `OWNER` | **None** (`db` only) | **CRITICAL:** Anyone knowing an `order_id` can zero out customer debts for free. |
| `/api/v1/expenses` | `GET`, `POST`| `OWNER` | **None** (`db` only) | **HIGH:** Commercial espionage: Anyone can view farm operating expenses and vendors. |
| `/api/v1/customers` | `GET` | `OWNER` / `STAFF` | **None** (`db` only) | **HIGH:** PII exposure: Returns all customer names, phone numbers, and home addresses. |
| `/api/v1/billing/monthly-due-reminders`| `GET` | `OWNER` | **None** (`db` only) | **HIGH:** Financial leak: Exposes outstanding customer balances and WhatsApp URLs. |

---

## 3. Multi-Tenant Data Isolation Audit
- **The Issue:** While models have `dairy_name` columns, database queries in `api_v1.py` rely on optional query parameters (e.g. `def get_customers(dairy_name: Optional[str] = None)`).
- **The Vulnerability:**
  - If a user sends `GET /api/v1/customers` without `?dairy_name=...`, the query executes `db.query(Customer).all()`.
  - The endpoint returns **every customer across all dairies on the platform**, violating tenant isolation.
  - The same flaw exists in `GET /api/v1/expenses`, `GET /api/v1/invoices`, and `GET /api/v1/orders`.
- **The Fix:** Multi-tenant scoping must be enforced server-side from the verified JWT payload:
  ```python
  def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
      # Decodes JWT and extracts dairy_name
      ...
  ```

---

## 4. Reproducible Proof of Concept (PoC)

```python
# Anyone can call without an Authorization header:
import requests

# 1. Wipe customer account without authentication:
res = requests.delete("http://localhost:8000/api/v1/customers/c1")
assert res.status_code == 200  # SUCCEEDS ILLEGITIMATELY

# 2. Divert dairy payment UPI ID without authentication:
res = requests.post("http://localhost:8000/api/v1/billing/settings/reminders", json={
    "upi_id": "attacker@fakeupi"
})
assert res.status_code == 200  # SUCCEEDS ILLEGITIMATELY
```

---

## 5. Required Sprint 1 Remediation Tasks
1. Implement `get_current_user` and `require_role(allowed_roles: List[str])` reusable FastAPI dependencies in a new module `backend/app/auth/dependencies.py`.
2. Secure all administrative, financial, and deletion endpoints with `Depends(require_role(["OWNER", "ADMIN"]))`.
3. Enforce automatic tenant filtering (`query.filter(Model.dairy_name == current_user.dairy_name)`).

