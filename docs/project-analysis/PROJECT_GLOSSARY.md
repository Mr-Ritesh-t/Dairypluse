# DairyPulse Project Glossary & B.Tech IT Viva Guide

> **Document Version:** 1.0.0  
> **Team:** NEXURA  
> **Target Audience:** Engineering Team, System Architects & B.Tech IT Students Preparing for Final Year Project Viva  

---

## 1. Domain & Industry Terminology (The Dairy Supply Chain)

1. **FAT Content:** The percentage of pure butterfat present in raw milk. Cow milk typically contains 3.5%–4.5% FAT, while buffalo milk contains 6.5%–8.5% FAT. DairyPulse records FAT percentage on every milk intake batch.
2. **SNF (Solids-Not-Fat):** All milk solids excluding fat (proteins, lactose, minerals, and vitamins). Standard buffalo milk has an SNF around 9.0%, and cow milk around 8.5%.
3. **Chilling Center / Bulk Milk Cooler (BMC):** The physical dairy facility where milk collected from rural farmers is rapidly chilled to below 4°C to halt bacterial growth before pasteurization and dispatch.
4. **Milk Crate:** Standard industrial plastic crate used by delivery riders, typically holding 12 to 24 milk pouches (usually 12 Liters per crate). In DairyPulse, riders confirm both crate and liter counts during morning pickup.
5. **Milk Variants:** The distinct varieties cataloged in `products` (Cow Milk, Buffalo Milk, Toned Milk, and A2 Desi Cow Milk).
6. **Household Subscription:** A standing recurring order where a family receives a set quantity of milk (e.g. 1.5L) every morning or on alternate days without needing to place an order every day.
7. **B2B Commercial Order:** One-off or scheduled bulk orders placed by restaurants, sweet shops (halwais), tea stalls, or grocery stores.
8. **Delivery Stop:** An individual doorstep destination on a delivery route, sequenced by geographic order for optimal rider travel.
9. **Fleet Status:** The real-time operational status of the dairy's delivery fleet and riders (e.g. "Active Dispatch" indicating riders are currently on duty delivering milk).
10. **UPI Intent URI:** A standardized Android/iOS deep-link URI format (`upi://pay?pa=...`) that directly opens installed UPI payment apps (GPay, PhonePe, Paytm) with pre-filled payee details and exact billing amounts.

---

## 2. Software Architecture & Technical Terminology

1. **Micro-Modular Monolith:** An architecture where all application domain routers and models run within a single unified service (FastAPI) while maintaining strict modular separation across domain boundaries.
2. **Optimistic UI Updates:** A design pattern where user actions update client-side screen state immediately, assuming the backend request will succeed. If the request fails, the state rolls back with a toast alert.
3. **PWA (Progressive Web App):** A web application built with modern web capabilities that behaves like an installed native app on mobile phones, with offline capabilities and mobile-optimized touch controls.
4. **CORS (Cross-Origin Resource Sharing):** HTTP headers that tell the browser whether resources can be shared across different origin domains (e.g., between the Vercel frontend domain and the Render backend domain).
5. **SQLAlchemy ORM:** An Object-Relational Mapping library that converts Python class definitions into SQL table schemas and translates database rows into Python objects.
6. **Pydantic v2:** A data validation and settings management library using Python type annotations to validate request bodies and format API responses.
7. **Connection Pooling:** A cache of active database connections maintained by SQLAlchemy so incoming HTTP requests don't waste time opening and closing new database sockets.
8. **Batch Synchronization:** The process of collecting multiple offline mutations in a local queue and transmitting them to the server in a single unified HTTP payload (`POST /deliveries/sync-batch`).

---

## 3. B.Tech IT Final Year Project Viva Preparation Guide

Here are the most common questions an external examiner or university viva panel will ask about DairyPulse, along with precise, code-backed technical answers:

