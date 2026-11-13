# DairyPulse Staging & Production Release Checklist

Every release must complete this verification gate before deployment.

---

## 1. Automated Verification Gates
- [ ] **Backend Tests:** Run `pytest backend/tests -v`. 100% of tests must pass (Current baseline: 43/43 passing).
- [ ] **Typecheck:** Run `node ./node_modules/typescript/bin/tsc --noEmit` in `frontend/`. 0 errors allowed.
- [ ] **Production Build:** Run `npm run build` in `frontend/`. All 18 routes must compile and prerender cleanly.
- [ ] **Lint & Cleanliness:** Verify no debug `console.log()` statements or leftover scratch files in source.

---

## 2. Security & Compliance Gates
- [ ] **No Plaintext Secrets:** Check `.env` and configuration files. Ensure no live private keys or credentials are committed to version control.
- [ ] **Bcrypt Hashing:** Verify new user registration produces salted bcrypt hashes.
- [ ] **JWT Minting:** Verify login response issues signed JWT tokens rather than dummy strings.
- [ ] **Accidental Data Loss Gate:** Confirm that no destructive SQL operations (`DROP`, `TRUNCATE`) are scheduled in migration scripts without backups.

---

## 3. Product & Operational Gates
- [ ] **10:00 PM Cutoff Check:** Verify that tomorrow morning deliveries are locked after 10:00 PM local time.
- [ ] **Payment Reconciliation Check:** Verify that simulated gateway orders deduct the exact amount from customer ledger balances.
- [ ] **Mobile PWA Touch Targets:** Verify rider and customer mobile buttons are easily clickable on a small screen (minimum 44x44px).
- [ ] **Release Notes:** Document all changes in `docs/project-analysis/` and update user-facing release notes.
