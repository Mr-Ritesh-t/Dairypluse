# End-to-End Business Workflows — DairyPulse

> **Document Version:** 1.0.0  
> **Team:** NEXURA  
> **Scope:** Traceability across User Action, Frontend, API Gateway, Backend Logic, Database Mutations, and UI Feedback  

---

## 1. Dairy Owner Registration
- **User Action:** New farm owner fills out the dairy registration form with farm name, owner name, email, phone, city, address, and password.
- **Frontend Page:** `frontend/src/app/login/page.tsx`
- **API Request:** `POST /api/v1/dairies` with `DairyCreate` body.
- **Backend Processing:** Validates that email and phone are unique. Creates default admin user and associated dairy tenant.
- **Database Operation:** Inserts record into `dairies`, inserts user into `users` with `role="OWNER"`.
- **API Response:** `200 OK` with `DairyResponse`.
- **Result Shown to User:** Auto-logs owner into their new farm workspace and redirects to `/`.

---

## 2. Authentication & Login
- **User Action:** User selects role tab (`OWNER`, `DELIVERY`, or `CUSTOMER`), inputs email or phone and password, and taps "Sign In".
- **Frontend Page:** `frontend/src/app/login/page.tsx`
- **API Request:** `POST /api/v1/auth/login` with `LoginRequest` (`login_id`, `password`, `role`).
- **Backend Processing:** Normalizes phone number via `app/utils/phone.py`. Queries across `users`, `staff`, `dairies`, and `customers`. Verifies password.
- **Database Operation:** Read-only query across account tables.
- **API Response:** `AuthUserResponse` containing `token`, `role`, `name`, `assignedAreaOrRoute`, `dairy_name`.
- **Result Shown to User:** Sets `dairypulse_auth_user` in `localStorage`. Redirects `OWNER` to `/`, `DELIVERY` to `/mobile/delivery`, and `CUSTOMER` to `/mobile/customer`.

---

## 3. Customer Self-Registration & Owner Alert
- **User Action:** Customer registers via mobile portal, entering name, phone, address, society, and preferred delivery time.
- **Frontend Page:** `frontend/src/app/login/page.tsx` or `/customers` modal.
- **API Request:** `POST /api/v1/customers` with `CustomerCreate`, followed by `POST /api/v1/customers/{id}/notify-owner`.
- **Backend Processing:** Inserts customer record with initial balance `₹0.0`. Looks up the dairy owner's phone number and creates a pre-formatted WhatsApp alert link.
- **Database Operation:** Inserts into `customers`.
- **API Response:** `CustomerResponse` and `OwnerCustomerAlertResponse`.
- **Result Shown to User:** Owner sees a real-time notification banner (`NewCustomerOwnerAlert.tsx`) with a "Chat on WhatsApp" button to confirm delivery start date.

---

## 4. Customer CRM & Profile Updates
- **User Action:** Owner edits a customer's assigned route, delivery slot, address, or sets GPS location via the pin map.
- **Frontend Page:** `frontend/src/app/customers/page.tsx`
- **API Request:** `PATCH /api/v1/customers/{id}` with `CustomerUpdate`.
- **Backend Processing:** Validates updated fields. Dynamically applies changes to customer record.
- **Database Operation:** `UPDATE customers SET address=..., route=..., latitude=..., longitude=... WHERE id=...`.
- **API Response:** `CustomerResponse` entity.
- **Result Shown to User:** Customer detail panel updates with new coordinates and route badge.

---

## 5. Milk Subscription Creation
- **User Action:** Owner or customer creates a standing milk order (e.g. 1.5L Cow Milk, Daily, Morning Slot).
- **Frontend Page:** `frontend/src/app/household/page.tsx` or `AddSubscriptionModal.tsx`.
- **API Request:** `POST /api/v1/subscriptions` with `SubscriptionCreate`.
- **Backend Processing:** Resolves customer by ID, checks product selling price, verifies customer status is `Active`.
- **Database Operation:** Inserts into `subscriptions`.
- **API Response:** `SubscriptionResponse` with `id`, `start_date`, `status: "Active"`.
- **Result Shown to User:** Subscription added to the customer's active plan list and immediately included in subsequent daily route stop generations.

---

