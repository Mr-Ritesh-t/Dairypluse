# Authentication & Security Audit Report — DairyPulse

> **Document Version:** 1.0.0  
> **Team:** NEXURA  
> **Audit Type:** White-Box Source Code Security Review  
> **Classification Framework:** OWASP Top 10 API Security Risks (2023)  

---

## 1. Executive Security Summary

A comprehensive source code security audit of the DairyPulse repository was conducted. While the application benefits from architectural safeguards inherent to modern frameworks (such as SQLAlchemy's parameterized queries preventing SQL injection, Pydantic's strict type coercion preventing payload smuggling, and Next.js 16's sanitized JSX rendering preventing stored XSS), several **Critical and High severity security vulnerabilities** were identified in the authentication, token issuance, and password verification mechanisms.

These issues stem primarily from developer convenience shortcuts during prototype development and must be remediated prior to processing real financial transactions and onboarding commercial customers.

---

## 2. Security Findings Summary Matrix

| Vulnerability ID | Issue Title | Severity | Impacted Component | OWASP Category |
|---|---|---|---|---|
| **DP-SEC-01** | Plaintext Password Storage and Insecure Comparison | **CRITICAL** | `api_v1.py#L1757` & `seed.py#L101` | API2:2023 Broken Authentication |
| **DP-SEC-02** | Password Verification Bypass When Password Omitted | **CRITICAL** | `api_v1.py#L1756` | API2:2023 Broken Authentication |
| **DP-SEC-03** | Static Dummy Session Token (`"dairypulse_session_token"`) | **CRITICAL** | `schemas.py#L425` & `api_v1.py#L1829` | API2:2023 Broken Authentication |
| **DP-SEC-04** | Missing Endpoint Authorization Guards (No Role Dependency) | **HIGH** | `api_v1.py` (All routes) | API1:2023 Broken Object Level Auth |
| **DP-SEC-05** | Fallback Wildcard CORS in Development Mode (`"*"`) | **HIGH** | `app/main.py#L140-L146` | API7:2023 Security Misconfiguration |
| **DP-SEC-06** | Hardcoded Fallback Secret Key in Config (`settings.py`) | **MEDIUM** | `app/config.py#L16` | API8:2023 Security Misconfiguration |
| **DP-SEC-07** | Hardcoded Supabase Anon JWT Key in Client Code | **MEDIUM** | `frontend/src/config/env.ts#L7` | API8:2023 Security Misconfiguration |
| **DP-SEC-08** | Lack of Rate Limiting on Login & Phone Verification | **MEDIUM** | `api_v1.py` (`/auth/login`) | API4:2023 Unrestricted Resource Consumption |
| **DP-SEC-09** | Lack of Idempotency on Payment & Delivery Status Endpoints | **MEDIUM** | `api_v1.py` (`/invoices/{id}/payments`) | Financial Integrity |
| **DP-SEC-10** | Missing Signature Verification on Webhook Callbacks | **LOW (PLANNED)** | Payment Architecture | API2:2023 Broken Authentication |

---

## 3. Deep-Dive Vulnerability Analysis & Remediation Plans

### DP-SEC-01: Plaintext Password Storage & Insecure String Comparison
- **Severity:** **CRITICAL**
- **Location:** `backend/app/routers/api_v1.py#L1756-L1759` & `backend/app/seed.py#L101`
- **Verified Code:**
  ```python
  # api_v1.py lines 1756-1759
  if user and login_req.password:
      if user.password_hash and user.password_hash.strip() != login_req.password.strip():
          raise HTTPException(status_code=401, detail="Incorrect password. Please verify your credentials.")
  ```
  ```python
  # seed.py line 101
  password_hash="admin123"
  ```
- **The Problem:** 
  1. The column `password_hash` stores plain text strings (e.g. `"admin123"`, `"rider123"`).
  2. The authentication endpoint compares passwords using standard string inequality (`!=`), which is vulnerable to timing analysis attacks.
  3. Despite `passlib[bcrypt]` being installed in `requirements.txt`, bcrypt hashing functions are never called.
- **Impact:** Anyone with read access to the database (or a backup file) can view all user passwords immediately.
- **Recommended Fix:**
  Use `passlib.context.CryptContext(schemes=["bcrypt"], deprecated="auto")`:
  ```python
  from passlib.context import CryptContext
  pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

  def hash_password(password: str) -> str:
      return pwd_context.hash(password)

  def verify_password(plain_password: str, hashed_password: str) -> bool:
      return pwd_context.verify(plain_password, hashed_password)
  ```

---

### DP-SEC-02: Password Verification Bypass When Password Is Omitted
- **Severity:** **CRITICAL**
- **Location:** `backend/app/routers/api_v1.py#L1756`
- **Verified Code:**
  ```python
  # Notice the condition checks: if user and login_req.password:
  if user and login_req.password:
      if user.password_hash and user.password_hash.strip() != login_req.password.strip():
          raise HTTPException(status_code=401, detail="Incorrect password.")
  ```
- **The Problem:** If an attacker submits `{ "login_id": "admin@dairypulse.farm", "role": "OWNER" }` with `password` omitted or empty (`None`), the `if user and login_req.password:` block is skipped entirely! The server proceeds to authenticate the user and returns an active owner session without ever verifying a credential.
- **Impact:** Complete authentication bypass allowing unauthorized login to any dairy owner, rider, or customer account by providing only their phone number or email.
- **Recommended Fix:**
  Make password mandatory for password-based logins, or reject the request if the account has a password configured:
  ```python
  if user and user.password_hash:
      if not login_req.password or not verify_password(login_req.password, user.password_hash):
          raise HTTPException(status_code=401, detail="Invalid credentials. Please verify your password.")
  ```

---

### DP-SEC-03: Static Dummy Session Token (`"dairypulse_session_token"`)
- **Severity:** **CRITICAL**
- **Location:** `backend/app/schemas/schemas.py#L425` & `backend/app/routers/api_v1.py#L1829`
- **Verified Code:**
  ```python
  # schemas.py line 425
  class AuthUserResponse(BaseModel):
      ...
      token: str = "dairypulse_session_token"
  ```
- **The Problem:** The API does not generate a cryptographically signed JSON Web Token (JWT). Every single login across every role receives the identical static string `"dairypulse_session_token"`. Furthermore, downstream API endpoints do not validate the `Authorization: Bearer <token>` header, leaving endpoints accessible without verified sessions.
- **Impact:** Impersonation and lack of session revocation. Once an endpoint is invoked, the backend has no cryptographically verified identity attached to the request.
- **Recommended Fix:**
  Implement standard PyJWT / python-jose token minting:
  ```python
  from jose import jwt
  from datetime import datetime, timedelta

  def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
      to_encode = data.copy()
      expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
      to_encode.update({"exp": expire})
      return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
  ```

---

### DP-SEC-04: Missing Endpoint Authorization & Role Guards
- **Severity:** **HIGH**
- **Location:** `backend/app/routers/api_v1.py` (All endpoints)
- **The Problem:** Endpoints such as `POST /api/v1/invoices`, `POST /api/v1/salary/payout`, `PATCH /api/v1/staff/{id}/daily-salary`, and `DELETE /api/v1/customers/{id}` do not enforce role checks via FastAPI dependencies (e.g. `current_user: User = Depends(get_current_active_owner)`).
- **Impact:** Any authenticated user (even a customer or delivery rider) who knows the endpoint URL could theoretically invoke administrative functions if not restricted by network proxies.
- **Recommended Fix:**
  Create a reusable dependency `get_current_user` and `require_role(["OWNER"])`:
  ```python
  def require_role(allowed_roles: List[str]):
      def role_checker(current_user: User = Depends(get_current_user)):
          if current_user.role not in allowed_roles:
              raise HTTPException(status_code=403, detail="Forbidden: Insufficient privileges.")
          return current_user
      return role_checker
  ```

---

### DP-SEC-05: Fallback Wildcard CORS in Development Mode
- **Severity:** **HIGH**
- **Location:** `backend/app/main.py#L140-L146`
- **Verified Code:**
  ```python
  else:
      # Development / Permissive Mode
      app.add_middleware(
          CORSMiddleware,
          allow_origins=["*"],
          allow_credentials=False,
          allow_methods=["*"],
          allow_headers=["*"],
      )
  ```
- **The Problem:** If `ALLOWED_ORIGINS` is not defined in the production environment (e.g., omitted in Render dashboard), FastAPI defaults to `allow_origins=["*"]`, permitting any third-party website in a user's browser to execute cross-origin requests against the API.
- **Impact:** Cross-Site Request Forgery (CSRF) and Cross-Origin data leakage.
- **Recommended Fix:**
  Fail closed in production: if `ALLOWED_ORIGINS` is not specified, only allow `localhost:3000` and specific production domains; never allow `*` when `settings.NODE_ENV == "production"`.

---

### DP-SEC-06: Hardcoded Fallback Secret Key in Configuration
- **Severity:** **MEDIUM**
- **Location:** `backend/app/config.py#L16`
- **Verified Code:**
  ```python
  SECRET_KEY: str = os.getenv("SECRET_KEY", "dairypulse-secret-key-development-2026")
  ```
- **The Problem:** If `SECRET_KEY` is not provided in `.env`, the system defaults to a known public string stored in version control.
- **Impact:** Anyone who reads the repository could forge valid JWT signatures if this key is used in production.
- **Recommended Fix:**
  Throw an exception on application boot if `SECRET_KEY` is using the default value in a production environment.

---

### DP-SEC-07: Hardcoded Supabase Anon JWT Key in Client Code
- **Severity:** **MEDIUM**
- **Location:** `frontend/src/config/env.ts#L7`
- **Verified Code:**
  ```python
  const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  ```
- **The Problem:** A fallback Supabase anon key is hardcoded directly into the frontend repository. While Supabase anon keys are designed for client exposure, if Row-Level Security (RLS) policies are misconfigured on the Supabase project, anyone with this key can directly read or write all tables.
- **Impact:** Potential unauthorized data exfiltration if Supabase tables lack strict RLS policies.
- **Recommended Fix:** Remove hardcoded keys from source code; enforce loading strictly from `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## 4. Security Strengths Discovered

1. **SQL Injection Immunity:** All database access is implemented via SQLAlchemy 2.0 ORM query objects and parameterized driver queries (`exec_driver_sql` with parameterized replacements). Zero raw string concatenation into SQL statements was found in `api_v1.py`.
2. **Strict Payload Typing:** Pydantic v2 rejects malformed JSON, out-of-range floats, invalid dates, and unexpected extra fields before request data touches business logic handlers.
3. **Multi-Tenant Isolation Scoping:** Major queries explicitly filter by `dairy_name` or `dairy_id`, preventing data bleeding between tenant dairies.
4. **No Sensitive Data in Logs:** The exception handlers in `app/main.py` log generic warnings without dumping user passwords or authorization credentials.

---

This completes the independent security audit of DairyPulse.
