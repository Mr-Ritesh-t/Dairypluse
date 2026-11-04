import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_daily_milk_delivered_adds_to_remaining_payment_and_bill():
    # 1. Create a customer
    cust_res = client.post("/api/v1/customers", json={
        "name": "Rohan Test Sharma",
        "phone": "+91 91111 22222",
        "email": "rohan.test@example.com",
        "address": "Flat 301, Sunrise Heights, Baner",
        "area": "Baner",
        "route": "Route 1 - Baner Line",
        "customer_type": "HOUSEHOLD",
        "dairy_name": "DairyPulse Farm HQ"
    })
    assert cust_res.status_code == 200
    cust_data = cust_res.json()
    customer_id = cust_data["id"]
    assert cust_data["balance"] == 0.0

    # 2. Create an assigned daily delivery task for 1.0 Liter Cow Milk
    deliv_res = client.post("/api/v1/deliveries", json={
        "customer_name": "Rohan Test Sharma",
        "customer_phone": "+91 91111 22222",
        "address": "Flat 301, Sunrise Heights, Baner",
        "area": "Baner",
        "product_variant": "Cow Milk",
        "quantity_liters": 1.0,
        "slot": "Morning (6:00 AM - 7:30 AM)",
        "assigned_rider": "Rahul Deshmukh",
        "status": "Assigned"
    })
    assert deliv_res.status_code == 200
    deliv_id = deliv_res.json()["id"]

    # 3. Mark the delivery task as Delivered
    patch_res = client.patch(f"/api/v1/deliveries/{deliv_id}/status?status=Delivered")
    assert patch_res.status_code == 200
    patch_data = patch_res.json()
    
    assert patch_data["status"] == "Delivered"
    assert patch_data["delivered_cost"] == 62.0  # 1.0L Cow Milk @ Rs 62
    assert patch_data["customer_balance"] == 62.0
    assert patch_data["invoice_total"] == 62.0

    # 4. Verify Customer Remaining Payment balance in database
    get_custs = client.get("/api/v1/customers")
    assert get_custs.status_code == 200
    cust = next(c for c in get_custs.json() if c["id"] == customer_id)
    assert cust["balance"] == 62.0

    # 5. Verify Invoice Bill in database
    get_invoices = client.get("/api/v1/invoices")
    assert get_invoices.status_code == 200
    cust_invoices = [inv for inv in get_invoices.json() if inv["customer_id"] == customer_id]
    assert len(cust_invoices) >= 1
    latest_inv = cust_invoices[0]
    assert latest_inv["total_amount"] == 62.0
    assert latest_inv["status"] == "Unpaid"

    # 6. Mark a second delivery task (1.5L Cow Milk = Rs 93.0) as Delivered
    deliv2_res = client.post("/api/v1/deliveries", json={
        "customer_name": "Rohan Test Sharma",
        "customer_phone": "+91 91111 22222",
        "address": "Flat 301, Sunrise Heights, Baner",
        "area": "Baner",
        "product_variant": "Cow Milk",
        "quantity_liters": 1.5,
        "slot": "Morning (6:00 AM - 7:30 AM)",
        "assigned_rider": "Rahul Deshmukh",
        "status": "Assigned"
    })
    assert deliv2_res.status_code == 200
    deliv2_id = deliv2_res.json()["id"]

    patch2_res = client.patch(f"/api/v1/deliveries/{deliv2_id}/status?status=Delivered")
    assert patch2_res.status_code == 200
    patch2_data = patch2_res.json()
    assert patch2_data["delivered_cost"] == 93.0
    assert patch2_data["customer_balance"] == 155.0  # 62.0 + 93.0
    assert patch2_data["invoice_total"] == 155.0

    # Verify customer balance after 2nd delivery
    get_custs2 = client.get("/api/v1/customers")
    cust2 = next(c for c in get_custs2.json() if c["id"] == customer_id)
    assert cust2["balance"] == 155.0

    # 7. Test Revert: If delivery status is reverted to Pending, cost is refunded
    revert_res = client.patch(f"/api/v1/deliveries/{deliv2_id}/status?status=Pending")
    assert revert_res.status_code == 200
    assert revert_res.json()["customer_balance"] == 62.0
    assert revert_res.json()["invoice_total"] == 62.0

    get_custs3 = client.get("/api/v1/customers")
    cust3 = next(c for c in get_custs3.json() if c["id"] == customer_id)
    assert cust3["balance"] == 62.0
