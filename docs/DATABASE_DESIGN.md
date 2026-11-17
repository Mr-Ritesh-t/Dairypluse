# Database Schema & Entity Documentation — DairyPulse

> **Document Version:** 1.0.0  
> **Team:** NEXURA  
> **ORM Engine:** SQLAlchemy 2.0+ Declarative Base  
> **Source Model File:** `backend/app/models/models.py`  
> **Total Entities Discovered:** 17  

---

## 1. Database Architecture Overview

DairyPulse uses a normalized relational data model designed around agricultural operations and distribution logistics. UUID strings generated via `uuid.uuid4()` serve as primary keys across all entities, ensuring collision-free data synchronization between distributed mobile devices, local offline stores, and multi-tenant cloud databases.

### Key Architectural Characteristics
- **Multi-Tenant Scoping:** Major operational entities (`customers`, `products`, `routes`, `delivery_tasks`, `subscriptions`, `orders`, `staff`, `invoices`, `staff_attendance`, `staff_salary_payments`) carry a `dairy_name` or `dairy_id` scoping column, isolating different dairy operations under the same database instance.
- **Foreign Key Integrity:** Core parent-child relationships (`Customer` -> `Subscription`, `Customer` -> `Order` -> `OrderItem`, `Customer` -> `Invoice`) are defined using SQLAlchemy `ForeignKey` constraints and mapped bidirectional `relationship` attributes.
- **Dual-Dialect Compatibility:** Tables and column types (Strings, Floats, Booleans, Texts, DateTimes) are chosen to execute identically on SQLite (`backend/dairypulse.db`) and PostgreSQL (`Supabase` / `Render`).

---

## 2. Complete Entity Catalog (17 Entities)

### 2.1 `Dairy` (Table: `dairies`)
Represents an independent dairy farm, processing plant, or chilling center business.
- **Primary Key:** `id` (`String`, UUID)
- **Columns:**
  - `name`: `String`, Non-nullable. (e.g. `"Amrut Dairy Farm"`)
  - `owner_name`: `String`, Non-nullable. (e.g. `"Rajesh Sharma"`)
  - `email`: `String`, Non-nullable. (e.g. `"admin@dairypulse.farm"`)
  - `phone`: `String`, Non-nullable. (e.g. `"+91 98765 43210"`)
  - `city`: `String`, Default: `"Pune"`.
  - `address`: `String`, Nullable. (e.g. `"Hadapsar Chilling Center, Pune"`)
  - `latitude`: `Float`, Nullable, Default: `18.5520`.
  - `longitude`: `Float`, Nullable, Default: `73.7880`.
  - `rating`: `Float`, Default: `4.9`.
  - `upi_id`: `String`, Nullable, Default: `"dairypulse@okhdfcbank"`.
  - `auto_reminders`: `Boolean`, Default: `True`.
  - `created_at`: `DateTime`, Default: `datetime.utcnow`.

---

### 2.2 `User` (Table: `users`)
System authentication account with role-based access permissions.
- **Primary Key:** `id` (`String`, UUID)
- **Columns:**
  - `email`: `String`, Unique, Index, Non-nullable.
  - `phone`: `String`, Unique, Index, Nullable.
  - `password_hash`: `String`, Non-nullable.
  - `full_name`: `String`, Non-nullable.
  - `role`: `String`, Default: `"OWNER"`. Values: `"OWNER"`, `"STAFF"` / `"DELIVERY"`, `"CUSTOMER"`.
  - `dairy_name`: `String`, Nullable, Default: `"Amrut Dairy Farm"`.
  - `is_active`: `Boolean`, Default: `True`.
  - `created_at`: `DateTime`, Default: `datetime.utcnow`.

---

### 2.3 `Staff` (Table: `staff`)
Employee and delivery rider personnel records.
- **Primary Key:** `id` (`String`, UUID)
- **Columns:**
  - `name`: `String`, Non-nullable. (e.g. `"Rahul Deshmukh"`)
  - `role`: `String`, Non-nullable. Values: `"Delivery Rider"`, `"Plant Operator"`, `"Manager"`.
  - `phone`: `String`, Non-nullable.
  - `email`: `String`, Nullable.
  - `assigned_area`: `String`, Non-nullable. (e.g. `"Baner & Wakad"`)
  - `dairy_name`: `String`, Nullable, Default: `"DairyPulse Farm HQ"`.
  - `status`: `String`, Default: `"On Duty"`. Values: `"On Duty"`, `"Off Duty"`, `"On Leave"`.
  - `deliveries_today`: `Integer`, Default: `0`.
  - `rating`: `Float`, Default: `4.9`.
  - `daily_salary`: `Float`, Default: `500.0`. (Daily wage rate in ₹)
  - `pending_salary`: `Float`, Default: `0.0`. (Accumulated unpaid wage balance in ₹)
  - `total_salary_paid`: `Float`, Default: `0.0`. (Lifetime wage disbursed in ₹)
  - `joining_date`: `String`, Non-nullable. (Format: `"YYYY-MM-DD"`)
  - `created_at`: `DateTime`, Default: `datetime.utcnow`.

