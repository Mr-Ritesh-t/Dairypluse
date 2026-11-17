# Master API Endpoint Inventory — DairyPulse

> **Document Version:** 1.0.0  
> **Total Verified Endpoints:** 76 (74 in `/api/v1` + 2 root monitoring endpoints)  
> **Source Files:** `backend/app/routers/api_v1.py` & `backend/app/main.py`  

---

## 1. Summary of API Modules

| Module | Base Path Prefix | Endpoint Count | Purpose |
|---|---|---|---|
| **System & Monitoring** | `/` & `/health` | 2 | Uptime health checks, service metadata, and database dialect probe |
| **Dashboard** | `/api/v1/dashboard` | 1 | High-level aggregated KPI metrics and operational summaries |
| **Inventory & Quality** | `/api/v1/inventory` | 8 | Product varieties, milk intake batches, FAT/SNF testing, wastage logging |
| **Customers & CRM** | `/api/v1/customers` | 7 | Customer directory, self-registration, owner alerts, delivery history |
| **Subscriptions** | `/api/v1/subscriptions` | 7 | Recurring milk subscriptions, pause/resume, quantity adjustments, extra milk |
| **Commercial Orders** | `/api/v1/orders` | 2 | B2B bulk orders for tea stalls, restaurants, and grocery retailers |
| **Deliveries & Dispatch** | `/api/v1/deliveries` | 10 | Daily task generation, sequence ordering, status updates, offline batch sync |
| **Routes Management** | `/api/v1/routes` | 3 | Route definitions, society clustering, route builder studio |
| **Driver Ratings** | `/api/v1/ratings` | 3 | 5-star customer feedback, tags, and driver reviews |
| **Invoices & Payments** | `/api/v1/invoices` | 3 | Monthly billing invoices and payment recordings |
| **WhatsApp Billing** | `/api/v1/billing` | 4 | Month-end dues calculation, UPI intent links, WhatsApp broadcasts |
| **Expenses** | `/api/v1/expenses` | 2 | Farm operational expenses and vendor payment tracking |
| **Staff & Rosters** | `/api/v1/staff` | 5 | Staff profiles, daily salary rates, salary summaries |
| **Attendance & Pickup** | `/api/v1/attendance` | 5 | Rider morning check-in, crate pickup, shift completion |
| **Salary & Payouts** | `/api/v1/salary` | 2 | Salary payout execution and historical transaction logs |
| **Dairies Management** | `/api/v1/dairies` | 3 | Multi-dairy farm tenant records, GPS pins, UPI ID configuration |
| **Authentication** | `/api/v1/auth` | 2 | Unified multi-role login and Supabase OAuth synchronization |
| **AI Analytics** | `/api/v1/analytics` | 3 | Demand forecasting, wastage insights, customer retention risk |
| **In-App Notifications** | `/api/v1/notifications` | 5 | Notification queue, mark read, simulate event |
| **TOTAL** | | **76** | |

---

## 2. Complete Master Endpoint Specification

### 2.1 System & Monitoring
| Method | Path | Summary | Auth | Request Body | Response Body | Database Tables | Frontend Callers |
|---|---|---|---|---|---|---|---|
| `GET` | `/health` | Health and DB dialect probe | None | None | `{ status, service, version, database }` | None | `lib/api.ts (checkBackendHealth)` |
| `GET` | `/` | API root welcoming message | None | None | `{ message, docs_url, api_v1 }` | None | Browser / Monitoring probes |

---

