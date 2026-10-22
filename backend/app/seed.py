from app.database import engine, Base, SessionLocal
from app.models.models import (
    Product,
    Customer,
    Subscription,
    Order,
    OrderItem,
    DeliveryTask,
    Invoice,
    Expense,
    Staff,
    InventoryTransaction,
)

def seed_database():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(Product).first():
        print("Database already seeded.")
        db.close()
        return

    print("Seeding initial products...")
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
            available_stock=180.0,
            low_stock_threshold=50.0,
            status="Low Stock",
        ),
    ]
    db.add_all(products)
    db.flush()

    print("Seeding customers...")
    c1 = Customer(
        name="Sharma Sweets & Dairy",
        customer_type="SHOP",
        phone="+91 98221 44321",
        email="sharmasweets@gmail.com",
        address="Shop 14, Main Market, MG Road",
        area="Central Market",
        route="Route A - Commercial",
        balance=14200.0,
        status="Active",
    )
    c2 = Customer(
        name="Priya Kulkarni",
        customer_type="HOUSEHOLD",
        phone="+91 94230 77812",
        email="priya.kulkarni@gmail.com",
        address="Flat 402, Green Acre Residency, Baner",
        area="Baner",
        route="Route 1 - Morning Baner",
        balance=0.0,
        status="Active",
    )
    c3 = Customer(
        name="Rajesh Patil",
        customer_type="HOUSEHOLD",
        phone="+91 98901 33214",
        address="B-12, Ganga Satellite, Wanowrie",
        area="Wanowrie",
        route="Route 2 - Camp & Wanowrie",
        balance=-650.0,
        status="Active",
    )
    c4 = Customer(
        name="Hotel Green Park & Cafe",
        customer_type="RESTAURANT",
        phone="+91 97654 22109",
        address="Plot 88, Near Highway Junction, Wakad",
        area="Wakad",
        route="Route B - Commercial Bulk",
        balance=28500.0,
        status="Active",
    )
    db.add_all([c1, c2, c3, c4])
    db.flush()

    print("Seeding subscriptions...")
    s1 = Subscription(
        customer_id=c2.id,
        customer_name=c2.name,
        product_variant="Cow Milk",
        quantity_liters=1.5,
        time_slot="Morning (6:00 AM - 7:30 AM)",
        unit_price=62.0,
        status="Active",
    )
    s2 = Subscription(
        customer_id=c3.id,
        customer_name=c3.name,
        product_variant="Buffalo Milk",
        quantity_liters=2.0,
        time_slot="Morning (6:00 AM - 7:30 AM)",
        unit_price=78.0,
        status="Active",
    )
    db.add_all([s1, s2])

    print("Seeding delivery tasks...")
    d1 = DeliveryTask(
        delivery_number="DEL-2026-01",
        customer_name=c2.name,
        customer_phone=c2.phone,
        address=c2.address,
        area=c2.area,
        product_variant="Cow Milk",
        quantity_liters=1.5,
        slot="Morning",
        assigned_rider="Rahul Deshmukh",
        status="Delivered",
        delivered_at="06:42",
        notes="Left at doorstep milk bag ring",
    )
    d2 = DeliveryTask(
        delivery_number="DEL-2026-02",
        customer_name=c3.name,
        customer_phone=c3.phone,
        address=c3.address,
        area=c3.area,
        product_variant="Buffalo Milk",
        quantity_liters=2.0,
        slot="Morning",
        assigned_rider="Amit Shinde",
        status="Delivered",
        delivered_at="06:55",
    )
    d3 = DeliveryTask(
        delivery_number="DEL-2026-03",
        customer_name=c1.name,
        customer_phone=c1.phone,
        address=c1.address,
        area=c1.area,
        product_variant="Buffalo Milk",
        quantity_liters=120.0,
        slot="Morning",
        assigned_rider="Rahul Deshmukh",
        status="In Progress",
        notes="2 Cans of 60L each",
    )
    db.add_all([d1, d2, d3])

    print("Seeding shop orders...")
    ord1 = Order(
        order_number="SO-1001",
        customer_id=c1.id,
        shop_name=c1.name,
        contact_person="Ramesh Sharma",
        phone=c1.phone,
        total_amount=9360.0,
        paid_amount=5000.0,
        status="Dispatched",
        payment_status="Partial",
    )
    db.add(ord1)
    db.flush()

    item1 = OrderItem(
        order_id=ord1.id,
        product_variant="Buffalo Milk",
        quantity=120.0,
        unit="Liter",
        unit_price=78.0,
        line_total=9360.0,
    )
    db.add(item1)

    print("Seeding invoices...")
    inv1 = Invoice(
        invoice_number="INV-2026-089",
        customer_id=c1.id,
        customer_name=c1.name,
        customer_type="SHOP",
        billing_period="15 Oct - 22 Oct 2026",
        due_date="2026-10-29",
        total_amount=28500.0,
        paid_amount=14300.0,
        status="Partial",
    )
    inv2 = Invoice(
        invoice_number="INV-2026-088",
        customer_id=c2.id,
        customer_name=c2.name,
        customer_type="HOUSEHOLD",
        billing_period="01 Oct - 15 Oct 2026",
        due_date="2026-10-23",
        total_amount=2790.0,
        paid_amount=2790.0,
        status="Paid",
    )
    db.add_all([inv1, inv2])

    print("Seeding staff...")
    st1 = Staff(
        name="Rahul Deshmukh",
        role="Delivery Rider",
        phone="+91 98220 11984",
        assigned_area="Baner & Central Market",
        status="On Duty",
        deliveries_today=24,
        rating=4.9,
        joining_date="2024-03-15",
    )
    st2 = Staff(
        name="Amit Shinde",
        role="Delivery Rider",
        phone="+91 94220 88712",
        assigned_area="Camp & Wanowrie",
        status="On Duty",
        deliveries_today=18,
        rating=4.8,
        joining_date="2024-07-20",
    )
    db.add_all([st1, st2])

    print("Seeding expenses...")
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
    db.add_all([exp1, exp2])

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