---

### 2.4 `Customer` (Table: `customers`)
Consumer household, retail shop, or restaurant client account.
- **Primary Key:** `id` (`String`, UUID)
- **Columns:**
  - `name`: `String`, Non-nullable. (e.g. `"Priya Kulkarni"`)
  - `customer_type`: `String`, Non-nullable. Values: `"HOUSEHOLD"`, `"SHOP"`, `"RESTAURANT"`.
  - `phone`: `String`, Non-nullable.
  - `email`: `String`, Nullable.
  - `address`: `String`, Non-nullable. (e.g. `"Flat 402, Rohan Viti, Wakad"`)
  - `area`: `String`, Non-nullable. (e.g. `"Wakad"`)
  - `route`: `String`, Non-nullable. (e.g. `"Wakad Central Route"`)
  - `dairy_name`: `String`, Nullable, Default: `"DairyPulse Farm HQ"`.
  - `latitude`: `Float`, Nullable. (GPS latitude)
  - `longitude`: `Float`, Nullable. (GPS longitude)
  - `preferred_time`: `String`, Nullable, Default: `"6:00 AM - 7:30 AM"`.
  - `balance`: `Float`, Default: `0.0`. (Current outstanding debt in ₹)
  - `status`: `String`, Default: `"Active"`. Values: `"Active"`, `"Paused"`, `"Inactive"`.
  - `joined_date`: `String`, Default: Current UTC date (`"YYYY-MM-DD"`).
  - `last_reminder_sent`: `String`, Nullable. (Timestamp of last WhatsApp invoice notice)
- **Relationships:**
  - `subscriptions`: `1:N` back-populates `Subscription.customer`.
  - `orders`: `1:N` back-populates `Order.customer`.
  - `invoices`: `1:N` back-populates `Invoice.customer`.

---

### 2.5 `Product` (Table: `products`)
Catalog of milk varieties and dairy items sold by the farm.
- **Primary Key:** `id` (`String`, UUID)
- **Columns:**
  - `name`: `String`, Non-nullable. (e.g. `"Pure Fresh Cow Milk"`)
  - `variant`: `String`, Non-nullable. (e.g. `"Cow Milk"`, `"Buffalo Milk"`, `"Toned Milk"`, `"A2 Desi Cow Milk"`)
  - `unit`: `String`, Default: `"Liter"`.
  - `fat_content`: `Float`, Non-nullable. (Percentage FAT, e.g. `4.2`)
  - `snf_content`: `Float`, Non-nullable. (Percentage Solid-Not-Fat, e.g. `8.7`)
  - `selling_price`: `Float`, Non-nullable. (Customer retail price in ₹)
  - `cost_price`: `Float`, Non-nullable. (Farmer procurement cost in ₹)
  - `available_stock`: `Float`, Default: `0.0`. (Current chilling vat liters)
  - `low_stock_threshold`: `Float`, Default: `100.0`. (Warning trigger liters)
  - `dairy_name`: `String`, Nullable, Default: `"DairyPulse Farm HQ"`.
  - `status`: `String`, Default: `"In Stock"`. Values: `"In Stock"`, `"Low Stock"`, `"Out of Stock"`.

---

### 2.6 `StockReceipt` (Table: `stock_receipts`)
Audit record of raw milk intake from partner farmers or collection centers.
- **Primary Key:** `id` (`String`, UUID)
- **Columns:**
  - `supplier_name`: `String`, Non-nullable. (e.g. `"Kisan Dairy Co-Op Baramati"`)
  - `receipt_date`: `String`, Default: `"YYYY-MM-DD"`.
  - `variant`: `String`, Non-nullable.
  - `quantity`: `Float`, Non-nullable. (Liters received)
  - `unit_cost`: `Float`, Non-nullable. (Cost per liter in ₹)
  - `notes`: `Text`, Nullable.
  - `expiry_date`: `String`, Nullable. (Batch expiration date `"YYYY-MM-DD"`)
  - `created_at`: `DateTime`, Default: `datetime.utcnow`.

