# DairyPulse — Billing, Inventory & Financial Integrity Audit

This document examines how DairyPulse handles money, recurring customer billing, payment reconciliation, inventory ledger consistency, and milk quality assurance.

---

## 1. Inventory & Quality Assurance (Fat / SNF Architecture)

Milk is paid for based on laboratory quality metrics:
- **Fat Content (%)**: Direct indicator of creaminess and nutritional density.
  - Standard Cow Milk: 4.0% – 4.5% Fat
  - Pure Buffalo Milk: 6.5% – 7.5% Fat
  - Toned Milk: 3.0% Fat
  - A2 Desi Gir Cow: 4.2% – 4.8% Fat
- **Solids-Not-Fat (SNF %)**: Protein, lactose, and minerals.
  - Standard minimum requirement: **8.5% SNF**.
  - Any dilution with water drops SNF below 8.5%, alerting plant managers to adulteration.

### 1.1 The Stock Ledger Mechanism
Every movement of milk into or out of cold storage is captured in `InventoryTransaction` (`app/models/models.py:110`):
1. **Intake (`RECEIPT`)**: Fresh batch arrives from tankers or farmers. Increases `Product.available_stock` and logs purchase rate.
2. **Dispatch (`DISPATCH`)**: Delivery runs dispatched or bulk crates loaded onto trucks. Deducts `Product.available_stock`.
3. **Spoilage (`WASTAGE`)**: Milk lost due to chilling failure, packaging rupture, or transit spillage. Deducts stock and increments wastage analytics.

---

## 2. Invoicing, Billing & Payment Calculations

### 2.1 Subscription Cost Formula
For each active household subscription:
$$\text{Monthly Cost} = \text{Daily Quantity (Liters)} \times \text{Unit Price per Liter} \times \text{Delivered Days}$$

*Example: 1.5 Liters of Fresh Cow Milk @ ₹62/L for 30 days = ₹2,790.00.*

### 2.2 Payment Reconciliation Logic (`api_v1.py:615`)
When a customer pays (via UPI, Cash, or Bank Transfer):
```python
# Payment processing transaction
invoice.paid_amount += req.amount
if invoice.paid_amount >= invoice.total_amount:
    invoice.status = "Paid"
elif invoice.paid_amount > 0:
    invoice.status = "Partial"

# Deducts paid amount from customer's outstanding balance
customer = db.query(Customer).filter(Customer.id == invoice.customer_id).first()
if customer:
    customer.balance -= req.amount
db.commit()
```

- **Partial Payments**: If an invoice is ₹2,790 and the customer pays ₹1,500, status becomes `Partial`. The remaining ₹1,290 stays on `Customer.balance`.
- **Overdue Tracking**: If `due_date < today` and status is `Unpaid`, the frontend highlights the card in Red (`Overdue`).

---

## 3. Financial & Stock Integrity Evaluation

| Area | Current State | Risk Level | Recommendation for Scale |
| :--- | :--- | :--- | :--- |
| **Float Precision** | Prices and stock use `Float` columns | Low (Dev) / Medium (Prod) | In SQLite, `Float` handles small amounts fine. In PostgreSQL, migrate currency columns (`selling_price`, `total_amount`, `paid_amount`, `balance`) to `Numeric(10, 2)` to eliminate floating-point precision artifacts (e.g. `0.30000000000000004`). |
| **Price Snapshots** | `OrderItem` snapshots `unit_price` at order time | Low (Secure) | **PASSED**: Future price hikes on `Product` will not alter the historical price recorded on previously fulfilled orders. |
| **Negative Stock Prevention** | Inventory transactions allow deducting available stock | Medium | Add a database check constraint: `CHECK (available_stock >= 0)` or trigger an API 400 Bad Request if requested dispatch exceeds available silo volume. |
| **Audit Trails** | `StockReceipt` and `InventoryTransaction` provide append-only history | Low (Secure) | **PASSED**: Every stock arrival and wastage entry logs supplier name, date, time, variant, and quantity. |
