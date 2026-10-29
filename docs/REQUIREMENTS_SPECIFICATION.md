# DairyPulse: Software Requirements Specification (SRS) & Product Requirements Document (PRD)

**Project Name:** DairyPulse – Smart Milk Supply Chain & Delivery Management Platform  
**Document Version:** 1.0.0  
**Target Audience:** Engineering Team, System Architects, Operations Managers, Academic/Project Evaluators  
**Date:** October 2026  

---

## 1. Executive Summary

### 1.1 Project Vision
**DairyPulse** is an end-to-end, multi-dairy supply chain and doorstep delivery management platform designed for modern dairy farms, milk processing cooperatives, and distribution hubs. It bridges the gap between customer subscriptions, route optimization, vehicle load management, rider dispatch, inventory quality assurance (Fat/SNF testing), and automated billing.

### 1.2 Problem Statement
Traditional milk distribution suffers from:
- **Inefficient routing**: Riders take suboptimal paths without a clear sequential stop order, increasing fuel costs and causing delivery delays.
- **Inflexible delivery times**: Customers cannot specify their preferred delivery time window, leading to missed handoffs and spoiled milk.
- **Inaccurate doorstep addresses**: Lack of exact GPS coordinates causes riders to wander in dense residential societies.
- **Vehicle overload risks**: Dispatches are made without verifying rider vehicle capacity (e.g. 60L bike limits), leading to spillage and mid-run shortages.
- **Poor offline connectivity**: Delivery boys operating in basements or low-network areas cannot record deliveries in real time.

### 1.3 Proposed Solution
DairyPulse introduces:
1. **Interactive Route Builder Studio**: Map-based route visualizer where admins see customer GPS pins, choose the exact stop sequence (`#1 First Stop`, `#2 Second Stop`, `#3...`), check vehicle capacity against max load, and dispatch directly to delivery partners.
2. **Customer Geolocation & Time Preference**: 3-step registration wizard allowing customers to drop an exact map pin and choose their preferred delivery window (`Early Morning: 5:30 - 6:30 AM`, `Morning: 6:00 - 7:30 AM`, `Late Morning: 7:30 - 8:30 AM`, or `Evening: 5:30 - 7:00 PM`).
3. **Delivery Partner Mobile PWA with Offline Engine**: Lightweight mobile app with IndexedDB queue, turn-by-turn map navigation, bottle returns, and cash collection.
4. **Quality & Inventory Tracking**: Batch reception tracking fat %, SNF %, cold-chain storage levels, and automated wastage monitoring.

---

## 2. Stakeholders & User Personas

| Role | Primary Objectives | Key Pain Points Addressed |
| :--- | :--- | :--- |
| **Dairy Owner / Hub Admin** | Manage operations, review revenue, dispatch routes, ensure vehicle load safety, oversee inventory quality. | Disorganized route planning, lack of visibility into delivery progress and inventory wastage. |
| **Delivery Partner (Rider)** | Deliver milk packets in optimal sequence, record successful deliveries, note bottle returns, operate offline. | Confusing flat addresses, missed delivery windows, lack of offline app support. |
| **Household Customer** | Get fresh unadulterated milk daily at their preferred time, pause subscriptions during travel, pay monthly bills. | Inflexible delivery times, difficulty explaining exact society flat location, inaccurate billing. |
| **Commercial / Shop Buyer** | Order bulk milk crates (Cow/Buffalo), verify fat/SNF metrics, maintain B2B credit ledger. | Inconsistent milk quality, manual paper ledgers, lack of digital order records. |

---

## 3. System Architecture & Tech Stack

```mermaid
graph TD
    subgraph Frontend [Client Applications (Next.js 16 + Turbopack)]
        AdminApp["Admin Dashboard & Route Studio<br/>(/delivery, /inventory, /billing)"]
        CustomerPortal["Customer Portal & Wizard<br/>(/login, /mobile/customer)"]
        RiderPWA["Rider Mobile PWA<br/>(/mobile/delivery)"]
    end

    subgraph Backend [Backend API (FastAPI + Python 3.10+)]
        Router["API Gateway / Routers (/api/v1)"]
        AuthService["Auth & Multi-Dairy Controller"]
        RouteEngine["Route Builder & Sequencing Engine"]
        DeliveryService["Daily Task Dispatcher"]
        InventoryService["Fat / SNF & Cold Chain Manager"]
        BillingService["Invoice & Ledger Generator"]
    end

    subgraph Database [Persistence & Storage]
        DB[(Relational DB: SQLite / PostgreSQL)]
        LocalStorage["Client Storage (IndexedDB / LocalStorage)"]
    end

    AdminApp -->|REST API| Router
    CustomerPortal -->|REST API| Router
    RiderPWA -->|REST API & Offline Sync| Router
    RiderPWA --> LocalStorage

    Router --> AuthService
    Router --> RouteEngine
    Router --> DeliveryService
    Router --> InventoryService
    Router --> BillingService

    AuthService --> DB
    RouteEngine --> DB
    DeliveryService --> DB
    InventoryService --> DB
    BillingService --> DB
```