---

### 2.7 `InventoryTransaction` (Table: `inventory_transactions`)
Double-entry inventory audit ledger recording stock additions, dispatches, and loss.
- **Primary Key:** `id` (`String`, UUID)
- **Columns:**
  - `date`: `String`, Default: `"YYYY-MM-DD"`.
  - `timestamp`: `String`, Default: `"HH:MM"`.
  - `transaction_type`: `String`, Non-nullable. Values: `"RECEIPT"`, `"DISPATCH"`, `"WASTAGE"`, `"ADJUSTMENT"`.
  - `product_variant`: `String`, Non-nullable.
  - `quantity`: `Float`, Non-nullable.
  - `supplier_or_batch`: `String`, Non-nullable. (e.g. `"Morning Procurement Batch #104"`)
  - `rate_per_liter`: `Float`, Nullable.
  - `notes`: `Text`, Nullable.
  - `expiry_date`: `String`, Nullable.

---

### 2.8 `Subscription` (Table: `subscriptions`)
Recurring standing daily milk order for a household customer.
- **Primary Key:** `id` (`String`, UUID)
- **Foreign Key:** `customer_id` -> `customers.id`, Non-nullable.
- **Columns:**
  - `customer_name`: `String`, Non-nullable.
  - `product_variant`: `String`, Non-nullable. (e.g. `"Cow Milk"`)
  - `quantity_liters`: `Float`, Non-nullable. (e.g. `1.5`)
  - `time_slot`: `String`, Default: `"Morning (6:00 AM - 7:30 AM)"`.
  - `frequency`: `String`, Default: `"Daily"`. Values: `"Daily"`, `"Alternate Days"`, `"Custom"`.
  - `unit_price`: `Float`, Non-nullable. (Price per liter in ₹)
  - `dairy_name`: `String`, Nullable, Default: `"DairyPulse Farm HQ"`.
  - `start_date`: `String`, Default: `"YYYY-MM-DD"`.
  - `status`: `String`, Default: `"Active"`. Values: `"Active"`, `"Paused"`, `"Expired"`.
  - `paused_until`: `String`, Nullable. (Resume date after vacation)
- **Relationships:**
  - `customer`: `N:1` back-populates `Customer.subscriptions`.

---

### 2.9 `Order` (Table: `orders`)
B2B commercial bulk order header for restaurants, tea stalls, and shops.
- **Primary Key:** `id` (`String`, UUID)
- **Foreign Key:** `customer_id` -> `customers.id`, Nullable.
- **Columns:**
  - `order_number`: `String`, Unique, Non-nullable. (e.g. `"ORD-2026-0891"`)
  - `shop_name`: `String`, Non-nullable. (e.g. `"Shree Krishna Sweets"`)
  - `contact_person`: `String`, Non-nullable.
  - `phone`: `String`, Non-nullable.
  - `order_date`: `String`, Default: `"YYYY-MM-DD"`.
  - `delivery_date`: `String`, Default: `"YYYY-MM-DD"`.
  - `status`: `String`, Default: `"Pending"`. Values: `"Pending"`, `"Dispatched"`, `"Delivered"`, `"Cancelled"`.
  - `payment_status`: `String`, Default: `"Pending"`. Values: `"Paid"`, `"Partial"`, `"Pending"`.
  - `dairy_name`: `String`, Nullable, Default: `"DairyPulse Farm HQ"`.
  - `total_amount`: `Float`, Default: `0.0`.
  - `paid_amount`: `Float`, Default: `0.0`.
- **Relationships:**
  - `customer`: `N:1` back-populates `Customer.orders`.
  - `items`: `1:N` back-populates `OrderItem.order`.

---

### 2.10 `OrderItem` (Table: `order_items`)
Individual line item within a commercial B2B order.
- **Primary Key:** `id` (`String`, UUID)
- **Foreign Key:** `order_id` -> `orders.id`, Non-nullable.
- **Columns:**
  - `product_variant`: `String`, Non-nullable.
  - `quantity`: `Float`, Non-nullable.
  - `unit`: `String`, Default: `"Liter"`.
  - `unit_price`: `Float`, Non-nullable.
  - `line_total`: `Float`, Non-nullable.
- **Relationships:**
  - `order`: `N:1` back-populates `Order.items`.

---

