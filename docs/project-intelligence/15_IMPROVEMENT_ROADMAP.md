# DairyPulse — Engineering Roadmap, Improvement Plan & Learning Guide

This document provides a prioritized implementation roadmap, recommended learning order, and architectural improvements to guide the future development of DairyPulse.

---

## 1. Top 15 Architecture & Engineering Findings

| Rank | Finding / Area | Impact | Affected Modules | Recommended Action |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Monolithic Router File** | High Maintainability | `backend/app/routers/api_v1.py` | Split into sub-routers: `customers.py`, `deliveries.py`, `routes.py`, `inventory.py`. |
| **2** | **CORS Configuration** | High Security | `backend/app/main.py:19` | Replace `allow_origins=["*"]` with explicit environment domain in production. |
| **3** | **Monetary Float Precision** | High Financial Integrity | `backend/app/models/models.py` | Migrate `selling_price`, `balance`, `total_amount` to `Numeric(10, 2)`. |
| **4** | **JWT Cookie Auth vs Session Storage** | High Security | `frontend/src/context/AuthContext.tsx` | Store authenticated session in secure HTTP-only cookies rather than `sessionStorage`. |
| **5** | **Road-Distance Route Optimization** | High Operational Value | `RouteBuilderStudio.tsx` | Integrate open-source OSRM (Open Source Routing Machine) or Google Directions API for automatic TSP route calculation. |
| **6** | **Composite Unique Index on Deliveries** | High Data Integrity | `backend/app/models/models.py` | Add DB-level constraint: `UniqueConstraint('customer_phone', 'delivery_date', 'slot')`. |
| **7** | **Service Worker Background Sync** | High Reliability | `frontend/src/lib/offlineSync.ts` | Register a Service Worker with the Web Background Sync API to sync even if the tab closes. |
| **8** | **Modular Context State** | Medium Frontend Perf | `DairyPulseContext.tsx` | Split monolithic context into `DeliveryContext`, `BillingContext`, and `InventoryContext`. |
| **9** | **Foreign Key on Delivery Tasks** | Medium DB Integrity | `DeliveryTask` model | Add explicit `customer_id = Column(String, ForeignKey("customers.id"))`. |
| **10** | **Negative Stock Constraint** | Medium Inventory Safety | `backend/app/models/models.py` | Add `CHECK (available_stock >= 0)` constraint on `products` table. |
| **11** | **Dynamic Sector Landmarks** | Low UX Flexibility | `MapLocationPicker.tsx` | Fetch sector landmarks dynamically from database instead of hardcoding Pune areas. |
| **12** | **Automated Invoice PDF Generation** | Medium Feature Value | `frontend/src/app/billing/page.tsx` | Integrate `@react-pdf/renderer` for instant downloadable PDF monthly milk bills. |
| **13** | **SMS / WhatsApp Delivery Notifications** | High Customer Delight | `backend/app/routers/api_v1.py` | Webhook trigger on `Delivered` status sending WhatsApp notification to consumer. |
| **14** | **Pagination on Large Tables** | Medium Scalability | `GET /customers`, `GET /invoices` | Add `limit` and `offset` pagination parameters to prevent high memory usage at 10,000+ records. |
| **15** | **Alembic Automated Migrations** | High DevOps Hygiene | `backend/` | Initialize Alembic migration versions (`alembic init alembic`) to manage schema changes smoothly. |

---

## 2. Top 10 Prioritized Implementation Tasks

| Task # | Title | Expected Benefit | Effort | Affected Files | Verification Method |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **T-01** | **Split `api_v1.py` into Domain Routers** | Eliminates code bloat, clean team git workflow | 3 hours | `backend/app/routers/` | Run `pytest` (28/28 tests must pass) |
| **T-02** | **Enforce CORS Production Origins** | Secures API from unauthorized web origins | 30 mins | `backend/app/main.py`, `.env` | Inspect CORS headers with cURL |
| **T-03** | **Migrate Currency Fields to Numeric** | Eliminates floating-point rounding errors | 2 hours | `models.py`, `schemas.py` | Verify payment and balance calculations |
| **T-04** | **Add Composite Unique Delivery Constraint** | Guarantees zero duplicate tasks at DB level | 1 hour | `models.py:173` | Test duplicate task insertion rejection |
| **T-05** | **Direct FK on DeliveryTask.customer_id** | Enables direct relational joins and cascades | 1.5 hours | `models.py`, `api_v1.py` | Verify task lookups by ID |
| **T-06** | **Service Worker Offline Background Sync** | Flushes offline deliveries even if browser closes | 4 hours | `frontend/public/sw.js` | Disconnect internet, close tab, verify sync |
| **T-07** | **Modularize React Contexts** | Optimizes React re-renders across dashboard | 3 hours | `frontend/src/context/` | React Profiler re-render inspection |
| **T-08** | **Downloadable PDF Invoice Receipts** | Professional printed monthly bills for customers | 3 hours | `billing/page.tsx` | Download and inspect generated PDF |
| **T-09** | **Add Query Pagination to List Endpoints** | Protects server memory as customer base grows | 2 hours | `api_v1.py`, `api.ts` | Query with `?limit=10&offset=0` |
| **T-10** | **WhatsApp Webhook for Milk Delivery Drop-off** | Instant customer notification upon delivery | 4 hours | `api_v1.py` | Webhook test endpoint validation |

---

## 3. Recommended Code Study Order (For Students & Developers)

If you have 2 hours to master this codebase before an interview or presentation, study the files in this exact sequence:

1. **`backend/app/models/models.py`** (30 mins):  
   Understand the 12 entities: `Customer` (with `latitude`, `longitude`, `preferred_time`), `Route` (with `max_capacity_liters`), and `DeliveryTask` (with `sequence_order`).
2. **`backend/app/routers/api_v1.py:315`** (20 mins):  
   Study `POST /routes/build`. See how it receives stops in sequence, links customers to routes, and sets `sequence_order` on today's tasks.
3. **`frontend/src/components/delivery/RouteBuilderStudio.tsx`** (25 mins):  
   Study the normalized coordinate projection onto the map, the Up/Down sequence buttons, and the vehicle capacity meter.
4. **`frontend/src/app/mobile/delivery/page.tsx` & `lib/offlineSync.ts`** (20 mins):  
   Understand how delivery partners see ordered stops, and how IndexedDB queues actions when offline.
5. **`backend/tests/test_api.py`** (15 mins):  
   Run `pytest` and read the assertions. This proves everything is functional.

---

## 4. Knowledge Gaps & Runtime Environment Notes

- **External Services**: The project currently uses zero external paid third-party APIs (no paid Google Maps API keys or third-party SMS gateways required). Everything is self-contained and operates locally.
- **Production Database**: SQLite is active by default in development (`dairypulse.db`). Transitioning to PostgreSQL requires provisioning a PostgreSQL database and setting `DATABASE_URL` in `.env`.
