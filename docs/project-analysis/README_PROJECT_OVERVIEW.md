# DairyPulse — Technical Project Overview & Repository Map

> **Document Version:** 1.0.0  
> **Date:** November 2026  
> **Team:** NEXURA  
> **Classification:** Comprehensive Technical Architecture & Project Audit  

---

## 1. Executive Summary

**DairyPulse** is an enterprise-grade, AI-enabled dairy management and daily milk distribution ERP platform engineered specifically for the Indian dairy supply chain. It digitizes and unifies the end-to-end operational lifecycle of local and regional dairies—from farmer milk collection, quality testing (FAT/SNF parameters), batch inventory, and chilling center stock management to morning/evening household subscriptions, shop/restaurant bulk dispatches, delivery rider fleet routing, automated billing, and customer ledger reconciliation.

The application operates as a unified multi-role platform serving four distinct stakeholder personas:
1. **Dairy Owners / Farm Managers:** Full web-based operational command center to track sales, stock intake, billing cycles, rider attendance, and AI demand forecasting.
2. **Delivery Staff / Riders:** Mobile-first Progressive Web App (PWA) interface for turn-by-turn route dispatch, milk crate collection, stop-by-stop delivery verification, offline caching, and daily earnings tracking.
3. **Consumers / Household Customers:** Self-service mobile portal to view live morning/evening delivery status, adjust subscriptions, schedule extra milk, download monthly bills, pay via UPI, and rate their delivery rider.
4. **Super Admin / Platform Operators:** Multi-dairy tenant management and regional fleet oversight.

---

## 2. Technology Stack Inventory (Verified from Source Code)

The following technologies were directly verified by inspecting dependency manifests, configuration files, and source code across the repository:

### 2.1 Frontend Stack (`frontend/package.json`)
| Technology | Verified Version | Purpose in DairyPulse | Source Code Reference |
|---|---|---|---|
| **Next.js** | `16.4.2` | App Router framework, SSR/SSG, layout streaming, and client routing | `frontend/package.json#L15` |
| **React** | `19.3.0` | Declarative UI component architecture and client rendering | `frontend/package.json#L16` |
| **React DOM** | `19.3.0` | DOM renderer for React 19 | `frontend/package.json#L17` |
| **TypeScript** | `^5` | Strict static type definitions across pages, components, and contexts | `frontend/package.json#L28` |
| **Tailwind CSS** | `^4` | Utility-first responsive CSS styling with custom agricultural color palette | `frontend/package.json#L27` |
| **Lucide React** | `^1.61.0` | Comprehensive icon set for operational dashboards, cards, and mobile bars | `frontend/package.json#L13` |
| **Motion (Framer Motion)** | `^14.13.0` | Fluid layout transitions, smooth modal dialogs, and route animations | `frontend/package.json#L14` |
| **Recharts** | `^3.10.1` | Data visualization charts for revenue, milk intake trends, and stock levels | `frontend/package.json#L18` |
| **Supabase JS** | `^2.118.0` | Client SDK for Supabase authentication, Google OAuth, and phone OTP | `frontend/package.json#L12` |
| **ESLint & ESLint Config Next** | `^9` / `16.4.2` | Code quality enforcement and Next.js best-practice linting | `frontend/package.json#L25-L26` |