### 2.11 `DeliveryTask` (Table: `delivery_tasks`)
Single physical delivery stop assigned to a rider for morning/evening dispatch.
- **Primary Key:** `id` (`String`, UUID)
- **Columns:**
  - `delivery_number`: `String`, Unique, Non-nullable. (e.g. `"DEL-2026-0412"`)
  - `customer_name`: `String`, Non-nullable.
  - `customer_phone`: `String`, Non-nullable.
  - `address`: `String`, Non-nullable.
  - `flat_or_unit`: `String`, Nullable. (e.g. `"Flat 402"`)
  - `society_or_landmark`: `String`, Nullable. (e.g. `"Rohan Viti Society"`)
  - `landmark`: `String`, Nullable.
  - `area`: `String`, Non-nullable. (e.g. `"Wakad"`)
  - `route`: `String`, Nullable. (e.g. `"Wakad Central Route"`)
  - `dairy_name`: `String`, Nullable, Default: `"Amrut Dairy Farm"`.
  - `product_variant`: `String`, Non-nullable.
  - `quantity_liters`: `Float`, Non-nullable.
  - `slot`: `String`, Default: `"Morning"`.
  - `assigned_rider`: `String`, Non-nullable. (e.g. `"Rahul Deshmukh"`)
  - `status`: `String`, Default: `"Pending"`. Values: `"Pending"`, `"Assigned"`, `"Out for Delivery"`, `"Delivered"`, `"Failed"`.
  - `failed_reason`: `String`, Nullable. (e.g. `"Gate Locked"`, `"Customer Refused"`)
  - `delivered_at`: `String`, Nullable. (Timestamp e.g. `"06:45 AM"`)
  - `sequence_order`: `Integer`, Default: `1`. (Turn-by-turn stop sequence)
  - `delivery_date`: `String`, Default: `"YYYY-MM-DD"`.
  - `is_extra_order`: `Boolean`, Default: `False`.
  - `latitude`: `Float`, Nullable.
  - `longitude`: `Float`, Nullable.
  - `notes`: `Text`, Nullable.
  - `driver_rating`: `Integer`, Nullable. (1 to 5 stars)
  - `driver_rating_feedback`: `Text`, Nullable.
  - `rated_at`: `String`, Nullable.

---

### 2.12 `DriverRating` (Table: `driver_ratings`)
Customer satisfaction feedback and 5-star review record for a delivery rider.
- **Primary Key:** `id` (`String`, UUID)
- **Columns:**
  - `driver_name`: `String`, Non-nullable.
  - `driver_id`: `String`, Nullable.
  - `customer_id`: `String`, Nullable.
  - `customer_name`: `String`, Non-nullable.
  - `delivery_id`: `String`, Nullable.
  - `rating`: `Integer`, Non-nullable. (1 to 5)
  - `tags`: `String`, Nullable. (Comma-separated e.g. `"On Time, Polite"`)
  - `feedback`: `Text`, Nullable.
  - `created_at`: `DateTime`, Default: `datetime.utcnow`.

---

### 2.13 `Route` (Table: `routes`)
Planned distribution corridor grouping geographic clusters of customers.
- **Primary Key:** `id` (`String`, UUID)
- **Columns:**
  - `route_code`: `String`, Unique, Non-nullable. (e.g. `"RT-WAKAD-01"`)
  - `name`: `String`, Non-nullable. (e.g. `"Wakad Central Morning Run"`)
  - `area`: `String`, Non-nullable.
  - `assigned_rider`: `String`, Non-nullable.
  - `slot`: `String`, Default: `"Morning (6:00 AM - 7:30 AM)"`.
  - `societies`: `String`, Nullable. (Comma-separated societies covered)
  - `total_stops`: `Integer`, Default: `0`.
  - `total_liters`: `Float`, Default: `0.0`.
  - `max_capacity_liters`: `Float`, Default: `60.0`. (Vehicle carrying limit)
  - `dairy_name`: `String`, Nullable, Default: `"Amrut Dairy Farm"`.
  - `created_at`: `DateTime`, Default: `datetime.utcnow`.

---

### 2.14 `Invoice` (Table: `invoices`)
Monthly customer billing statement summarizing milk delivered.
- **Primary Key:** `id` (`String`, UUID)
- **Foreign Key:** `customer_id` -> `customers.id`, Non-nullable.
- **Columns:**
  - `invoice_number`: `String`, Unique, Non-nullable. (e.g. `"INV-2026-0341"`)
  - `customer_name`: `String`, Non-nullable.
  - `customer_type`: `String`, Default: `"HOUSEHOLD"`.
  - `billing_period`: `String`, Non-nullable. (e.g. `"October 2026"`)
  - `issue_date`: `String`, Default: `"YYYY-MM-DD"`.
  - `due_date`: `String`, Non-nullable. (e.g. `"2026-11-05"`)
  - `total_amount`: `Float`, Non-nullable. (Total billing amount in ₹)
  - `paid_amount`: `Float`, Default: `0.0`. (Amount received so far in ₹)
  - `status`: `String`, Default: `"Unpaid"`. Values: `"Paid"`, `"Partial"`, `"Unpaid"`, `"Overdue"`.
  - `dairy_name`: `String`, Nullable, Default: `"DairyPulse Farm HQ"`.
