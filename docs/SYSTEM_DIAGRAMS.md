# DairyPulse — Complete Software Engineering UML & Architecture Diagrams

This document contains the complete software engineering visual specifications for **DairyPulse** (Multi-Dairy Farm & Supply Chain Operations Platform). These diagrams follow standard UML 2.5 and system engineering specifications, designed for academic Capstone evaluation and production architectural review.

---

## 1. System Architecture Diagram

```mermaid
graph TB
    subgraph PresentationLayer ["1. Client Presentation Layer (Next.js 16 + React 19)"]
        OwnerUI["Dairy Owner Operations Portal<br/>• Overview Dashboard & P&L<br/>• Inventory Silos & Intake<br/>• Fleet Roster & Route Studio<br/>• Invoicing & WhatsApp Billing"]
        RiderUI["Delivery Fleet Partner PWA<br/>• Shift Start & Milk Pickup<br/>• Doorstep Task Checklist<br/>• Cash & Bottle Collection<br/>• Offline Sync Engine"]
        CustomerUI["Customer Household Portal<br/>• Subscription Calendar<br/>• Doorstep Delivery Tracking<br/>• Driver Rating & Feedback<br/>• Monthly Bill Settlement"]
    end

    subgraph StateLayer ["2. Client State & Persistence Layer"]
        DairyContext["DairyPulseContext<br/>(Global Reactive State Cache)"]
        AuthContext["AuthContext<br/>(JWT & Role Session Guard)"]
        LocalStore["Browser LocalStorage / IndexedDB<br/>(Offline Delivery Queue)"]
    end

    subgraph APILayer ["3. Application & API Gateway (FastAPI)"]
        CORS["CORS & Request Middleware<br/>(origins: localhost, vercel.app)"]
        RouterV1["REST API Router (/api/v1)<br/>• /auth & /dairies<br/>• /customers & /subscriptions<br/>• /deliveries & /routes<br/>• /inventory & /staff<br/>• /invoices & /expenses"]
        Pydantic["Pydantic v2 Schema Validators<br/>(Strict DTO Serialization)"]
    end

    subgraph ServiceLayer ["4. Business Logic Services"]
        RouteService["Route Builder & Sequencing Engine<br/>• Sequential Geo-Ordering<br/>• Vehicle Capacity Balance"]
        DispatchService["Daily Dispatch Manifest Generator<br/>• 5:00 AM Task Generation<br/>• Subscription Recurrence Rules"]
        StockService["Cold-Chain Silo Ledger<br/>• Intake Logging & SNF/FAT<br/>• Dispatch Reconciliation"]
        BillingService["Automated Billing Engine<br/>• Monthly Ledger Calculation<br/>• Deposit & Bottle Tracking"]
        PayrollService["Staff Shift & Payroll Engine<br/>• Geofenced Attendance<br/>• Daily Wage Payouts"]
    end

    subgraph DatabaseLayer ["5. Persistence Layer"]
        ORM["SQLAlchemy 2.0 ORM Engine"]
        DB[("Relational Database<br/>SQLite (Local Development)<br/>PostgreSQL (Production Cloud)")]
    end

    %% Connections
    OwnerUI --> DairyContext
    RiderUI --> DairyContext
    CustomerUI --> DairyContext
    RiderUI <--> LocalStore
    OwnerUI --> AuthContext

    DairyContext --> RouterV1
    LocalStore --> RouterV1
    AuthContext --> RouterV1

    CORS --> RouterV1
    RouterV1 --> Pydantic
    Pydantic --> RouteService
    Pydantic --> DispatchService
    Pydantic --> StockService
    Pydantic --> BillingService
    Pydantic --> PayrollService

    RouteService --> ORM
    DispatchService --> ORM
    StockService --> ORM
    BillingService --> ORM
    PayrollService --> ORM
    ORM --> DB
```

---

## 2. Comprehensive System Use Case Diagram