### 2.2 Backend Stack (`backend/requirements.txt`)
| Technology | Verified Version | Purpose in DairyPulse | Source Code Reference |
|---|---|---|---|
| **Python** | `3.10.11` (Runtime) | Core backend programming runtime | Verified via venv runtime |
| **FastAPI** | `>=0.115.0` | High-performance asynchronous REST API framework | `backend/requirements.txt#L1` |
| **Uvicorn** | `>=0.32.0` | ASGI web server for asynchronous request handling | `backend/requirements.txt#L2` |
| **Pydantic** | `>=2.10.0` | Schema validation, request serialization, and response modeling | `backend/requirements.txt#L3` |
| **Pydantic Settings** | `>=2.6.0` | Environment configuration parsing via `.env` files | `backend/requirements.txt#L4` |
| **SQLAlchemy** | `>=2.0.36` | ORM for database models, relationships, transactions, and queries | `backend/requirements.txt#L5` |
| **Psycopg2 Binary & Psycopg** | `>=2.9.10` / `>=3.2.0` | PostgreSQL database drivers for cloud hosting (Supabase, Render) | `backend/requirements.txt#L6-L7` |
| **SQLite3** | Standard Library | Zero-config embedded database for rapid local development and testing | `backend/app/database.py#L12` |
| **Python-JOSE** | `>=3.3.0` | Cryptographic JWT token encoding and signature verification | `backend/requirements.txt#L8` |
| **Passlib [Bcrypt]** | `>=1.7.4` | Password hashing library installed in dependencies | `backend/requirements.txt#L9` |
| **Python-Multipart** | `>=0.0.17` | Form data handling for file uploads and authentication requests | `backend/requirements.txt#L10` |
| **Alembic** | `>=1.14.0` | Database migration framework installed in environment | `backend/requirements.txt#L11` |
| **Pytest** | `>=8.3.0` | Automated testing runner for backend integration and API tests | `backend/requirements.txt#L12` |
| **HTTPX** | `>=0.28.0` | Asynchronous HTTP client used by FastAPI TestClient | `backend/requirements.txt#L13` |

---

## 3. Repository Directory Tree

The complete repository hierarchy discovered during inspection:

