# DairyPulse — Database Architecture & Entity Relationship Design

This document details the database architecture of DairyPulse based on the SQLAlchemy models defined in `backend/app/models/models.py`.

---

## 1. Database Table Inventory

| Entity / Table | Model Class | Primary Key | Foreign Keys | Key Attributes | Relationships | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`dairies`** | `Dairy` | `id` (String UUID) | None | `name`, `owner_name`, `email`, `phone`, `city`, `address`, `rating` | None | Multi-dairy farm tenant records |
| **`users`** | `User` | `id` (String UUID) | None | `email` (Unique), `phone`, `password_hash`, `full_name`, `role`, `dairy_name`, `is_active` | None | User accounts for authentication and RBAC |
| **`staff`** | `Staff` | `id` (String UUID) | None | `name`, `role`, `phone`, `assigned_area`, `dairy_name`, `status`, `deliveries_today`, `rating` | None | Delivery riders, plant operators, and managers |
| **`customers`** | `Customer` | `id` (String UUID) | None | `name`, `customer_type`, `phone`, `email`, `address`, `area`, `route`, `latitude`, `longitude`, `preferred_time`, `balance`, `status` | `subscriptions`, `orders`, `invoices` | Master customer directory with GPS and delivery preferences |
| **`products`** | `Product` | `id` (String UUID) | None | `name`, `variant`, `unit`, `fat_content`, `snf_content`, `selling_price`, `cost_price`, `available_stock`, `low_stock_threshold`, `status` | None | Catalog of milk variants with cold chain stock and fat/SNF specs |
| **`stock_receipts`** | `StockReceipt` | `id` (String UUID) | None | `supplier_name`, `receipt_date`, `variant`, `quantity`, `unit_cost`, `notes` | None | Batch intake records from dairy farmers/tankers |
| **`inventory_transactions`** | `InventoryTransaction` | `id` (String UUID) | None | `date`, `timestamp`, `transaction_type` (`RECEIPT`, `DISPATCH`, `WASTAGE`), `product_variant`, `quantity`, `rate_per_liter`, `notes` | None | Complete ledger tracking every liter in and out of the hub |
| **`subscriptions`** | `Subscription` | `id` (String UUID) | `customer_id` ➔ `customers.id` | `customer_name`, `product_variant`, `quantity_liters`, `time_slot`, `frequency`, `unit_price`, `status`, `start_date` | `customer` | Active recurring daily delivery contracts |
| **`orders`** | `Order` | `id` (String UUID) | `customer_id` ➔ `customers.id` | `order_number` (Unique), `shop_name`, `contact_person`, `phone`, `delivery_date`, `status`, `total_amount`, `paid_amount` | `customer`, `items` | Commercial B2B bulk milk orders |
| **`order_items`** | `OrderItem` | `id` (String UUID) | `order_id` ➔ `orders.id` | `product_variant`, `quantity`, `unit`, `unit_price`, `line_total` | `order` | Line items belonging to commercial orders |
| **`delivery_tasks`** | `DeliveryTask` | `id` (String UUID) | None | `delivery_number` (Unique), `customer_name`, `customer_phone`, `address`, `flat_or_unit`, `society_or_landmark`, `area`, `product_variant`, `quantity_liters`, `slot`, `assigned_rider`, `status`, `sequence_order`, `latitude`, `longitude`, `delivery_date` | None | Daily execution tasks assigned to riders in sequential order |
| **`routes`** | `Route` | `id` (String UUID) | None | `route_code` (Unique), `name`, `area`, `assigned_rider`, `slot`, `societies`, `total_stops`, `total_liters`, `max_capacity_liters` | None | Sector distribution routes with vehicle load limits |
| **`invoices`** | `Invoice` | `id` (String UUID) | `customer_id` ➔ `customers.id` | `invoice_number` (Unique), `customer_name`, `customer_type`, `billing_period`, `issue_date`, `due_date`, `total_amount`, `paid_amount`, `status` | `customer` | Monthly billing statements |
| **`expenses`** | `Expense` | `id` (String UUID) | None | `category`, `amount`, `date`, `vendor`, `payment_method`, `notes` | None | Operational cost ledger for fuel, maintenance, packaging |

---

## 2. Verified Entity Relationship (ER) Diagram

```mermaid
erDiagram
    DAIRIES {
        string id PK
        string name
        string owner_name
        string email
        string phone
        string city
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
    }

    CUSTOMERS {
        string id PK
        string name
        string customer_type
        string phone
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
        string delivery_date
        float latitude
        float longitude
    }

    ROUTES {
        string id PK
        string route_code UK
        string name
        string area
        string assigned_rider
        string slot
        int total_stops
        float total_liters
        float max_capacity_liters
    }

    INVOICES {
        string id PK
        string invoice_number UK
        string customer_id FK
        string customer_name
        string billing_period
        float total_amount
        float paid_amount
        string status
    }

    CUSTOMERS ||--o{ SUBSCRIPTIONS : "has"
    CUSTOMERS ||--o{ ORDERS : "places"
    CUSTOMERS ||--o{ INVOICES : "receives"
    ORDERS ||--|{ ORDER_ITEMS : "contains"
```

---

## 3. Real-World Role of Key Entities

1. **`Customer`**: Stores the household subscriber or shop buyer. Crucially stores `latitude`, `longitude` (for turn-by-turn rider navigation) and `preferred_time` (e.g. `5:30 AM - 6:30 AM`).
2. **`Route`**: Represents a geographic delivery circuit (e.g. `R-04: Baner Morning Express`). Tracks total stops, total liters assigned, and `max_capacity_liters` (e.g. 60.0 L) to protect riders from vehicle overload.
3. **`DeliveryTask`**: The atomic daily delivery ticket for a rider. Contains the explicit `sequence_order` (1st, 2nd, 3rd) assigned in the Route Builder Studio, doorstep flat details, and real-time status (`Pending`, `Assigned`, `Delivered`, `Failed`).
4. **`Product`**: Represents distinct milk types with laboratory specs:
   - Cow Milk: 4.2% Fat, 8.5% SNF (₹62/L)
   - Buffalo Milk: 7.0% Fat, 9.0% SNF (₹78/L)
   - Toned Milk: 3.0% Fat, 8.5% SNF (₹54/L)
   - A2 Desi Cow Milk: 4.5% Fat, 8.8% SNF (₹85/L)
5. **`InventoryTransaction`**: Complete immutable ledger recording every liter received (`RECEIPT`), dispatched (`DISPATCH`), or discarded due to spoilage or container rupture (`WASTAGE`).

---

## 4. Schema Integrity & Recommended Enhancements

- **Current Implementation**: Foreign keys are enforced on `subscriptions.customer_id`, `orders.customer_id`, `order_items.order_id`, and `invoices.customer_id`. Primary keys use standard UUID4 strings.
- **Recommended Improvements**:
  1. Add a direct foreign key from `delivery_tasks.customer_id` ➔ `customers.id` (currently tasks look up customers by phone or name).
  2. Add a composite unique index on `delivery_tasks (customer_phone, delivery_date, slot)` at the database schema level to reinforce the existing application-level idempotency check.
  3. Change monetary amounts (`Float`) to `Numeric(10, 2)` or `Decimal` in PostgreSQL to completely eliminate floating-point rounding artifacts.
