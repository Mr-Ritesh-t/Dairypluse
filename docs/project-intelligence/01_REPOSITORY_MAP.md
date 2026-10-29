# DairyPulse — Repository Map & File Responsibilities

This document provides a complete map of the DairyPulse codebase, explaining the role of every directory and primary source file.

---

## 1. Directory Tree Structure

```
dairypluse/
├── .env.example                     # Sample environment variable declarations
├── README.md                        # High-level project documentation
├── start.bat                        # Dual-process startup script for Windows
├── backend/                         # FastAPI Python Backend
│   ├── pytest.ini                   # Pytest test discovery configuration
│   ├── requirements.txt             # Python backend dependencies
│   ├── dairypulse.db                # SQLite local database file
│   ├── app/
│   │   ├── config.py                # Environment configuration (Pydantic BaseSettings)
│   │   ├── database.py              # SQLAlchemy engine, session maker, get_db dependency
│   │   ├── main.py                  # FastAPI application entry point & middleware
│   │   ├── seed.py                  # Database initialization & sample data generator
│   │   ├── models/
│   │   │   ├── __init__.py          # Exports all SQLAlchemy models
│   │   │   └── models.py            # Database tables & relationships
│   │   ├── schemas/
│   │   │   └── schemas.py           # Pydantic v2 validation & response schemas
│   │   └── routers/
│   │       └── api_v1.py            # Main API router (25+ REST endpoints)
│   └── tests/
│       └── test_api.py              # Integration test suite (28 test scenarios)
├── frontend/                        # Next.js 16 Web & Mobile Applications
│   ├── package.json                 # Node dependencies & run scripts
│   ├── tsconfig.json                # TypeScript compiler options
│   ├── next.config.ts               # Next.js framework configuration (Turbopack enabled)
│   ├── eslint.config.mjs            # ESLint code quality rules
│   └── src/
│       ├── app/                     # Next.js App Router (pages and layouts)
│       │   ├── layout.tsx           # Root HTML layout with font imports
│       │   ├── page.tsx             # Executive KPI dashboard & overview
│       │   ├── globals.css          # Tailwind CSS tokens & global styles
│       │   ├── login/page.tsx       # Auth & 3-Step Customer Registration Wizard
│       │   ├── delivery/page.tsx    # Delivery operations & Route Studio launcher
│       │   ├── inventory/page.tsx   # Milk variants, stock levels & quality checks
│       │   ├── billing/page.tsx     # Invoices, billing cycles & payments
│       │   ├── customers/page.tsx   # Customer directory & subscription tracker
│       │   ├── household/page.tsx   # Household milk deliveries & pause manager
│       │   ├── orders/page.tsx      # Commercial B2B bulk orders
│       │   ├── staff/page.tsx       # Staff roster, riders & duty statuses
│       │   ├── expenses/page.tsx    # Operational expenses & category breakdown
│       │   ├── reports/page.tsx     # Auditing reports & revenue analytics
│       │   └── mobile/
│       │       ├── delivery/page.tsx # Delivery Rider Mobile PWA
│       │       └── customer/page.tsx # Customer Self-Service Mobile Portal
│       ├── components/              # Modular UI Components
│       │   ├── layout/
│       │   │   ├── AppShell.tsx     # Global layout wrapper (conditional sidebar)
│       │   │   ├── Sidebar.tsx      # Left navigation bar with role guards
│       │   │   └── TopNavbar.tsx    # Header with dairy selector, live clock & user badge
│       │   ├── delivery/
│       │   │   ├── RouteBuilderStudio.tsx # Interactive Map Route Builder & Sequencer
│       │   │   └── MapLocationPicker.tsx  # Geolocation pin picker component
│       │   ├── analytics/
│       │   │   ├── SalesDispatchOverviewChart.tsx # Recharts dual-series area chart
│       │   │   ├── WastageIntelligenceCard.tsx    # Spoilage & revenue leakage card
│       │   │   └── CustomerInsightsCard.tsx       # Retention, balance & cohort stats
│       │   ├── modals/
│       │   │   └── ModalContainer.tsx   # Global dialog container for quick actions
│       │   ├── notifications/
│       │   │   └── NotificationCenter.tsx # Notification bell dropdown
│       │   └── subscriptions/
│       │       └── FlexibleSubscriptionModal.tsx # Subscription creation dialog
│       ├── context/
│       │   ├── DairyPulseContext.tsx # Global operational state & API synchronization
│       │   └── AuthContext.tsx       # Authentication state, session storage & roles
│       ├── lib/
│       │   ├── api.ts               # Complete REST client communicating with FastAPI
│       │   └── offlineSync.ts       # IndexedDB offline event queue & retry engine
│       └── types/
│           └── index.ts             # Central TypeScript domain interfaces
└── docs/
    ├── REQUIREMENTS_SPECIFICATION.md # Formal Software Requirements Specification
    └── project-intelligence/        # In-depth architectural audit documents
```

---

## 2. Directory Responsibilities & Key Files

### 2.1 Backend (`backend/`)
The backend provides a stateless, high-performance REST API built with **FastAPI** and **SQLAlchemy**.

