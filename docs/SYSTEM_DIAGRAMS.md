# DairyPulse — Complete System Diagrams & Technical Architecture

This comprehensive diagram collection provides a full visual blueprint of the DairyPulse platform, covering high-level architecture, database schema, end-to-end data flows, rider shift state machines, and offline-sync engines.

---

## 1. High-Level System Architecture Diagram

```mermaid
graph TB
    subgraph ClientLayer ["Client Presentation Layer (Next.js 16 + React 19)"]
        AdminDashboard["Admin Dashboard & Operations<br/>(/, /delivery, /inventory, /billing)"]
        CustomerWiz["Customer Portal & Wizard<br/>(/login, /mobile/customer)"]
        RiderPWA["Rider Mobile PWA<br/>(/mobile/delivery)"]
        RouteStudio["Interactive Route Studio<br/>(RouteBuilderStudio.tsx)"]
        MapPicker["Map Location Picker<br/>(MapLocationPicker.tsx)"]
    end

    subgraph StateLayer ["Client State & Synchronization Layer"]
        Context["DairyPulseContext<br/>(Global Cache & Dispatcher)"]
        AuthCtx["AuthContext<br/>(Role & Session Guard)"]
        OfflineQueue["Offline Sync Engine<br/>(IndexedDB Event Queue)"]
    end

    subgraph APILayer ["Backend Gateway & Routers (FastAPI)"]
        MainApp["app.main:app<br/>(CORS, /health, /docs)"]
        APIRouter["app.routers.api_v1:api_router<br/>(50+ REST Endpoints)"]
        Schemas["app.schemas.schemas<br/>(Pydantic v2 Validation)"]
    end

    subgraph ServiceLogic ["Core Business Logic Modules"]
        RouteEngine["Route Builder & Sequencing Engine<br/>(POST /routes/build)"]
        DailyDispatcher["Daily Delivery Generator<br/>(POST /deliveries/generate-daily)"]
        InventoryLedger["Cold Chain & Stock Ledger<br/>(POST /inventory/receipts, wastage)"]
        BillingEngine["Billing & Invoice Generator<br/>(POST /invoices, /payments)"]
        SalaryEngine["Staff Attendance & Salary Engine<br/>(POST /staff/payout)"]
    end

    subgraph StorageLayer ["Persistence Layer"]
        DBEngine["SQLAlchemy ORM Engine<br/>(app.database)"]
        DB[("Relational Database<br/>SQLite (Dev) / PostgreSQL (Prod)")]
    end

    AdminDashboard --> Context
    CustomerWiz --> Context
    CustomerWiz --> MapPicker
    AdminDashboard --> RouteStudio
    RiderPWA --> Context
    RiderPWA <--> OfflineQueue

    Context --> APIRouter
    AuthCtx --> AdminDashboard
    OfflineQueue --> APIRouter

    MainApp --> APIRouter
    APIRouter --> Schemas
    APIRouter --> RouteEngine
    APIRouter --> DailyDispatcher
    APIRouter --> InventoryLedger
    APIRouter --> BillingEngine
    APIRouter --> SalaryEngine

    RouteEngine --> DBEngine
    DailyDispatcher --> DBEngine
    InventoryLedger --> DBEngine
    BillingEngine --> DBEngine
    SalaryEngine --> DBEngine
    DBEngine --> DB
```

---

## 2. Complete Entity-Relationship (ER) Data Model