### 3.1 Technology Stack Details
- **Frontend Framework**: Next.js 16.4 (React 19, Turbopack, App Router)
- **Styling**: Tailwind CSS utility tokens, Lucide React icons, Custom Glassmorphism UI
- **Data Visualization**: Recharts (Responsive dual-series area charts, capacity gauges)
- **Geolocation & Mapping**: HTML5 Geolocation API, Normalized Coordinate Projection, Interactive SVG Route Paths
- **Backend Framework**: FastAPI (High-performance ASGI, Python 3.10+)
- **ORM & Database**: SQLAlchemy ORM with SQLite (Development) / PostgreSQL (Production)
- **Data Validation**: Pydantic v2 schemas
- **Testing**: Pytest (28 automated API integration tests)

---

## 4. Functional Requirements Specification (FRS)

### Module 1: Customer Onboarding, Address & Time Preference
- **REQ-1.1**: The system must provide a 3-step registration wizard:
  - *Step 1*: Personal details (Full Name, Mobile Phone, Email, Password).
  - *Step 2*: Multi-dairy farm selection.
  - *Step 3*: Doorstep address, GPS map location pinning, milk variant, daily quantity, and preferred delivery time.
- **REQ-1.2**: The customer must be able to choose from at least 4 preferred delivery time slots:
  - `Early Morning: 5:30 AM - 6:30 AM` (First Batch)
  - `Morning Standard: 6:00 AM - 7:30 AM` (Regular)
  - `Morning Late: 7:30 AM - 8:30 AM` (Working Families)
  - `Evening: 5:30 PM - 7:00 PM` (Fresh Night Supply)
- **REQ-1.3**: The system must store latitude and longitude with ~1 meter precision (5 decimal places) to assist delivery boys.
- **REQ-1.4**: Customers must be able to update their address, flat/door unit, and map pin at any time via the customer portal.

### Module 2: Interactive Route Builder Studio
- **REQ-2.1**: The admin must have an interactive visual studio (RouteBuilderStudio.tsx) displaying:
  - Route Code and Route Name.
  - Area filter (e.g. Baner, Aundh, Kothrud, Wakad, All).
  - Delivery Partner / Rider selector with vehicle capacity.
  - Delivery Shift (Morning vs Evening).
- **REQ-2.2**: The studio must render an interactive map view showing:
  - Numbered green badges (`#1`, `#2`, `#3`...) for selected stops.
  - Dark pins with `+` icon for unselected available customers in that sector.
  - An animated route polyline visually connecting Stop #1 ➔ Stop #2 ➔ Stop #3 in sequence.
  - Tooltips displaying customer name, doorstep address, preferred delivery time, and subscription liters.
- **REQ-2.3**: Stop Sequencing Controls:
  - The admin must be able to reorder stops using `▲ (Move Up)` and `▼ (Move Down)` controls.
  - The first stop must be prominently tagged as `#1 (1st Stop - START)`.
  - The admin must be able to override or customize the specific time slot for any individual stop.
- **REQ-2.4**: Vehicle Capacity Load Meter:
  - The system must calculate real-time total liters for selected stops against vehicle capacity (e.g., 60L).
  - The UI must display a progress bar and trigger an overload warning if total liters exceed max capacity.
- **REQ-2.5**: One-Click Dispatch:
  - Clicking "Save Route & Dispatch to Rider" must trigger `POST /api/v1/routes/build`, persist the route, link customers, and generate today's delivery tasks in that exact sequence.

### Module 3: Delivery Partner Mobile App & Offline Engine
- **REQ-3.1**: The mobile app must display stops strictly ordered by `sequence_order` (`#1`, `#2`, `#3`...).
- **REQ-3.2**: Each stop card must show:
  - Stop sequence number and customer name.
  - Door / Flat number, housing society, and landmark.
  - Quantity and milk variant (e.g., 2.0L Cow Milk).
  - Customer preferred delivery window.
  - One-tap "Navigate in Google Maps" using coordinates.
  - One-tap "Call Customer" phone dialer.
- **REQ-3.3**: The rider must be able to mark deliveries as "Delivered" or "Failed" (with reasons: Door locked, Customer absent, Milk refused).
- **REQ-3.4**: Bottle Return & Cash Collection:
  - Rider can log empty bottles returned and cash collected directly on the delivery card.
- **REQ-3.5**: Offline Resilience:
  - If network drops, delivery actions must be queued in local storage and synced automatically upon reconnection.

### Module 4: Subscriptions & Daily Run Generation
- **REQ-4.1**: Subscriptions must support daily, alternate days, and custom schedules with milk variants (Cow Milk, Buffalo Milk, Toned Milk, A2 Desi Cow Milk).
- **REQ-4.2**: Customers can pause and resume subscriptions without canceling.
- **REQ-4.3**: Idempotent Daily Delivery Generation:
  - Generating daily deliveries via `POST /api/v1/deliveries/generate-daily` must prevent duplicate tasks for the same subscription on the same date.