### 2.2 Dashboard
| Method | Path | Summary | Auth | Request Body | Response Body | Database Tables | Frontend Callers |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/dashboard/summary` | Real-time farm operational KPI summary | Public / Token | None | `{ today_sales, milk_stock, active_subs, deliveries_done, ... }` | `Product`, `DeliveryTask`, `Subscription`, `Order` | `frontend/src/app/page.tsx` |

---

### 2.3 Inventory & Milk Stock (`/api/v1/inventory`)
| Method | Path | Summary | Auth | Request Body | Response Body | Database Tables | Frontend Callers |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/inventory/products` | List all milk product varieties | None | Query: `dairy_name` | `List[ProductResponse]` | `products` | `inventory/page.tsx`, `DairyPulseContext` |
| `POST` | `/api/v1/inventory/products` | Create a new product variety | None | `ProductCreate` | `ProductResponse` | `products` | `DairyPulseContext (addProduct)` |
| `PATCH` | `/api/v1/inventory/products/{product_id}` | Update product prices or thresholds | None | `ProductUpdate` | `ProductResponse` | `products` | `DairyPulseContext (updateProductPrice)` |
| `DELETE` | `/api/v1/inventory/products/{product_id}` | Remove a product variety | None | None | `{ message: "Product deleted" }` | `products` | `DairyPulseContext (deleteProduct)` |
| `GET` | `/api/v1/inventory/movements` | List stock receipts, dispatches, wastage | None | Query: `limit`, `dairy_name` | `List[dict]` | `inventory_transactions` | `inventory/page.tsx` |
| `POST` | `/api/v1/inventory/receipts` | Record bulk milk intake from supplier | None | `StockReceiptCreate` | `{ message, receipt_id, new_stock }` | `stock_receipts`, `inventory_transactions`, `products` | `DairyPulseContext (addStockReceipt)` |
| `PATCH` | `/api/v1/inventory/movements/{id}/expiry` | Update expiration date on stock batch | None | `MovementExpiryUpdate` | `{ message, movement_id, expiry_date }` | `inventory_transactions`, `stock_receipts` | `DairyPulseContext (updateIntakeExpiry)` |
| `POST` | `/api/v1/inventory/wastage` | Log spoiled milk or processing loss | None | `WastageCreate` | `{ message, transaction_id, remaining_stock }` | `inventory_transactions`, `products` | `DairyPulseContext (recordWastage)` |

---

### 2.4 Customers & CRM (`/api/v1/customers`)
| Method | Path | Summary | Auth | Request Body | Response Body | Database Tables | Frontend Callers |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/customers` | List all registered customers | None | Query: `dairy_name`, `area`, `type` | `List[CustomerResponse]` | `customers` | `customers/page.tsx`, `DairyPulseContext` |
| `GET` | `/api/v1/customers/{id}` | Get specific customer profile | None | None | `CustomerResponse` | `customers` | `mobile/customer/page.tsx` |
| `GET` | `/api/v1/customers/{id}/delivery-history` | Get 30-day delivery history for customer | None | None | `List[DeliveryTaskResponse]` | `delivery_tasks`, `customers` | `customers/page.tsx`, `mobile/customer/page.tsx` |
| `POST` | `/api/v1/customers` | Register a new customer | None | `CustomerCreate` | `CustomerResponse` | `customers` | `DairyPulseContext (addCustomer)` |
| `POST` | `/api/v1/customers/{id}/notify-owner` | Trigger WhatsApp alert to dairy owner | None | None | `OwnerCustomerAlertResponse` | `customers`, `dairies` | `customers/page.tsx`, `NewCustomerOwnerAlert` |
| `GET` | `/api/v1/customers/{id}/notify-owner` | Get owner WhatsApp alert details | None | None | `OwnerCustomerAlertResponse` | `customers`, `dairies` | `customers/page.tsx` |
| `PATCH` | `/api/v1/customers/{id}` | Update customer address, route, or balance | None | `CustomerUpdate` | `CustomerResponse` | `customers` | `DairyPulseContext (updateCustomer)` |

---

### 2.5 Subscriptions (`/api/v1/subscriptions`)
| Method | Path | Summary | Auth | Request Body | Response Body | Database Tables | Frontend Callers |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/subscriptions` | List all active/paused subscriptions | None | Query: `dairy_name` | `List[SubscriptionResponse]` | `subscriptions` | `household/page.tsx` |
| `POST` | `/api/v1/subscriptions` | Create new milk subscription | None | `SubscriptionCreate` | `SubscriptionResponse` | `subscriptions`, `customers` | `DairyPulseContext (addSubscription)` |
| `PATCH` | `/api/v1/subscriptions/{id}/toggle-pause` | Toggle pause/resume on subscription | None | None | `{ message, subscription_id, status }` | `subscriptions` | `DairyPulseContext (toggleSubscriptionPause)` |
| `DELETE` | `/api/v1/subscriptions/{id}` | Cancel/delete a subscription | None | None | `{ message: "Subscription deleted" }` | `subscriptions` | `DairyPulseContext (deleteSubscription)` |
| `PATCH` | `/api/v1/subscriptions/{id}/skip` | Skip delivery for a specific date | None | `SkipDeliveryRequest` | `{ message, subscription_id, status }` | `subscriptions` | `mobile/customer/page.tsx` |
| `PATCH` | `/api/v1/subscriptions/{id}/modify-quantity` | Adjust daily milk volume (e.g. 1L to 2L) | None | `ModifyQuantityRequest` | `{ message, new_quantity_liters }` | `subscriptions` | `FlexibleSubscriptionModal` |
| `POST` | `/api/v1/subscriptions/{id}/extra-milk` | Schedule one-off extra milk delivery | None | `ExtraMilkRequest` | `DeliveryTaskResponse` | `subscriptions`, `delivery_tasks` | `AddMilkModal`, `mobile/customer` |