```mermaid
erDiagram
    DAIRIES ||--o{ USERS : "employs"
    DAIRIES ||--o{ STAFF : "employs"
    DAIRIES ||--o{ CUSTOMERS : "serves"
    DAIRIES ||--o{ ROUTES : "operates"

    CUSTOMERS ||--o{ SUBSCRIPTIONS : "holds"
    CUSTOMERS ||--o{ ORDERS : "places"
    CUSTOMERS ||--o{ INVOICES : "billed"

    ORDERS ||--o{ ORDER_ITEMS : "contains"
    
    STAFF ||--o{ STAFF_ATTENDANCE : "logs"
    STAFF ||--o{ STAFF_SALARY_PAYMENTS : "receives"
    STAFF ||--o{ DRIVER_RATINGS : "reviewed_in"

    DAIRIES {
        string id PK
        string name
        string owner_name
        string email
        string phone
        string city
        string address
        float rating
    }

    USERS {
        string id PK
        string email UK
        string phone UK
        string password_hash
        string full_name
        string role
        string dairy_name
        boolean is_active
    }

    CUSTOMERS {
        string id PK
        string name
        string customer_type
        string phone
        string email
        string address
        string area
        string route
        float latitude
        float longitude
        string preferred_time
        float balance
        string status
    }

    SUBSCRIPTIONS {
        string id PK
        string customer_id FK
        string customer_name
        string product_variant
        float quantity_liters
        string time_slot
        string frequency
        float unit_price
        string status
        string start_date
    }

    PRODUCTS {
        string id PK
        string name
        string variant
        string unit
        float fat_content
        float snf_content
        float selling_price
        float cost_price
        float available_stock
        float low_stock_threshold
        string status
    }

    STOCK_RECEIPTS {
        string id PK
        string supplier_name
        string receipt_date
        string variant
        float quantity
        float unit_cost
        string notes
    }

    INVENTORY_TRANSACTIONS {
        string id PK
        string date
        string timestamp
        string transaction_type
        string product_variant
        float quantity
        float rate_per_liter
        string notes
    }

    ORDERS {
        string id PK
        string order_number UK
        string customer_id FK
        string shop_name
        string contact_person
        string phone
        string delivery_date
        string status
        float total_amount
        float paid_amount
    }

    ORDER_ITEMS {
        string id PK
        string order_id FK
        string product_variant
        float quantity
        string unit
        float unit_price
        float line_total
    }

    DELIVERY_TASKS {
        string id PK
        string delivery_number UK
        string customer_name
        string customer_phone
        string address
        string flat_or_unit
        string society_or_landmark
        string area
        string product_variant
        float quantity_liters
        string slot
        string assigned_rider
        string status
        int sequence_order
        float latitude
        float longitude
        string delivery_date
        string failure_reason
    }

    ROUTES {
        string id PK
        string route_code UK
        string name
        string area
        string assigned_rider
        string slot
        string societies
        int total_stops
        float total_liters
        float max_capacity_liters
    }

    STAFF {
        string id PK
        string name
        string role
        string phone
        string assigned_area
        string dairy_name
        string status
        int deliveries_today
        float rating
        float daily_salary
        float pending_salary
        float total_salary_paid
    }

    STAFF_ATTENDANCE {
        string id PK
        string staff_id FK
        string staff_name
        string dairy_name
        string date
        string check_in_time
        boolean milk_picked_up
        float milk_quantity_liters
        boolean shift_completed
        string shift_completed_time
        int deliveries_completed
        float daily_salary_earned
        boolean salary_credited
        string payout_status
    }

    STAFF_SALARY_PAYMENTS {
        string id PK
        string staff_id FK
        string staff_name
        string dairy_name
        float amount
        string payment_date
        string payment_mode
        string reference_number
        string notes
    }

    INVOICES {
        string id PK
        string invoice_number UK
        string customer_id FK
        string customer_name
        string customer_type
        string billing_period
        string issue_date
        string due_date
        float total_amount
        float paid_amount
        string status
    }

    EXPENSES {
        string id PK
        string category
        float amount
        string date
        string vendor
        string payment_method
        string notes
    }

    DRIVER_RATINGS {
        string id PK
        string driver_id
        string driver_name
        string customer_id
        string customer_name
        string delivery_id
        float rating
        string feedback
        string date
    }
```

---

