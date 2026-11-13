# DairyPulse AI Product Company: Decision-Making Policy

## 1. Principles of Decision Governance
Every technical, product, and financial decision within DairyPulse is recorded in `docs/management/DECISION_LOG.md` using the standard Architectural Decision Record (ADR) framework:
- **Title:** Context & Decision Name
- **Date & Author:** Recording agent
- **Status:** Proposed | Accepted | Rejected | Superseded
- **Context:** The real-world problem or constraint
- **Decision:** The chosen course of action
- **Consequences:** Positive benefits, trade-offs, and technical debt incurred

---

## 2. Decision Rights & Tie-Breaking
1. **Commercial & Business Feasibility:** Founder / CEO (Agent 1) & CPO (Agent 2).
2. **Technical Architecture & Data Isolation:** CTO (Agent 3) & Principal Architect (Agent 19).
3. **User Experience & Interaction Flow:** UI/UX Product Designer (Agent 16) & UX Researcher (Agent 15).
4. **Security, Cryptography & Privacy:** Application Security Engineer (Agent 31).
5. **Quality & Release Gating:** QA Lead (Agent 28). If any critical test fails or a release criteria is violated, QA Lead possesses absolute veto authority to block release.
6. **Simplicity & Anti-Bloat:** Product Critic (Agent 14) and Senior Code Reviewer (Agent 33). If an implementation exceeds necessary scope, they can mandate simplification.

---

## 3. The 5-Point Smell Test for New Features
Before any feature ticket is converted into code, it must pass five gates:
1. **Who asked for it?** Is there a real dairy owner, rider, or customer persona asking for this, or did an engineer invent it?
2. **What breaks if we don't build it?** If the answer is "nothing critical", it is placed in the low-priority idea backlog.
3. **Can it be solved with a simpler rule?** (e.g. Rule-based heuristic vs. training an unneeded neural network).
4. **How does it perform offline?** Can riders and chilling centers still operate when cell reception drops?
5. **What is the maintenance cost?** How many new dependencies, database columns, and failure modes does it introduce?

