import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_persistent_notifications():
    """Verify notifications can be fetched from database, marked read, and simulated."""
    # 1. Fetch notifications
    res = client.get("/api/v1/notifications")
    assert res.status_code == 200
    data = res.json()
    assert "notifications" in data
    assert "unread_count" in data
    assert "total_count" in data
    initial_total = data["total_count"]
    assert initial_total > 0

    # 2. Simulate new stock alert notification
    sim_res = client.post("/api/v1/notifications/simulate-event?event_type=STOCK")
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert sim_data["success"] is True
    notif_id = sim_data["created_notification"]["id"]

    # 3. Mark notification as read
    read_res = client.patch(f"/api/v1/notifications/{notif_id}/read")
    assert read_res.status_code == 200
    assert read_res.json()["is_read"] is True

def test_customer_bottle_deposit_tracking():
    """Verify empty glass bottle tracking and deposit liability calculations."""
    # 1. Get an existing customer
    custs_res = client.get("/api/v1/customers")
    assert custs_res.status_code == 200
    customers = custs_res.json()
    assert len(customers) > 0
    cust = customers[0]
    cust_id = cust["id"]

    # 2. Fetch initial bottle balance
    bottle_res = client.get(f"/api/v1/customers/{cust_id}/bottles")
    assert bottle_res.status_code == 200
    b_data = bottle_res.json()
    assert "bottle_balance" in b_data
    assert "deposit_rate" in b_data
    assert "total_deposit_liability" in b_data
    initial_bal = b_data["bottle_balance"]

    # 3. Log a delivery: 2 bottles dropped off, 1 empty returned
    log_res = client.post(
        f"/api/v1/customers/{cust_id}/bottles/log",
        json={
            "bottles_delivered": 2,
            "bottles_returned": 1,
            "notes": "Doorstep morning drop-off",
            "logged_by": "Rider Rahul",
        },
    )
    assert log_res.status_code == 200
    new_data = log_res.json()
    expected_bal = initial_bal + (2 - 1)
    assert new_data["bottle_balance"] == expected_bal
    assert new_data["total_deposit_liability"] == expected_bal * new_data["deposit_rate"]
    assert len(new_data["recent_logs"]) > 0

def test_procurement_rate_calculator():
    """Verify the Indian dairy two-axis Fat & SNF procurement pricing engine."""
    # 1. Premium Cow Milk Calculation (4.2% Fat, 8.6% SNF)
    res = client.post(
        "/api/v1/inventory/procurement-rate-calc",
        json={
            "milk_type": "COW",
            "fat_percentage": 4.2,
            "snf_percentage": 8.6,
            "quantity_liters": 200.0,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["milk_type"] == "COW"
    assert data["quality_grade"] == "PREMIUM"
    assert data["rate_per_liter"] > 25.0
    assert data["total_procurement_cost"] == round(data["rate_per_liter"] * 200.0, 2)
    assert data["ts_percentage"] == 12.8  # 4.2 + 8.6

    # 2. Substandard Buffalo Milk Calculation
    res_buf = client.post(
        "/api/v1/inventory/procurement-rate-calc",
        json={
            "milk_type": "BUFFALO",
            "fat_percentage": 5.0,  # Below Buffalo standard (6.0+)
            "snf_percentage": 8.2,
            "quantity_liters": 100.0,
        },
    )
    assert res_buf.status_code == 200
    buf_data = res_buf.json()
    assert buf_data["quality_grade"] == "SUBSTANDARD"

def test_route_tsp_optimization():
    """Verify 2-Opt Nearest-Neighbor TSP route optimization endpoint."""
    # Fetch available routes
    routes_res = client.get("/api/v1/routes")
    assert routes_res.status_code == 200
    routes = routes_res.json()
    assert len(routes) > 0
    target_route = routes[0]["route_code"]

    # Call TSP optimizer
    opt_res = client.post(f"/api/v1/routes/{target_route}/optimize-tsp")
    assert opt_res.status_code == 200
    opt_data = opt_res.json()
    assert "route_code" in opt_data
    assert "total_stops" in opt_data
    assert "estimated_distance_km" in opt_data
    assert "estimated_time_minutes" in opt_data
    assert opt_data["optimization_method"] == "2-Opt Nearest-Neighbor TSP"
    assert len(opt_data["stops"]) > 0
    # Stops should have sequential sequence_order starting from 1
    orders = [s["sequence_order"] for s in opt_data["stops"]]
    assert orders == list(range(1, len(orders) + 1))

def test_invoice_pdf_download():
    """Verify automated PDF Tax Invoice generation via ReportLab."""
    # 1. Fetch available invoices
    invs_res = client.get("/api/v1/invoices")
    assert invs_res.status_code == 200
    invoices = invs_res.json()
    assert len(invoices) > 0
    inv = invoices[0]
    inv_id = inv["id"]

    # 2. Download invoice PDF
    pdf_res = client.get(f"/api/v1/invoices/{inv_id}/pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert "attachment" in pdf_res.headers.get("content-disposition", "")
    assert pdf_res.content.startswith(b"%PDF-")  # Valid PDF magic bytes
    assert len(pdf_res.content) > 1000  # Non-trivial PDF size