## 3. End-to-End Route Building & Live Dispatch Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Dairy Owner (Admin)
    participant UI as RouteBuilderStudio.tsx
    participant Context as DairyPulseContext.tsx
    participant API as Backend REST API (/api/v1)
    participant DB as Relational Database
    participant RiderApp as mobile/delivery/page.tsx

    Admin->>UI: Selects Sector (e.g., Baner) & adds customer stops
    UI->>UI: Projects GPS coords to SVG canvas & draws delivery path
    Admin->>UI: Reorders stops (moves Stop #2 to Stop #1)
    UI->>UI: Updates sequence orders & capacity bar (24.5L / 60L)
    Admin->>UI: Clicks "Save Route & Dispatch to Rider"
    UI->>Context: buildAndDispatchRoute(payload)
    Context->>API: POST /routes/build
    API->>DB: Upsert Route record & assign rider
    API->>DB: Update today's DeliveryTasks with sequence_order
    DB-->>API: Commits transaction
    API-->>Context: Return { success: true, route_code: "R-05", total_stops: 8 }
    Context->>RiderApp: Live state sync & stop order updated
    RiderApp-->>Admin: Stop sequence visible on rider smartphone
```

---

## 4. Rider Daily Shift & Compensation State Machine

```mermaid
stateDiagram-v2
    [*] --> OffDuty: Start of Day
    
    OffDuty --> AttendanceCheckedIn: Rider checks in at Farm (POST /staff/attendance/check-in)
    
    AttendanceCheckedIn --> MilkLoaded: Loads crates & logs liters taken (POST /staff/milk-pickup)
    
    MilkLoaded --> OutOnRoute: On Duty & Dispatched for Deliveries
    
    state OutOnRoute {
        [*] --> PendingStops
        PendingStops --> Delivered: Drop milk at doorstep (Online Sync)
        PendingStops --> QueuedOffline: Drop milk without mobile network (IndexedDB Queue)
        QueuedOffline --> Delivered: Network restored & batch sync processed
        PendingStops --> Failed: Door locked / Customer refused
    }

    OutOnRoute --> ReturningToHub: All stops completed
    
    ReturningToHub --> ShiftCompleted: Rider completes shift (POST /staff/shift-complete)
    note right of ShiftCompleted: System automatically credits rider's daily wage into pending balance
    
    ShiftCompleted --> PayoutSettled: Owner processes UPI/Cash settlement (POST /staff/payout)
    
    PayoutSettled --> OffDuty: Ready for next day
```

---

## 5. Cold-Chain Milk Inventory & Quality Assurance Flowchart

```mermaid
flowchart LR
    subgraph Intake ["1. Raw Milk Intake"]
        Tanker["Farmer / Tanker Arrival"] --> Testing["FAT & SNF Testing"]
        Testing --> Receipt["Log Stock Receipt<br/>(POST /inventory/receipts)"]
    end

    subgraph Storage ["2. Cold-Chain Silos"]
        Receipt --> CowSilo["Cow Milk Silo<br/>(3.8% FAT / 8.5% SNF)"]
        Receipt --> BuffaloSilo["Buffalo Milk Silo<br/>(6.5% FAT / 9.0% SNF)"]
        Receipt --> TonedSilo["Toned Milk Silo<br/>(3.0% FAT / 8.5% SNF)"]
        Receipt --> DesiSilo["A2 Desi Cow Silo<br/>(4.2% FAT / 8.8% SNF)"]
    end

    subgraph Outflow ["3. Consumption & Ledger"]
        CowSilo & BuffaloSilo & TonedSilo & DesiSilo --> Dispatch["Daily Delivery Run & B2B Orders"]
        CowSilo & BuffaloSilo & TonedSilo & DesiSilo --> Spillage["Wastage / Leakage Record<br/>(POST /inventory/wastage)"]
        Dispatch --> Ledger["Immutable Transaction Ledger<br/>(RECEIPT, DISPATCH, WASTAGE)"]
        Spillage --> Ledger
    end
```

---

## 6. Customer 3-Step Self-Service Onboarding Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Customer as New Household Customer
    participant LoginUI as /login (Customer Signup)
    participant Map as MapLocationPicker.tsx
    participant Context as DairyPulseContext.tsx
    participant API as /api/v1 Endpoints
    participant DB as Database

    Customer->>LoginUI: Step 1: Enters Name, Mobile (+91), Email, Password
    Customer->>LoginUI: Step 2: Browses local dairy farms & picks preferred dairy
    Customer->>Map: Step 3: Enters Flat/Society & drags pin on map to set GPS
    Map-->>LoginUI: Returns exact { latitude: 18.5593, longitude: 73.7788 }
    Customer->>LoginUI: Chooses Milk Variant (Cow/Buffalo/A2), Qty (1.5L) & Slot (Morning)
    LoginUI->>Context: addCustomer() & addSubscription()
    Context->>API: POST /customers (with GPS coordinates)
    API->>DB: Insert Customer record
    Context->>API: POST /subscriptions
    API->>DB: Insert Active Recurring Subscription
    DB-->>Context: Return Customer & Subscription details
    Context->>Customer: Automatic Login & redirect to /mobile/customer portal
```

---

## 7. Offline-First Delivery Synchronization Architecture

```mermaid
flowchart TD
    RiderAction["Rider marks stop 'Delivered' in /mobile/delivery"] --> NetCheck{"Is Device Online?"}

    NetCheck -- "YES (Online)" --> DirectHTTP["Send HTTP PATCH /deliveries/{id}/status"]
    DirectHTTP --> BackendOK{"Server Responds 200 OK?"}
    BackendOK -- "YES" --> ConfirmLive["Display Live Farm Synced Banner"]
    BackendOK -- "NO (Timeout/5xx)" --> QueueAction

    NetCheck -- "NO (Offline)" --> QueueAction["Push Action to IndexedDB Queue<br/>{ stopId, status, cash, bottles, timestamp }"]
    QueueAction --> ToastQueued["Display 'Queued Offline' Badge"]

    QueueAction --> BackgroundWatcher["Network Status Listener ('online' event)"]
    BackgroundWatcher --> ProcessQueue["triggerManualSync() / Auto-Drain Engine"]
    ProcessQueue --> BatchAPI["POST /deliveries/batch-sync<br/>Array of queued stops"]
    BatchAPI --> BulkUpdate["Backend processes bulk transaction idempotently"]
    BulkUpdate --> ClearQueue["Remove synced items from IndexedDB"]
    ClearQueue --> ToastSynced["Notify: 'Synchronized N offline stops!'"]
```
