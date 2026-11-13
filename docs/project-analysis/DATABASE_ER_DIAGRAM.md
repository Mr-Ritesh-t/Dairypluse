# Database Entity-Relationship (ER) Diagram — DairyPulse

> **Document Version:** 1.0.0  
> **Team:** NEXURA  
> **Dialect:** Mermaid ER Diagram  
> **Total Entities Represented:** 17  
> **Primary Keys:** UUID v4 String  

---

## 1. Complete System Entity-Relationship Diagram

```mermaid
erDiagram
    DAIRIES ||--o{ USERS : "employs / owns"
    DAIRIES ||--o{ STAFF : "employs"
    DAIRIES ||--o{ CUSTOMERS : "serves"
    DAIRIES ||--o{ PRODUCTS : "catalogs"
    DAIRIES ||--o{ ROUTES : "operates"
    DAIRIES ||--o{ INVOICES : "issues"
    DAIRIES ||--o{ STAFF_ATTENDANCE : "tracks"
    DAIRIES ||--o{ STAFF_SALARY_PAYMENTS : "disburses"

    CUSTOMERS ||--o{ SUBSCRIPTIONS : "subscribes to"
    CUSTOMERS ||--o{ ORDERS : "places bulk order"
    CUSTOMERS ||--o{ INVOICES : "billed by"
    CUSTOMERS ||--o{ DRIVER_RATINGS : "reviews driver"

    ORDERS ||--|{ ORDER_ITEMS : "contains line items"

    STAFF ||--o{ STAFF_ATTENDANCE : "checks in"
    STAFF ||--o{ STAFF_SALARY_PAYMENTS : "receives wages"
    STAFF ||--o{ DRIVER_RATINGS : "rated on delivery"

    ROUTES ||--o{ DELIVERY_TASKS : "groups stops on"
    STAFF ||--o{ DELIVERY_TASKS : "assigned as rider"

    PRODUCTS ||--o{ STOCK_RECEIPTS : "intake batch variant"
    PRODUCTS ||--o{ INVENTORY_TRANSACTIONS : "movement audits"

    DAIRIES {
        string id PK
        string name
        string owner_name
        string email
        string phone
        string city
        string address
        float latitude
        float longitude
        float rating
        string upi_id
        boolean auto_reminders
        datetime created_at
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
        datetime created_at
    }

    STAFF {
        string id PK
        string name
        string role
        string phone
        string email
        string assigned_area
        string dairy_name
        string status
        int deliveries_today
        float rating
        float daily_salary
        float pending_salary
        float total_salary_paid
        string joining_date
        datetime created_at
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
        string dairy_name
        float latitude
        float longitude
        string preferred_time
        float balance
        string status
        string joined_date
        string last_reminder_sent
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
        string dairy_name
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
        string expiry_date
        datetime created_at
    }

    INVENTORY_TRANSACTIONS {
        string id PK
        string date
        string timestamp
        string transaction_type
        string product_variant
        float quantity
        string supplier_or_batch
        float rate_per_liter
        string notes
        string expiry_date
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
        string dairy_name
        string start_date
        string status
        string paused_until
    }

    ORDERS {
        string id PK
        string order_number UK
        string customer_id FK
        string shop_name
        string contact_person
        string phone
        string order_date
        string delivery_date
        string status
        string payment_status
        string dairy_name
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
        string landmark
        string area
        string route
        string dairy_name
        string product_variant
        float quantity_liters
        string slot
        string assigned_rider
        string status
        string failed_reason
        string delivered_at
        int sequence_order
        string delivery_date
        boolean is_extra_order
        float latitude
        float longitude
        string notes
        int driver_rating
        string driver_rating_feedback
        string rated_at
    }

    DRIVER_RATINGS {
        string id PK
        string driver_name
        string driver_id
        string customer_id
        string customer_name
        string delivery_id
        int rating
        string tags
        string feedback
        datetime created_at
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
        string dairy_name
        datetime created_at
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
        string dairy_name
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

    STAFF_ATTENDANCE {
        string id PK
        string staff_id
        string staff_name
        string dairy_name
        string date
        string check_in_time
        string status
        boolean pickup_confirmed
        string pickup_time
        float pickup_liters
        int pickup_crates
        boolean shift_completed
        string shift_completed_time
        int deliveries_completed
        float daily_salary_earned
        boolean salary_credited
        string payout_status
        string payout_id
        string notes
        datetime created_at
    }

    STAFF_SALARY_PAYMENTS {
        string id PK
        string staff_id
        string staff_name
        string dairy_name
        float amount
        string payment_date
        string payment_time
        string payment_mode
        string reference_id
        string notes
        datetime created_at
    }
```

---

## 2. Practical DairyPulse Entity Relationships Explained

### 2.1 The Daily Delivery & Ledger Pipeline
```
[Customer]
    │ 1
    ├── has many (1:N) ──> [Subscription] (e.g. 1.5L Cow Milk daily)
    │
    └── generate-daily ──> [DeliveryTask] (Assigned to Route & Rider)
                                │
                        Marked "Delivered"
                                │
                                └──> updates [Customer.balance] += (1.5L * ₹68 = ₹102)
                                └──> updates [Staff.deliveries_today] += 1
```
- **Example:** Customer "Priya Kulkarni" has an active `Subscription` for `1.5L` Cow Milk at `₹68/L`.
- Each morning, `POST /deliveries/generate-daily` instantiates a `DeliveryTask` sequenced on route `RT-WAKAD-01`.
- When rider "Rahul Deshmukh" taps "Mark Delivered" at 06:45 AM, the backend executes `customer.balance += 102.0`, updating Priya's monthly bill automatically.

---

### 2.2 The B2B Bulk Commercial Pipeline
```
[Customer (Type: SHOP)]
    │ 1
    └── places (1:N) ──> [Order] (e.g. ORD-2026-0891 to "Shree Krishna Sweets")
                            │ 1
                            └── contains (1:N) ──> [OrderItem] #1: 30L Buffalo Milk @ ₹78 = ₹2,340
                            └── contains (1:N) ──> [OrderItem] #2: 10L Cow Milk @ ₹68 = ₹680
                                                    Total = ₹3,020 (Payment: Pending)
```
- **Example:** Sweet shops and halwais require multi-product bulk deliveries with separate invoices and payment tracking distinct from household subscriptions.

---

### 2.3 The Rider Attendance & Payout Pipeline
```
[Staff (Rider)]
    │
    ├── checks in at 05:30 AM ──> [StaffAttendance] (check_in_time: "05:30 AM")
    ├── picks up crates       ──> [StaffAttendance] (pickup_liters: 72L, pickup_crates: 6)
    ├── completes 24 stops    ──> [StaffAttendance] (shift_completed: True, daily_salary_earned: ₹500)
    │                                 │
    │                       credits to [Staff.pending_salary] += ₹500
    │
    └── owner pays via UPI   ──> [StaffSalaryPayment] (amount: ₹3,500, mode: "UPI", ref: "UPI20261113009")
                                      │
                            debits [Staff.pending_salary] -= ₹3,500
                            credits [Staff.total_salary_paid] += ₹3,500
```
- This closed-loop payroll ensures farm owners never lose track of rider attendance, fuel allowances, or accumulated wages.

This completes the comprehensive visual and operational ER model documentation.