---

### 2.6 Commercial & Shop Orders (`/api/v1/orders`)
| Method | Path | Summary | Auth | Request Body | Response Body | Database Tables | Frontend Callers |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/orders` | List B2B and shop orders | None | Query: `dairy_name` | `List[OrderResponse]` | `orders`, `order_items` | `orders/page.tsx` |
| `POST` | `/api/v1/orders` | Create bulk shop order with line items | None | `OrderCreate` | `OrderResponse` | `orders`, `order_items` | `DairyPulseContext (addShopOrder)` |

---

### 2.7 Deliveries & Dispatch (`/api/v1/deliveries`)
| Method | Path | Summary | Auth | Request Body | Response Body | Database Tables | Frontend Callers |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/deliveries/today` | List today's delivery tasks | None | Query: `date`, `slot`, `rider`, `dairy_name` | `List[DeliveryTaskResponse]` | `delivery_tasks` | `delivery/page.tsx`, `mobile/delivery` |
| `PATCH` | `/api/v1/deliveries/reorder` | Update sequence order of stops | None | `ReorderStopsRequest` | `{ message, updated_count }` | `delivery_tasks` | `delivery/page.tsx` |
| `POST` | `/api/v1/deliveries` | Create custom single delivery stop | None | `DeliveryTaskCreate` | `DeliveryTaskResponse` | `delivery_tasks` | `DairyPulseContext (addDeliveryTask)` |
| `PATCH` | `/api/v1/deliveries/{id}/address` | Update address/GPS pin for stop | None | `DeliveryAddressUpdate` | `DeliveryTaskResponse` | `delivery_tasks`, `customers` | `MapLocationPicker` |
| `POST` | `/api/v1/deliveries/generate-daily` | Generate stops from active subscriptions | None | `DailyGenerationRequest` | `{ created_count, skipped_duplicates, total_stops }` | `subscriptions`, `delivery_tasks`, `customers` | `delivery/page.tsx` |
| `PATCH` | `/api/v1/deliveries/{id}/assign` | Reassign stop to rider/slot | None | `DeliveryAssignRequest` | `DeliveryTaskResponse` | `delivery_tasks` | `delivery/page.tsx` |
| `POST` | `/api/v1/deliveries/route-assign` | Batch assign all stops on route to rider | None | `RouteAssignRequest` | `{ message, assigned_count }` | `delivery_tasks`, `routes` | `routes/page.tsx` |
| `PATCH` | `/api/v1/deliveries/{id}/status` | Mark stop Delivered or Failed | None | Query: `status`, `failed_reason`, `notes` | `{ message, delivery_id, status }` | `delivery_tasks`, `customers`, `staff` | `mobile/delivery`, `delivery/page.tsx` |
| `GET` | `/api/v1/deliveries/optimized-route` | Compute shortest path route sequencing | None | Query: `route_name`, `dairy_name` | `RouteOptimizationResponse` | `delivery_tasks` | `delivery/page.tsx` |
| `POST` | `/api/v1/deliveries/apply-sequence` | Apply optimized sequence to stops | None | None | `{ message, applied: true }` | `delivery_tasks` | `delivery/page.tsx` |
| `POST` | `/api/v1/deliveries/sync-batch` | Replay offline rider actions in batch | None | `DeliveryBatchSyncRequest` | `DeliveryBatchSyncResponse` | `delivery_tasks`, `customers`, `staff` | `lib/offlineSync.ts` |

