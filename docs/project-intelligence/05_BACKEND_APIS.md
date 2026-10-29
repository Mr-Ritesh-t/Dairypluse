# DairyPulse — Backend Architecture & REST API Catalog

This document details the backend architecture of DairyPulse, providing a complete catalog of all REST API endpoints implemented in `backend/app/routers/api_v1.py`.

---

## 1. REST API Endpoint Catalog

| HTTP Method | Endpoint | Router File | Request Schema | Response Model / Type | Database Tables Read / Modified | Frontend Caller | Test Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | `main.py` | None | `{ status, service, version, database }` | None (Health Ping) | `checkBackendHealth` | Covered in test suite |
| `GET` | `/api/v1/summary/dashboard` | `api_v1.py:35` | Query params: `period` | `DashboardSummary` | `customers`, `products`, `delivery_tasks`, `orders`, `invoices` | `getDashboardSummary` | Covered |
| `GET` | `/api/v1/products` | `api_v1.py:90` | None | `List[ProductResponse]` | `products` (Read) | `getProducts` | Covered |
| `POST` | `/api/v1/products` | `api_v1.py:96` | `ProductCreate` | `ProductResponse` | `products` (Insert) | `postProductApi` | Covered |
| `PATCH` | `/api/v1/products/{id}/price` | `api_v1.py:112` | Query: `selling_price`, `cost_price` | `ProductResponse` | `products` (Update) | `patchProductPriceApi` | Covered |
| `DELETE` | `/api/v1/products/{id}` | `api_v1.py:126` | Path: `id` | `{ success: bool }` | `products` (Delete) | `deleteProductApi` | Covered |
| `POST` | `/api/v1/inventory/receipts` | `api_v1.py:140` | `StockReceiptCreate` | `StockReceiptResponse` | `stock_receipts` (Insert), `products` (Update stock), `inventory_transactions` | `postStockReceipt` | Covered |
| `POST` | `/api/v1/inventory/wastage` | `api_v1.py:168` | `WastageCreate` | `InventoryTransactionResponse` | `products` (Deduct stock), `inventory_transactions` (Insert) | `postWastage` | Covered |
| `GET` | `/api/v1/customers` | `api_v1.py:195` | None | `List[CustomerResponse]` | `customers` (Read) | `getCustomers` | Covered |
| `POST` | `/api/v1/customers` | `api_v1.py:200` | `CustomerCreate` | `CustomerResponse` | `customers` (Insert with lat, lng, preferred_time) | `postCustomer` | Covered |
| `GET` | `/api/v1/subscriptions` | `api_v1.py:228` | None | `List[SubscriptionResponse]` | `subscriptions` (Read) | `getSubscriptions` | Covered |
| `POST` | `/api/v1/subscriptions` | `api_v1.py:233` | `SubscriptionCreate` | `SubscriptionResponse` | `subscriptions` (Insert) | `postSubscription` | Covered |
| `PATCH` | `/api/v1/subscriptions/{id}/pause` | `api_v1.py:252` | Path: `id`, Query: `until_date` | `SubscriptionResponse` | `subscriptions` (Update status Active/Paused) | `toggleSubscriptionPauseApi` | Covered |
| `GET` | `/api/v1/orders` | `api_v1.py:269` | None | `List[OrderResponse]` | `orders`, `order_items` (Read) | `getShopOrders` | Covered |
| `POST` | `/api/v1/orders` | `api_v1.py:276` | `OrderCreate` | `OrderResponse` | `orders` (Insert), `order_items` (Insert), `products` (Deduct stock) | `postShopOrder` | Covered |
| `GET` | `/api/v1/routes` | `api_v1.py:297` | None | `List[RouteResponse]` | `routes` (Read, counts stops & liters) | `getRoutesApi` | Covered |
| `POST` | `/api/v1/routes` | `api_v1.py:307` | `RouteCreate` | `RouteResponse` | `routes` (Insert) | `createRouteApi` | Covered |
| `POST` | `/api/v1/routes/build` | `api_v1.py:315` | `RouteBuildRequest` | `{ success, route_code, total_stops, total_liters }` | `routes` (Upsert), `customers` (Update route), `delivery_tasks` (Upsert sequenced stops) | `buildAndDispatchRouteApi` | Covered (`test_build_and_dispatch_route_with_custom_sequence`) |
| `GET` | `/api/v1/deliveries/today` | `api_v1.py:408` | None | `List[DeliveryTaskResponse]` | `delivery_tasks` (Read ordered by sequence_order) | `getDeliveriesToday` | Covered |
| `POST` | `/api/v1/deliveries` | `api_v1.py:417` | `DeliveryTaskCreate` | `DeliveryTaskResponse` | `delivery_tasks` (Insert individual stop) | `postDeliveryTaskApi` | Covered |
| `PATCH` | `/api/v1/deliveries/{id}/status` | `api_v1.py:440` | Path: `id`, Query: `status`, `failure_reason` | `DeliveryTaskResponse` | `delivery_tasks` (Update status, delivered_at) | `patchDeliveryStatus` | Covered |
| `PATCH` | `/api/v1/deliveries/{id}/assign` | `api_v1.py:456` | Path: `id`, Query: `assigned_rider`, `slot`, `area` | `DeliveryTaskResponse` | `delivery_tasks` (Update rider, slot, area) | `patchDeliveryAssignApi` | Covered |
| `POST` | `/api/v1/deliveries/assign-route` | `api_v1.py:476` | Query: `area`, `assigned_rider`, `slot` | `{ updated_count: int }` | `delivery_tasks` (Bulk update rider in area) | `postRouteAssignApi` | Covered |
| `PATCH` | `/api/v1/deliveries/reorder` | `api_v1.py:494` | `ReorderStopsRequest` | `{ success: bool, updated_stops: int }` | `delivery_tasks` (Batch update sequence_order) | `reorderDeliveriesApi` | Covered |
| `POST` | `/api/v1/deliveries/generate-daily` | `api_v1.py:507` | `DailyGenerateRequest` | `{ success, created_count, skipped_duplicates, total_stops }` | `subscriptions` (Read), `customers` (Read), `routes` (Read), `delivery_tasks` (Insert idempotently) | `generateDailyDeliveriesApi` | Covered |
| `PATCH` | `/api/v1/deliveries/{id}/address` | `api_v1.py:560` | Path: `id`, Body: `DeliveryAddressUpdate` | `DeliveryTaskResponse` | `delivery_tasks` (Update address, flat, society, lat, lng, notes) | `updateDeliveryAddressApi` | Covered |
| `GET` | `/api/v1/invoices` | `api_v1.py:586` | None | `List[InvoiceResponse]` | `invoices` (Read) | `getInvoices` | Covered |
| `POST` | `/api/v1/invoices` | `api_v1.py:591` | `InvoiceCreate` | `InvoiceResponse` | `invoices` (Insert) | `postInvoice` | Covered |
| `POST` | `/api/v1/payments` | `api_v1.py:615` | `PaymentCreate` | `InvoiceResponse` | `invoices` (Update paid_amount, status), `customers` (Deduct balance) | `postPayment` | Covered |
| `GET` | `/api/v1/expenses` | `api_v1.py:643` | None | `List[ExpenseResponse]` | `expenses` (Read) | `getExpenses` | Covered |
| `POST` | `/api/v1/expenses` | `api_v1.py:648` | `ExpenseCreate` | `ExpenseResponse` | `expenses` (Insert) | `postExpense` | Covered |
| `GET` | `/api/v1/staff` | `api_v1.py:666` | None | `List[StaffResponse]` | `staff` (Read) | `getStaff` | Covered |
| `POST` | `/api/v1/staff` | `api_v1.py:671` | `StaffCreate` | `StaffResponse` | `staff` (Insert) | `postStaff` | Covered |
| `GET` | `/api/v1/dairies` | `api_v1.py:694` | None | `List[DairyResponse]` | `dairies` (Read) | `getDairiesApi` | Covered |
| `POST` | `/api/v1/dairies` | `api_v1.py:699` | `DairyCreate` | `DairyResponse` | `dairies` (Insert), `users` (Insert owner account) | `postDairyApi` | Covered |

