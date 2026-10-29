# DairyPulse 🥛 — Milk Distribution & Dairy Farm Operations System

A full-stack, enterprise-grade Dairy Business Management System tailored for local dairy farms, milk processing centers, and doorstep milk delivery networks.

Built with **Next.js 15 (React, TypeScript, Tailwind CSS)** on the frontend and **Python FastAPI (SQLAlchemy, SQLite/PostgreSQL)** on the backend.

---

## 👥 Multi-Dairy Architecture & User Roles

DairyPulse is a **multi-tenant platform** designed so multiple independent dairy owners can operate their farms, manage their delivery riders, and serve households across cities:

```
+--------------------------------------------------------------------------------------------------+
|                                    DAIRYPULSE MULTI-DAIRY NETWORK                                 |
+--------------------------------------------------------------------------------------------------+
|  1. DAIRY OWNERS (ADMINS)        2. DELIVERY RIDERS                 3. CUSTOMERS / SUBSCRIBERS    |
|  - Any Dairy Owner can register  - Log in with mobile number        - Step 1: Create Account      |
|  - Gets own Admin account        - Assigned to specific dairy/route - Step 2: Choose Dairy Farm   |
|  - Creates Rider IDs             - Doorstep delivery checklist      - Step 3: Address & Milk Spec |
|  - Manages stock, rates & bills  - Real-time drop confirmation      - Pause delivery on vacation  |
+--------------------------------------------------------------------------------------------------+
```

### 1. 👑 Dairy Farm Owner / Admin (Web Dashboard)
- **Login:** Select **Admin** on `/login` (Default: `admin@dairypulse.farm` / `admin123`)
- **Self-Registration for Other Dairy Owners:** Click **"Register Dairy"** on `/login`. Any new dairy owner can enter their Dairy Name, Owner Name, Contact Phone, City, and Password to launch their own admin dashboard!
- **Key Capabilities:**
  - Track silo stock for **Cow Milk, Buffalo Milk, Toned Milk, and A2 Desi Cow Milk**.
  - **Live Delivery & Dispatch Management (`/delivery`):** Assign delivery stops to specific riders, assign entire routes to riders with shift times (Morning / Evening), schedule on-demand doorstep deliveries, and track live progress per delivery boy (drops completed, remaining, and delivery timestamps).
  - **Milk Variety & Price Management (`/inventory`):** Click **"+ Add Milk Variety"** to introduce new milk variants (e.g. *Organic Gir Cow Milk*, *Goat Milk*, *Standardized Milk*) with custom FAT/SNF, selling price, and cost price. Click **"Change Price"** to update selling/cost prices instantly, or click **"Remove"** to delete obsolete varieties.
  - **Create Rider IDs:** Go to **Staff & Delivery Crew (`/staff`)** -> Click **"Create Rider / Staff ID"**. Enter the rider's name, mobile number, and assigned route. The rider can immediately log in with that phone number!
  - Manage daily household recurring subscriptions and commercial bulk orders for sweet shops.
  - Generate monthly bills and record customer payments.
  - View revenue, expenses (cattle feed, diesel, electricity), and profit reports.

### 2. 🚚 Delivery Rider (Mobile Delivery App)
- **Login:** Select **Rider** on `/login` (Demo: `+91 98220 11984` or any Rider ID created by Admin)
- **Destination Portal:** `/mobile/delivery`
- **Key Capabilities:**
  - View morning and evening route drops specifically assigned to this rider by the Admin.
  - One-tap status updates: mark stop as **"Delivered"** (with live timestamp recorded for the Admin) or record reason if doorstep was locked.
  - Collect empty bottles and record cash collections directly into the sync engine.
  - Direct customer contact: call customer directly from the delivery interface.

### 3. 🥛 Customer / Household Subscriber (Customer Portal)
- **3-Step Customer Registration Flow (`/login` -> "Customer Sign Up"):**
  - **Step 1: Create Account:** Enter Full Name, Mobile Phone, Email, and Password.
  - **Step 2: Select Dairy Farm:** Browse local dairies (e.g., Amrut Dairy Farm, Gokul Pure Milk Co., Gir Organic Farms) with quality ratings and choose preferred dairy.
  - **Step 3: Fill Address & Milk Requirement:** Enter doorstep address, route area, daily milk variant (Cow/Buffalo/Toned/A2), quantity (0.5L - 2.0L), and delivery shift (Morning/Evening).
- **Instant Access:** Customer profile and subscription are created, and they can immediately access their customer portal!
- **Login:** Select **Customer** on `/login` (Demo: `+91 98200 44551` or registered mobile phone)
- **Destination Portal:** `/mobile/customer`
- **Key Capabilities:**
  - View today's milk delivery status and assigned dairy farm.
  - **Vacation Hold:** Pause milk delivery during out-of-town trips with 1 click.
  - Modify quantity (e.g., request 1 extra liter for festival guests).
  - Check outstanding balance and view monthly invoices.

---

## ⚡ How to Run the Project (1-Click Startup)

