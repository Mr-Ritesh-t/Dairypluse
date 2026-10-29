# DairyPulse — Actual Technology Stack & Dependency Inventory

This document provides a verified inventory of all technologies, libraries, frameworks, and tools used across DairyPulse. Every entry has been checked against `package.json`, `requirements.txt`, lockfiles, and active code references.

---

## 1. Technology Stack Inventory Table

| Layer | Technology | Actual Version | Purpose | Evidence in Code | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | `16.4.2` | Server-rendered & client-rendered modern React web app with file-based routing | `frontend/package.json:13`, `frontend/src/app/layout.tsx` | **Actively Used** |
| **Frontend Runtime** | React & React DOM | `19.3.0` | Declarative UI rendering, hooks, state lifecycle | `frontend/package.json:14-15` | **Actively Used** |
| **Type System** | TypeScript | `^5.0.0` | Static typing, interface definitions, compiler type safety | `frontend/tsconfig.json`, `frontend/src/types/index.ts` | **Actively Used** |
| **CSS Framework** | Tailwind CSS | `^4.0.0` | Utility-first styling, color tokens, and responsive layout classes | `frontend/package.json:25`, `frontend/src/app/globals.css` | **Actively Used** |
| **Frontend Bundler** | Next.js Turbopack | Integrated | Fast incremental local development and production build bundling | `frontend/next.config.ts`, `frontend/package.json:19` | **Actively Used** |
| **Iconography** | Lucide React | `^1.61.0` | Clean, lightweight SVG icons for navigation, status badges, and actions | `frontend/package.json:12`, throughout `frontend/src/` | **Actively Used** |
| **Data Visualization** | Recharts | `^3.10.1` | Interactive dual-series area charts, responsive containers, tooltips | `frontend/package.json:16`, `SalesDispatchOverviewChart.tsx` | **Actively Used** |
| **Client State Management** | React Context API | Native | Global state distribution (`DairyPulseContext`, `AuthContext`) without external boilerplate | `frontend/src/context/DairyPulseContext.tsx` | **Actively Used** |
| **Offline Storage** | IndexedDB & LocalStorage | Native Web APIs | Offline event queue storage for delivery partners, token & user session persistence | `frontend/src/lib/offlineSync.ts`, `frontend/src/context/AuthContext.tsx` | **Actively Used** |
| **Geolocation API** | HTML5 Geolocation | Native Web API | Captures live GPS coordinates (`coords.latitude`, `coords.longitude`) with high accuracy | `frontend/src/components/delivery/MapLocationPicker.tsx:80-100` | **Actively Used** |
| **Backend Framework** | FastAPI | `>=0.115.0` | High-performance Python ASGI REST API framework with automatic OpenAPI docs | `backend/requirements.txt:1`, `backend/app/main.py:1-15` | **Actively Used** |
| **ASGI Server** | Uvicorn (standard) | `>=0.32.0` | Lightning-fast asynchronous server running the FastAPI application | `backend/requirements.txt:2`, `start.bat:7` | **Actively Used** |
| **ORM & DB Toolkit** | SQLAlchemy | `>=2.0.36` | Database schema definition, model relationships, session lifecycle, and query builder | `backend/requirements.txt:5`, `backend/app/database.py`, `models.py` | **Actively Used** |
| **Database Engine** | SQLite (Dev) / PostgreSQL (Ready) | Embedded / Driver `>=2.9.10` | Zero-configuration local database (`dairypulse.db`) with psycopg2-binary driver available | `backend/app/config.py:10`, `backend/dairypulse.db` | **Actively Used** |
| **Data Validation** | Pydantic v2 & Pydantic Settings | `>=2.10.0` / `>=2.6.0` | Request payload validation, response model serialization, environment variable parsing | `backend/requirements.txt:3-4`, `backend/app/schemas/schemas.py` | **Actively Used** |
| **Automated Testing** | Pytest | `>=8.3.0` | Unit and integration test runner for backend endpoints | `backend/requirements.txt:11`, `backend/tests/test_api.py` | **Actively Used** |
| **HTTP Test Client** | HTTPX | `>=0.28.0` | Asynchronous/synchronous HTTP client used by FastAPI's `TestClient` | `backend/requirements.txt:12`, `backend/tests/test_api.py:10` | **Actively Used** |
| **Database Migrations** | Alembic | `>=1.14.0` | Database schema version control and migration tooling | `backend/requirements.txt:10` | **Installed / Optional** |
| **Auth / Cryptography** | Python-Jose & Passlib | `>=3.3.0` / `>=1.7.4` | JWT token decoding, cryptographic signing, and password hashing | `backend/requirements.txt:7-8`, `backend/app/config.py:12-14` | **Installed / In-Progress** |

---

## 2. Deep Dive: Why Each Technology Was Selected

### 2.1 Next.js 16 + React 19 + Turbopack
- **Why**: DairyPulse requires both fast public landing pages (SEO-friendly) and a dynamic, client-side dashboard with live map rendering. Next.js 16 App Router provides the optimal hybrid model. Turbopack provides sub-second hot module reloading (HMR) and production builds in under 5 seconds.
- **Evidence**: `frontend/next.config.ts`, `frontend/src/app/delivery/page.tsx`.

### 2.2 FastAPI + Pydantic v2
- **Why**: Milk distribution requires strict type validation. Pydantic v2 prevents corrupt data (e.g., negative milk volume, missing phone numbers, or invalid GPS coordinates) before it reaches the database. FastAPI automatically generates Swagger documentation at `/docs`, enabling frontend and mobile developers to inspect and test endpoints easily.
- **Evidence**: `backend/app/main.py`, `backend/app/schemas/schemas.py`.

### 2.3 Recharts
- **Why**: Visualizing revenue trends and daily milk volume requires smooth SVG rendering with responsive viewport adaptation. Recharts uses a declarative component syntax (`<AreaChart>`, `<ResponsiveContainer>`, `<XAxis>`, `<Tooltip>`) that matches React's component model without relying on external canvas wrappers.
- **Evidence**: `frontend/src/components/analytics/SalesDispatchOverviewChart.tsx`.

### 2.4 Normalized Coordinate Projection (Custom Visual Mapping)
- **Why**: Traditional map components like Google Maps JavaScript API require paid API billing keys and heavy script downloads. DairyPulse implements a lightweight, mathematical coordinate projection engine inside [RouteBuilderStudio.tsx](file:///d:/coding/dairypluse/frontend/src/components/delivery/RouteBuilderStudio.tsx) that projects real latitude/longitude coordinates onto an interactive SVG grid, drawing smooth polylines and animated pins with zero third-party API costs.

### 2.5 IndexedDB Offline Synchronization
- **Why**: Milk delivery riders work early in the morning in high-density apartments, basements, and peripheral rural routes with intermittent mobile internet. The native IndexedDB browser database enables offline event queueing so riders never experience app freezes or lost delivery confirmations.
- **Evidence**: `frontend/src/lib/offlineSync.ts`.
