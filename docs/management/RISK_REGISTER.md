# DairyPulse Project Risk Register & Mitigation Strategy

Systematic tracking of business, technical, operational, and regulatory risks.

---

## Risk Evaluation Matrix

| Risk ID | Category | Risk Description | Likelihood | Impact | Severity | Mitigation Strategy |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **RSK-01** | Technical | **Apartment Network Dropouts:** Rider loses cellular coverage inside society basement elevators, preventing stop logging. | High | High | **CRITICAL** | Offline-first IndexedDB architecture with automated background sync and visual offline badge. |
| **RSK-02** | Security | **Tenant Isolation Breach:** Bug in query filters allows Dairy A owner to view Dairy B customer phone numbers or revenue. | Low | Critical | **CRITICAL** | Enforce `dairy_name` / `dairy_id` scoping in SQLAlchemy session queries; automated multi-tenant isolation unit tests. |
| **RSK-03** | Regulatory | **Payment Aggregator Escrow Restrictions:** Intermediary handling of customer milk funds without RBI PA-PG license. | Low | Critical | **CRITICAL** | Route customer payments directly to dairy owner's verified Razorpay merchant ID (Route/Direct). Never hold escrow funds. |
| **RSK-04** | Operational | **Disputed 10:00 PM Pauses:** Customer claims they paused delivery via verbal phone call to delivery boy before 10:00 PM. | Medium | Medium | **HIGH** | In-app push/SMS confirmation log with immutable timestamps; customer self-service app is the source of truth. |
| **RSK-05** | Financial | **WhatsApp Business API Messaging Costs:** Large broadcast volumes inflating messaging expenses. | Medium | Low | **MEDIUM** | Offer free browser-based `wa.me` deep links for smaller dairies; reserve Cloud API templates for Enterprise tier. |
| **RSK-06** | Performance | **Morning 05:30 AM Peak Sync Spikes:** All riders across Pune syncing routes simultaneously causing backend slowdown. | High | Medium | **HIGH** | Redis query caching on static routes, connection pooling, and optimized lightweight JSON responses. |

