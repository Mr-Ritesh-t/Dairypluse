from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
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
    StockReceipt,
    InventoryTransaction,
)
from app.schemas.schemas import (
    ProductResponse,
    StockReceiptCreate,
    WastageCreate,
    CustomerCreate,
    CustomerResponse,
    SubscriptionCreate,
    SubscriptionResponse,
    OrderCreate,
    OrderResponse,
    DeliveryTaskResponse,
    InvoiceCreate,
    InvoiceResponse,
    PaymentRecord,
    ExpenseCreate,
    ExpenseResponse,
    StaffResponse,
)

api_router = APIRouter()

# ----------------- DASHBOARD -----------------
@api_router.get("/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    deliveries = db.query(DeliveryTask).all()
    invoices = db.query(Invoice).all()
    orders = db.query(Order).limit(5).all()

    total_stock = sum(p.available_stock for p in products)
    delivered_count = sum(1 for d in deliveries if d.status == "Delivered")
    pending_dues = sum(inv.total_amount - inv.paid_amount for inv in invoices if inv.status != "Paid")

    return {
        "today_sales": 24850,
        "total_stock_liters": total_stock,
        "total_deliveries": len(deliveries),
        "delivered_count": delivered_count,
        "pending_payments": pending_dues,
        "products": [
            {
                "id": p.id,
                "variant": p.variant,
                "availableStock": p.available_stock,
                "status": p.status,
            }
            for p in products
        ],
        "recent_orders": [
            {
                "id": o.id,
                "orderNumber": o.order_number,
                "shopName": o.shop_name,
                "totalAmount": o.total_amount,
                "status": o.status,
            }
            for o in orders
        ],
    }

# ----------------- INVENTORY -----------------
@api_router.get("/inventory/products", response_model=List[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()

@api_router.get("/inventory/movements")
def get_movements(db: Session = Depends(get_db)):
    return db.query(InventoryTransaction).order_by(InventoryTransaction.id.desc()).all()

@api_router.post("/inventory/receipts")
def add_stock_receipt(receipt_data: StockReceiptCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.variant == receipt_data.variant).first()
    if not product:
        raise HTTPException(status_code=404, detail="Milk variant not found")

    # 1. Update stock
    product.available_stock += receipt_data.quantity
    product.status = "In Stock" if product.available_stock > product.low_stock_threshold else "Low Stock"

    # 2. Record movement
    now = datetime.utcnow()
    movement = InventoryTransaction(
        date=now.strftime("%Y-%m-%d"),
        timestamp=now.strftime("%H:%M"),
        transaction_type="RECEIPT",
        product_variant=receipt_data.variant,
        quantity=receipt_data.quantity,
        supplier_or_batch=receipt_data.supplier_name,
        rate_per_liter=receipt_data.unit_cost,
        notes=receipt_data.notes,
    )
    db.add(movement)
    db.commit()
    return {"message": "Stock receipt recorded successfully", "new_stock": product.available_stock}

@api_router.post("/inventory/wastage")
def record_wastage(wastage: WastageCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.variant == wastage.variant).first()
    if not product:
        raise HTTPException(status_code=404, detail="Milk variant not found")

    product.available_stock = max(0.0, product.available_stock - wastage.quantity)
    product.status = "In Stock" if product.available_stock > product.low_stock_threshold else "Low Stock"

    now = datetime.utcnow()
    movement = InventoryTransaction(
        date=now.strftime("%Y-%m-%d"),
        timestamp=now.strftime("%H:%M"),
        transaction_type="WASTAGE",
        product_variant=wastage.variant,
        quantity=wastage.quantity,
        supplier_or_batch=wastage.reason,
    )
    db.add(movement)
    db.commit()
    return {"message": "Wastage recorded successfully", "remaining_stock": product.available_stock}

# ----------------- CUSTOMERS -----------------
@api_router.get("/customers", response_model=List[CustomerResponse])
def get_customers(db: Session = Depends(get_db)):
    return db.query(Customer).all()

@api_router.post("/customers", response_model=CustomerResponse)
def create_customer(cust: CustomerCreate, db: Session = Depends(get_db)):
    new_cust = Customer(**cust.model_dump())
    db.add(new_cust)
    db.commit()
    db.refresh(new_cust)
    return new_cust

# ----------------- SUBSCRIPTIONS -----------------
@api_router.get("/subscriptions", response_model=List[SubscriptionResponse])
def get_subscriptions(db: Session = Depends(get_db)):
    return db.query(Subscription).all()

@api_router.post("/subscriptions", response_model=SubscriptionResponse)
def create_subscription(sub: SubscriptionCreate, db: Session = Depends(get_db)):
    new_sub = Subscription(**sub.dict())
    db.add(new_sub)
    db.commit()
    db.refresh(new_sub)
    return new_sub

@api_router.patch("/subscriptions/{sub_id}/toggle-pause")
def toggle_subscription_pause(sub_id: str, db: Session = Depends(get_db)):
    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    sub.status = "Paused" if sub.status == "Active" else "Active"
    db.commit()
    return {"status": sub.status}

# ----------------- ORDERS -----------------
@api_router.get("/orders", response_model=List[OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    return db.query(Order).all()

@api_router.post("/orders", response_model=OrderResponse)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    count = db.query(Order).count()
    order_num = f"SO-{1001 + count}"
    new_order = Order(
        order_number=order_num,
        shop_name=order_data.shop_name,
        contact_person=order_data.contact_person,
        phone=order_data.phone,
        total_amount=order_data.total_amount,
        status="Pending",
        payment_status="Pending",
    )
    db.add(new_order)
    db.flush()

    for item in order_data.items:
        order_item = OrderItem(
            order_id=new_order.id,
            product_variant=item.product_variant,
            quantity=item.quantity,
            unit=item.unit,
            unit_price=item.unit_price,
            line_total=item.line_total,
        )
        db.add(order_item)

    db.commit()
    db.refresh(new_order)
    return new_order

# ----------------- DELIVERIES -----------------
@api_router.get("/deliveries/today", response_model=List[DeliveryTaskResponse])
def get_deliveries(db: Session = Depends(get_db)):
    return db.query(DeliveryTask).all()

@api_router.patch("/deliveries/{delivery_id}/status")
def update_delivery_status(
    delivery_id: str,
    status: str,
    failure_reason: str = None,
    db: Session = Depends(get_db)
):
    deliv = db.query(DeliveryTask).filter(DeliveryTask.id == delivery_id).first()
    if not deliv:
        raise HTTPException(status_code=404, detail="Delivery task not found")
    deliv.status = status
    if status == "Delivered":
        deliv.delivered_at = datetime.utcnow().strftime("%H:%M")
    elif status == "Failed":
        deliv.failed_reason = failure_reason
    db.commit()
    return {"status": deliv.status, "delivered_at": deliv.delivered_at}

# ----------------- BILLING & INVOICES -----------------
@api_router.get("/invoices", response_model=List[InvoiceResponse])
def get_invoices(db: Session = Depends(get_db)):
    return db.query(Invoice).all()

@api_router.post("/invoices", response_model=InvoiceResponse)
def create_invoice(inv_data: InvoiceCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == inv_data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    count = db.query(Invoice).count()
    inv_num = f"INV-2026-{str(count + 89).padStart(3, '0') if hasattr(str, 'padStart') else str(count + 89).zfill(3)}"
    new_inv = Invoice(
        invoice_number=inv_num,
        customer_id=customer.id,
        customer_name=customer.name,
        customer_type=customer.customer_type,
        billing_period=inv_data.billing_period,
        due_date=inv_data.due_date,
        total_amount=inv_data.total_amount,
        paid_amount=0.0,
        status="Unpaid",
    )
    db.add(new_inv)
    db.commit()
    db.refresh(new_inv)
    return new_inv

@api_router.post("/invoices/{invoice_id}/payments")
def record_payment(invoice_id: str, payment: PaymentRecord, db: Session = Depends(get_db)):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    inv.paid_amount += payment.amount
    if inv.paid_amount >= inv.total_amount:
        inv.status = "Paid"
    elif inv.paid_amount > 0:
        inv.status = "Partial"

    db.commit()
    return {"status": inv.status, "paid_amount": inv.paid_amount, "balance": inv.total_amount - inv.paid_amount}

# ----------------- EXPENSES -----------------
@api_router.get("/expenses", response_model=List[ExpenseResponse])
def get_expenses(db: Session = Depends(get_db)):
    return db.query(Expense).all()

@api_router.post("/expenses", response_model=ExpenseResponse)
def create_expense(exp_data: ExpenseCreate, db: Session = Depends(get_db)):
    new_exp = Expense(**exp_data.model_dump())
    db.add(new_exp)
    db.commit()
    db.refresh(new_exp)
    return new_exp

# ----------------- STAFF -----------------
@api_router.get("/staff", response_model=List[StaffResponse])
def get_staff(db: Session = Depends(get_db)):
    return db.query(Staff).all()
