import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_dashboard_summary():
    response = client.get("/api/v1/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_stock_liters" in data
    assert "total_deliveries" in data
    assert "products" in data

def test_inventory_products():
    response = client.get("/api/v1/inventory/products")
    assert response.status_code == 200
    products = response.json()
    assert len(products) >= 4
    variants = [p["variant"] for p in products]
    assert "Cow Milk" in variants
    assert "Buffalo Milk" in variants

def test_stock_receipt():
    payload = {
        "supplier_name": "Test Co-Op Farm",
        "variant": "Cow Milk",
        "quantity": 100.0,
        "unit_cost": 48.0,
        "notes": "Quality test batch"
    }
    response = client.post("/api/v1/inventory/receipts", json=payload)
    assert response.status_code == 200
    assert "new_stock" in response.json()

def test_wastage_logging():
    payload = {
        "variant": "Cow Milk",
        "quantity": 5.0,
        "reason": "Test leakage"
    }
    response = client.post("/api/v1/inventory/wastage", json=payload)
    assert response.status_code == 200
    assert "remaining_stock" in response.json()

def test_customers_crud():
    # 1. List
    list_res = client.get("/api/v1/customers")
    assert list_res.status_code == 200

    # 2. Create
    payload = {
        "name": "Test Restaurant & Sweets",
        "customer_type": "RESTAURANT",
        "phone": "+91 99999 88888",
        "email": "test@dairy.com",
        "address": "123 Highway Road",
        "area": "Wakad",
        "route": "Route B - Commercial Bulk",
        "balance": 0.0,
        "status": "Active"
    }
    create_res = client.post("/api/v1/customers", json=payload)
    assert create_res.status_code == 200
    created_cust = create_res.json()
    assert created_cust["name"] == "Test Restaurant & Sweets"

    # 3. Customer updates profile and sets location on map
    cust_id = created_cust["id"]
    update_payload = {
        "name": "Updated Restaurant & Sweets",
        "phone": "+91 99999 77777",
        "address": "Flat 304, Marvel Zephyr, Baner",
        "area": "Baner",
        "latitude": 18.5593,
        "longitude": 73.7788,
        "preferred_time": "6:15 AM - 7:00 AM"
    }
    patch_res = client.patch(f"/api/v1/customers/{cust_id}", json=update_payload)
    assert patch_res.status_code == 200
    updated_data = patch_res.json()
    assert updated_data["name"] == "Updated Restaurant & Sweets"
    assert updated_data["phone"] == "+91 99999 77777"
    assert updated_data["latitude"] == 18.5593
    assert updated_data["longitude"] == 73.7788

def test_subscriptions():
    response = client.get("/api/v1/subscriptions")
    assert response.status_code == 200
    subs = response.json()
    assert len(subs) >= 1

def test_deliveries_today():
    response = client.get("/api/v1/deliveries/today")
    assert response.status_code == 200
    delivs = response.json()
    assert len(delivs) >= 1
    first_id = delivs[0]["id"]

    # Toggle status
    status_res = client.patch(f"/api/v1/deliveries/{first_id}/status?status=Delivered")
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "Delivered"

def test_invoices_and_payment():
    invoices_res = client.get("/api/v1/invoices")
    assert invoices_res.status_code == 200
    invoices = invoices_res.json()
    assert len(invoices) >= 1

    # Record partial payment
    first_inv = invoices[0]
    pay_res = client.post(f"/api/v1/invoices/{first_inv['id']}/payments", json={"amount": 500.0})
    assert pay_res.status_code == 200
    assert pay_res.json()["paid_amount"] >= 500.0

def test_expenses():
    payload = {
        "category": "Cattle Feed",
        "amount": 5000.0,
        "vendor": "Test Feed Vendor",
        "payment_method": "UPI",
        "notes": "Emergency 5 bags feed"
    }
    create_res = client.post("/api/v1/expenses", json=payload)
    assert create_res.status_code == 200
    assert create_res.json()["amount"] == 5000.0

def test_create_staff_and_login():
    # 1. Admin creates a new delivery rider with explicit Gmail and Password
    rider_payload = {
        "name": "Suresh Shinde",
        "role": "Delivery Rider",
        "phone": "+91 98221 55667",
        "email": "suresh.rider@gmail.com",
        "password": "SecurePassword123",
        "assigned_area": "Baner Morning Route R-04",
        "status": "On Duty",
    }
    create_res = client.post("/api/v1/staff", json=rider_payload)
    assert create_res.status_code == 200
    rider_data = create_res.json()
    assert rider_data["name"] == "Suresh Shinde"
    assert rider_data["phone"] == "+91 98221 55667"
    assert rider_data["email"] == "suresh.rider@gmail.com"

    # 2a. Rider logs in using their Gmail and Password
    gmail_login_res = client.post("/api/v1/auth/login", json={
        "login_id": "suresh.rider@gmail.com",
        "password": "SecurePassword123",
        "role": "DELIVERY",
    })
    assert gmail_login_res.status_code == 200
    assert gmail_login_res.json()["name"] == "Suresh Shinde"
    assert gmail_login_res.json()["email"] == "suresh.rider@gmail.com"
    assert gmail_login_res.json()["role"] == "DELIVERY"

    # 2b. Rider logs in using their Phone and Password
    phone_login_res = client.post("/api/v1/auth/login", json={
        "login_id": "+91 98221 55667",
        "password": "SecurePassword123",
        "role": "DELIVERY",
    })
    assert phone_login_res.status_code == 200
    assert phone_login_res.json()["name"] == "Suresh Shinde"

    # 2c. Invalid password check fails with 401
    bad_pwd_res = client.post("/api/v1/auth/login", json={
        "login_id": "suresh.rider@gmail.com",
        "password": "WrongPassword",
        "role": "DELIVERY",
    })
    assert bad_pwd_res.status_code == 401

    # 3. Update staff member status and assigned area
    rider_id = rider_data["id"]
    patch_res = client.patch(f"/api/v1/staff/{rider_id}", json={
        "status": "Off Duty",
        "assigned_area": "Aundh Route A-01"
    })
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "Off Duty"
    assert patch_res.json()["assigned_area"] == "Aundh Route A-01"

    # 4. Delete staff member
    del_res = client.delete(f"/api/v1/staff/{rider_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # 5. Verify staff no longer in list
    staff_list = client.get("/api/v1/staff").json()
    assert not any(s["id"] == rider_id for s in staff_list)

def test_auth_login_owner():
    payload = {
        "login_id": "admin@dairypulse.farm",
        "password": "admin123",
        "role": "OWNER"
    }
    res = client.post("/api/v1/auth/login", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "OWNER"
    assert "token" in data

def test_auth_login_delivery():
    payload = {
        "login_id": "+91 98220 11984",
        "role": "DELIVERY"
    }
    res = client.post("/api/v1/auth/login", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "DELIVERY"
    assert "token" in data

def test_auth_login_customer():
    payload = {
        "login_id": "+91 98200 44551",
        "role": "CUSTOMER"
    }
    res = client.post("/api/v1/auth/login", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "CUSTOMER"
    assert "token" in data

def test_auth_login_invalid_role():
    payload = {
        "login_id": "unknown",
        "role": "INVALID_ROLE"
    }
    res = client.post("/api/v1/auth/login", json=payload)
    assert res.status_code == 400

def test_demand_forecasting():
    res = client.get("/api/v1/analytics/demand-forecast")
    assert res.status_code == 200
    data = res.json()
    assert "total_predicted_demand" in data
    assert "total_suggested_procurement" in data
    assert len(data["variants"]) >= 4
    assert len(data["seven_day_trend"]) == 7
    assert data["confidence_score"] > 80.0

def test_wastage_insights():
    res = client.get("/api/v1/analytics/wastage-insights")
    assert res.status_code == 200
    data = res.json()
    assert "wastage_rate_percentage" in data
    assert "total_financial_loss" in data
    assert len(data["reasons_breakdown"]) >= 3
    assert len(data["variants_breakdown"]) >= 3

def test_optimized_route():
    res = client.get("/api/v1/deliveries/optimized-route?route_name=Baner%20Morning%20Route%20R-04")
    assert res.status_code == 200
    data = res.json()
    assert data["distance_saved_km"] > 0
    assert data["time_saved_mins"] > 0
    assert len(data["stops"]) >= 5
    assert data["stops"][0]["stop_number"] == 1

def test_apply_route_sequence():
    res = client.post("/api/v1/deliveries/apply-sequence?route_name=Baner%20Morning%20Route%20R-04")
    assert res.status_code == 200
    assert res.json()["success"] is True

def test_skip_subscription_delivery():
    subs = client.get("/api/v1/subscriptions").json()
    first_id = subs[0]["id"]
    payload = {"skip_date": "2026-10-25", "reason": "Diwali Festival Family Outing"}
    res = client.patch(f"/api/v1/subscriptions/{first_id}/skip", json=payload)
    assert res.status_code == 200
    assert res.json()["success"] is True
    assert res.json()["skipped_date"] == "2026-10-25"

def test_modify_subscription_quantity():
    subs = client.get("/api/v1/subscriptions").json()
    first_id = subs[0]["id"]
    payload = {"new_quantity_liters": 2.5, "effective_date": "2026-10-26"}
    res = client.patch(f"/api/v1/subscriptions/{first_id}/modify-quantity", json=payload)
    assert res.status_code == 200
    assert res.json()["success"] is True
    assert res.json()["new_quantity"] == 2.5

def test_schedule_extra_milk():
    subs = client.get("/api/v1/subscriptions").json()
    first_id = subs[0]["id"]
    payload = {"extra_liters": 1.0, "date": "2026-10-27", "variant": "Cow Milk"}
    res = client.post(f"/api/v1/subscriptions/{first_id}/extra-milk", json=payload)
    assert res.status_code == 200
    assert res.json()["success"] is True
    assert res.json()["extra_liters"] == 1.0

def test_customer_insights():
    res = client.get("/api/v1/analytics/customer-insights")
    assert res.status_code == 200
    data = res.json()
    assert data["total_customers"] > 0
    assert len(data["insights"]) >= 5
    assert len(data["retention_tips"]) >= 2

def test_offline_delivery_batch_sync():
    tasks = client.get("/api/v1/deliveries/today").json()
    test_id = tasks[0]["id"] if tasks else "deliv_1"
    payload = {
        "actions": [
            {
                "delivery_id": test_id,
                "status": "Delivered",
                "notes": "Delivered at back porch, 2 empty glass bottles collected",
                "bottles_returned": 2,
                "cash_collected": 0.0,
                "timestamp": "06:45 AM",
                "client_action_id": "client_act_9912",
            }
        ],
        "rider_id": "rider_1",
        "rider_name": "Rahul Deshmukh",
        "device_info": "Samsung M32 PWA",
    }
    res = client.post("/api/v1/deliveries/sync-batch", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["synced_count"] >= 1

def test_notifications_lifecycle():
    # 1. Fetch notifications
    res = client.get("/api/v1/notifications")
    assert res.status_code == 200
    data = res.json()
    assert "notifications" in data
    assert len(data["notifications"]) >= 1

    first_notif = data["notifications"][0]
    notif_id = first_notif["id"]

    # 2. Mark single as read
    res_read = client.patch(f"/api/v1/notifications/{notif_id}/read")
    assert res_read.status_code == 200
    assert res_read.json()["is_read"] is True

    # 3. Simulate operational alert
    res_sim = client.post("/api/v1/notifications/simulate-event?event_type=SKIP")
    assert res_sim.status_code == 200
    assert res_sim.json()["success"] is True
    assert "created_notification" in res_sim.json()

    # 4. Mark all as read
    res_all = client.post("/api/v1/notifications/mark-all-read")
    assert res_all.status_code == 200
    assert res_all.json()["success"] is True

def test_dairies_api():
    # 1. List available dairies
    res_list = client.get("/api/v1/dairies")
    assert res_list.status_code == 200
    dairies = res_list.json()
    assert len(dairies) >= 3

    # 2. Register a new dairy owner
    new_dairy = {
        "name": "Tayade Organic Dairy",
        "owner_name": "Ritesh Tayade",
        "email": "owner@tayadedairy.com",
        "phone": "+91 98888 77777",
        "city": "Pune",
        "address": "Hadapsar Chilling Center",
        "latitude": 18.5089,
        "longitude": 73.9259,
        "password": "ownerpassword123",
    }
    res_create = client.post("/api/v1/dairies", json=new_dairy)
    assert res_create.status_code == 200
    created = res_create.json()
    assert created["name"] == "Tayade Organic Dairy"
    assert created["city"] == "Pune"
    assert created["latitude"] == 18.5089
    assert created["longitude"] == 73.9259

    # 3. Update dairy location via PATCH
    dairy_id = created["id"]
    res_patch = client.patch(f"/api/v1/dairies/{dairy_id}", json={
        "address": "Hadapsar Plant Phase 2, Pune",
        "latitude": 18.5120,
        "longitude": 73.9300,
    })
    assert res_patch.status_code == 200
    patched = res_patch.json()
    assert patched["address"] == "Hadapsar Plant Phase 2, Pune"
    assert patched["latitude"] == 18.5120
    assert patched["longitude"] == 73.9300

    # 4. Newly registered dairy owner can log in
    res_login = client.post("/api/v1/auth/login", json={
        "login_id": "owner@tayadedairy.com",
        "role": "OWNER"
    })
    assert res_login.status_code == 200
    assert res_login.json()["dairy_name"] == "Tayade Organic Dairy"

def test_product_variety_lifecycle():
    # 1. Add a new milk variety
    variety_payload = {
        "name": "Organic Gir Cow Milk",
        "variant": "Gir Cow Milk",
        "unit": "Liter",
        "fat_content": 4.8,
        "snf_content": 8.7,
        "selling_price": 88.0,
        "cost_price": 65.0,
        "available_stock": 250.0,
        "low_stock_threshold": 50.0,
        "status": "In Stock"
    }
    res_create = client.post("/api/v1/inventory/products", json=variety_payload)
    assert res_create.status_code == 200
    created = res_create.json()
    product_id = created["id"]
    assert created["variant"] == "Gir Cow Milk"
    assert created["selling_price"] == 88.0

    # 2. Change price
    res_update = client.patch(f"/api/v1/inventory/products/{product_id}", json={
        "selling_price": 94.0,
        "cost_price": 70.0
    })
    assert res_update.status_code == 200
    updated = res_update.json()
    assert updated["selling_price"] == 94.0
    assert updated["cost_price"] == 70.0

    # 3. Verify in product list
    res_list = client.get("/api/v1/inventory/products")
    assert res_list.status_code == 200
    variants = [p["variant"] for p in res_list.json()]
    assert "Gir Cow Milk" in variants

    # 4. Remove / Delete the variety
    res_delete = client.delete(f"/api/v1/inventory/products/{product_id}")
    assert res_delete.status_code == 200
    assert res_delete.json()["success"] is True

    # 5. Verify it is deleted
    res_list_after = client.get("/api/v1/inventory/products")
    variants_after = [p["variant"] for p in res_list_after.json()]
    assert "Gir Cow Milk" not in variants_after

def test_delivery_assignment_and_tracking():
    # 1. Create a new delivery stop
    payload = {
        "customer_name": "Kavita Rathi",
        "customer_phone": "+91 98333 44444",
        "address": "B-302, Green Glen, Baner",
        "area": "Baner",
        "product_variant": "Cow Milk",
        "quantity_liters": 2.0,
        "slot": "Morning (6:00 AM - 7:30 AM)",
        "assigned_rider": "Rahul Deshmukh",
        "notes": "Ring doorbell twice"
    }
    res_create = client.post("/api/v1/deliveries", json=payload)
    assert res_create.status_code == 200
    created = res_create.json()
    deliv_id = created["id"]
    assert created["customer_name"] == "Kavita Rathi"
    assert created["assigned_rider"] == "Rahul Deshmukh"

    # 2. Re-assign delivery to another rider and time slot
    res_assign = client.patch(f"/api/v1/deliveries/{deliv_id}/assign", json={
        "assigned_rider": "Amit Kadam",
        "slot": "Evening (5:30 PM - 7:00 PM)",
        "status": "In Progress"
    })
    assert res_assign.status_code == 200
    assigned = res_assign.json()
    assert assigned["assigned_rider"] == "Amit Kadam"
    assert assigned["slot"] == "Evening (5:30 PM - 7:00 PM)"
    assert assigned["status"] == "In Progress"

    # 3. Route-level bulk assignment
    res_route = client.post("/api/v1/deliveries/route-assign", json={
        "area": "Baner",
        "assigned_rider": "Sunil Patil",
        "slot": "Morning (6:00 AM - 7:30 AM)"
    })
    assert res_route.status_code == 200
    assert res_route.json()["success"] is True

    # 4. Mark delivered and verify tracking timestamp
    res_status = client.patch(f"/api/v1/deliveries/{deliv_id}/status?status=Delivered")
    assert res_status.status_code == 200
    assert res_status.json()["status"] == "Delivered"
    assert res_status.json()["delivered_at"] is not None

    # 5. Test Routes listing
    res_routes = client.get("/api/v1/routes")
    assert res_routes.status_code == 200
    routes = res_routes.json()
    assert len(routes) >= 3

    # 6. Test Stop Sequencing & Reordering
    res_reorder = client.patch("/api/v1/deliveries/reorder", json={
        "stops": [
            {"id": deliv_id, "sequence_order": 99}
        ]
    })
    assert res_reorder.status_code == 200
    assert res_reorder.json()["success"] is True

    # 7. Test Address & Location Update with Map Coordinates (Support unavailable/incorrect addresses)
    res_addr = client.patch(f"/api/v1/deliveries/{deliv_id}/address", json={
        "address": "B-Wing Flat 302, Rohan Nilay, Baner",
        "flat_or_unit": "B-302",
        "society_or_landmark": "Rohan Nilay",
        "landmark": "Near Main Gate",
        "latitude": 18.5593,
        "longitude": 73.7788
    })
    assert res_addr.status_code == 200
    updated_deliv = res_addr.json()
    assert updated_deliv["flat_or_unit"] == "B-302"
    assert updated_deliv["society_or_landmark"] == "Rohan Nilay"
    assert updated_deliv["latitude"] == 18.5593
    assert updated_deliv["longitude"] == 73.7788

    # 8. Test Daily Delivery Generation with Deduplication
    res_gen = client.post("/api/v1/deliveries/generate-daily", json={
        "delivery_date": "2026-10-26",
        "slot": "ALL"
    })
    assert res_gen.status_code == 200
    gen_data = res_gen.json()
    assert gen_data["success"] is True
    # Calling a second time should detect and skip duplicates
    res_gen2 = client.post("/api/v1/deliveries/generate-daily", json={
        "delivery_date": "2026-10-26",
        "slot": "ALL"
    })
    assert res_gen2.status_code == 200
    assert res_gen2.json()["skipped_duplicates"] >= gen_data["created_count"]

    # 9. Test Route Creation with Configurable Vehicle Capacity
    import uuid
    unique_route_code = f"H-{uuid.uuid4().hex[:4].upper()}"
    res_new_route = client.post("/api/v1/routes", json={
        "route_code": unique_route_code,
        "name": "Hinjawadi Tech Park Sector",
        "area": "Hinjawadi",
        "assigned_rider": "Rahul Deshmukh",
        "slot": "Morning (6:00 AM - 7:30 AM)",
        "societies": "Blue Ridge, Megapolis, Life Republic",
        "max_capacity_liters": 75.0
    })
    assert res_new_route.status_code == 200
    assert res_new_route.json()["route_code"] == unique_route_code
    assert res_new_route.json()["max_capacity_liters"] == 75.0

    # 10. Test Route Builder with Selected Customers & Explicit Sequencing (1st, 2nd...)
    # Get available customers
    cust_res = client.get("/api/v1/customers")
    assert cust_res.status_code == 200
    all_custs = cust_res.json()
    assert len(all_custs) >= 2

    builder_route_code = f"RT-{uuid.uuid4().hex[:4].upper()}"
    build_payload = {
        "route_code": builder_route_code,
        "name": "Morning Express Loop",
        "area": "Baner",
        "assigned_rider": "Rahul Deshmukh",
        "slot": "Morning (6:00 AM - 7:30 AM)",
        "societies": "Rohan Nilay, Green Glen",
        "max_capacity_liters": 65.0,
        "stops": [
            {
                "customer_id": all_custs[0]["id"],
                "sequence_order": 1,
                "custom_slot": "6:15 AM - 6:45 AM"
            },
            {
                "customer_id": all_custs[1]["id"],
                "sequence_order": 2,
                "custom_slot": "6:45 AM - 7:15 AM"
            }
        ]
    }
    res_build = client.post("/api/v1/routes/build", json=build_payload)
    assert res_build.status_code == 200
    build_data = res_build.json()
    assert build_data["success"] is True
    assert build_data["route"]["route_code"] == builder_route_code
    assert build_data["dispatched_count"] >= 2
    assert build_data["stops"][0]["sequence_order"] == 1
    assert build_data["stops"][1]["sequence_order"] == 2

def test_driver_rating_workflow():
    # 1. Create a staff driver
    staff_res = client.post("/api/v1/staff", json={
        "name": "Kailash Rider",
        "role": "Delivery Rider",
        "phone": "+91 98888 11111",
        "assigned_area": "Baner Sector 4",
        "rating": 5.0
    })
    assert staff_res.status_code == 200
    staff_id = staff_res.json()["id"]

    # 2. Submit a driver rating
    rating_payload = {
        "driver_name": "Kailash Rider",
        "driver_id": staff_id,
        "customer_name": "Priya Kulkarni",
        "rating": 5,
        "tags": ["Always On Time", "Quiet Morning Drop"],
        "feedback": "Arrived exactly at 6:15 AM without disturbing anyone. Milk was ice-cold!"
    }
    rate_res = client.post("/api/v1/ratings/driver", json=rating_payload)
    assert rate_res.status_code == 200
    rate_data = rate_res.json()
    assert rate_data["rating"] == 5
    assert "Always On Time" in rate_data["tags"]

    # 3. Fetch ratings for driver
    get_res = client.get("/api/v1/ratings/driver/Kailash Rider")
    assert get_res.status_code == 200
    reviews = get_res.json()
    assert len(reviews) >= 1
    assert reviews[0]["customer_name"] == "Priya Kulkarni"






