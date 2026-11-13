import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from jose import jwt
from app.main import app
from app.config import settings
from app.routers.api_v1 import check_delivery_cutoff, hash_password, verify_password
from fastapi import HTTPException

client = TestClient(app)

def test_bcrypt_hashing_and_verification():
    raw_pwd = "SecretFarmerPassword2026"
    hashed = hash_password(raw_pwd)
    
    assert hashed != raw_pwd
    assert hashed.startswith("$2b$") or hashed.startswith("$2a$")
    assert verify_password(raw_pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False
    # Legacy plaintext password backward compatibility
    assert verify_password("admin123", "admin123") is True


def test_delivery_cutoff_rules():
    now = datetime.now()
    tomorrow_str = (now.date() + timedelta(days=1)).strftime("%Y-%m-%d")
    today_str = now.date().strftime("%Y-%m-%d")
    future_str = (now.date() + timedelta(days=5)).strftime("%Y-%m-%d")

    # Dates far in future are never blocked
    check_delivery_cutoff(future_str, slot="Morning", is_admin_override=False)

    # Admin override always succeeds
    check_delivery_cutoff(tomorrow_str, slot="Morning", is_admin_override=True)
    check_delivery_cutoff(today_str, slot="Morning", is_admin_override=True)

    # If it is past 10 PM (22:00) right now, tomorrow morning should be blocked for normal customers
    if now.hour >= 22:
        with pytest.raises(HTTPException) as exc_info:
            check_delivery_cutoff(tomorrow_str, slot="Morning", is_admin_override=False)
        assert exc_info.value.status_code == 400
        assert "10:00 PM Cut-off exceeded" in exc_info.value.detail


def test_online_payment_order_creation_and_verification():
    # 1. Create a customer with outstanding balance
    cust_res = client.post("/api/v1/customers", json={
        "name": "Vikram Adhav",
        "customer_type": "HOUSEHOLD",
        "phone": "+91 98901 22334",
        "email": "vikram.adhav@example.com",
        "address": "B-304, Silver Oak Residency",
        "area": "Baner",
        "route": "Baner Route B-1",
        "balance": 1250.0,
        "billing_type": "POSTPAID",
        "dairy_name": "Amrut Dairy Farm"
    })
    assert cust_res.status_code == 200
    cust = cust_res.json()
    cust_id = cust["id"]
    assert cust["balance"] == 1250.0

    # 2. Create online payment order for partial due clearance (₹500)
    order_payload = {
        "customer_id": cust_id,
        "amount": 500.0,
        "dairy_name": "Amrut Dairy Farm",
        "notes": "Partial monthly milk dues payment via UPI"
    }
    order_res = client.post("/api/v1/payments/create-order", json=order_payload)
    assert order_res.status_code == 200
    order_data = order_res.json()
    assert order_data["amount"] == 500.0
    assert order_data["status"] == "PENDING"
    assert order_data["order_id"].startswith("order_rzp_")

    # 3. Verify payment success webhook / confirmation
    verify_payload = {
        "order_id": order_data["order_id"],
        "payment_id": "pay_test_9988776655",
        "signature": "simulated_razorpay_signature_abc123",
        "payment_method": "UPI",
        "notes": "Payment processed successfully via Google Pay"
    }
    verify_res = client.post("/api/v1/payments/verify", json=verify_payload)
    assert verify_res.status_code == 200
    tx = verify_res.json()
    assert tx["status"] == "SUCCESS"
    assert tx["gateway_payment_id"] == "pay_test_9988776655"

    # 4. Confirm customer balance is automatically reconciled: 1250 - 500 = 750
    updated_cust = client.get(f"/api/v1/customers/{cust_id}").json()
    assert updated_cust["balance"] == 750.0

    # 5. Fetch payment transaction history
    hist_res = client.get(f"/api/v1/payments/history?customer_id={cust_id}")
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert len(history) >= 1
    assert history[0]["gateway_order_id"] == order_data["order_id"]
    assert history[0]["status"] == "SUCCESS"


def test_prepaid_delinquency_delivery_generation():
    # Create prepaid customer with positive due balance (meaning zero/unpaid prepaid credit)
    prepaid_cust = client.post("/api/v1/customers", json={
        "name": "Sunita Mane",
        "customer_type": "HOUSEHOLD",
        "phone": "+91 97665 11223",
        "email": "sunita.mane@example.com",
        "address": "Flat 101, Lakeview Enclave",
        "area": "Aundh",
        "route": "Route A-1",
        "balance": 240.0,
        "billing_type": "PREPAID",
        "dairy_name": "Amrut Dairy Farm"
    }).json()

    # Create active subscription for this prepaid customer
    sub_res = client.post("/api/v1/subscriptions", json={
        "customer_id": prepaid_cust["id"],
        "customer_name": "Sunita Mane",
        "product_variant": "Buffalo Milk",
        "quantity_liters": 1.0,
        "frequency": "Daily",
        "time_slot": "Morning (6:00 AM - 7:30 AM)",
        "unit_price": 70.0,
        "dairy_name": "Amrut Dairy Farm"
    })
    assert sub_res.status_code == 200

    test_date = "2026-11-20"
    gen_res = client.post("/api/v1/deliveries/generate-daily", json={
        "delivery_date": test_date,
        "slot": "Morning"
    })
    assert gen_res.status_code == 200

    # Confirm that Sunita Mane was NOT scheduled because her prepaid account has unpaid dues
    tasks_res = client.get("/api/v1/deliveries/today").json()
    scheduled_names = [t["customer_name"] for t in tasks_res if t.get("delivery_date") == test_date]
    assert "Sunita Mane" not in scheduled_names
