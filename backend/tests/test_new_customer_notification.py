import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_new_customer_notifies_owner():
    # 1. Fetch unread notifications count initially
    initial_notifs_res = client.get("/api/v1/notifications")
    assert initial_notifs_res.status_code == 200
    initial_count = initial_notifs_res.json()["total_count"]

    # 2. Add a new customer
    cust_res = client.post("/api/v1/customers", json={
        "name": "Kavita R. Patil",
        "phone": "+91 98223 99887",
        "email": "kavita.patil@example.com",
        "address": "Bldg 4, Flat 202, Palm Breeze",
        "area": "Baner Pashan Link Rd",
        "route": "Route 1 - Morning Baner",
        "customer_type": "HOUSEHOLD",
        "dairy_name": "Amrut Dairy Farm"
    })
    assert cust_res.status_code == 200
    cust_data = cust_res.json()
    cust_id = cust_data["id"]

    # 3. Verify in-app notification center automatically received the alert
    notifs_after_res = client.get("/api/v1/notifications")
    assert notifs_after_res.status_code == 200
    notifs_data = notifs_after_res.json()
    assert notifs_data["total_count"] == initial_count + 1

    top_notif = notifs_data["notifications"][0]
    assert "Kavita R. Patil" in top_notif["title"]
    assert "Kavita R. Patil" in top_notif["message"]
    assert "HOUSEHOLD" in top_notif["message"]
    assert top_notif["category"] == "SUBSCRIPTION"
    assert top_notif["severity"] == "SUCCESS"
    assert top_notif["is_read"] is False

    # 4. Verify /customers/{id}/notify-owner endpoint returns owner WhatsApp link and details
    owner_alert_res = client.post(f"/api/v1/customers/{cust_id}/notify-owner")
    assert owner_alert_res.status_code == 200
    alert_data = owner_alert_res.json()

    assert alert_data["customer_name"] == "Kavita R. Patil"
    assert alert_data["customer_phone"] == "+91 98223 99887"
    assert "wa.me/" in alert_data["owner_whatsapp_url"]
    assert "DairyPulse New Customer Alert" in alert_data["owner_whatsapp_message"]
    assert alert_data["dairy_name"] == "Amrut Dairy Farm"
