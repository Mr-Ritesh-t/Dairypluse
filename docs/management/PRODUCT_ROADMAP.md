# DairyPulse Strategic Product Roadmap (2026–2027)

```mermaid
gantt
    title DairyPulse Commercial Roadmap
    dateFormat  YYYY-MM-DD
    section Phase 1: Core Field Reliability
    10PM Cutoff & Security Fixes      :done, p1_1, 2026-10-15, 2026-11-14
    Online Payments & Webhook Sync    :done, p1_2, 2026-11-01, 2026-11-14
    Offline Rider PWA & IndexedDB     :active, p1_3, 2026-11-15, 2026-12-05
    GPS Geofenced Delivery Proof      :p1_4, 2026-12-06, 2026-12-25
    section Phase 2: Operations & Scale
    Multi-Dairy Tenant Hardening      :p2_1, 2026-12-20, 2027-01-20
    WhatsApp Cloud Business API Native:p2_2, 2027-01-10, 2027-02-15
    Dock Milk Analyzer Bluetooth Sync :p2_3, 2027-02-01, 2027-03-10
    section Phase 3: Commercial SaaS
    Automated Split-Settlement Engine :p3_1, 2027-03-01, 2027-04-15
    Predictive Silo Souring Telemetry :p3_2, 2027-04-01, 2027-05-30
```

---

## Roadmap Phases

### Phase 1: Core Field Reliability & Cashflow (Q4 2026) - *CURRENT*
- **Milestone 1.1 (Complete):** 10:00 PM cutoff enforcement, Bcrypt password hashing, JWT authentication, and Razorpay/Cashfree order generation & verification.
- **Milestone 1.2:** Hardening the Delivery Rider mobile interface into an installable, offline-first PWA with IndexedDB background sync.
- **Milestone 1.3:** GPS-verified doorstep drop-off proof and customer photo confirmation for dispute elimination.

### Phase 2: Multi-Tenant Operational Hardening (Q1 2027)
- **Milestone 2.1:** Strict multi-tenant row-level security (RLS) enforcement across all API endpoints with `require_dairy_context` dependency.
- **Milestone 2.2:** Native Meta WhatsApp Business Cloud API integration for automated bill dispatch and interactive 1-tap customer pause/resume.
- **Milestone 2.3:** Bluetooth hardware integration with ultrasonic milk analyzers at collection docks.

### Phase 3: Marketplace & Commercial SaaS (Q2 2027)
- **Milestone 3.1:** Provider-approved automated payout splits and marketplace settlement architecture for independent dairy networks.
- **Milestone 3.2:** IoT chilling silo telemetry integration with automated cold-chain failure alarms.