### Simple Start (Windows):
Double-click `start.bat` in the root folder. It automatically launches both:
1. **Frontend:** [http://localhost:3000](http://localhost:3000)
2. **Backend API:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
3. **API Documentation (Swagger UI):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### Manual Startup (Step-by-Step):

#### 1. Backend (FastAPI)
```bash
cd backend
# Activate virtual environment
.\.venv\Scripts\activate
# Start backend server
python -m uvicorn app.main:app --port 8000 --host 127.0.0.1 --reload
```

#### 2. Frontend (Next.js)
```bash
cd frontend
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📂 Project Directory Structure

```
dairypluse/
├── frontend/                     # Next.js 15 App Router Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Main Admin Dashboard
│   │   │   ├── login/page.tsx    # Sign In & Customer Self-Registration
│   │   │   ├── inventory/        # Milk Silo Stock Ledger & Quality Log
│   │   │   ├── household/        # Doorstep Household Subscriptions
│   │   │   ├── orders/           # B2B Bulk Commercial Orders
│   │   │   ├── delivery/         # Dispatch & Route Planning
│   │   │   ├── customers/        # Complete Customer Directory
│   │   │   ├── billing/          # Invoices, Payments, Receipts
│   │   │   ├── staff/            # Rider & Staff Creation (Admin feature)
│   │   │   ├── expenses/         # Dairy Farm Operational Expenses
│   │   │   ├── reports/          # Financial P&L and Sales Analytics
│   │   │   └── mobile/
│   │   │       ├── delivery/     # Rider Mobile Dispatch App
│   │   │       └── customer/     # Customer Self-Service Portal
│   │   ├── components/           # Reusable UI components & layouts
│   │   ├── context/              # DairyPulseContext & AuthContext
│   │   └── types/                # TypeScript data interfaces
├── backend/                      # Python FastAPI Backend
│   ├── app/
│   │   ├── models/models.py      # SQLAlchemy Relational Models (SQLite/Postgres)
│   │   ├── schemas/schemas.py    # Pydantic Request & Response Schemas
│   │   ├── routers/api_v1.py     # Clean REST Endpoints for all operations
│   │   ├── database.py           # Database connection & session factory
│   │   ├── seed.py               # Seed data for realistic Indian dairy operations
│   │   └── main.py               # FastAPI application setup & CORS configuration
│   └── tests/test_api.py         # Pytest test suite (28/28 passing)
├── stitch_designs/               # Reference HTML UI templates
└── start.bat                     # 1-click startup script for both services
```

---

## 🧪 Automated Testing

The backend includes a comprehensive automated test suite verifying all 28 critical paths (inventory receipts, delivery assignment & real-time tracking, milk variety lifecycle, price editing & removal, multi-dairy registration, customer 3-step onboarding, rider creation, order processing, and authentication):

```bash
cd backend
.\.venv\Scripts\pytest tests -v
```
*(Result: **28 passed in ~1 second**)*

---

## 🎓 Teacher / Viva Presentation Cheat Sheet

Common questions your teacher or examiner might ask and simple answers:

**Q1: What is the primary problem this software solves?**  
> *"Traditional dairy businesses in India face manual bookkeeping errors in milk measurement, delivery boy miscommunication, missed subscription cancellations when families go on vacation, and delayed monthly billing. DairyPulse provides an automated, connected system between the Farm Owner, Delivery Boys, and Customers."*

**Q2: How does authentication and role management work?**  
> *"We have 3 distinct roles: Admin, Delivery Rider, and Customer. Admin logs in with farm credentials. Customers can register themselves directly on the login page to get an instant Customer ID and start milk delivery. Admin can add delivery riders in Staff Management by giving them a mobile number, which the rider uses to access the mobile dispatch app."*

**Q3: How is data stored and synchronized?**  
> *"The backend uses SQLAlchemy ORM connected to SQLite (or PostgreSQL in production). The Next.js frontend interacts with the REST API using asynchronous fetch calls. The frontend also has reactive context state management (`DairyPulseContext`), ensuring instantaneous UI feedback."*

**Q4: How do recurring milk subscriptions work?**  
> *"A customer chooses a milk variant (e.g., Cow Milk 1L) and delivery slot (Morning/Evening). Subscriptions are linked to delivery task rosters. When a customer pauses their subscription on vacation, the delivery roster automatically excludes their house without requiring manual admin intervention."*

**Q5: What prevents negative inventory or spillage discrepancies?**  
> *"Every milk addition is logged as a `StockReceipt` with FAT/SNF quality scores. Dispatches subtract from inventory, and any souring or spillage is recorded as an immutable `Wastage` transaction with a verified reason."*

**Q6: How does route structuring and stop ordering work when customers have different addresses?**  
> *"In real-world milk delivery, customer addresses naturally cluster into residential housing societies, apartment complexes, and streets (e.g., Marvel Zephyr, Rohan Nilay, Green Glen). DairyPulse groups customer doorsteps by geographic area into fixed Routes (e.g., R-04 Baner, A-01 Aundh), attaches a society/building tag to each address, and automatically sequences the stops so all flats in the same building are delivered consecutively. The admin can also re-order stops with one-click Up/Down controls, and the sequence immediately synchronizes to the rider's mobile delivery app."*

"# Dairypluse" 
