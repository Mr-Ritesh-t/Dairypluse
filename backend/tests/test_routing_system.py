import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_routes_list_and_dairy_filter():
    # 1. Fetch all routes
    res = client.get("/api/v1/routes")
    assert res.status_code == 200
    routes = res.json()
    assert isinstance(routes, list)
    assert len(routes) > 0

    # Ensure every route has route_code, name, area, and dairy_name
    for r in routes:
        assert "route_code" in r
        assert "name" in r
        assert "area" in r
        assert "dairy_name" in r

    # 2. Filter by dairy_name
    res_filtered = client.get("/api/v1/routes?dairy_name=Amrut%20Dairy%20Farm")
    assert res_filtered.status_code == 200
    filtered_routes = res_filtered.json()
    assert isinstance(filtered_routes, list)

def test_route_creation_and_assignment():
    # Create route
    test_code = "TEST-R-99"
    payload = {
        "route_code": test_code,
        "name": "Test Express Loop",
        "area": "Kalyani Nagar",
        "assigned_rider": "Amit Shinde",
        "slot": "Morning (6:00 AM - 7:30 AM)",
        "societies": "Aditi Garden, Kalyani Park",
        "max_capacity_liters": 55.0,
        "dairy_name": "Amrut Dairy Farm"
    }
    create_res = client.post("/api/v1/routes", json=payload)
    assert create_res.status_code == 200
    data = create_res.json()
    assert data["route_code"] == test_code
    assert data["dairy_name"] == "Amrut Dairy Farm"

    # Route assign by route_code
    assign_res = client.post("/api/v1/deliveries/route-assign", json={
        "route_code": test_code,
        "assigned_rider": "Rahul Deshmukh",
        "slot": "Morning (6:00 AM - 7:30 AM)"
    })
    assert assign_res.status_code == 200
    assign_data = assign_res.json()
    assert assign_data["success"] is True
    assert assign_data["assigned_rider"] == "Rahul Deshmukh"

def test_generate_daily_deliveries_links_route():
    gen_res = client.post("/api/v1/deliveries/generate-daily", json={
        "slot": "ALL"
    })
    assert gen_res.status_code == 200
    gen_data = gen_res.json()
    assert gen_data["success"] is True

    # Check today's deliveries
    deliv_res = client.get("/api/v1/deliveries/today")
    assert deliv_res.status_code == 200
    deliveries = deliv_res.json()
    assert len(deliveries) > 0
    # Ensure route field is present in response
    for d in deliveries:
        assert "route" in d
        assert "dairy_name" in d