---

### 2.8 Routes Management (`/api/v1/routes`)
| Method | Path | Summary | Auth | Request Body | Response Body | Database Tables | Frontend Callers |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/routes` | List all configured delivery routes | None | Query: `dairy_name` | `List[RouteResponse]` | `routes` | `routes/page.tsx` |
| `POST` | `/api/v1/routes` | Create new delivery route | None | `RouteCreate` | `RouteResponse` | `routes`, `customers` | `DairyPulseContext (createRoute)` |
| `POST` | `/api/v1/routes/build` | Build route with sequenced stops | None | `RouteBuildRequest` | `{ message, route_code, total_stops }` | `routes`, `customers` | `RouteBuilderStudio` |

---

### 2.9 Driver Ratings (`/api/v1/ratings`)
| Method | Path | Summary | Auth | Request Body | Response Body | Database Tables | Frontend Callers |
|---|---|---|---|---|---|---|---|
| `POST` | `/api/v1/ratings/driver` | Submit 5-star rating and tags for rider | None | `DriverRatingCreate` | `DriverRatingResponse` | `driver_ratings`, `delivery_tasks`, `staff` | `DriverRatingModal` |
| `GET` | `/api/v1/ratings/driver/{driver_name}` | Get all ratings received by rider | None | None | `List[DriverRatingResponse]` | `driver_ratings` | `customers/page.tsx` |
| `GET` | `/api/v1/ratings` | List all ratings across the dairy | None | None | `List[DriverRatingResponse]` | `driver_ratings` | `DairyPulseContext` |

---

### 2.10 Invoices & Payments (`/api/v1/invoices`)
| Method | Path | Summary | Auth | Request Body | Response Body | Database Tables | Frontend Callers |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/invoices` | List billing invoices | None | Query: `dairy_name` | `List[InvoiceResponse]` | `invoices` | `billing/page.tsx` |
| `POST` | `/api/v1/invoices` | Generate invoice for customer | None | `InvoiceCreate` | `InvoiceResponse` | `invoices`, `customers` | `DairyPulseContext (generateInvoice)` |
| `POST` | `/api/v1/invoices/{id}/payments` | Record payment against invoice | None | `PaymentRecord` | `{ message, invoice_id, paid_amount, status }` | `invoices`, `customers` | `CollectPaymentModal` |

---

