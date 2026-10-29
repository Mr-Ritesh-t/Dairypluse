# DairyPulse — Authentication, Security & Permissions Audit

This document reviews the authentication mechanisms, role-based authorization rules, session lifecycles, and security posture of DairyPulse.

---

## 1. Authentication & Role-Based Access Control (RBAC)

### 1.1 Implemented Roles & Personas
DairyPulse defines three user roles in `frontend/src/types/index.ts:175` and `backend/app/models/models.py:40`:
1. **`OWNER` (Dairy Hub Manager / Operations Administrator)**:
   - Full access to all operational dashboards: `/delivery`, `/inventory`, `/billing`, `/staff`, `/expenses`, `/reports`.
   - Access to the Interactive Route Builder Studio to create, sequence, and dispatch routes.
   - Authority to receive milk batches, alter product pricing, and log wastage.
2. **`DELIVERY` (Delivery Partner / Rider)**:
   - Mobile PWA access restricted to `/mobile/delivery`.
   - Authorized to view assigned stops for today's run.
   - Authorized to update stop delivery status (`Delivered`, `Failed`) and log empty bottle returns and cash collection.
3. **`CUSTOMER` (Household Milk Consumer)**:
   - Self-service portal access restricted to `/mobile/customer`.
   - Authorized to pause and resume their active subscription, update delivery time preferences, and view invoice history.

---

## 2. Authentication Workflow in Code

### 2.1 Frontend Authentication Lifecycle (`frontend/src/context/AuthContext.tsx`)
```typescript
// AuthContext initializes from browser sessionStorage
useEffect(() => {
  const storedUser = sessionStorage.getItem('dairypulse_user');
  if (storedUser) {
    try {
      setUser(JSON.parse(storedUser));
    } catch (e) {
      sessionStorage.removeItem('dairypulse_user');
    }
  }
  setIsLoading(false);
}, []);
```

- When a user logs in via `frontend/src/app/login/page.tsx`, `login(loginId, password, selectedRole)` validates the credentials against seeded accounts:
  - Admin: `admin@dairypulse.farm` / `admin123` ➔ Role: `OWNER`
  - Rider: `+91 98220 11984` / `rider123` ➔ Role: `DELIVERY`
  - Customer: `+91 98200 44551` / `user123` ➔ Role: `CUSTOMER`
- The authenticated user object is stored in browser `sessionStorage`, persisting state across page refreshes during the session.

---

## 3. Security Findings & Risk Matrix

| Finding / Area | Severity | Likelihood | Impact | Code Evidence | Recommended Mitigation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. CORS Allows All Origins (`"*"`)** | **Medium** | High | Low (Dev) / High (Prod) | `backend/app/main.py:19`: `allow_origins=["*"]` | In production, restrict `allow_origins` to the specific Next.js production domain (e.g. `https://dairypulse.farm`). |
| **2. Plaintext Seed Credentials in Code** | **Medium** | Low | Low (Demo) / High (Prod) | `backend/app/config.py:12`: Default `SECRET_KEY` string fallback | Require `SECRET_KEY` from environment variables in production; disallow starting the server if the default key is present. |
| **3. Client-Side Role Enforcement** | **Medium** | Medium | Medium | `frontend/src/components/layout/Sidebar.tsx:70` | Enforce role validation at the FastAPI dependency level (`Depends(verify_owner_role)`) so modifying client state cannot call administrative endpoints. |
| **4. IDOR (Insecure Direct Object Reference) Risk on Status Updates** | **Low** | Low | Medium | `PATCH /api/v1/deliveries/{id}/status` | Add rider ownership validation: verify that `delivery_task.assigned_rider == current_user.name` before allowing status updates. |
| **5. SQL Injection Protection** | **Secure** | Negligible | Critical | `backend/app/routers/api_v1.py` | **PASSED**: All database queries use SQLAlchemy parameterized ORM queries (`db.query(Model).filter(...)`); zero raw SQL string concatenation was found. |
| **6. Secret Leakage Prevention** | **Secure** | Negligible | High | Entire repository | **PASSED**: No private API keys, cloud storage tokens, or payment gateway secrets are committed. |
