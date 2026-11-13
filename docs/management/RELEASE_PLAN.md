# DairyPulse Release Plan: Version 2.0 & Sprint 1

## 1. Release Version Overview
- **Target Release:** DairyPulse v2.0-MVP (Core Field Reliability Release)
- **Target Date:** December 2026
- **Release Manager:** Agent 36 (Release Manager)
- **Sign-off Gatekeepers:** CTO (Agent 3), QA Lead (Agent 28), Security Engineer (Agent 31).

---

## 2. Release Milestones & Rollout Stages

```mermaid
graph LR
    classDef stage fill:#0F766E,stroke:#115E59,color:#FFFFFF,stroke-width:2px;
    classDef test fill:#F59E0B,stroke:#D97706,color:#FFFFFF,stroke-width:1.5px;
    classDef prod fill:#10B981,stroke:#047857,color:#FFFFFF,stroke-width:2px;

    M1["Stage 1: Internal Alpha<br/>(Local Dev & Pytest Suite)"]:::stage
    M2["Stage 2: Staging Sandbox<br/>(Razorpay Test Mode & 2 Dairies)"]:::test
    M3["Stage 3: Field Pilot<br/>(Baramati Plant & 5 Baner Riders)"]:::test
    M4["Stage 4: General Availability<br/>(Commercial Launch)"]:::prod

    M1 --> M2 --> M3 --> M4
```

---

## 3. Staging Deployment Checklist
1. **Database Migrations:** Ensure SQLite and PostgreSQL migrations (`ensure_db_columns()`) run automatically on startup without data loss.
2. **Environment Variables:** Verify `.env` has valid values for `SECRET_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `SUPABASE_URL`.
3. **Automated Smoke Tests:** Execute all 43 backend tests and frontend static build (`npm run build`) with zero errors.
4. **Rollback Plan:** Stored git tag `v1.9.4-stable` with database snapshot script available in `scripts/backup_db.py`.