## 6. Subscription Pause & Resume (Vacation Mode)
- **User Action:** Customer or owner taps "Pause Subscription" or specifies a return date (`paused_until`).
- **Frontend Page:** `frontend/src/components/subscriptions/FlexibleSubscriptionModal.tsx`
- **API Request:** `PATCH /api/v1/subscriptions/{id}/toggle-pause` or `PATCH /api/v1/subscriptions/{id}/skip`.
- **Backend Processing:** Toggles status between `"Active"` and `"Paused"`. If pausing until a date, stores `paused_until`.
- **Database Operation:** `UPDATE subscriptions SET status = CASE WHEN status='Active' THEN 'Paused' ELSE 'Active' END`.
- **API Response:** `{ message: "Subscription paused", subscription_id, status }`.
- **Result Shown to User:** Status badge turns orange (`Paused`). Daily generator automatically skips this customer during paused dates.

---

## 7. Extra Milk Requests
- **User Action:** Customer taps "Need Extra Milk Tomorrow" on mobile and chooses 1 Liter Buffalo Milk.
- **Frontend Page:** `frontend/src/app/mobile/customer/page.tsx` or `AddMilkModal.tsx`.
- **API Request:** `POST /api/v1/subscriptions/{id}/extra-milk` with `ExtraMilkRequest` (`extra_liters: 1.0, date: "2026-11-14"`).
- **Backend Processing:** Looks up subscription, creates an ad-hoc `DeliveryTask` for the requested date with `is_extra_order = True`.
- **Database Operation:** Inserts into `delivery_tasks`.
- **API Response:** `DeliveryTaskResponse` with `delivery_number: "DEL-EXT-..."`.
- **Result Shown to User:** Toast confirms "Extra 1L scheduled for tomorrow morning". Appears on rider's morning stop list with an "Extra" badge.

---

## 8. Daily Milk Stock Intake & Expiry Management
- **User Action:** Chilling plant manager logs arrival of a morning milk tanker (e.g., 500 Liters Cow Milk @ ₹42/L, Expiry: 3 days out).
- **Frontend Page:** `frontend/src/app/inventory/page.tsx`
- **API Request:** `POST /api/v1/inventory/receipts` with `StockReceiptCreate`.
- **Backend Processing:** Increments `Product.available_stock` by received quantity. Logs an `inventory_transactions` record of type `"RECEIPT"`.
- **Database Operation:** Inserts into `stock_receipts`, inserts into `inventory_transactions`, updates `products.available_stock += quantity`.
- **API Response:** `{ message: "Stock received", receipt_id, new_stock: 750.0 }`.
- **Result Shown to User:** Stock level bar increases; batch card appears in the receipts ledger with expiry countdown badge.

---

## 9. Milk Quality Testing & Wastage Logging
- **User Action:** Plant operator tests batch, logs FAT (4.2%) and SNF (8.7%), or reports spoiled milk / processing leakage (e.g. 15L spoiled).
- **Frontend Page:** `frontend/src/app/inventory/page.tsx`
- **API Request:** `POST /api/v1/inventory/wastage` with `WastageCreate` (`variant, quantity: 15.0, reason: "Curdled during chilling"`).
- **Backend Processing:** Deducts 15L from product stock. Records transaction of type `"WASTAGE"`.
- **Database Operation:** Updates `products.available_stock -= 15.0`, inserts into `inventory_transactions`.
- **API Response:** `{ message: "Wastage recorded", transaction_id, remaining_stock }`.
- **Result Shown to User:** Wastage analytics card reflects updated loss percentage and financial impact.

---

## 10. Commercial & Shop Orders (B2B Dispatches)
- **User Action:** Manager enters bulk dispatch for a sweet shop (e.g., 40L Buffalo Milk, 20L Cow Milk).
- **Frontend Page:** `frontend/src/app/orders/page.tsx`
- **API Request:** `POST /api/v1/orders` with `OrderCreate` containing items array.
- **Backend Processing:** Generates unique order number `ORD-YYYY-XXXX`, calculates line totals and grand total, sets payment status to `Pending`.
- **Database Operation:** Inserts into `orders`, bulk inserts into `order_items`.
- **API Response:** `OrderResponse` with order ID and breakdown.
- **Result Shown to User:** Commercial order card appears under "Dispatched Orders" with outstanding payment amount.

---

## 11. Daily Delivery Stop Generation
- **User Action:** Manager clicks "Generate Deliveries" for today's morning shift.
- **Frontend Page:** `frontend/src/app/delivery/page.tsx`
- **API Request:** `POST /api/v1/deliveries/generate-daily` with `DailyGenerationRequest`.
- **Backend Processing:**
  - Queries active subscriptions.
  - Filters out subscriptions where `paused_until` is active.
  - Checks existing deliveries for today to prevent duplicates.
  - Copies customer address, area, route, and assigned rider.
