# DairyPulse Architecture & Product Decision Log (ADR)

Immutable log of architectural, security, and product trade-offs.

---

## ADR-001: Salted Bcrypt Password Hashing & HS256 JWT Authentication
- **Date:** 2026-11-14
- **Decision Owner:** CTO (Agent 3) & Security Engineer (Agent 31)
- **Status:** **ACCEPTED & IMPLEMENTED**
- **Context:** Previously, passwords were stored in plaintext and evaluated via direct string comparison (`user.password_hash == login_req.password`). Session tokens were static (`"dairypulse_session_token"`), allowing unauthorized session spoofing.
- **Decision:** Integrated salted `bcrypt` hashing for all newly stored credentials. Retained backwards-compatible plaintext verification for legacy seeds. Replaced static tokens with HS256 cryptographically signed JWTs containing subject ID, role, name, and dairy context.
- **Consequences:** Eliminates critical OWASP API2 broken authentication vulnerabilities (`DP-SEC-01`, `DP-SEC-02`, `DP-SEC-03`).

---

## ADR-002: 10:00 PM Hard Cutoff for Morning Milk Subscriptions
- **Date:** 2026-11-14
- **Decision Owner:** CPO (Agent 2) & Dairy Owner Rep (Agent 6)
- **Status:** **ACCEPTED & IMPLEMENTED**
- **Context:** Customers skipping milk at 1:00 AM or 5:00 AM cause driver routing confusion, wasted bottled milk, and billing friction.
- **Decision:** Implemented `check_delivery_cutoff()` function in `api_v1.py` locking all morning delivery skips, quantity modifications, and extra milk orders after 10:00 PM the night before (and after 5:00 AM day of delivery). Provided `is_admin_override=True` for dairy owner emergency exceptions.
- **Consequences:** Enforces operational discipline in milk dispatch packaging while allowing management flexibility.

---

## ADR-003: Direct Merchant Settlement Architecture for Online Payments
- **Date:** 2026-11-14
- **Decision Owner:** Fintech Engineer (Agent 24) & Product Critic (Agent 14)
- **Status:** **ACCEPTED & IMPLEMENTED**
- **Context:** Handling online payments for multiple independent dairies requires compliance with Indian banking regulations (RBI guidelines on Payment Aggregators).
- **Decision:** Built order creation (`/api/v1/payments/create-order`) and signature verification (`/api/v1/payments/verify`) using Razorpay/Cashfree standard integration where funds route directly to the dairy owner's merchant account. DairyPulse does not hold consumer funds in transit.
- **Consequences:** Zero regulatory exposure to PA-PG licensing while enabling immediate online UPI dues collection.