```
dairypluse/
├── .env.example                                  # Master environment variable template
├── .gitignore                                     # Git ignore patterns for Node, Python, caches
├── DEPLOYMENT.md                                  # Production deployment guidelines
├── README.md                                      # Developer onboarding & quickstart instructions
├── render.yaml                                    # Render Cloud Blueprint for backend & DB deployment
├── start.bat                                      # Dual-process Windows runner (FastAPI + Next.js)
│
├── backend/                                       # Python FastAPI REST API Backend
│   ├── .dockerignore                              # Docker build exclusion rules
│   ├── .env.example                               # Backend-specific environment variables template
│   ├── Dockerfile                                 # Multi-stage production container build
│   ├── Procfile                                   # Process declaration for Render/Heroku (web: uvicorn)
│   ├── pytest.ini                                 # Test discovery and configuration settings
│   ├── requirements.txt                           # Frozen Python backend dependencies
│   ├── seed_supabase.py                           # Standalone migration seed script for remote Supabase
│   ├── app/                                       # FastAPI Application Source Code
│   │   ├── config.py                              # Centralized application settings (Pydantic BaseSettings)
│   │   ├── database.py                            # SQLAlchemy engine, session maker, and DB dependency
│   │   ├── main.py                                # App factory, CORS, exception handlers, lifecycle hooks
│   │   ├── seed.py                                # Comprehensive database seeder (3 dairies, 100+ entities)
│   │   ├── models/
│   │   │   ├── __init__.py                        # Model exports
│   │   │   └── models.py                          # 17 SQLAlchemy ORM model definitions
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   └── api_v1.py                          # 74 API endpoints across all system modules (3,001 lines)
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py                         # 50+ Pydantic request & response schemas (738 lines)
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── phone.py                           # Indian phone number sanitization and regex pattern matcher
│   └── tests/                                     # Automated Test Suite (39 passing tests)
│       ├── conftest.py                            # Pytest fixtures, test SQLite DB, client setup
│       ├── test_api.py                            # 32 core CRUD, auth, and analytics API tests
│       ├── test_delivery_billing.py               # Delivery-to-invoice balance increment tests
│       ├── test_new_customer_notification.py      # Customer self-registration owner alert tests
│       ├── test_routing_system.py                 # Route creation, stop linking, and daily dispatch tests
│       └── test_whatsapp_reminders.py             # Billing reminder generation and WhatsApp link tests
│
├── docs/                                          # Project Documentation & Architecture
│   ├── REQUIREMENTS_SPECIFICATION.md              # Functional and non-functional requirements
│   ├── SYSTEM_DIAGRAMS.md                         # Visual flowcharts and workflow sequences
│   ├── project-intelligence/                      # Prior architectural notes
│   └── project-analysis/                          # THIS AUDIT: 15 exhaustive engineering analysis files
│
└── frontend/                                      # Next.js 16 Client Application
    ├── package.json                               # Node.js dependencies, scripts, versions
    ├── tsconfig.json                              # TypeScript strict compiler options & path aliases
    ├── next.config.ts                             # Next.js build and Turbopack configuration
    ├── public/                                    # Static assets, logos, and illustrations
    │   ├── favicon.ico
    │   ├── icon.png                               # DairyPulse 512x512 app brand icon
    │   ├── logo.png                               # Primary brand logo
    │   └── images/                                # Login pasture and milk imagery
    └── src/                                       # Application Source Code
        ├── config/
        │   └── env.ts                             # Centralized, type-safe frontend environment loader
        ├── types/
        │   └── index.ts                           # Comprehensive TypeScript interface definitions
        ├── context/
        │   ├── AuthContext.tsx                    # Multi-role auth provider (Supabase + FastAPI)
        │   ├── DairyPulseContext.tsx              # Master operational state (1,939 lines)
        │   └── ToastContext.tsx                   # Global notification toast provider
        ├── lib/
        │   ├── api.ts                             # Typed HTTP API client with fallback data (2,280 lines)
        │   ├── offlineSync.ts                     # LocalStorage queue & auto-reconnect batch sync
        │   ├── supabaseClient.ts                  # Supabase OAuth and OTP client initialization
        │   └── calculations/
        │       ├── delivery.ts                    # Delivery completion and metric math
        │       └── salary.ts                      # Rider daily earnings and payout calculations
        ├── components/
        │   ├── common/
        │   │   └── PageHead.tsx                   # Dynamic HTML head and OpenGraph metadata
        │   ├── layout/
        │   │   ├── AppShell.tsx                   # Master role-guarded shell & sidebar controller
        │   │   ├── Sidebar.tsx                    # Dual-mode desktop sidebar (full & 80px icon rail)
        │   │   ├── TopNavbar.tsx                  # Global header with search, notifications, user menu
        │   │   └── MobileBottomNav.tsx            # Sticky mobile bottom navigation bar
        │   ├── ui/                                # Reusable atomic component design system
        │   │   ├── Badge.tsx                      # Status pills with dot indicators
        │   │   ├── Button.tsx                     # Primary, secondary, danger, ghost buttons
        │   │   ├── Card.tsx                       # Standard agricultural card container
        │   │   ├── StatCard.tsx                   # Metric KPI card with trend indicators
        │   │   ├── PageHeader.tsx                 # Standardized view title and action bar
        │   │   ├── Tabs.tsx                       # Filter and category tab navigation
        │   │   ├── Input.tsx                      # Form input with label and validation states
        │   │   ├── ProgressBar.tsx                # Delivery route progress visualizer
        │   │   ├── Skeleton.tsx                   # Content loading placeholders
        │   │   └── EmptyState.tsx                 # Zero-data empty state graphics
        │   ├── modals/
        │   │   └── ModalContainer.tsx             # Global dialog router and renderer
        │   ├── notifications/
        │   │   ├── NotificationCenter.tsx         # Operational notification dropdown drawer
        │   │   └── NewCustomerOwnerAlert.tsx      # Real-time popup alert for new customer registrations
        │   ├── customers/
        │   │   ├── AddMilkModal.tsx               # Extra milk quick-order modal
        │   │   ├── CollectPaymentModal.tsx        # Payment recording and balance clearance modal
        │   │   └── MonthEndWhatsAppModal.tsx      # WhatsApp invoice broadcast with UPI QR
        │   ├── subscriptions/
        │   │   ├── AddSubscriptionModal.tsx       # New milk subscription configuration modal
        │   │   └── FlexibleSubscriptionModal.tsx  # Pause/resume and quantity modification modal
        │   └── delivery/
        │       ├── DriverRatingModal.tsx          # 5-star customer feedback and tag modal
        │       ├── MapLocationPicker.tsx          # Interactive pin locator for customer address
        │       └── RouteBuilderStudio.tsx         # Visual route builder with drag sequencing
        └── app/                                   # Next.js 16 App Router Routes
            ├── layout.tsx                         # Root HTML shell, fonts, providers
            ├── globals.css                        # Tailwind directives and theme variables
            ├── not-found.tsx                      # 404 page with recovery navigation
            ├── page.tsx                           # Master Owner Dashboard
            ├── login/page.tsx                     # Unified role-switching login portal
            ├── inventory/page.tsx                 # Milk stock intake, batches, wastage
            ├── household/page.tsx                 # Household subscriptions management
            ├── orders/page.tsx                    # Commercial B2B and restaurant shop orders
            ├── delivery/page.tsx                  # Daily route dispatches and stop sequence
            ├── routes/page.tsx                    # Delivery route mapping and rider binding
            ├── customers/page.tsx                 # Customer directory, CRM, ledger, history
            ├── billing/page.tsx                   # Invoice ledger, dues, payment tracking
            ├── staff/page.tsx                     # Staff roster, attendance, and salary payouts
            ├── expenses/page.tsx                  # Farm expenses, fuel, feed, vendor payments
            ├── reports/page.tsx                   # Financial and milk volume analytics
            └── mobile/
                ├── customer/page.tsx              # Standalone mobile customer portal
                └── delivery/page.tsx              # Standalone mobile rider delivery portal
```