### Q1: What problem does DairyPulse solve, and why is an ERP needed for milk distribution?
> **Answer:** In India, over 70% of milk distribution is handled by unorganized local dairies using manual paper notebooks. Dairies face four massive challenges: 
> 1) Morning route chaos and lost delivery stops; 
> 2) Leakage and disputes in customer payment ledgers; 
> 3) Spoilage and wastage of perishable milk without batch tracking; and 
> 4) Inability for customers to easily adjust daily subscriptions when going on vacation. 
> DairyPulse replaces paper ledgers with an AI-enabled ERP that connects the farm owner, delivery riders, and customers in real time.

---

### Q2: What is the technology stack, and why did you choose Next.js and FastAPI?
> **Answer:** 
> - **Frontend:** Next.js 16 with React 19, TypeScript, and Tailwind CSS. We chose Next.js for its App Router, built-in SSR for fast initial loads, and ability to build responsive PWAs for mobile riders.
> - **Backend:** Python with FastAPI and Uvicorn. FastAPI was selected for its native async performance, automatic OpenAPI `/docs` generation, and Pydantic schema validation.
> - **Database:** SQLAlchemy 2.0 ORM with SQLite for development and PostgreSQL (Supabase / Render) for cloud deployment.
> - **Authentication:** Multi-role authentication supporting password credentials, Google OAuth, and Phone OTP via Supabase.

---

### Q3: How does your delivery system work if a delivery rider enters a basement with no internet?
> **Answer:** We implemented an **Offline Synchronization Queue** in `frontend/src/lib/offlineSync.ts`. When the rider marks a stop as "Delivered" while offline, the browser catches the offline state and writes an `OfflineDeliveryAction` object into `localStorage` (`dairypulse_offline_delivery_queue_v1`). The rider's UI updates optimistically with a pending clock badge. When the rider re-emerges into network coverage, the `window.ononline` event listener automatically triggers `flushQueue()`, batch-sending all queued actions to `POST /api/v1/deliveries/sync-batch`. The backend processes them atomically in a single database transaction.

---

### Q4: How does marking a delivery affect the customer's billing ledger?
> **Answer:** In `backend/app/routers/api_v1.py#L1251`, when a stop is patched with `status="Delivered"`, the backend calculates `line_total = quantity_liters * unit_price`. It updates the delivery record with `delivered_at` timestamp, increments `staff.deliveries_today`, and executes an atomic ledger update: `customer.balance += line_total`. When the customer pays, `POST /invoices/{id}/payments` executes `customer.balance -= paid_amount`, ensuring the running ledger is always 100% mathematically balanced.

---

### Q5: How does DairyPulse handle multi-tenancy? Can one dairy see another dairy's customers?
> **Answer:** DairyPulse utilizes **row-level tenant scoping**. Major operational models (`customers`, `products`, `routes`, `delivery_tasks`, `subscriptions`, `orders`, `staff`, `invoices`) contain a `dairy_name` or `dairy_id` foreign key. All list and summary queries in `api_v1.py` enforce filtering by the active dairy context, guaranteeing strict multi-tenant data isolation.

---

### Q6: How does the AI Demand Forecasting work?
> **Answer:** Implemented in `api_v1.py#L1980` under `GET /analytics/demand-forecast`. It aggregates total liters committed across all active household subscriptions (`status="Active"`), adds scheduled commercial shop orders, applies weekday multiplier coefficients (e.g. 1.1x on weekends when household milk consumption rises), and factors in a 15% safety buffer. It compares this predicted demand against `products.available_stock` in the chilling vats to calculate net shortages and output recommended farmer procurement volumes.

---

### Q7: If you had 3 more months on this project, what would you improve?
> **Answer:** 
> 1. Complete the automated online payment gateway integration using Razorpay UPI AutoPay for recurring subscription debits.
> 2. Upgrade authentication to use salted Bcrypt password hashes and cryptographically signed JWT tokens.
> 3. Refactor the 3,000-line monolithic `api_v1.py` file into domain-specific sub-routers.
> 4. Add native push notifications using Web Push API to alert customers the moment milk is placed at their doorstep.

---

This glossary and viva guide provides complete technical grounding for academic project defenses and technical interviews.
