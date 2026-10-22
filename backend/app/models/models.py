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

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="OWNER")  # OWNER, STAFF, CUSTOMER
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Staff(Base):
    __tablename__ = "staff"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # Delivery Rider, Plant Operator, Manager
    phone = Column(String, nullable=False)
    assigned_area = Column(String, nullable=False)
    status = Column(String, default="On Duty")  # On Duty, Off Duty, On Leave
    deliveries_today = Column(Integer, default=0)
    rating = Column(Float, default=4.9)
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
    area = Column(String, nullable=False)
    product_variant = Column(String, nullable=False)
    quantity_liters = Column(Float, nullable=False)
    slot = Column(String, default="Morning")
    assigned_rider = Column(String, nullable=False)
    status = Column(String, default="Pending")  # Pending, In Progress, Delivered, Failed
    failed_reason = Column(String, nullable=True)
    delivered_at = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

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