- **Relationships:**
  - `customer`: `N:1` back-populates `Customer.invoices`.

---

### 2.15 `Expense` (Table: `expenses`)
Farm operational cost line item.
- **Primary Key:** `id` (`String`, UUID)
- **Columns:**
  - `category`: `String`, Non-nullable. (e.g. `"Cattle Feed"`, `"Vehicle Fuel"`, `"Chilling Maintenance"`, `"Veterinary"`)
  - `amount`: `Float`, Non-nullable. (Expense in ₹)
  - `date`: `String`, Default: `"YYYY-MM-DD"`.
  - `vendor`: `String`, Non-nullable.
  - `payment_method`: `String`, Default: `"UPI"`. Values: `"UPI"`, `"Cash"`, `"Bank Transfer"`, `"Cheque"`.
  - `notes`: `Text`, Nullable.

---

### 2.16 `StaffAttendance` (Table: `staff_attendance`)
Rider shift attendance, milk crate collection, and daily shift completion log.
- **Primary Key:** `id` (`String`, UUID)
- **Columns:**
  - `staff_id`: `String`, Nullable.
  - `staff_name`: `String`, Non-nullable.
  - `dairy_name`: `String`, Nullable, Default: `"DairyPulse Farm HQ"`.
  - `date`: `String`, Default: `"YYYY-MM-DD"`.
  - `check_in_time`: `String`, Nullable. (e.g. `"05:30 AM"`)
  - `status`: `String`, Default: `"Present"`. Values: `"Present"`, `"Late"`, `"Half Day"`.
  - `pickup_confirmed`: `Boolean`, Default: `False`.
  - `pickup_time`: `String`, Nullable. (e.g. `"05:55 AM"`)
  - `pickup_liters`: `Float`, Default: `0.0`.
  - `pickup_crates`: `Integer`, Default: `0`.
  - `shift_completed`: `Boolean`, Default: `False`.
  - `shift_completed_time`: `String`, Nullable. (e.g. `"08:15 AM"`)
  - `deliveries_completed`: `Integer`, Default: `0`.
  - `daily_salary_earned`: `Float`, Default: `0.0`.
  - `salary_credited`: `Boolean`, Default: `False`.
  - `payout_status`: `String`, Default: `"PENDING"`. Values: `"PENDING"`, `"PAID"`.
  - `payout_id`: `String`, Nullable.
  - `notes`: `Text`, Nullable.
  - `created_at`: `DateTime`, Default: `datetime.utcnow`.

---

### 2.17 `StaffSalaryPayment` (Table: `staff_salary_payments`)
Disbursement transaction record paying accumulated pending wages to a rider.
- **Primary Key:** `id` (`String`, UUID)
- **Columns:**
  - `staff_id`: `String`, Non-nullable.
  - `staff_name`: `String`, Non-nullable.
  - `dairy_name`: `String`, Nullable, Default: `"DairyPulse Farm HQ"`.
  - `amount`: `Float`, Non-nullable. (Amount disbursed in ₹)
  - `payment_date`: `String`, Default: `"YYYY-MM-DD"`.
  - `payment_time`: `String`, Nullable. (e.g. `"11:30 AM"`)
  - `payment_mode`: `String`, Default: `"UPI"`. Values: `"UPI"`, `"Cash"`, `"Bank Transfer"`.
  - `reference_id`: `String`, Nullable. (UPI UTR / Bank reference number)
  - `notes`: `Text`, Nullable.
  - `created_at`: `DateTime`, Default: `datetime.utcnow`.

---

## 3. Database Migration Management

- **Alembic:** Present in `requirements.txt` (`alembic>=1.14.0`) for formal revision control.
- **Runtime Startup Migrations (`app/main.py#ensure_db_columns`):**
  - Uses SQLite/PostgreSQL metadata queries to check column presence dynamically at boot.
  - Safely issues non-blocking `ALTER TABLE ADD COLUMN` queries with default values.
  - Automatically backfills route links on unassociated delivery tasks.

This completes the exhaustive database model documentation.