```mermaid
graph LR
    %% Actors
    Owner((Dairy Owner / Admin))
    Rider((Delivery Rider))
    Customer((Customer / Subscriber))
    Scheduler((System Chron Worker))

    subgraph SystemBoundary ["DairyPulse Enterprise System Boundary"]
        %% Owner Use Cases
        UC_Auth["UC-1: Authenticate / Switch Dairy Workspace"]
        UC_RegDairy["UC-2: Register & Configure Dairy Farm"]
        UC_Stock["UC-3: Record Milk Intake & Fat/SNF"]
        UC_Cust["UC-4: Manage Customers & Subscriptions"]
        UC_BuildRoute["UC-5: Build & Sequence Delivery Routes"]
        UC_Dispatch["UC-6: Generate Daily Dispatch Manifest"]
        UC_Payroll["UC-7: Process Rider Daily Wage Payouts"]
        UC_Reports["UC-8: Audit Revenue, Wastage & P&L"]

        %% Rider Use Cases
        UC_ShiftStart["UC-9: Clock-in Attendance & Milk Pickup"]
        UC_DropOff["UC-10: Mark Doorstep Drop & Collect Bottles"]
        UC_CashCollect["UC-11: Collect Cash Payment on Delivery"]
        UC_OfflineSync["UC-12: Sync Offline Completed Deliveries"]

        %% Customer Use Cases
        UC_SubManage["UC-13: Modify Milk Quantity or Pause Date"]
        UC_TrackDeliv["UC-14: Track Morning Delivery Status"]
        UC_RateDriver["UC-15: Rate Driver & Submit Feedback"]
        UC_PayInvoice["UC-16: Settle Monthly Milk Invoice"]
    end

    %% Owner Relationships
    Owner --- UC_Auth
    Owner --- UC_RegDairy
    Owner --- UC_Stock
    Owner --- UC_Cust
    Owner --- UC_BuildRoute
    Owner --- UC_Dispatch
    Owner --- UC_Payroll
    Owner --- UC_Reports

    %% Rider Relationships
    Rider --- UC_Auth
    Rider --- UC_ShiftStart
    Rider --- UC_DropOff
    Rider --- UC_CashCollect
    Rider --- UC_OfflineSync

    %% Customer Relationships
    Customer --- UC_Auth
    Customer --- UC_SubManage
    Customer --- UC_TrackDeliv
    Customer --- UC_RateDriver
    Customer --- UC_PayInvoice

    %% Scheduler Relationships
    Scheduler --- UC_Dispatch
```

---

