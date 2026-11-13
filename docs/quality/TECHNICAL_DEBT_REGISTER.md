# DairyPulse Technical Debt & Code Shortcuts Register

Managed in accordance with `ponytail-debt`.

---

## Technical Debt Ledger

| Debt ID | Module | Description & Known Limit | Impact | Remediation Plan & Target |
| :--- | :--- | :--- | :---: | :--- |
| **DEBT-01** | Backend Auth | Role-based endpoint authorization currently enforced by inspection rather than reusable FastAPI dependencies (`current_user = Depends(require_role)`). | Medium | Implement standard dependency guard in Sprint 1. |
| **DEBT-02** | Database Migration | Automatic column backfilling handled via raw SQLite `PRAGMA` in `main.py#ensure_db_columns()`. | Low | Introduce Alembic migration scripts when migrating to multi-instance production PostgreSQL. |
| **DEBT-03** | Frontend State | Local state in `DairyPulseContext.tsx` holds memory-cached copies alongside API sync. | Medium | Transition heavy queries to React Query / SWR for automated cache invalidation. |
| **DEBT-04** | Route Optimization| Route optimization endpoint currently evaluates heuristics and simulated stop sequencing for Baramati and Baner. | Low | Integrate open-source OSRM or Google Distance Matrix API when fleet expands beyond 20 riders. |
| **DEBT-05** | CORS Policy | Development mode allows wildcard `allow_origins=["*"]` when testing locally without proxy. | Medium | Enforce strict origin whitelisting (`dairypulse.farm`, `localhost:3000`) in production settings. |

