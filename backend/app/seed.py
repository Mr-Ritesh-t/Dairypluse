import sys
from datetime import datetime
from app.database import engine, Base, SessionLocal
from app.models.models import (
    Dairy,
    User,
    Product,
    Customer,
    Subscription,
    Order,
    OrderItem,
    DeliveryTask,
    Route,
    Invoice,
    Expense,
    Staff,
    StockReceipt,
    InventoryTransaction,
    DriverRating,
)

def seed_database(clear_existing=True, db_session=None):
    if db_session is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        should_close = True
    else:
        db = db_session
        should_close = False

    if clear_existing:
        print("Clearing old data from all tables...")
        # Clear child tables first to respect foreign keys
        db.query(DriverRating).delete()
        db.query(OrderItem).delete()
        db.query(Order).delete()
        db.query(Subscription).delete()
        db.query(DeliveryTask).delete()
        db.query(Invoice).delete()
        db.query(StockReceipt).delete()
        db.query(InventoryTransaction).delete()
        db.query(Expense).delete()
        db.query(Customer).delete()
        db.query(Product).delete()
        db.query(Route).delete()
        db.query(Staff).delete()
        db.query(User).delete()
        db.query(Dairy).delete()
        db.commit()
        print("Old data wiped clean.")
    elif db.query(Product).first():
        print("Database already contains data and clear_existing is False. Skipping.")
        db.close()
        return

    today_str = datetime.utcnow().strftime("%Y-%m-%d")

    # 1. Multi-Dairy Farms
    print("Seeding Dairies...")
    d1 = Dairy(
        name="Amrut Dairy Farm",
        owner_name="Rajesh Sharma",
        email="admin@dairypulse.farm",
        phone="+91 98765 43210",
        city="Pune",
        address="Hadapsar Chilling Center, Pune",
        latitude=18.5089,
        longitude=73.9259,
        rating=4.9,
    )
    d2 = Dairy(
        name="Gokul Pure Milk Co.",
        owner_name="Suresh Patil",
        email="owner@gokul.com",
        phone="+91 98220 12345",
        city="Pune",
        address="Kothrud Depot, Pune",
        latitude=18.5074,
        longitude=73.8077,
        rating=4.8,
    )
    d3 = Dairy(
        name="Gir Organic Farms",
        owner_name="Mahesh Deshmukh",
        email="gir@dairy.com",
        phone="+91 97654 32109",
        city="Pune",
        address="Bavdhan Valley, Pune",
        latitude=18.5140,
        longitude=73.7710,
        rating=4.95,
    )
    db.add_all([d1, d2, d3])
    db.flush()

    # 2. System Users
    print("Seeding Users...")
    u_owner = User(
        email="admin@dairypulse.farm",
        phone="+91 98765 43210",
        password_hash="admin123",
        full_name="Rajesh Sharma",
        role="OWNER",
        dairy_name="Amrut Dairy Farm",
    )
    u_rider1 = User(
        email="rahul.rider@dairypulse.farm",
        phone="+91 98220 11984",
        password_hash="rider123",
        full_name="Rahul Deshmukh",
        role="DELIVERY",
        dairy_name="Amrut Dairy Farm",
    )
    u_cust = User(
        email="priya.kulkarni@gmail.com",
        phone="+91 94230 77812",
        password_hash="user123",
        full_name="Priya Kulkarni",
        role="CUSTOMER",
        dairy_name="Amrut Dairy Farm",
    )
    db.add_all([u_owner, u_rider1, u_cust])

    # 3. Staff & Delivery Fleet
    print("Seeding Staff...")
    st1 = Staff(
        name="Rahul Deshmukh",
        role="Delivery Rider",
        phone="+91 98220 11984",
        assigned_area="Baner & Wakad",
        dairy_name="Amrut Dairy Farm",
        status="On Duty",
        deliveries_today=24,
        rating=4.9,
        joining_date="2024-03-15",
    )
    st2 = Staff(
        name="Amit Shinde",
        role="Delivery Rider",
        phone="+91 94220 88712",
        assigned_area="Aundh & Wanowrie",
        dairy_name="Amrut Dairy Farm",
        status="On Duty",
        deliveries_today=18,
        rating=4.8,
        joining_date="2024-07-20",
    )
    st3 = Staff(
        name="Sachin Kamble",
        role="Delivery Rider",
        phone="+91 99210 33456",
        assigned_area="Kothrud & Hinjawadi",
        dairy_name="Gokul Pure Milk Co.",
        status="On Duty",
        deliveries_today=14,
        rating=4.7,
        joining_date="2025-01-10",
    )
    st4 = Staff(
        name="Ganesh More",
        role="Dairy Plant Operator",
        phone="+91 97630 44512",
        assigned_area="Central Processing Plant",
        dairy_name="Amrut Dairy Farm",
        status="On Duty",
        deliveries_today=0,
        rating=5.0,
        joining_date="2023-11-01",
    )
    db.add_all([st1, st2, st3, st4])
    db.flush()

    # 4. Milk Products & Varieties
    print("Seeding Products...")
    products = [
        Product(
            name="Fresh Cow Milk",
            variant="Cow Milk",
            fat_content=4.2,
            snf_content=8.5,
            selling_price=62.0,
            cost_price=48.0,
            available_stock=1420.0,
            low_stock_threshold=300.0,
            status="In Stock",
        ),
        Product(
            name="Pure Buffalo Milk",
            variant="Buffalo Milk",
            fat_content=7.0,
            snf_content=9.0,
            selling_price=78.0,
            cost_price=60.0,
            available_stock=890.0,
            low_stock_threshold=200.0,
            status="In Stock",
        ),
        Product(
            name="Homogenized Toned Milk",
            variant="Toned Milk",
            fat_content=3.0,
            snf_content=8.5,
            selling_price=54.0,
            cost_price=42.0,
            available_stock=650.0,
            low_stock_threshold=150.0,
            status="In Stock",
        ),
        Product(
            name="A2 Gir Cow Organic Milk",
            variant="A2 Desi Cow Milk",
            fat_content=4.5,
            snf_content=8.8,
            selling_price=95.0,
            cost_price=70.0,
            available_stock=220.0,
            low_stock_threshold=50.0,
            status="In Stock",
        ),
    ]
    db.add_all(products)
    db.flush()

    # 5. Delivery Routes (with Vehicle Capacities & Societies)
    print("Seeding Routes...")
    r1 = Route(
        route_code="R-04",
        name="Baner Morning Express",
        area="Baner",
        assigned_rider="Rahul Deshmukh",
        slot="Morning (6:00 AM - 7:30 AM)",
        societies="Rohan Nilay, Green Glen, Marvel Zephyr",
        total_stops=3,
        total_liters=4.5,
        max_capacity_liters=60.0,
    )
    r2 = Route(
        route_code="A-01",
        name="Aundh Heritage Loop",
        area="Aundh",
        assigned_rider="Amit Shinde",
        slot="Morning (6:00 AM - 7:30 AM)",
        societies="Sindh Society, Bremen Chowk, ITI Road",
        total_stops=1,
        total_liters=1.0,
        max_capacity_liters=60.0,
    )
    r3 = Route(
        route_code="K-02",
        name="Kothrud Western Line",
        area="Kothrud",
        assigned_rider="Sachin Kamble",
        slot="Morning (6:00 AM - 7:30 AM)",
        societies="Dahanukar Colony, Mayur Colony, Ideal Colony",
        total_stops=1,
        total_liters=1.0,
        max_capacity_liters=70.0,
    )
    r4 = Route(
        route_code="WK-03",
        name="Wakad Tech Corridor",
        area="Wakad",
        assigned_rider="Rahul Deshmukh",
        slot="Morning (6:00 AM - 7:30 AM)",
        societies="Mont Vert Tropez, Pride Purple, Datta Mandir Rd",
        total_stops=1,
        total_liters=2.0,
        max_capacity_liters=65.0,
    )
    r5 = Route(
        route_code="W-01",
        name="Wanowrie Green Circuit",
        area="Wanowrie",
        assigned_rider="Amit Shinde",
        slot="Morning (6:00 AM - 7:30 AM)",
        societies="Ganga Satellite, Salunke Vihar, Oxford Village",
        total_stops=1,
        total_liters=2.0,
        max_capacity_liters=60.0,
    )
    db.add_all([r1, r2, r3, r4, r5])
    db.flush()

    # 6. Customers with Doorstep Map Coordinates & Dairy Choices
    print("Seeding Customers...")
    c1 = Customer(
        name="Priya Kulkarni",
        customer_type="HOUSEHOLD",
        phone="+91 94230 77812",
        email="priya.kulkarni@gmail.com",
        address="Flat 402, Rohan Nilay, Baner Road",
        area="Baner",
        route="R-04",
        dairy_name="Amrut Dairy Farm",
        latitude=18.5593,
        longitude=73.7788,
        balance=0.0,
        status="Active",
    )
    c2 = Customer(
        name="Vikas More",
        customer_type="HOUSEHOLD",
        phone="+91 98231 55678",
        email="vikas.more@gmail.com",
        address="Flat C-502, Mont Vert Tropez, Datta Mandir Rd, Wakad",
        area="Wakad",
        route="WK-03",
        dairy_name="Amrut Dairy Farm",
        latitude=18.5987,
        longitude=73.7667,
        balance=0.0,
        status="Active",
    )
    c3 = Customer(
        name="Sneha Joshi",
        customer_type="HOUSEHOLD",
        phone="+91 98224 99182",
        email="sneha.joshi@outlook.com",
        address="Flat A-301, Sindh Society, Bremen Chowk, Aundh",
        area="Aundh",
        route="A-01",
        dairy_name="Gokul Pure Milk Co.",
        latitude=18.5602,
        longitude=73.8031,
        balance=0.0,
        status="Active",
    )
    c4 = Customer(
        name="Aniket Deshpande",
        customer_type="HOUSEHOLD",
        phone="+91 97651 88234",
        email="aniket.deshpande@yahoo.com",
        address="Flat 104, Mayur Colony, Ideal Colony Rd, Kothrud",
        area="Kothrud",
        route="K-02",
        dairy_name="Gir Organic Farms",
        latitude=18.5074,
        longitude=73.8077,
        balance=0.0,
        status="Active",
    )
    c5 = Customer(
        name="Rajesh Patil",
        customer_type="HOUSEHOLD",
        phone="+91 98901 33214",
        email="rajesh.patil@rediffmail.com",
        address="Flat B-12, Ganga Satellite, Salunke Vihar Rd, Wanowrie",
        area="Wanowrie",
        route="W-01",
        dairy_name="Amrut Dairy Farm",
        latitude=18.4851,
        longitude=73.8992,
        balance=-650.0,
        status="Active",
    )
    c6 = Customer(
        name="Sharma Sweets & Dairy",
        customer_type="SHOP",
        phone="+91 98221 44321",
        email="sharmasweets@gmail.com",
        address="Shop 14, Main Commercial Market, MG Road",
        area="Baner",
        route="R-04",
        dairy_name="Amrut Dairy Farm",
        latitude=18.5550,
        longitude=73.7820,
        balance=14200.0,
        status="Active",
    )
    c7 = Customer(
        name="Hotel Green Park & Cafe",
        customer_type="RESTAURANT",
        phone="+91 97654 22109",
        email="greenparkcafe@gmail.com",
        address="Plot 88, Near Highway Junction, Wakad",
        area="Wakad",
        route="WK-03",
        dairy_name="Amrut Dairy Farm",
        latitude=18.5950,
        longitude=73.7630,
        balance=28500.0,
        status="Active",
    )
    db.add_all([c1, c2, c3, c4, c5, c6, c7])
    db.flush()

    # 7. Subscriptions
    print("Seeding Subscriptions...")
    s1 = Subscription(
        customer_id=c1.id,
        customer_name=c1.name,
        product_variant="Cow Milk",
        quantity_liters=1.5,
        time_slot="Morning (6:00 AM - 7:30 AM)",
        frequency="Daily",
        unit_price=62.0,
        dairy_name="Amrut Dairy Farm",
        status="Active",
    )
    s2 = Subscription(
        customer_id=c2.id,
        customer_name=c2.name,
        product_variant="Cow Milk",
        quantity_liters=2.0,
        time_slot="Morning (6:00 AM - 7:30 AM)",
        frequency="Daily",
        unit_price=62.0,
        dairy_name="Amrut Dairy Farm",
        status="Active",
    )
    s3 = Subscription(
        customer_id=c3.id,
        customer_name=c3.name,
        product_variant="Cow Milk",
        quantity_liters=1.0,
        time_slot="Morning (6:00 AM - 7:30 AM)",
        frequency="Daily",
        unit_price=62.0,
        dairy_name="Gokul Pure Milk Co.",
        status="Active",
    )
    s4 = Subscription(
        customer_id=c4.id,
        customer_name=c4.name,
        product_variant="A2 Desi Cow Milk",
        quantity_liters=1.0,
        time_slot="Morning (6:00 AM - 7:30 AM)",
        frequency="Daily",
        unit_price=95.0,
        dairy_name="Gir Organic Farms",
        status="Active",
    )
    s5 = Subscription(
        customer_id=c5.id,
        customer_name=c5.name,
        product_variant="Buffalo Milk",
        quantity_liters=2.0,
        time_slot="Morning (6:00 AM - 7:30 AM)",
        frequency="Daily",
        unit_price=78.0,
        dairy_name="Amrut Dairy Farm",
        status="Active",
    )
    db.add_all([s1, s2, s3, s4, s5])
    db.flush()

    # 8. Delivery Tasks (Today's Live Dispatch with Coordinates & Status)
    print("Seeding Delivery Tasks...")
    d1 = DeliveryTask(
        delivery_number="DEL-2026-001",
        customer_name=c1.name,
        customer_phone=c1.phone,
        address=c1.address,
        flat_or_unit="Flat 402",
        society_or_landmark="Rohan Nilay",
        landmark="Near Main Security Gate",
        area=c1.area,
        product_variant="Cow Milk",
        quantity_liters=1.5,
        slot="Morning (6:00 AM - 7:30 AM)",
        assigned_rider="Rahul Deshmukh",
        status="Delivered",
        delivered_at="06:35",
        sequence_order=1,
        delivery_date=today_str,
        is_extra_order=False,
        latitude=18.5593,
        longitude=73.7788,
        notes="Ring bell once and leave in milk pouch bag",
    )
    d2 = DeliveryTask(
        delivery_number="DEL-2026-002",
        customer_name=c2.name,
        customer_phone=c2.phone,
        address=c2.address,
        flat_or_unit="Flat C-502",
        society_or_landmark="Mont Vert Tropez",
        landmark="Near Datta Mandir Bridge",
        area=c2.area,
        product_variant="Cow Milk",
        quantity_liters=2.0,
        slot="Morning (6:00 AM - 7:30 AM)",
        assigned_rider="Rahul Deshmukh",
        status="Out for Delivery",
        sequence_order=2,
        delivery_date=today_str,
        is_extra_order=False,
        latitude=18.5987,
        longitude=73.7667,
        notes="Door handle delivery bag",
    )
    d3 = DeliveryTask(
        delivery_number="DEL-2026-003",
        customer_name=c3.name,
        customer_phone=c3.phone,
        address=c3.address,
        flat_or_unit="Flat A-301",
        society_or_landmark="Sindh Society",
        landmark="Bremen Chowk",
        area=c3.area,
        product_variant="Cow Milk",
        quantity_liters=1.0,
        slot="Morning (6:00 AM - 7:30 AM)",
        assigned_rider="Amit Shinde",
        status="Assigned",
        sequence_order=3,
        delivery_date=today_str,
        is_extra_order=False,
        latitude=18.5602,
        longitude=73.8031,
        notes="Direct delivery to kitchen entrance",
    )
    d4 = DeliveryTask(
        delivery_number="DEL-2026-004",
        customer_name=c4.name,
        customer_phone=c4.phone,
        address=c4.address,
        flat_or_unit="Flat 104",
        society_or_landmark="Mayur Colony",
        landmark="Near Joggers Park",
        area=c4.area,
        product_variant="A2 Desi Cow Milk",
        quantity_liters=1.0,
        slot="Morning (6:00 AM - 7:30 AM)",
        assigned_rider="Sachin Kamble",
        status="Assigned",
        sequence_order=4,
        delivery_date=today_str,
        is_extra_order=False,
        latitude=18.5074,
        longitude=73.8077,
        notes="Handle glass bottle with care",
    )
    d5 = DeliveryTask(
        delivery_number="DEL-2026-005",
        customer_name=c5.name,
        customer_phone=c5.phone,
        address=c5.address,
        flat_or_unit="Flat B-12",
        society_or_landmark="Ganga Satellite",
        landmark="Near D-Mart Salunke Vihar",
        area=c5.area,
        product_variant="Buffalo Milk",
        quantity_liters=2.0,
        slot="Morning (6:00 AM - 7:30 AM)",
        assigned_rider="Amit Shinde",
        status="Assigned",
        sequence_order=5,
        delivery_date=today_str,
        is_extra_order=False,
        latitude=18.4851,
        longitude=73.8992,
        notes="Deliver at doorstep",
    )
    db.add_all([d1, d2, d3, d4, d5])
    db.flush()

    # 9. Shop B2B Orders
    print("Seeding Orders...")
    ord1 = Order(
        order_number="SO-1001",
        customer_id=c6.id,
        shop_name=c6.name,
        contact_person="Ramesh Sharma",
        phone=c6.phone,
        total_amount=9360.0,
        paid_amount=5000.0,
        status="Dispatched",
        payment_status="Partial",
    )
    ord2 = Order(
        order_number="SO-1002",
        customer_id=c7.id,
        shop_name=c7.name,
        contact_person="Sunil Shetty",
        phone=c7.phone,
        total_amount=3720.0,
        paid_amount=0.0,
        status="Pending",
        payment_status="Pending",
    )
    db.add_all([ord1, ord2])
    db.flush()

    item1 = OrderItem(
        order_id=ord1.id,
        product_variant="Buffalo Milk",
        quantity=120.0,
        unit="Liter",
        unit_price=78.0,
        line_total=9360.0,
    )
    item2 = OrderItem(
        order_id=ord2.id,
        product_variant="Cow Milk",
        quantity=60.0,
        unit="Liter",
        unit_price=62.0,
        line_total=3720.0,
    )
    db.add_all([item1, item2])

    # 10. Invoices & Billing
    print("Seeding Invoices...")
    inv1 = Invoice(
        invoice_number="INV-2026-001",
        customer_id=c6.id,
        customer_name=c6.name,
        customer_type="SHOP",
        billing_period="15 Oct - 22 Oct 2026",
        due_date="2026-10-30",
        total_amount=18720.0,
        paid_amount=10000.0,
        status="Partial",
    )
    inv2 = Invoice(
        invoice_number="INV-2026-002",
        customer_id=c1.id,
        customer_name=c1.name,
        customer_type="HOUSEHOLD",
        billing_period="01 Oct - 15 Oct 2026",
        due_date="2026-10-25",
        total_amount=2790.0,
        paid_amount=2790.0,
        status="Paid",
    )
    inv3 = Invoice(
        invoice_number="INV-2026-003",
        customer_id=c7.id,
        customer_name=c7.name,
        customer_type="SHOP",
        billing_period="10 Oct - 20 Oct 2026",
        due_date="2026-10-28",
        total_amount=7440.0,
        paid_amount=0.0,
        status="Unpaid",
    )
    db.add_all([inv1, inv2, inv3])

    # 11. Farm Expenses
    print("Seeding Expenses...")
    exp1 = Expense(
        category="Cattle Feed",
        amount=32000.0,
        date="2026-10-22",
        vendor="Godrej Agrovet Cattle Feeds",
        payment_method="Bank Transfer",
        notes="40 Bags High-Yield Dairy Pellet Feed",
    )
    exp2 = Expense(
        category="Cold Storage Electricity",
        amount=18450.0,
        date="2026-10-18",
        vendor="MSEDCL Maharashtra State Electricity",
        payment_method="Bank Transfer",
        notes="Chilling Plant & Cold Room Commercial Meter Bill",
    )
    exp3 = Expense(
        category="Packaging Pouches",
        amount=6800.0,
        date="2026-10-24",
        vendor="Shree Samarth Packaging Ltd",
        payment_method="UPI",
        notes="Food grade tamper-proof milk pouches (10,000 rolls)",
    )
    db.add_all([exp1, exp2, exp3])

    db.commit()
    if should_close:
        db.close()
    print("[SUCCESS] Fresh data seeded successfully with zero errors!")

if __name__ == "__main__":
    clear = "--keep" not in sys.argv
    seed_database(clear_existing=clear)


def seed_initial_data(db_session=None):
    """Safe auto-seed for cloud deployment (Supabase / Render). Only seeds if Product table is empty."""
    if db_session is None:
        db = SessionLocal()
        should_close = True
    else:
        db = db_session
        should_close = False

    try:
        if db.query(Product).count() == 0:
            print("[INFO] Fresh database detected. Auto-seeding initial catalog and records...")
            seed_database(clear_existing=False, db_session=db)
    except Exception as e:
        print("[WARN] Auto-seed check skipped or failed:", e)
    finally:
        if should_close:
            db.close()
