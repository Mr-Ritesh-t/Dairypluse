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
    assert create_res.json()["name"] == "Test Restaurant & Sweets"

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