---

## 2. Request Lifecycle in FastAPI

When an HTTP request enters the backend (e.g. `POST /api/v1/routes/build`):

```
HTTP Request (Client)
  │
  ▼
1. CORS Middleware (app.add_middleware(CORSMiddleware))
   • Verifies allowed origins (allows Next.js dev server).
   • Sets Access-Control-Allow-Origin, Allow-Headers, and Allow-Methods.
  │
  ▼
2. Routing & Path Matching (app.include_router(api_router, prefix="/api/v1"))
   • Matches URI path and HTTP method against registered endpoints.
  │
  ▼
3. Request Validation (Pydantic Schema: RouteBuildRequest)
   • Automatically deserializes JSON body.
   • Validates field types: route_code (str), stops (List[RouteCustomerStop]), etc.
   • If invalid, returns HTTP 422 Unprocessable Entity with exact error paths.
  │
  ▼
4. Dependency Injection (db: Session = Depends(get_db))
   • Calls get_db() from app.database.
   • Yields an isolated SQLAlchemy SessionLocal instance.
  │
  ▼
5. Business Logic Execution (build_and_dispatch_route)
   • Checks/creates Route record.
   • Iterates through stops sorted by sequence_order.
   • Links Customer.route and creates/updates today's DeliveryTask records.
   • Calculates total stops and volume against max vehicle capacity.
  │
  ▼
6. Database Commit & Session Teardown
   • Executes db.commit().
   • In finally block of get_db(), executes db.close() returning connection to pool.
  │
  ▼
7. Response Serialization & HTTP 200 OK
   • Serializes result dictionary or Pydantic response model to JSON string.
```

---

## 3. Separation of Concerns in the Codebase

- **Routers (`app/routers/`)**: Handle HTTP protocol concerns (headers, status codes, query/path parameters, dependency injection).
- **Schemas (`app/schemas/`)**: Pure Pydantic models responsible for data contract validation, coercion, and response filtering (preventing internal DB fields like raw passwords from leaking).
- **Models (`app/models/`)**: Declarative SQLAlchemy table definitions with column types, default values, primary/foreign keys, and ORM relationship mappings.
- **Config & Settings (`app/config.py`)**: Centralizes environment variables with typed fallbacks.
- **Database Engine (`app/database.py`)**: Manages the underlying connection pool and session generator.