- **Database Operation:** Bulk inserts new rows into `delivery_tasks`.
- **API Response:** `{ created_count: 32, skipped_duplicates: 0, total_stops: 32 }`.
- **Result Shown to User:** Delivery route table populates with customer stops ready for dispatch.

---

## 12. Delivery Route Creation & Society Clustering
- **User Action:** Manager creates route `RT-WAKAD-01` covering 4 societies with a 60L bike capacity limit.
- **Frontend Page:** `frontend/src/app/routes/page.tsx` or `RouteBuilderStudio.tsx`.
- **API Request:** `POST /api/v1/routes` with `RouteCreate`.
- **Backend Processing:** Checks uniqueness of route code, validates rider existence, calculates capacity.
- **Database Operation:** Inserts into `routes`, updates `customers.route` for associated customer IDs.
- **API Response:** `RouteResponse` object.
- **Result Shown to User:** Route studio displays new route card with visual capacity indicator.

---

## 13. Rider Assignment & Route Sequencing
- **User Action:** Manager reassigns a route from "Amit Shinde" to "Rahul Deshmukh" or reorders stops.
- **Frontend Page:** `frontend/src/app/delivery/page.tsx` or `/routes`.
- **API Request:** `POST /api/v1/deliveries/route-assign` and `PATCH /api/v1/deliveries/reorder`.
- **Backend Processing:** Bulk updates `assigned_rider` on all matching stops; updates `sequence_order` integers.
- **Database Operation:** `UPDATE delivery_tasks SET assigned_rider=...`, batch `UPDATE delivery_tasks SET sequence_order=...`.
- **API Response:** `{ message: "Route assigned", assigned_count: 24 }`.
- **Result Shown to User:** Rider's mobile portal instantly displays the refreshed stop sequence.

---

## 14. Delivery Status Updates (Live Route Execution)
- **User Action:** Rider taps "Delivered" on their phone at customer's doorstep.
- **Frontend Page:** `frontend/src/app/mobile/delivery/page.tsx`
- **API Request:** `PATCH /api/v1/deliveries/{id}/status?status=Delivered`.
- **Backend Processing:**
  - Sets `delivery_task.status = "Delivered"`.
  - Sets `delivery_task.delivered_at = "06:45 AM"`.
  - Calculates cost of delivered milk and increments `Customer.balance`.
  - Increments rider's `deliveries_today` count.
- **Database Operation:**
  - `UPDATE delivery_tasks SET status='Delivered', delivered_at='06:45 AM' WHERE id=...`.
  - `UPDATE customers SET balance = balance + (quantity * unit_price) WHERE id=...`.
  - `UPDATE staff SET deliveries_today = deliveries_today + 1 WHERE id=...`.
- **API Response:** `{ message: "Status updated", delivery_id, status: "Delivered" }`.
- **Result Shown to User:** Checkmark animates on rider's screen; progress bar advances (e.g. 19/24); customer's portal updates to "Delivered at 06:45 AM".

---

## 15. Offline Delivery Synchronization
- **User Action:** Rider delivers 5 stops in an underground basement with no network connectivity.
- **Frontend Page:** `frontend/src/app/mobile/delivery/page.tsx`
- **Client Processing (`offlineSync.ts`):** Action is captured in `localStorage` (`dairypulse_offline_delivery_queue_v1`). Optimistic UI shows green tick with pending sync clock icon.
- **Reconnection Trigger:** Rider emerges into network coverage (`window.ononline` event fires).
- **API Request:** `POST /api/v1/deliveries/sync-batch` with `DeliveryBatchSyncRequest`.
- **Backend Processing:** Executes atomic loop over queued actions. Applies status updates, delivered timestamps, and customer balance updates in a single database transaction.
- **Database Operation:** Batch updates `delivery_tasks` and `customers`.
- **API Response:** `DeliveryBatchSyncResponse` (`synced_count: 5, success: true`).
- **Result Shown to User:** Queue clears; sync pill turns solid green ("All synced").

---

## 16. Monthly Invoice Generation
- **User Action:** On the 1st of the month, manager clicks "Generate Monthly Bills".
- **Frontend Page:** `frontend/src/app/billing/page.tsx`
- **API Request:** `POST /api/v1/invoices` with `InvoiceCreate`.
- **Backend Processing:** Generates invoice number `INV-YYYY-XXXX`, sets billing period (e.g. "October 2026"), due date, and amount matching customer's accrued balance.
- **Database Operation:** Inserts into `invoices`.
- **API Response:** `InvoiceResponse`.
- **Result Shown to User:** Invoice card appears in the billing ledger as `Unpaid`.