- `backend/app/main.py`: Entry point that creates the `FastAPI` application instance, mounts CORS middleware to allow requests from Next.js (`http://localhost:3000`), creates database tables on boot (`Base.metadata.create_all`), mounts `/api/v1` routes, and defines `/health` and `/` endpoints.
- `backend/app/config.py`: Reads runtime configuration using `pydantic-settings`. Configures database URL (defaults to SQLite: `sqlite:///./dairypulse.db`), JWT signing key, and default timezone (`Asia/Kolkata`).
- `backend/app/database.py`: Initializes the SQLAlchemy database engine, configures `connect_args={"check_same_thread": False}` for SQLite, creates the thread-safe `SessionLocal` factory, and declares the standard `get_db()` dependency for FastAPI route handlers.
- `backend/app/models/models.py`: Defines 12 SQLAlchemy ORM models: `Dairy`, `User`, `Staff`, `Customer`, `Product`, `StockReceipt`, `InventoryTransaction`, `Subscription`, `Order`, `OrderItem`, `DeliveryTask`, `Route`, `Invoice`, and `Expense`.
- `backend/app/schemas/schemas.py`: Pydantic v2 schemas validating request payloads and serializing JSON responses for all CRUD actions, including `RouteBuildRequest` and `DeliveryTaskResponse`.
- `backend/app/routers/api_v1.py`: The single primary router registering 25+ REST endpoints handling inventory receipts, customers, subscriptions, daily delivery generation, delivery task status updates, address editing, route creation, route sequencing (`POST /routes/build`), and invoicing.
- `backend/app/seed.py`: Standalone CLI script that resets and populates the database with realistic sample data (5 routes, 7 customers with real Pune coordinates, active subscriptions, products with Fat/SNF metrics, staff members, and delivery tasks).
- `backend/tests/test_api.py`: Automated Pytest integration test suite containing 28 test cases executing against the live API and database.

---

### 2.2 Frontend (`frontend/`)
The frontend is a modern **Next.js 16** application with **React 19** and **TypeScript**, configured with Turbopack for ultra-fast compilation.

- `frontend/src/app/`: The Next.js App Router containing route segments:
  - `page.tsx`: The primary executive dashboard showing quick KPI cards, the sales overview chart, and shortcut buttons.
  - `delivery/page.tsx`: Delivery operations command center showing routes, riders, delivery task tables, address editor, and the button launching the Route Builder Studio.
  - `login/page.tsx`: Dual-purpose authentication screen offering role switching for demos and a 3-step customer registration wizard with map pin picker.
  - `inventory/page.tsx`: Cold chain inventory manager for recording milk arrivals, Fat % / SNF % testing, and stock movements.
  - `billing/page.tsx`: Invoice creation, payment collection, and outstanding balance tracking.
  - `mobile/delivery/page.tsx`: Mobile PWA for delivery riders featuring sequential stop navigation, bottle return counters, and cash logging.
  - `mobile/customer/page.tsx`: Self-service mobile portal for household consumers to pause milk deliveries or adjust daily quantity.
- `frontend/src/components/delivery/RouteBuilderStudio.tsx`: The interactive route builder modal that calculates coordinate projections onto a street grid, renders the visual delivery path polyline, allows drag/up/down stop reordering, checks vehicle capacity (e.g. 60L limit), and dispatches runs.
- `frontend/src/components/delivery/MapLocationPicker.tsx`: Customer doorstep coordinate selector using browser Geolocation API or manual pin placement with 5-decimal precision.
- `frontend/src/components/analytics/SalesDispatchOverviewChart.tsx`: Dual-series area chart built with **Recharts** comparing household subscription liters against commercial bulk revenue.
- `frontend/src/context/DairyPulseContext.tsx`: The central application state engine that fetches data on initial mount, provides fallback mock state for offline execution, and coordinates optimistic updates across all operational modules.
- `frontend/src/context/AuthContext.tsx`: Manages current user session, active role (`OWNER`, `DELIVERY`, `CUSTOMER`), and session storage persistence.
- `frontend/src/lib/api.ts`: Central HTTP client using native `fetch` with error resilience and type mapping to backend endpoints.
- `frontend/src/lib/offlineSync.ts`: Custom offline sync engine implementing an IndexedDB event queue that records rider actions when disconnected and automatically retries synchronization when network connectivity returns.

---

## 3. Application Startup Process

The project is started using the Windows batch script `start.bat`:

```bat
# start.bat execution flow:
1. Navigates to backend directory: cd backend
2. Activates virtual environment: .venv\Scripts\python.exe
3. Launches Uvicorn ASGI server: uvicorn app.main:app --port 8000 --host 127.0.0.1 --reload
4. Navigates to frontend directory: cd frontend
5. Launches Next.js Turbopack development server: npm run dev
```

- **Frontend URL**: `http://localhost:3000`
- **Backend API URL**: `http://127.0.0.1:8000`
- **Interactive Swagger API Documentation**: `http://127.0.0.1:8000/docs`
