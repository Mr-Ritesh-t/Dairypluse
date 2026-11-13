# DairyPulse Product Backlog & Work Items

Prioritized using the RICE framework (Reach, Impact, Confidence, Effort).

---

## 1. High Priority (Sprint 1 & Sprint 2 Candidates)

| Item ID | Module | Title & Description | RICE Score | Est. Effort | Target Sprint |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **PB-01** | Mobile / Rider | **Hardened Offline PWA Service Worker:** Cache delivery stops in IndexedDB with automated background sync on reconnect. | 88.0 | 3 Days | Sprint 1 |
| **PB-02** | Security | **RBAC Dependency Guards:** Inject `Depends(require_role(["OWNER"]))` across all sensitive billing, salary, and customer deletion endpoints. | 85.0 | 2 Days | Sprint 1 |
| **PB-03** | Billing | **Customer Payment Modal with Live Razorpay SDK:** Wire live Razorpay checkout.js trigger into customer mobile portal. | 82.5 | 2 Days | Sprint 1 |
| **PB-04** | Deliveries | **GPS Geofence Validation:** Auto-verify delivery rider is within 50 meters of customer society pin before allowing "Delivered" tap. | 78.0 | 4 Days | Sprint 2 |
| **PB-05** | Inventory | **Batch Expiry & Low Stock Dashboard Alarms:** Visual warning pills on dashboard for milk pouches expiring within 12 hours. | 72.0 | 2 Days | Sprint 2 |

---

## 2. Medium Priority (Sprint 3 & Sprint 4)

| Item ID | Module | Title & Description | RICE Score | Est. Effort | Target Sprint |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **PB-06** | WhatsApp | **Meta WhatsApp Cloud Webhooks:** Handle inbound customer WhatsApp replies ("STOP", "EXTRA 1L") directly via API webhook. | 68.0 | 5 Days | Sprint 3 |
| **PB-07** | Routing | **Dynamic Turn-by-Turn Rider Navigation:** Embed Leaflet/Mapbox in rider PWA with one-tap Google Maps route launch. | 65.0 | 3 Days | Sprint 3 |
| **PB-08** | Invoices | **Automated PDF Invoice Generator:** Backend HTML-to-PDF invoice rendering with dairy branding, GSTIN, and UPI QR code. | 62.0 | 4 Days | Sprint 4 |
| **PB-09** | Payroll | **Rider Per-Drop Commission Engine:** Dynamic salary calculation based on base pay + ₹2 per pouch delivered. | 59.0 | 3 Days | Sprint 4 |

---

## 3. Low Priority / Future Exploration

| Item ID | Module | Title & Description | RICE Score | Est. Effort | Status |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **PB-10** | Hardware | **Bluetooth Milk Analyzer Serial Reader:** Stream Fat/SNF data directly from EkoMilk analyzers via Web Bluetooth API. | 45.0 | 7 Days | Backlog |
| **PB-11** | ML | **Neural Network Demand Predictor:** Replace current rule-based day-of-week multiplier with Prophet time-series model. | 38.0 | 10 Days | Deferred (Critic Reject) |
| **PB-12** | Marketplace| **Split-Payment Escrow Engine:** Multi-vendor payout distribution (Requires RBI/PA-PG aggregator approvals). | 32.0 | 14 Days | Roadmap Phase 3 |