---

## 17. Payment Recording & Balance Reconciliation
- **User Action:** Customer pays via cash to the delivery rider or scans the UPI QR code. Manager logs the payment.
- **Frontend Page:** `frontend/src/components/customers/CollectPaymentModal.tsx` or `/billing`.
- **API Request:** `POST /api/v1/invoices/{id}/payments` with `PaymentRecord` (`amount: 2100.0`).
- **Backend Processing:** Increments `invoice.paid_amount`. If `paid_amount >= total_amount`, sets status to `"Paid"`. Decrements customer's running balance.
- **Database Operation:**
  - `UPDATE invoices SET paid_amount = paid_amount + 2100, status='Paid' WHERE id=...`.
  - `UPDATE customers SET balance = balance - 2100 WHERE id=...`.
- **API Response:** `{ message: "Payment recorded", invoice_id, paid_amount: 2100.0, status: "Paid" }`.
- **Result Shown to User:** Invoice badge turns green (`Paid`); customer outstanding balance clears to `₹0`.

---

## 18. Customer Refunds
- **Verification Status:** **NOT IMPLEMENTED / SIMULATED VIA MANUAL BALANCE ADJUSTMENT**
- **Current Workaround in Code:** Owners adjust `balance` manually via `PATCH /api/v1/customers/{id}` by submitting a negative balance delta. No dedicated `Refund` entity or automated gateway refund endpoint exists in the current codebase.

---

## 19. Staff Shift, Attendance & Daily Salary Payouts
- **User Action:** Rider checks in at 05:30 AM, picks up milk crates, delivers route, completes shift, and owner disburses weekly wages.
- **Frontend Page:** `frontend/src/app/staff/page.tsx` & `frontend/src/app/mobile/delivery/page.tsx`.
- **API Requests:**
  1. `POST /api/v1/attendance/check-in`
  2. `POST /api/v1/attendance/pickup`
  3. `POST /api/v1/attendance/complete-shift`
  4. `POST /api/v1/salary/payout`
- **Backend Processing:**
  - Check-in records start time.
  - Shift complete sets `shift_completed=True`, credits rider's wage (`pending_salary += 500.0`).
  - Salary payout logs `StaffSalaryPayment` and debits `pending_salary`.
- **Database Operations:** Inserts into `staff_attendance`, updates `staff`, inserts into `staff_salary_payments`.
- **API Responses:** `AttendanceResponse`, `SalaryPaymentResponse`.
- **Result Shown to User:** Rider's wallet shows credited earnings; owner's pending wage liability reflects cleared balance.

---

## 20. Farm Expense Tracking
- **User Action:** Farm owner logs an operational purchase (e.g., ₹4,500 for Cattle Feed from "Kisan Feeds" paid via UPI).
- **Frontend Page:** `frontend/src/app/expenses/page.tsx`
- **API Request:** `POST /api/v1/expenses` with `ExpenseCreate`.
- **Backend Processing:** Validates category and payment method.
- **Database Operation:** Inserts into `expenses`.
- **API Response:** `ExpenseResponse`.
- **Result Shown to User:** Expense added to monthly expenditure ledger and aggregated into financial profit/loss analytics.

---

## 21. Reports, Business Analytics & AI Insights
- **User Action:** Owner opens Analytics tab to view demand predictions, wastage trends, and customer retention insights.
- **Frontend Page:** `frontend/src/app/reports/page.tsx` & `/inventory`.
- **API Requests:**
  - `GET /api/v1/analytics/demand-forecast`
  - `GET /api/v1/analytics/wastage-insights`
  - `GET /api/v1/analytics/customer-insights`
- **Backend Processing:** Aggregates active subscriptions with weekday multipliers, cross-references inventory movements for wastage loss, and segments customers into top buyers and churn risks.
- **Database Operations:** Aggregated read-only queries across `subscriptions`, `products`, `inventory_transactions`, and `customers`.
- **API Response:** Structured insight payloads with charts, metrics, and actionable recommendations.
- **Result Shown to User:** Rendered Recharts graphs and recommendation cards (e.g. "Procure +45L Cow Milk for Saturday morning peak").

---

This completes the 21 verified business workflow specifications.