---

## 4. Key Modules & Feature Implementation Matrix

| Module Name | Backend Model | API Routes | Frontend View | Verification Status | Implementation Notes |
|---|---|---|---|---|---|
| **Authentication & Roles** | `User`, `Dairy`, `Staff`, `Customer` | `POST /auth/login`, `POST /auth/supabase-sync` | `/login` | **IMPLEMENTED** | Multi-role detection (Owner, Delivery, Customer). Supabase OAuth/OTP supported. Plaintext password verification in dev. |
| **Owner Dashboard** | Composite queries across all tables | `GET /dashboard/summary` | `/` | **IMPLEMENTED** | Real-time KPI cards, live milk stock levels, today's delivery progress, order streams. |
| **Milk Inventory & Quality** | `Product`, `StockReceipt`, `InventoryTransaction` | 8 endpoints under `/inventory/*` | `/inventory` | **IMPLEMENTED** | FAT/SNF quality logging, batch receipts, expiry date tracking, wastage reason classification. |
| **Customer CRM** | `Customer` | 7 endpoints under `/customers/*` | `/customers` | **IMPLEMENTED** | Household vs Shop categorization, GPS geocoordinates, balance tracking, delivery history. |
| **Subscriptions** | `Subscription` | 7 endpoints under `/subscriptions/*` | `/household` | **IMPLEMENTED** | Daily, alternate, weekday plans; pause/resume with auto-date calculation; extra milk scheduling. |
| **Commercial Orders** | `Order`, `OrderItem` | `GET /orders`, `POST /orders` | `/orders` | **IMPLEMENTED** | Multi-line item B2B shop orders with payment status (Paid, Partial, Pending). |
| **Delivery Management** | `DeliveryTask` | 13 endpoints under `/deliveries/*` | `/delivery` | **IMPLEMENTED** | Automated daily task generation from active subscriptions; rider assignment; sequence reordering. |
| **Route Builder** | `Route` | 3 endpoints under `/routes/*` | `/routes` | **IMPLEMENTED** | Route capacity (liters), society clustering, sequence assignment, visual route builder studio. |
| **Rider Mobile Portal** | `DeliveryTask`, `StaffAttendance` | `/deliveries/*`, `/attendance/*` | `/mobile/delivery` | **IMPLEMENTED** | Shift check-in, morning crate pickup, offline sync, one-click WhatsApp customer contact. |
| **Customer Mobile Portal** | `Customer`, `Subscription`, `DeliveryTask` | Multi-endpoint aggregation | `/mobile/customer` | **IMPLEMENTED** | Today's milk status, monthly ledger, UPI payment deep link (`upi://pay`), driver rating dialog. |
| **Driver Ratings** | `DriverRating` | 3 endpoints under `/ratings/*` | `/customers`, `/mobile/customer` | **IMPLEMENTED** | 1-5 star ratings, compliment tags ("On Time", "Polite"), customer feedback notes. |
| **Invoices & Billing** | `Invoice` | 7 endpoints under `/invoices/*` & `/billing/*` | `/billing` | **IMPLEMENTED** | Monthly invoice generation, payment recording, balance ledger offset, overdue flags. |
| **WhatsApp Reminders** | `Customer`, `Dairy` | 4 endpoints under `/billing/*` | `/customers`, `/billing` | **IMPLEMENTED** | Automated month-end due calculations, custom notes, prefilled WhatsApp click-to-chat links with UPI ID. |
| **Staff & Salaries** | `Staff`, `StaffAttendance`, `StaffSalaryPayment` | 13 endpoints under `/staff/*`, `/attendance/*`, `/salary/*` | `/staff` | **IMPLEMENTED** | Daily salary calculation (`₹500/day`), attendance logging, shift completion, salary payout ledger. |
| **Expenses** | `Expense` | `GET /expenses`, `POST /expenses` | `/expenses` | **IMPLEMENTED** | Categorized expense tracking (Feed, Fuel, Maintenance, Veterinary) with payment method tags. |
| **AI Demand Forecast** | None (Rule-based predictive service) | `GET /analytics/demand-forecast` | `/inventory` | **SIMULATED / HEURISTIC** | Heuristic forecasting combining active subscriptions + weekday multipliers + safety buffers. |
| **Wastage Intelligence** | `InventoryTransaction` | `GET /analytics/wastage-insights` | `/inventory` | **IMPLEMENTED** | Aggregates wastage by variant and reason, calculates financial loss against cost price. |
| **Customer Insights** | `Customer`, `Subscription` | `GET /analytics/customer-insights` | `/customers` | **IMPLEMENTED** | Identifies top buyers, overdue accounts, at-risk churn risks with retention suggestions. |
| **In-App Notifications** | In-memory backend list | 5 endpoints under `/notifications/*` | Top bar dropdown | **PARTIALLY IMPLEMENTED** | In-memory ring buffer notifications. Resets on server restart (no persistent table). |
| **Offline Delivery Sync** | LocalStorage + `/deliveries/sync-batch` | `POST /deliveries/sync-batch` | `/mobile/delivery` | **IMPLEMENTED** | Queues offline rider actions in LocalStorage, flushes to backend upon network reconnection. |
| **Online Payment Gateway** | None (Manual UPI intent only) | Not implemented | `/billing`, `/mobile/customer` | **NOT FOUND / PLANNED** | No gateway SDK (Razorpay/Cashfree) or webhook handler currently installed in source code. |

