# DairyPulse 🥛 — Full-Stack Dairy Distribution Management Platform

**Team:** NEXURA  
**Project Type:** Full-Stack Dairy Distribution, Inventory, Subscription, and Business Management Platform  
**Design Reference:** Google Stitch Project `projects/14682950118343009920` (11 Screens)

---

## 🌟 Overview

DairyPulse is an enterprise platform designed for small and medium-sized dairy distribution operations in India. It manages the complete operational lifecycle:
- Milk procurement, quality testing (FAT/SNF), and silo inventory ledger
- Doorstep household recurring subscriptions and vacation hold scheduling
- Commercial B2B shop & restaurant bulk milk orders
- Route delivery dispatch with a dedicated mobile interface for delivery boys
- Automated customer invoice generation and partial/full payment tracking
- Operational expense categorization and real-time P&L reporting

---

## 🏗️ Architecture & Technology Stack

```
dairypluse/
├── frontend/             # Next.js 15 (App Router), React, TypeScript, Tailwind CSS
│   ├── src/
│   │   ├── app/          # 11 Modules + 2 Mobile Experiences
│   │   ├── components/   # Sidebar, TopNavbar, AppShell, Quick Modals
│   │   ├── context/      # Reactive DairyPulseContext with mock & API state
│   │   └── types/        # TypeScript interfaces matching DB schema
├── backend/              # Python FastAPI, SQLAlchemy, Pydantic, PostgreSQL/SQLite
│   ├── app/
│   │   ├── models/       # Relational database models
│   │   ├── schemas/      # Pydantic v2 schemas
│   │   ├── routers/      # REST API v1 endpoints
│   │   ├── database.py   # SQLAlchemy session & engine
│   │   ├── seed.py       # Realistic Indian dairy demo seed data
│   │   └── main.py       # FastAPI application & CORS
│   └── tests/            # Automated pytest test suite (10/10 passing)
└── stitch_designs/       # Original Stitch HTML templates & designs
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on v24.13.1)
- **Python**: 3.10+ (tested on 3.10.11)
- **Database**: PostgreSQL 18 or SQLite (configured out-of-the-box)

### 2. Run the Frontend (Next.js)
```bash
cd frontend
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 3. Run the Backend (FastAPI)
```bash
cd backend
# Windows virtual environment:
.\.venv\Scripts\activate
# Seed initial demo data:
python -m app.seed
# Start API server:
uvicorn app.main:app --reload --port 8000
```
- Interactive API Docs (Swagger UI): **[http://localhost:8000/docs](http://localhost:8000/docs)**
- Health check endpoint: **[http://localhost:8000/health](http://localhost:8000/health)**

### 4. Run Automated Backend Tests
```bash
cd backend
$env:PYTHONPATH = "d:\coding\dairypluse\backend"
.\.venv\Scripts\pytest tests -v
```

---

## 📱 Navigation & Module Sitemap

| Route | Module Description | Stitch UI Reference |
| :--- | :--- | :--- |
| `/` | **Owner Dashboard** — Top KPIs, pastoral hero banner, sales chart, deliveries, recent orders | `DairyPulse_Main_Dashboard.html` |
| `/inventory` | **Milk Inventory** — Silo stocks (Cow, Buffalo, Toned, A2), movement ledger, wastage logging | `DairyPulse_Milk_Inventory.html` |
| `/household` | **Household Subscriptions** — Daily morning/evening doorstep milk plans, pause/resume | `DairyPulse_Household_Subscriptions.html` |
| `/orders` | **Shop Orders (B2B)** — Bulk commercial sweet shop & cafe orders, order details drawer | `DairyPulse_Shop_Orders.html` |
| `/delivery` | **Delivery Management** — Route stops, rider assignments (Rahul, Amit, Sachin), status toggles | `DairyPulse_Delivery_Management.html` |
| `/customers` | **Customer Directory** — Household & commercial profiles, ledger balances, address tags | `DairyPulse_Customer_Management.html` |
| `/billing` | **Billing & Payments** — Monthly invoice cycles, partial payments, receipts, PDF export | `DairyPulse_Billing__Payments.html` |
| `/staff` | **Staff Management** — Delivery riders, plant operators, attendance, ratings | `DairyPulse_Staff_Management.html` |
| `/expenses` | **Expenses** — Cattle feed, chilling power, diesel fuel, packaging pouch logs | `DairyPulse_Expense_Management.html` |
| `/reports` | **Reports & Analytics** — Gross revenue, volume sold (L), variant share, CSV/PDF export | `DairyPulse_Reports_Dashboard.html` |
| `/suite` | **Business Management Suite** — Cold chain facility temperature, fleet integrity, operations | `DairyPulse_Business_Management_Suite.html` |
| `/mobile/delivery` | **Delivery Partner Mobile View** — Optimized for rider phones with call & completion actions | Mobile Partner App |
| `/mobile/customer` | **Customer Portal** — Household self-service for vacation holds and extra milk requests | Customer Web App |

---

## 🛡️ Business Rules & Financial Integrity
1. **Traceable Inventory Ledger**: Every milk movement creates an immutable `InventoryTransaction` record.
2. **Idempotent Deliveries**: Marking a stop delivered records delivery timestamps and updates stock without duplicate deductions.
3. **Price Snapshots**: Order lines and invoice items snapshot unit prices at creation time to prevent retroactive price modifications.
4. **Partial Payment Ledger**: Invoice balance = Total Amount - Valid Payments.