### Module 5: Inventory, Milk Quality (Fat/SNF) & Wastage
- **REQ-5.1**: Intake tracking with Fat % (3.0% - 9.0%) and SNF % (8.0% - 9.5%) validation.
- **REQ-5.2**: Automatic stock deduction when deliveries are dispatched or shop orders are fulfilled.
- **REQ-5.3**: Wastage logging with reasons (Spoilage, Packaging leak, Spillage, Temperature breach).

### Module 6: Billing, Invoicing & Payments
- **REQ-6.1**: Monthly and period-based billing cycles for household and retail customers.
- **REQ-6.2**: Invoice statuses: `Paid`, `Partial`, `Unpaid`, `Overdue`.
- **REQ-6.3**: Payment logging supporting Cash, UPI, and Bank Transfer with automated balance adjustments.

### Module 7: Analytics & Reporting
- **REQ-7.1**: Real-time sales and dispatch overview charts displaying household subscription volume vs commercial bulk revenue across 7 Days, 30 Days, and 3 Months.
- **REQ-7.2**: Cold-chain wastage intelligence reporting and revenue efficiency tracking.

---

## 5. Non-Functional Requirements (NFR)

| Category | Requirement Specification |
| :--- | :--- |
| **Performance** | API responses must return in under 200ms under ordinary network load. Next.js static and pre-rendered pages must load in < 1 second. |
| **Availability** | The system must support continuous offline rider actions; no delivery progress lost during internet outages. |
| **Scalability** | Capable of supporting multi-tenant operations with 50+ independent dairy hubs and 10,000+ daily delivery tasks. |
| **Usability** | Mobile-first responsive interface optimized for riders wearing gloves or operating with single-hand touch in daylight. |
| **Data Integrity** | Strict database foreign keys, transactional updates, and duplicate task prevention constraints. |
| **Security** | Role-based access control (RBAC) separating Owner, Delivery Partner, and Customer privileges. |

---

## 6. Data Model & Entity Relationship (ER)

```
+--------------------+       +--------------------+       +--------------------+
|      Customer      |       |    Subscription    |       |    DeliveryTask    |
+--------------------+       +--------------------+       +--------------------+
| id (PK)            | 1   * | id (PK)            | 1   * | id (PK)            |
| name               |<----->| customer_id (FK)   |<----->| customer_phone     |
| phone              |       | product_variant    |       | sequence_order     |
| address            |       | quantity_liters    |       | status             |
| latitude           |       | time_slot          |       | slot               |
| longitude          |       | status             |       | latitude/longitude |
| preferred_time     |       | frequency          |       | delivery_date      |
| route (FK Route)   |       +--------------------+       +--------------------+
+--------------------+                                              ^
          | 1                                                       | *
          |                                                         |
          v *                                                       |
+--------------------+                                              |
|       Route        |----------------------------------------------+
+--------------------+
| id (PK)            |
| route_code (Unique)|
| name               |
| area               |
| assigned_rider     |
| max_capacity_liters|
| slot               |
+--------------------+
```

---

## 7. Key REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/routes/build` | Creates/updates route, links customers, sequences stops (`#1`, `#2`...), and dispatches tasks. |
| `GET` | `/api/v1/routes` | Returns all sector routes with capacity and stop counts. |
| `GET` | `/api/v1/deliveries/today` | Fetches today's delivery tasks ordered by sequence. |
| `PATCH` | `/api/v1/deliveries/{id}/status` | Updates delivery status (`Delivered`, `Failed`) with notes and failure reason. |
| `PATCH` | `/api/v1/deliveries/{id}/address` | Updates doorstep address, landmark, society, and GPS coordinates. |
| `POST` | `/api/v1/deliveries/generate-daily` | Generates today's delivery run from active subscriptions idempotently. |
| `GET` | `/api/v1/customers` | Returns all registered customers including coordinates and `preferred_time`. |
| `POST` | `/api/v1/customers` | Registers a new customer with address, coordinates, and delivery preferences. |

---

## 8. Verification & Acceptance Criteria

1. **Route Sequencing Verification**:
   - Creating a route with 3 stops where Customer A is #1, Customer B is #2, and Customer C is #3 must store `sequence_order` as 1, 2, 3 in database.
   - The rider mobile PWA must display Customer A at the very top as `Stop #1`, followed by Customer B as `Stop #2`.
2. **Customer Preferred Time Verification**:
   - Customer selecting `Early Morning: 5:30 AM - 6:30 AM` in the registration wizard must have their preferred time shown in Route Studio and on the rider task card.
3. **Vehicle Capacity Verification**:
   - Adding stops totaling 65L to a 60L route must visibly trigger the Amber/Red Overload Warning on the progress meter.
4. **Offline Sync Verification**:
   - Toggling offline simulation in the mobile app, marking 2 stops as delivered, and restoring connectivity must flush the queue to the backend with zero data loss.
