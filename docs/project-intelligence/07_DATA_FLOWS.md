# DairyPulse — End-to-End Business Data Flows & Execution Traces

This document traces each implemented business workflow from initial user interaction, through state management and API requests, to database transactions and UI updates.

---

## Flow A: Customer Onboarding & Delivery Preference

```
[User Form: /login Step 3]
       │ (custName, custPhone, custAddress, custLat, custLng, custPreferredTime, custVariant, custQuantity)
       ▼
[handleStep3Submit() in frontend/src/app/login/page.tsx:160]
       │ calls addCustomer() in DairyPulseContext.tsx
       ▼
[postCustomer() in frontend/src/lib/api.ts:231]
       │ HTTP POST /api/v1/customers
       ▼
[create_customer() in backend/app/routers/api_v1.py:200]
       │ Validated by CustomerCreate schema (app/schemas/schemas.py:53)
       │ Executes db.add(Customer(..., latitude=req.latitude, longitude=req.longitude, preferred_time=req.preferred_time))
       │ db.commit() & db.refresh()
       ▼
[Response: CustomerResponse JSON]
       │ Frontend receives new customer record
       ▼
[addSubscription() in frontend/src/context/DairyPulseContext.tsx]
       │ HTTP POST /api/v1/subscriptions
       │ Inserts Subscription record linking customerId, variant, quantity, timeSlot
       ▼
[UI Updates]
       │ Displays success banner and navigates to customer self-service portal
```

---

## Flow B: Interactive Route Building, Sequencing & Dispatch

```
[Admin clicks "Interactive Route Studio" in /delivery]
       │ Opens frontend/src/components/delivery/RouteBuilderStudio.tsx
       ▼
[Coordinate Projection Engine]
       │ Calculates mapBounds from customer lat/lng: minLat, maxLat, minLng, maxLng
       │ Projects coordinates to (x%, y%) on interactive SVG map canvas
       │ Renders numbered pins (#1, #2, #3) for selected stops and animated polyline
       ▼
[Admin Reordering (▲ / ▼ Buttons)]
       │ handleMoveUp(index) / handleMoveDown(index)
       │ Swaps stop positions in selectedStops array
       │ Live capacity bar recalculates: (totalLiters / maxCapacity) * 100
       ▼
[Admin clicks "Save Route & Dispatch to Rider"]
       │ Calls handleSaveAndDispatch() in RouteBuilderStudio.tsx:150
       │ Calls buildAndDispatchRoute() in DairyPulseContext.tsx:1175
       ▼
[buildAndDispatchRouteApi() in frontend/src/lib/api.ts:529]
       │ HTTP POST /api/v1/routes/build
       │ Payload: { route_code, name, area, assigned_rider, stops: [{ customer_id, sequence_order, custom_slot }] }
       ▼
[build_and_dispatch_route() in backend/app/routers/api_v1.py:315]
       │ 1. Upserts Route record (sets assigned_rider, max_capacity_liters)
       │ 2. Iterates sorted stops (sorted by sequence_order ASC)
       │ 3. Updates Customer.route = route.route_code
       │ 4. Queries existing DeliveryTask for today (delivery_date == today_str)
       │    • If found: updates sequence_order, assigned_rider, slot, notes
       │    • If not found: creates new DeliveryTask with sequence_order, flat, society, GPS
       │ 5. Updates route.total_stops and route.total_liters
       │ 6. Executes db.commit()
       ▼
[Response: { success: true, route_code: "R-05", total_stops: N }]
       │ DairyPulseContext triggers getDeliveriesToday() and getRoutesApi()
       │ Dispatches toast notice in /delivery
```

---

## Flow C: Rider Delivery Execution (Online vs Offline)

```
[Rider opens /mobile/delivery on Smartphone]
       │ Component: frontend/src/app/mobile/delivery/page.tsx
       │ Calls getDeliveriesToday()
       ▼
[Displaying Sequenced Stops]
       │ Filtered by assigned_rider == user.name
       │ Sorted by stop.sequenceOrder ASC (Stop #1, Stop #2, Stop #3...)
       │ Displays ETA, flat/door unit, society, and customer's preferred delivery time
       ▼
[Doorstep Action: Rider clicks "Mark Delivered"]
       │ Form inputs: bottles returned (e.g. 2), cash collected (e.g. ₹124)
       │ Calls handleDeliver(stopId)
       ▼
   ┌─────────────────────── Network Decision ──────────────────────┐
   │                                                               │
[ONLINE]                                                       [OFFLINE]
   │                                                               │
   ▼                                                               ▼
Calls patchDeliveryStatus()                                    Calls recordDeliveryStop()
in frontend/src/lib/api.ts:600                                 in frontend/src/lib/offlineSync.ts:100
   │                                                               │
HTTP PATCH /api/v1/deliveries/{id}/status                      Pushes event to IndexedDB queue:
Query: status=Delivered&notes=2 bottles | ₹124 cash            { delivery_id, status, bottles, cash, timestamp }
   │                                                               │
update_delivery_status() in api_v1.py:440                      UI marks stop complete optimistically
Updates status="Delivered", delivered_at=NOW                   Top banner shows: "1 stop queued offline"
   │                                                               │
Executes db.commit()                                           When browser detects window 'online' event:
   │                                                           triggerManualSync() flushes queue to API
   ▼                                                               │
UI reflects Green "Delivered" Badge ◄──────────────────────────┘
```

