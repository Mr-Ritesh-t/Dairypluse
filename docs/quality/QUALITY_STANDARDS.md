# DairyPulse Quality Standards & Code Health

Standards enforced across all Pull Requests and code modifications.

---

## 1. Code Quality Metrics
- **Python / Backend:**
  - Python 3.10+ PEP 8 compliance.
  - 100% Pydantic v2 type validation on API inputs and responses.
  - Zero raw string SQL execution without parameterized queries.
  - SQLAlchemy session life-cycle managed strictly via `Depends(get_db)`.
- **TypeScript / Frontend:**
  - Strict type checking (`tsc --noEmit` must pass with 0 errors).
  - Zero unvetted `any` types in data-layer models.
  - Semantic HTML5 with ARIA labels on all interactive buttons, inputs, and modals.
  - Clean separation of UI components (`src/components/ui`), feature views, and API calls (`src/lib/api.ts`).

---

## 2. The Ponytail Minimal Change Doctrine
1. Implement the simplest code that solves the user story completely.
2. Eliminate unnecessary wrappers, intermediate helper classes, and premature abstractions.
3. Every non-trivial branch or ledger mutation must be accompanied by a unit test.
4. Any deferred edge-case must be explicitly logged as `shortcut: <limit>, <when to fix>`.