### 2.11 WhatsApp Billing Reminders (`/api/v1/billing`)
| Method | Path | Summary | Auth | Request Body | Response Body | Database Tables | Frontend Callers |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/billing/monthly-due-reminders` | Calculate customer dues and UPI links | None | Query: `month`, `dairy_name` | `MonthlyDueRemindersResponse` | `customers`, `dairies`, `subscriptions` | `MonthEndWhatsAppModal` |
| `POST` | `/api/v1/billing/customers/{id}/whatsapp-reminder` | Generate single customer reminder link | None | None | `WhatsAppReminderItem` | `customers`, `dairies`, `subscriptions` | `customers/page.tsx` |
| `POST` | `/api/v1/billing/broadcast-whatsapp-reminders` | Broadcast reminders to selected customers | None | `BroadcastReminderRequest` | `BroadcastReminderResponse` | `customers`, `dairies` | `MonthEndWhatsAppModal` |
| `POST` | `/api/v1/billing/settings/reminders` | Update dairy UPI ID and reminder toggle | None | `ReminderSettingsUpdate` | `{ message, upi_id, auto_reminders }` | `dairies` | `MonthEndWhatsAppModal` |

---

### 2.12 Expenses (`/api/v1/expenses`)
| Method | Path | Summary | Auth | Request Body | Response Body | Database Tables | Frontend Callers |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/expenses` | List farm operational expenses | None | None | `List[ExpenseResponse]` | `expenses` | `expenses/page.tsx` |
| `POST` | `/api/v1/expenses` | Create new farm expense record | None | `ExpenseCreate` | `ExpenseResponse` | `expenses` | `DairyPulseContext (addExpense)` |

---

### 2.13 Staff Management (`/api/v1/staff`)
| Method | Path | Summary | Auth | Request Body | Response Body | Database Tables | Frontend Callers |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/staff` | List all staff members and riders | None | Query: `dairy_name` | `List[StaffResponse]` | `staff` | `staff/page.tsx` |
| `POST` | `/api/v1/staff` | Add new staff member | None | `StaffCreate` | `StaffResponse` | `staff` | `DairyPulseContext (addStaff)` |
| `PATCH` | `/api/v1/staff/{id}` | Update staff details, status, or area | None | `StaffUpdate` | `StaffResponse` | `staff` | `DairyPulseContext (updateStaff)` |
| `DELETE` | `/api/v1/staff/{id}` | Remove staff member | None | None | `{ message: "Staff deleted" }` | `staff` | `DairyPulseContext (deleteStaff)` |
| `PATCH` | `/api/v1/staff/{id}/daily-salary` | Set daily salary rate for rider | None | `StaffDailySalaryUpdate` | `StaffResponse` | `staff` | `staff/page.tsx` |
| `GET` | `/api/v1/staff/{id}/salary-summary` | Summary of earned, pending, and paid salary | None | None | `{ staff_id, daily_salary, pending_salary, total_salary_paid }` | `staff`, `staff_attendance`, `staff_salary_payments` | `staff/page.tsx` |

---

### 2.14 Attendance & Milk Pickup (`/api/v1/attendance`)
| Method | Path | Summary | Auth | Request Body | Response Body | Database Tables | Frontend Callers |
|---|---|---|---|---|---|---|---|
| `POST` | `/api/v1/attendance/check-in` | Record morning shift check-in | None | `AttendanceCheckInRequest` | `AttendanceResponse` | `staff_attendance`, `staff` | `mobile/delivery` |
| `POST` | `/api/v1/attendance/pickup` | Confirm milk crate pickup at chilling center | None | `MilkPickupRequest` | `AttendanceResponse` | `staff_attendance` | `mobile/delivery` |
| `GET` | `/api/v1/attendance/today` | Get today's attendance summary for dairy | None | Query: `dairy_name` | `Dict[str, Any]` | `staff_attendance` | `staff/page.tsx` |
| `GET` | `/api/v1/attendance/list` | List attendance history records | None | Query: `date`, `dairy_name` | `List[AttendanceResponse]` | `staff_attendance` | `staff/page.tsx` |
| `POST` | `/api/v1/attendance/complete-shift` | Rider shift completion & salary crediting | None | `ShiftCompleteRequest` | `{ message, daily_salary_earned, pending_salary }` | `staff_attendance`, `staff` | `mobile/delivery` |

---

### 2.15 Salary Payouts (`/api/v1/salary`)
| Method | Path | Summary | Auth | Request Body | Response Body | Database Tables | Frontend Callers |
|---|---|---|---|---|---|---|---|
| `POST` | `/api/v1/salary/payout` | Record salary payout to staff via UPI/Cash | None | `SalaryPayoutRequest` | `{ message, payout_id, amount_paid, remaining_pending }` | `staff_salary_payments`, `staff`, `staff_attendance` | `staff/page.tsx` |
| `GET` | `/api/v1/salary/payouts` | List past salary payouts | None | Query: `staff_id`, `dairy_name` | `List[SalaryPaymentResponse]` | `staff_salary_payments` | `staff/page.tsx` |

---

### 2.16 Dairies Multi-Tenant Management (`/api/v1/dairies`)
| Method | Path | Summary | Auth | Request Body | Response Body | Database Tables | Frontend Callers |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/dairies` | List registered dairy farms | None | None | `List[DairyResponse]` | `dairies` | `TopNavbar`, `DairyPulseContext` |
| `POST` | `/api/v1/dairies` | Register new dairy farm | None | `DairyCreate` | `DairyResponse` | `dairies`, `users` | `DairyPulseContext (addDairy)` |
| `PATCH` | `/api/v1/dairies/{id}` | Update dairy details, address, or GPS | None | `DairyUpdate` | `DairyResponse` | `dairies` | `DairyPulseContext (updateDairy)` |