---

## 5. System Personas & Access Boundaries

```
+----------------------------------------------------------------------------------------------------+
|                                    DAIRYPULSE USER PERSONAS                                        |
+--------------------------+----------------------------+-----------------------+--------------------+
| 1. Dairy Owner / Admin   | 2. Delivery Rider          | 3. Customer           | 4. Super Admin     |
+--------------------------+----------------------------+-----------------------+--------------------+
| • Full ERP Dashboard     | • Mobile Delivery PWA      | • Mobile Consumer PWA | • Multi-Dairy Host |
| • Stock & Procurement    | • Attendance Check-In      | • Today's Milk Status | • System Config    |
| • Billing & Ledger       | • Morning Milk Pickup      | • Subscription Pause  | • DB Maintenance   |
| • Route Builder Studio   | • Stop-by-Stop Checklist   | • Extra Milk Booking  | • Fleet Overview   |
| • Rider Salary Payouts   | • Offline Action Queue     | • Monthly Bill Ledger |                    |
| • WhatsApp Reminders     | • Daily Earnings Tracker   | • Driver 5-Star Rating|                    |
+--------------------------+----------------------------+-----------------------+--------------------+
```

This master overview forms the foundation for the subsequent detailed architectural, database, API, workflow, security, and payment analysis documents in this directory.
