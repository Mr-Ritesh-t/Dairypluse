import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_month_end_whatsapp_reminders_flow():
    # 1. Create a test customer with outstanding balance
    cust_res = client.post("/api/v1/customers", json={
        "name": "Amit WhatsApp Test",
        "phone": "+91 98888 77777",
        "email": "amit.test@example.com",
        "address": "B-402, Green Acre Society",
        "area": "Kothrud",
        "route": "Route 2 - Kothrud",
        "customer_type": "HOUSEHOLD",
        "dairy_name": "DairyPulse Farm HQ"
    })
    assert cust_res.status_code == 200
    cust_id = cust_res.json()["id"]

    # 2. Add an extra milk delivery to create balance due
    delivery_res = client.post("/api/v1/deliveries", json={
        "customer_name": "Amit WhatsApp Test",
        "customer_phone": "+91 98888 77777",
        "address": "B-402, Green Acre Society",
        "area": "Kothrud",
        "product_variant": "Buffalo Milk",
        "quantity_liters": 2.0,
        "slot": "Morning (6:00 AM - 7:30 AM)",
        "assigned_rider": "Rahul Deshmukh",
        "status": "Assigned"
    })
    assert delivery_res.status_code == 200
    deliv_id = delivery_res.json()["id"]

    # Mark delivery as delivered (2L Buffalo Milk @ Rs 74 = Rs 148 due)
    client.patch(f"/api/v1/deliveries/{deliv_id}/status?status=Delivered")

    # 3. Test GET /api/v1/billing/monthly-due-reminders
    reminders_res = client.get("/api/v1/billing/monthly-due-reminders")
    assert reminders_res.status_code == 200
    data = reminders_res.json()
    assert data["total_customers_with_dues"] >= 1
    assert data["total_due_amount"] >= 148.0
    assert "upi_id" in data
    assert "customers" in data

    matched = [c for c in data["customers"] if c["customer_id"] == cust_id]
    assert len(matched) == 1
    item = matched[0]
    assert item["customer_name"] == "Amit WhatsApp Test"
    assert item["balance"] >= 148.0
    assert item["clean_phone"] == "919888877777"
    assert "wa.me/919888877777" in item["whatsapp_url"]
    assert "Namaste Amit WhatsApp Test ji" in item["message_text"]
    assert "upi://pay?pa=" in item["message_text"]

    # 4. Test POST single customer reminder /api/v1/billing/customers/{customer_id}/whatsapp-reminder
    single_res = client.post(f"/api/v1/billing/customers/{cust_id}/whatsapp-reminder")
    assert single_res.status_code == 200
    single_data = single_res.json()
    assert single_data["status"] == "success"
    assert single_data["last_reminder_sent"] is not None
    assert single_data["clean_phone"] == "919888877777"

    # 5. Test POST broadcast /api/v1/billing/broadcast-whatsapp-reminders
    broadcast_res = client.post("/api/v1/billing/broadcast-whatsapp-reminders", json={
        "billing_month": "November 2026",
        "customer_ids": [cust_id],
        "custom_note": "Please clear before 5th of the month"
    })
    assert broadcast_res.status_code == 200
    broadcast_data = broadcast_res.json()
    assert broadcast_data["status"] == "SUCCESS"
    assert broadcast_data["total_reminders"] == 1
    assert "broadcast_timestamp" in broadcast_data
    assert "Please clear before 5th" in broadcast_data["recipients"][0]["message"]

    # 6. Test settings update /api/v1/billing/settings/reminders
    settings_res = client.post("/api/v1/billing/settings/reminders", json={
        "upi_id": "amrutdairy@icici",
        "auto_reminders": True
    })
    assert settings_res.status_code == 200
    assert settings_res.json()["upi_id"] == "amrutdairy@icici"
    assert settings_res.json()["auto_reminders"] is True
