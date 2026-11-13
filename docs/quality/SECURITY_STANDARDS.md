# DairyPulse Application Security Standards (OWASP Aligned)

## 1. Authentication & Session Management
- **Passwords:** Salted `bcrypt` hashing on all stored credentials. Plaintext passwords strictly prohibited in storage.
- **Tokens:** Cryptographically signed HS256 JWT tokens containing `sub`, `role`, `name`, `dairy_name`, and timestamp expiration.
- **Bypass Elimination:** Passwords must be verified whenever provided; omitted passwords on protected accounts trigger immediate 401 Unauthorized.

---

## 2. Multi-Tenant Data Isolation
- **Tenant Scoping:** Every business entity (`Customer`, `Subscription`, `DeliveryTask`, `Invoice`, `Staff`, `Route`, `Product`) must carry `dairy_name` or foreign key reference to its parent `Dairy`.
- **Query Scoping:** API routers must partition database queries by the authenticated user's dairy context to prevent cross-tenant information disclosure.

---

## 3. Financial & Payment Gateway Security
- **HMAC Signature Verification:** All incoming Razorpay webhook payloads must be verified against `RAZORPAY_KEY_SECRET` using SHA256 HMAC before crediting accounts.
- **Idempotency:** Payment verification endpoints must check existing transaction state; duplicate webhook events for an already `SUCCESS` order must not double-credit balances.
- **Secrets Management:** Gateway keys, JWT secrets, and database credentials must be loaded via environment variables (`settings.py`), never hardcoded in source control.
