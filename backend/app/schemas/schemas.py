from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class ProductBase(BaseModel):
    name: str
    variant: str
    unit: str = "Liter"
    fat_content: float
    snf_content: float
    selling_price: float
    cost_price: float
    available_stock: float = 0.0
    low_stock_threshold: float = 100.0
    status: str = "In Stock"

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class StockReceiptCreate(BaseModel):
    supplier_name: str
    variant: str
    quantity: float
    unit_cost: float
    notes: Optional[str] = None

class WastageCreate(BaseModel):
    variant: str
    quantity: float
    reason: str

class CustomerBase(BaseModel):
    name: str
    customer_type: str
    phone: str
    email: Optional[str] = None
    address: str
    area: str
    route: str
    balance: float = 0.0
    status: str = "Active"

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: str
    joined_date: str
    model_config = ConfigDict(from_attributes=True)

class SubscriptionCreate(BaseModel):
    customer_id: str
    customer_name: str
    product_variant: str
    quantity_liters: float
    time_slot: str = "Morning (6:00 AM - 7:30 AM)"
    frequency: str = "Daily"
    unit_price: float

class SubscriptionResponse(SubscriptionCreate):
    id: str
    start_date: str
    status: str
    paused_until: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class OrderItemSchema(BaseModel):
    product_variant: str
    quantity: float
    unit: str = "Liter"
    unit_price: float
    line_total: float
    model_config = ConfigDict(from_attributes=True)

class OrderCreate(BaseModel):
    shop_name: str
    contact_person: str
    phone: str
    total_amount: float
    items: List[OrderItemSchema]
    delivery_date: Optional[str] = None

class OrderResponse(BaseModel):
    id: str
    order_number: str
    shop_name: str
    contact_person: str
    phone: str
    order_date: str
    delivery_date: str
    status: str
    payment_status: str
    total_amount: float
    paid_amount: float
    items: List[OrderItemSchema] = []
    model_config = ConfigDict(from_attributes=True)

class DeliveryTaskResponse(BaseModel):
    id: str
    delivery_number: str
    customer_name: str
    customer_phone: str
    address: str
    area: str
    product_variant: str
    quantity_liters: float
    slot: str
    assigned_rider: str
    status: str
    delivered_at: Optional[str] = None
    failed_reason: Optional[str] = None
    notes: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class InvoiceCreate(BaseModel):
    customer_id: str
    billing_period: str
    total_amount: float
    due_date: str

class InvoiceResponse(BaseModel):
    id: str
    invoice_number: str
    customer_id: str
    customer_name: str
    customer_type: str
    billing_period: str
    issue_date: str
    due_date: str
    total_amount: float
    paid_amount: float
    status: str
    model_config = ConfigDict(from_attributes=True)

class PaymentRecord(BaseModel):
    amount: float

class ExpenseCreate(BaseModel):
    category: str
    amount: float
    vendor: str
    payment_method: str = "UPI"
    notes: Optional[str] = None

class ExpenseResponse(ExpenseCreate):
    id: str
    date: str
    model_config = ConfigDict(from_attributes=True)

class StaffResponse(BaseModel):
    id: str
    name: str
    role: str
    phone: str
    assigned_area: str
    status: str
    deliveries_today: int
    rating: float
    joining_date: str
    model_config = ConfigDict(from_attributes=True)