---

### 2.17 Authentication & User Accounts (`/api/v1/auth`)
| Method | Path | Summary | Auth | Request Body | Response Body | Database Tables | Frontend Callers |
|---|---|---|---|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Multi-role user authentication | Public | `LoginRequest` | `AuthUserResponse` | `users`, `staff`, `dairies`, `customers` | `login/page.tsx` |
| `POST` | `/api/v1/auth/supabase-sync` | Sync Supabase OAuth user to backend DB | Public | `SupabaseAuthSyncRequest` | `AuthUserResponse` | `users`, `dairies`, `customers` | `AuthContext.tsx` |

---

### 2.18 Heuristic & AI Analytics (`/api/v1/analytics`)
| Method | Path | Summary | Auth | Request Body | Response Body | Database Tables | Frontend Callers |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/analytics/demand-forecast` | Predict milk procurement demand | None | Query: `days`, `dairy_name` | `DemandForecastResponse` | `subscriptions`, `orders`, `products` | `inventory/page.tsx`, `reports` |
| `GET` | `/api/v1/analytics/wastage-insights` | Analyze spoiled milk and financial loss | None | Query: `dairy_name` | `WastageInsightsResponse` | `inventory_transactions`, `products` | `inventory/page.tsx`, `reports` |
| `GET` | `/api/v1/analytics/customer-insights` | Detect churn risks, top buyers, overdue | None | Query: `dairy_name` | `CustomerInsightsResponse` | `customers`, `subscriptions` | `customers/page.tsx`, `reports` |

---

### 2.19 In-App Operational Notifications (`/api/v1/notifications`)
| Method | Path | Summary | Auth | Request Body | Response Body | Database Tables | Frontend Callers |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/notifications` | List active notification alerts | None | None | `NotificationListResponse` | In-memory buffer | `NotificationCenter.tsx` |
| `PATCH` | `/api/v1/notifications/{id}/read` | Mark notification as read | None | None | `{ message, notification_id }` | In-memory buffer | `NotificationCenter.tsx` |
| `POST` | `/api/v1/notifications/mark-all-read`| Mark all notifications as read | None | None | `{ message: "All marked read" }` | In-memory buffer | `NotificationCenter.tsx` |
| `POST` | `/api/v1/notifications/clear` | Clear all dismissed notifications | None | None | `{ message: "All cleared" }` | In-memory buffer | `NotificationCenter.tsx` |
| `POST` | `/api/v1/notifications/simulate-event` | Inject test notification event | None | `NotificationCreateRequest` | `NotificationItem` | In-memory buffer | Developer test tools |

---

This completes the exhaustive inventory of all 76 API endpoints in DairyPulse.
