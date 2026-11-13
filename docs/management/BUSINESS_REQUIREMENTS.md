# DairyPulse Business Requirements Document (BRD)

## 1. Procurement & Quality Ingestion
- **BR-01:** System must capture incoming milk shipments from farmers and third-party tanker routes including supplier name, batch number, liters received, Fat %, SNF %, and receiving temperature.
- **BR-02:** System must enforce quality thresholds (minimum Fat 3.5% for Cow, 6.0% for Buffalo) and flag sour or adulterated batches before pumping into processing silos.
- **BR-03:** FIFO inventory management: Raw milk batches must have strict 48-hour shelf-life expiry tracking with automated dispatch warnings.

---

## 2. Customer Subscriptions & Modifications
- **BR-04:** Household customers must be able to select daily, alternate-day, or custom-schedule milk deliveries with morning (6:00 AM – 7:30 AM) and evening slots.
- **BR-05:** **Cut-off Enforcement:** Customers cannot pause, skip, or alter morning delivery quantities after **10:00 PM** the previous night. Emergency changes after 10:00 PM require dairy owner / admin override.
- **BR-06:** Extra milk requests made prior to cut-off must be automatically converted into additional delivery tasks linked to the assigned route rider.

---

## 3. Delivery Route Optimization & Dispatch
- **BR-07:** The platform must cluster customers geographically by Area, Society, and Wing to produce an optimized morning delivery sequence for riders.
- **BR-08:** Rider mobile interface must function completely offline. Marked deliveries must be queued in local storage (IndexedDB) and automatically synchronized with the server when connectivity resumes.
- **BR-09:** Delivery failures must mandate a reason selection (e.g. "Door Locked", "Customer Refused", "Stray Dog Guarding Doorstep") to maintain delivery accountability.

---

## 4. Billing, Invoices & Payment Gateway
- **BR-10:** Billing cycles default to monthly (1st to month-end). Invoices must calculate total delivered milk value minus approved skips and plus extra milk requests.
- **BR-11:** Payment gateway integration (Razorpay / Cashfree) must support UPI, Netbanking, Cards, and cash collection recording.
- **BR-12:** Double-entry ledger: Successful payment gateway webhooks must automatically reduce customer outstanding dues and mark corresponding invoices `Paid`.
- **BR-13:** Automated month-end WhatsApp payment reminders with embedded UPI deep-links must be generated for all customers with balance > ₹0.

---

## 5. Security & Multi-Tenancy
- **BR-14:** Cryptographic authentication: Passwords must be hashed using salted Bcrypt (`passlib` / `bcrypt`). Sessions must issue signed HS256 JWT tokens.
- **BR-15:** Multi-tenancy: Dairy owners must only view and modify data belonging to their registered dairy brand.
