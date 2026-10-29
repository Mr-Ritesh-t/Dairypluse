# DairyPulse — Technical Glossary & Viva / Interview Master Guide

This document prepares you to explain, defend, and present the DairyPulse project with complete confidence before academic project guides, external examiners, clients, or technical interviewers.

---

## 1. Technical Concepts Explained in Simple English

1. **ORM (Object-Relational Mapping)**: A technique that allows us to interact with the database using Python classes and objects (`Customer`, `Route`) instead of writing raw SQL strings (`SELECT * FROM customers`). DairyPulse uses **SQLAlchemy**.
2. **Dependency Injection**: In FastAPI, functions declare what they need (like a database session `db: Session = Depends(get_db)`), and the framework automatically creates, passes, and closes it when the request finishes.
3. **Pydantic Schemas**: Data contract validators. Before data reaches our database, Pydantic ensures numbers are positive, required fields are present, and coordinates are valid. If not, it rejects the request with HTTP 422.
4. **Idempotency**: An operation that produces the exact same result no matter how many times you run it. Our daily delivery generator (`POST /deliveries/generate-daily`) checks if a task already exists for today before inserting; running it 10 times will not create duplicate milk deliveries.
5. **Optimistic Updates**: When a delivery rider taps "Mark Delivered", the UI updates immediately to green without waiting for the server response, giving the app an instantaneous feel. If the request fails, the state rolls back or queues offline.
6. **IndexedDB**: A fast, browser-based database inside the rider's smartphone that stores delivery actions offline when they have no mobile data.
7. **Fat % & SNF %**:
   - **Fat %**: The butterfat content of milk (e.g. 4.2% for Cow Milk, 7.0% for Buffalo Milk).
   - **SNF (Solids-Not-Fat)**: The protein, mineral, and lactose content. Must be at least 8.5%. Lower values indicate milk diluted with water.

---

## 2. Top Viva & Interview Questions & Answers

### Q1: What is DairyPulse, and what core problem does it solve?
- **20-Second Answer**:  
  *DairyPulse is an enterprise milk distribution and supply chain platform that connects customer doorstep subscriptions, map-based route sequencing, rider vehicle load limits, and cold chain quality tracking.*
- **60-Second Answer**:  
  *Fresh milk distribution operates under tight time constraints (5:00 AM – 7:30 AM). Traditional dairies suffer from disorganized routing, lack of delivery time choices for customers, vehicle overloads on motorbikes, and riders losing connectivity in basement flats. DairyPulse solves this by letting customers pick their preferred time window and pin their location on a map, providing hub managers an interactive Route Studio to sequence stops and monitor vehicle load, and equipping riders with an offline-capable mobile PWA.*
- **Detailed Technical Answer**:  
  *DairyPulse is built using a decoupled architecture with a Next.js 16 App Router frontend and a FastAPI backend. It features an interactive SVG coordinate projection studio where managers visually order stops (`#1`, `#2`, `#3`), calculate load against vehicle capacity (e.g. 60L limit), and dispatch via `POST /api/v1/routes/build`. Riders receive these stops in exact sequence on an IndexedDB-backed mobile PWA that synchronizes automatically when network connection returns.*

---

### Q2: How does the delivery route creation work? Does it do true road optimization?
- **20-Second Answer**:  
  *Admins visually build routes in an interactive map studio, choose customers in an area, adjust the delivery order (1st, 2nd, 3rd) using sequencing controls, verify bike capacity, and dispatch.*
- **60-Second Answer**:  
  *Route creation starts with customer GPS pins. In the Route Studio, all customers in a sector (like Baner or Aundh) appear on a live map. The manager selects stops, checks the vehicle capacity meter (e.g. 24.5L out of 60L), and sets the delivery sequence using Up/Down controls. When dispatched, the backend updates customer records and assigns sequence order numbers to today's delivery tasks.*
- **Detailed Technical Answer (Honest Distinction)**:  
  *The project currently performs visual geographic clustering and explicit sequence ordering rather than automated algorithmic road-network TSP (Traveling Salesperson Problem) optimization. We project real GPS coordinates onto a normalized 2D canvas and connect them with an SVG polyline. The sequencing is controlled by the operations manager using `handleMoveUp` and `handleMoveDown`, ensuring practical constraints like gated society entry rules are respected. The backend persists this via `POST /api/v1/routes/build` into `DeliveryTask.sequence_order`.*

---

### Q3: How are duplicate deliveries prevented when generating daily runs?
- **20-Second Answer**:  
  *The daily run generator is idempotent; it checks whether a task for that customer and date already exists before creating a new one.*
- **60-Second Answer**:  
  *In `backend/app/routers/api_v1.py:507`, the `generate_daily_deliveries` endpoint queries `DeliveryTask` matching `customer_phone == cust.phone` and `delivery_date == today_str`. If a task exists, it increments `skipped_duplicates` and bypasses creation, ensuring no customer receives duplicate milk or double charges.*
- **Detailed Technical Answer**:  
  *Idempotency is enforced in application logic. When `POST /deliveries/generate-daily` runs, it fetches all active subscriptions (`status == 'Active'`). For each subscriber, it checks the database for existing records on that date. Only non-existent deliveries are instantiated with unique delivery numbers (`DEL-YYYY-XXX`), while existing deliveries are skipped. In production, we also recommend a composite unique database index on `(customer_phone, delivery_date, slot)`.*

---

### Q4: How does the offline delivery functionality work?
- **20-Second Answer**:  
  *Rider delivery actions are saved in an IndexedDB queue on the smartphone when offline, and automatically synced to the server once the connection is restored.*
- **60-Second Answer**:  
  *In `frontend/src/lib/offlineSync.ts`, we listen to browser `online` and `offline` events. When a rider delivers milk in a basement with no signal, the action (status, timestamp, empty bottles returned, cash collected) is written to IndexedDB. The UI updates optimistically. When mobile data returns, the engine flushes the queue via background HTTP requests.*
- **Detailed Technical Answer**:  
  *The offline sync engine uses an event-sourcing queue model. Each queued action receives a unique UUID. When online, `triggerManualSync()` iterates through the queue and dispatches `PATCH /api/v1/deliveries/{id}/status`. If the server acknowledges with HTTP 200, the event is purged from IndexedDB. If it fails, an exponential backoff retry mechanism ensures actions are not dropped.*

---

### Q5: What security and validation measures are implemented?
- **20-Second Answer**:  
  *We use Pydantic v2 schemas to validate all API inputs, parameterized SQLAlchemy queries to prevent SQL injection, and role-based access for Owners, Riders, and Customers.*
- **60-Second Answer**:  
  *Every request payload is validated against strict Pydantic schemas, blocking malformed or negative values. Database access uses SQLAlchemy ORM parameterization, eliminating SQL injection. The frontend uses an AuthContext that enforces role access, ensuring delivery partners only see their route, and customers only access their portal.*
- **Detailed Technical Answer**:  
  *Security is enforced through input sanitization, type coercion, and ORM parameterization. For production readiness, the upgrade roadmap includes moving from sessionStorage to HTTP-only secure JWT cookies, adding Bcrypt password hashing across all registration endpoints, and tightening CORS from `allow_origins=["*"]` to the specific production domain.*
