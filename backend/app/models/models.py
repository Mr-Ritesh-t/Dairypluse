import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    DateTime,
    ForeignKey,
    Boolean,
    Text,
)
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Dairy(Base):
    __tablename__ = "dairies"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    owner_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    city = Column(String, default="Pune")
    address = Column(String, nullable=True)
    latitude = Column(Float, nullable=True, default=18.5520)
    longitude = Column(Float, nullable=True, default=73.7880)
    rating = Column(Float, default=4.9)
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="OWNER")  # OWNER, STAFF, CUSTOMER
    dairy_name = Column(String, default="DairyPulse Farm HQ", nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Staff(Base):
    __tablename__ = "staff"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # Delivery Rider, Plant Operator, Manager
    phone = Column(String, nullable=False)
    email = Column(String, nullable=True)
    assigned_area = Column(String, nullable=False)
    dairy_name = Column(String, default="DairyPulse Farm HQ", nullable=True)
    status = Column(String, default="On Duty")  # On Duty, Off Duty, On Leave
    deliveries_today = Column(Integer, default=0)
    rating = Column(Float, default=4.9)
    daily_salary = Column(Float, default=500.0)
    pending_salary = Column(Float, default=0.0)
    total_salary_paid = Column(Float, default=0.0)
    joining_date = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    customer_type = Column(String, nullable=False)  # HOUSEHOLD, SHOP, RESTAURANT
    phone = Column(String, nullable=False)
    email = Column(String, nullable=True)
    address = Column(String, nullable=False)
    area = Column(String, nullable=False)
    route = Column(String, nullable=False)
    dairy_name = Column(String, default="DairyPulse Farm HQ", nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    preferred_time = Column(String, default="6:00 AM - 7:30 AM", nullable=True)
    balance = Column(Float, default=0.0)
    status = Column(String, default="Active")  # Active, Paused, Inactive
    joined_date = Column(String, default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))

    subscriptions = relationship("Subscription", back_populates="customer")
    orders = relationship("Order", back_populates="customer")
    invoices = relationship("Invoice", back_populates="customer")

class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    variant = Column(String, nullable=False)  # Cow Milk, Buffalo Milk, Toned Milk, A2 Desi Cow Milk
    unit = Column(String, default="Liter")
    fat_content = Column(Float, nullable=False)
    snf_content = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    cost_price = Column(Float, nullable=False)
    available_stock = Column(Float, default=0.0)
    low_stock_threshold = Column(Float, default=100.0)
    dairy_name = Column(String, default="DairyPulse Farm HQ", nullable=True)
    status = Column(String, default="In Stock")

class StockReceipt(Base):
    __tablename__ = "stock_receipts"

    id = Column(String, primary_key=True, default=generate_uuid)
    supplier_name = Column(String, nullable=False)
    receipt_date = Column(String, default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    variant = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    unit_cost = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id = Column(String, primary_key=True, default=generate_uuid)
    date = Column(String, default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    timestamp = Column(String, default=lambda: datetime.utcnow().strftime("%H:%M"))
    transaction_type = Column(String, nullable=False)  # RECEIPT, DISPATCH, WASTAGE, ADJUSTMENT
    product_variant = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    supplier_or_batch = Column(String, nullable=False)
    rate_per_liter = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String, primary_key=True, default=generate_uuid)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    customer_name = Column(String, nullable=False)
    product_variant = Column(String, nullable=False)
    quantity_liters = Column(Float, nullable=False)
    time_slot = Column(String, default="Morning (6:00 AM - 7:30 AM)")
    frequency = Column(String, default="Daily")
    unit_price = Column(Float, nullable=False)
    dairy_name = Column(String, default="DairyPulse Farm HQ", nullable=True)
    start_date = Column(String, default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    status = Column(String, default="Active")  # Active, Paused, Expired
    paused_until = Column(String, nullable=True)

    customer = relationship("Customer", back_populates="subscriptions")

class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=generate_uuid)
    order_number = Column(String, unique=True, nullable=False)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=True)
    shop_name = Column(String, nullable=False)
    contact_person = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    order_date = Column(String, default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    delivery_date = Column(String, default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    status = Column(String, default="Pending")  # Pending, Dispatched, Delivered, Cancelled
    payment_status = Column(String, default="Pending")  # Paid, Partial, Pending
    dairy_name = Column(String, default="DairyPulse Farm HQ", nullable=True)
    total_amount = Column(Float, default=0.0)
    paid_amount = Column(Float, default=0.0)

    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    product_variant = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String, default="Liter")
    unit_price = Column(Float, nullable=False)
    line_total = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")

class DeliveryTask(Base):
    __tablename__ = "delivery_tasks"

    id = Column(String, primary_key=True, default=generate_uuid)
    delivery_number = Column(String, unique=True, nullable=False)
    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)
    address = Column(String, nullable=False)
    flat_or_unit = Column(String, nullable=True)
    society_or_landmark = Column(String, nullable=True)
    landmark = Column(String, nullable=True)
    area = Column(String, nullable=False)
    product_variant = Column(String, nullable=False)
    quantity_liters = Column(Float, nullable=False)
    slot = Column(String, default="Morning")
    assigned_rider = Column(String, nullable=False)
    status = Column(String, default="Pending")  # Pending, Assigned, Out for Delivery, Delivered, Failed
    failed_reason = Column(String, nullable=True)
    delivered_at = Column(String, nullable=True)
    sequence_order = Column(Integer, default=1)
    delivery_date = Column(String, default=lambda: datetime.utcnow().strftime("%Y-%m-%d"), nullable=True)
    is_extra_order = Column(Boolean, default=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    driver_rating = Column(Integer, nullable=True)
    driver_rating_feedback = Column(Text, nullable=True)
    rated_at = Column(String, nullable=True)

class DriverRating(Base):
    __tablename__ = "driver_ratings"

    id = Column(String, primary_key=True, default=generate_uuid)
    driver_name = Column(String, nullable=False)
    driver_id = Column(String, nullable=True)
    customer_id = Column(String, nullable=True)
    customer_name = Column(String, nullable=False)
    delivery_id = Column(String, nullable=True)
    rating = Column(Integer, nullable=False)  # 1 to 5
    tags = Column(String, nullable=True)  # e.g. "On Time, Polite"
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Route(Base):
    __tablename__ = "routes"

    id = Column(String, primary_key=True, default=generate_uuid)
    route_code = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    area = Column(String, nullable=False)
    assigned_rider = Column(String, nullable=False)
    slot = Column(String, default="Morning (6:00 AM - 7:30 AM)")
    societies = Column(String, nullable=True)
    total_stops = Column(Integer, default=0)
    total_liters = Column(Float, default=0.0)
    max_capacity_liters = Column(Float, default=60.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String, primary_key=True, default=generate_uuid)
    invoice_number = Column(String, unique=True, nullable=False)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    customer_name = Column(String, nullable=False)
    customer_type = Column(String, default="HOUSEHOLD")
    billing_period = Column(String, nullable=False)
    issue_date = Column(String, default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    due_date = Column(String, nullable=False)
    total_amount = Column(Float, nullable=False)
    paid_amount = Column(Float, default=0.0)
    status = Column(String, default="Unpaid")  # Paid, Partial, Unpaid, Overdue

    customer = relationship("Customer", back_populates="invoices")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String, primary_key=True, default=generate_uuid)
    category = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(String, default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    vendor = Column(String, nullable=False)
    payment_method = Column(String, default="UPI")  # UPI, Cash, Bank Transfer, Cheque
    notes = Column(Text, nullable=True)

class StaffAttendance(Base):
    __tablename__ = "staff_attendance"

    id = Column(String, primary_key=True, default=generate_uuid)
    staff_id = Column(String, nullable=True)
    staff_name = Column(String, nullable=False)
    dairy_name = Column(String, default="DairyPulse Farm HQ", nullable=True)
    date = Column(String, default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))  # YYYY-MM-DD
    check_in_time = Column(String, nullable=True)  # e.g. "05:30 AM"
    status = Column(String, default="Present")  # Present, Late, Half Day
    pickup_confirmed = Column(Boolean, default=False)
    pickup_time = Column(String, nullable=True)  # e.g. "05:55 AM"
    pickup_liters = Column(Float, default=0.0)
    pickup_crates = Column(Integer, default=0)
    shift_completed = Column(Boolean, default=False)
    shift_completed_time = Column(String, nullable=True)
    deliveries_completed = Column(Integer, default=0)
    daily_salary_earned = Column(Float, default=0.0)
    salary_credited = Column(Boolean, default=False)
    payout_status = Column(String, default="PENDING")  # PENDING, PAID
    payout_id = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class StaffSalaryPayment(Base):
    __tablename__ = "staff_salary_payments"

    id = Column(String, primary_key=True, default=generate_uuid)
    staff_id = Column(String, nullable=False)
    staff_name = Column(String, nullable=False)
    dairy_name = Column(String, default="DairyPulse Farm HQ", nullable=True)
    amount = Column(Float, nullable=False)
    payment_date = Column(String, default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    payment_time = Column(String, nullable=True)
    payment_mode = Column(String, default="UPI")  # UPI, Cash, Bank Transfer
    reference_id = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