---

## Flow D: Inventory Intake, Cold Chain Quality & Wastage

```
[Intake: /inventory Modal "Receive Fresh Milk Batch"]
       │ Supplier name, variant (e.g. Cow Milk), quantity (1,200L), unit_cost (₹48/L)
       │ Fat % (4.2%) and SNF % (8.5%) verified against lab testing
       ▼
[postStockReceipt() in frontend/src/lib/api.ts:156]
       │ HTTP POST /api/v1/inventory/receipts
       ▼
[receive_stock() in backend/app/routers/api_v1.py:140]
       │ 1. Inserts StockReceipt record
       │ 2. Finds matching Product by variant -> product.available_stock += quantity
       │ 3. Inserts InventoryTransaction(type="RECEIPT", quantity=quantity, rate=unit_cost)
       │ 4. Executes db.commit()
       ▼
[Wastage Adjustment: Milk Curdling / Spillage]
       │ Admin clicks "Record Wastage" (e.g. 15L Cow Milk lost to temperature breach)
       │ HTTP POST /api/v1/inventory/wastage
       │ record_wastage() in api_v1.py:168
       │ Product available_stock -= quantity
       │ Inserts InventoryTransaction(type="WASTAGE", notes="Temperature breach in chilling unit")
       │ UI WastageIntelligenceCard updates cost of spoilage
```

---

## Flow E: Daily Delivery Run Generation (Subscription to Task)

```
[Admin clicks "Generate Today's Runs" in /delivery]
       │ Calls generateDailyDeliveries() in DairyPulseContext.tsx:1173
       ▼
[generateDailyDeliveriesApi() in frontend/src/lib/api.ts:563]
       │ HTTP POST /api/v1/deliveries/generate-daily
       │ Body: { delivery_date: "2026-10-26", slot: "ALL" }
       ▼
[generate_daily_deliveries() in backend/app/routers/api_v1.py:507]
       │ 1. Fetches all active subscriptions (Subscription.status == "Active")
       │ 2. Maps customer area to assigned route rider via route_rider_map
       │ 3. For each active subscription:
       │    Checks if task already exists:
       │    db.query(DeliveryTask).filter(customer_phone == cust.phone, delivery_date == today_str).first()
       │    • If task exists: skipped_duplicates += 1 (IDEMPOTENCY GUARANTEE)
       │    • If task does NOT exist:
       │         Generates unique task number: DEL-2026-XXX
       │         Parses flat/unit and society from address
       │         Inserts DeliveryTask(status="Assigned", sequence_order=count+1)
       │ 4. Executes db.commit()
       ▼
[Response: { success: true, created_count: 5, skipped_duplicates: 0, total_stops: 5 }]
       │ DairyPulseContext updates state; delivery table refreshes instantly
```

---

## Flow F: Billing, Invoicing & Payments

```
[Admin navigates to /billing]
       │ Clicks "Generate Monthly Invoice" for Customer
       ▼
[postInvoice() in frontend/src/lib/api.ts:620]
       │ HTTP POST /api/v1/invoices
       │ Body: { customer_id, customer_name, billing_period: "Oct 2026", total_amount: 1920.0 }
       ▼
[create_invoice() in backend/app/routers/api_v1.py:591]
       │ Generates unique invoice number: INV-2026-XXX
       │ Inserts Invoice(status="Unpaid", paid_amount=0.0)
       │ Updates Customer.balance += total_amount
       │ Executes db.commit()
       ▼
[Customer pays via UPI / Cash]
       │ Admin records payment: HTTP POST /api/v1/payments
       │ Body: { invoice_id, amount: 1920.0 }
       │ record_payment() in api_v1.py:615
       │ Updates Invoice.paid_amount += amount
       │ Sets Invoice.status = "Paid" (or "Partial" if amount < total_amount)
       │ Updates Customer.balance -= amount
       │ Executes db.commit()
       ▼
[UI Updates]
       │ Invoice card updates to Green "Paid" badge; Customer balance resets to ₹0
```