## 3. Complete Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    DAIRIES ||--o{ USERS : "employs"
    DAIRIES ||--o{ STAFF : "employs"
    DAIRIES ||--o{ CUSTOMERS : "serves"
    DAIRIES ||--o{ PRODUCTS : "produces"
    DAIRIES ||--o{ ROUTES : "operates"
    DAIRIES ||--o{ EXPENSES : "incurs"

    CUSTOMERS ||--o{ SUBSCRIPTIONS : "holds"
    CUSTOMERS ||--o{ ORDERS : "places"
    CUSTOMERS ||--o{ INVOICES : "billed_to"
    CUSTOMERS ||--o{ DELIVERY_TASKS : "receives"

    STAFF ||--o{ DELIVERY_TASKS : "assigned_to"
    STAFF ||--o{ STAFF_ATTENDANCE : "logs"
    STAFF ||--o{ STAFF_SALARY_PAYMENTS : "receives"
    STAFF ||--o{ DRIVER_RATINGS : "evaluated_in"

    ROUTES ||--o{ DELIVERY_TASKS : "contains"
    PRODUCTS ||--o{ SUBSCRIPTIONS : "referenced_in"
    PRODUCTS ||--o{ INVENTORY_TRANSACTIONS : "tracked_in"

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
        string email
        string phone
        string password_hash
        string full_name
        string role "OWNER | DELIVERY | CUSTOMER"
        string dairy_name FK
    }

    PRODUCTS {
        string id PK
        string name
        string variant "Cow | Buffalo | Toned | A2"
        float fat_content
        float snf_content
        float selling_price
        float cost_price
        float available_stock
        float low_stock_threshold
        string status
    }

    CUSTOMERS {
        string id PK
        string name
        string type "HOUSEHOLD | SHOP"
        string phone
        string email
        string address
        string area
        string route
        float balance
        string status "Active | Paused"
    }

    SUBSCRIPTIONS {
        string id PK
        string customer_id FK
        string product_variant
        float quantity_liters
        string time_slot "Morning | Evening"
        string frequency "Daily | Alternate Days"
        float unit_price
        string status "Active | Paused"
    }

    DELIVERY_TASKS {
        string id PK
        string delivery_number
        string customer_id FK
        string assigned_rider FK
        string route FK
        string product_variant
        float quantity_liters
        string slot
        string status "Pending | In Progress | Delivered | Failed"
        int sequence_order
        string delivery_date
    }

    STAFF {
        string id PK
        string name
        string role "Delivery Rider | Plant Operator"
        string phone
        string assigned_area
        string status "On Duty | Off Duty"
        float daily_salary
        float pending_salary
    }

    INVOICES {
        string id PK
        string invoice_number
        string customer_id FK
        string billing_period
        float total_amount
        float paid_amount
        string status "Paid | Partial | Unpaid"
    }

    DRIVER_RATINGS {
        string id PK
        string driver_id FK
        string customer_id FK
        string delivery_id FK
        int rating "1 to 5"
        string feedback
    }
```

---

## 4. Sequence Diagram: Morning Dispatch & Doorstep Fulfillment Flow

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Dairy Owner
    actor Rider as Delivery Rider
    participant Frontend as Next.js PWA
    participant Backend as FastAPI Gateway
    participant Dispatcher as Dispatch Service
    participant DB as SQLite / PostgreSQL Database
    actor Customer as Household Customer

    Note over Owner, Backend: 05:00 AM — Daily Route Generation
    Owner->>Frontend: Click "Generate Daily Manifest"
    Frontend->>Backend: POST /api/v1/deliveries/generate-daily
    Backend->>Dispatcher: Resolve Active Subscriptions for Date
    Dispatcher->>DB: Query Subscriptions WHERE status = 'Active'
    DB-->>Dispatcher: Return Active Subscription Records
    Dispatcher->>DB: Bulk Insert DeliveryTask records (Status: Assigned)
    DB-->>Backend: Insert confirmed
    Backend-->>Frontend: 200 OK (e.g. 48 Stops Generated)

    Note over Rider, Backend: 05:30 AM — Milk Pickup & Attendance
    Rider->>Frontend: Click "Clock In & Confirm Milk Pickup"
    Frontend->>Backend: POST /api/v1/staff/attendance/check-in
    Backend->>DB: Record StaffAttendance (Status: On Duty)
    Frontend->>Backend: POST /api/v1/staff/pickup-milk (Liters, Crates)
    Backend->>DB: Decrement Silo Inventory Available Stock
    Backend-->>Frontend: Shift Activated & Crates Loaded

    Note over Rider, Customer: 06:15 AM — Doorstep Milk Drop
    Rider->>Frontend: Tap "Mark Delivered" on Customer Stop #1
    Frontend->>Backend: PATCH /api/v1/deliveries/{id}/status (Status: Delivered)
    Backend->>DB: Update DeliveryTask status & completed timestamp
    DB-->>Backend: Updated
    Backend-->>Frontend: 200 OK

    Note over Customer, Backend: 07:00 AM — Delivery Verification & Review
    Customer->>Frontend: Open Customer Portal
    Frontend->>Backend: GET /api/v1/deliveries/today?customer_id=...
    Backend-->>Frontend: Return Delivered status
    Customer->>Frontend: Rate Rider (5 Stars + Review note)
    Frontend->>Backend: POST /api/v1/driver-ratings
    Backend->>DB: Save DriverRating record & recalculate staff average
    DB-->>Backend: Rating Saved
    Backend-->>Customer: "Thank you for rating your delivery partner!"
```

---

## 5. State Machine Diagram: Delivery Task Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Scheduled: Daily Generation / Subscription Active
    
    Scheduled --> Assigned: Route Allocated to Rider
    Assigned --> In_Progress: Rider Starts Delivery Route
    
    In_Progress --> Delivered: Doorstep Drop Completed
    In_Progress --> Failed: Door Locked / Guard Refused / Dog
    In_Progress --> Skipped: Customer Requested Same-Day Skip
    
    Failed --> In_Progress: Retry Delivery on Return Loop
    Failed --> Returned_to_Hub: Shift Finished Without Redelivery
    
    Delivered --> [*]: Bottles Logged & Payment Settled
    Returned_to_Hub --> [*]: Milk Checked into Spoilage/Cold Silo
    Skipped --> [*]: Bill Adjusted for Omitted Day
```

---

## 6. Data Flow Diagram (DFD Level 1: Core Operations)

```mermaid
graph TD
    %% Entities
    E_Farmer["Dairy Farmer / Tanker Supplier"]
    E_Owner["Dairy Owner"]
    E_Rider["Delivery Fleet"]
    E_Cust["Customer"]

    %% Processes
    P1["1.0 Milk Intake & Silo Quality"]
    P2["2.0 Subscription & Order Mgmt"]
    P3["3.0 Daily Route & Dispatch Planning"]
    P4["4.0 Doorstep Delivery Execution"]
    P5["5.0 Billing & Invoice Ledger"]
    P6["6.0 Staff Attendance & Payroll"]

    %% Data Stores
    D1[("D1: Inventory Silos Store")]
    D2[("D2: Customers & Subscriptions")]
    D3[("D3: Delivery Tasks Store")]
    D4[("D4: Invoices & Receipts Store")]
    D5[("D5: Staff & Attendance Store")]

    %% Flows
    E_Farmer -->|Raw Milk Liters, FAT & SNF| P1
    P1 -->|Update Available Stock| D1

    E_Cust -->|Register Subscription / Pause| P2
    P2 -->|Save Customer Profile & Schedule| D2

    E_Owner -->|Trigger Daily Dispatch| P3
    D2 -->|Read Active Subscriptions| P3
    D1 -->|Verify Available Stock| P3
    P3 -->|Write Manifest Stops| D3

    D3 -->|Assigned Stop Sequence| P4
    E_Rider -->|Drop Confirmation & Bottles| P4
    P4 -->|Update Task Status| D3

    D3 -->|Completed Liters| P5
    P5 -->|Generate Monthly Invoices| D4
    D4 -->|WhatsApp Bill Statement| E_Cust

    E_Rider -->|Clock-in GPS & Pickup| P6
    P6 -->|Record Shift & Daily Salary| D5
    E_Owner -->|Disburse UPI / Cash Wage| P6
```
