from typing import Optional, List
from datetime import datetime
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

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    variant: Optional[str] = None
    unit: Optional[str] = None
    fat_content: Optional[float] = None
    snf_content: Optional[float] = None
    selling_price: Optional[float] = None
    cost_price: Optional[float] = None
    available_stock: Optional[float] = None
    low_stock_threshold: Optional[float] = None
    status: Optional[str] = None

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
    dairy_name: Optional[str] = "DairyPulse Farm HQ"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    preferred_time: Optional[str] = "6:00 AM - 7:30 AM"
    balance: float = 0.0
    status: str = "Active"

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: str
    joined_date: str
    model_config = ConfigDict(from_attributes=True)

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    area: Optional[str] = None
    route: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    preferred_time: Optional[str] = None

class SubscriptionCreate(BaseModel):
    customer_id: str
    customer_name: str
    product_variant: str
    quantity_liters: float
    time_slot: str = "Morning (6:00 AM - 7:30 AM)"
    frequency: str = "Daily"
    unit_price: float
    dairy_name: Optional[str] = "DairyPulse Farm HQ"

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

class DeliveryTaskCreate(BaseModel):
    customer_name: str
    customer_phone: str
    address: str
    flat_or_unit: Optional[str] = None
    society_or_landmark: Optional[str] = None
    landmark: Optional[str] = None
    area: str
    product_variant: str
    quantity_liters: float
    slot: str = "Morning"
    assigned_rider: str
    sequence_order: Optional[int] = 1
    delivery_date: Optional[str] = None
    is_extra_order: Optional[bool] = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notes: Optional[str] = None

class DeliveryAddressUpdate(BaseModel):
    address: Optional[str] = None
    flat_or_unit: Optional[str] = None
    society_or_landmark: Optional[str] = None
    landmark: Optional[str] = None
    area: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notes: Optional[str] = None

class DeliveryAssignRequest(BaseModel):
    assigned_rider: Optional[str] = None
    slot: Optional[str] = None
    area: Optional[str] = None
    status: Optional[str] = None
    sequence_order: Optional[int] = None

class RouteAssignRequest(BaseModel):
    area: str
    assigned_rider: str
    slot: Optional[str] = None

class StopOrderUpdate(BaseModel):
    id: str
    sequence_order: int

class ReorderStopsRequest(BaseModel):
    stops: List[StopOrderUpdate]

class DailyGenerationRequest(BaseModel):
    delivery_date: Optional[str] = None
    slot: Optional[str] = "ALL"

class RouteBase(BaseModel):
    route_code: str
    name: str
    area: str
    assigned_rider: str
    slot: str = "Morning (6:00 AM - 7:30 AM)"
    societies: Optional[str] = None
    total_stops: int = 0
    total_liters: float = 0.0
    max_capacity_liters: float = 60.0

class RouteCreate(RouteBase):
    pass

class RouteCustomerStop(BaseModel):
    customer_id: str
    sequence_order: int
    custom_slot: Optional[str] = None

class RouteBuildRequest(BaseModel):
    route_code: str
    name: str
    area: str
    assigned_rider: str
    slot: str = "Morning (6:00 AM - 7:30 AM)"
    societies: Optional[str] = None
    max_capacity_liters: float = 60.0
    stops: List[RouteCustomerStop] = []

class RouteResponse(RouteBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class DeliveryTaskResponse(BaseModel):
    id: str
    delivery_number: str
    customer_name: str
    customer_phone: str
    address: str
    flat_or_unit: Optional[str] = None
    society_or_landmark: Optional[str] = None
    landmark: Optional[str] = None
    area: str
    product_variant: str
    quantity_liters: float
    slot: str
    assigned_rider: str
    status: str
    sequence_order: Optional[int] = 1
    delivery_date: Optional[str] = None
    is_extra_order: Optional[bool] = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    delivered_at: Optional[str] = None
    failed_reason: Optional[str] = None
    notes: Optional[str] = None
    driver_rating: Optional[int] = None
    driver_rating_feedback: Optional[str] = None
    rated_at: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class DriverRatingCreate(BaseModel):
    driver_name: str
    driver_id: Optional[str] = None
    customer_id: Optional[str] = None
    customer_name: str
    delivery_id: Optional[str] = None
    rating: int  # 1 to 5
    tags: Optional[List[str]] = None
    feedback: Optional[str] = None

class DriverRatingResponse(BaseModel):
    id: str
    driver_name: str
    driver_id: Optional[str] = None
    customer_id: Optional[str] = None
    customer_name: str
    delivery_id: Optional[str] = None
    rating: int
    tags: Optional[str] = None
    feedback: Optional[str] = None
    created_at: Optional[datetime] = None
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
class StaffCreate(BaseModel):
    name: str
    role: str = "Delivery Rider"
    phone: str
    assigned_area: str
    status: str = "On Duty"
    deliveries_today: int = 0
    rating: float = 5.0
    joining_date: Optional[str] = None

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

class StaffUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    assigned_area: Optional[str] = None
    status: Optional[str] = None
    deliveries_today: Optional[int] = None
    rating: Optional[float] = None

class DairyCreate(BaseModel):
    name: str
    owner_name: str
    email: str
    phone: str
    city: str = "Pune"
    address: Optional[str] = None
    latitude: Optional[float] = 18.5520
    longitude: Optional[float] = 73.7880
    password: Optional[str] = "admin123"

class DairyUpdate(BaseModel):
    name: Optional[str] = None
    owner_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class DairyResponse(BaseModel):
    id: str
    name: str
    owner_name: str
    email: str
    phone: str
    city: str
    address: Optional[str] = None
    latitude: Optional[float] = 18.5520
    longitude: Optional[float] = 73.7880
    rating: float = 4.9
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class LoginRequest(BaseModel):
    login_id: str
    password: Optional[str] = None
    role: str = "OWNER"  # "OWNER", "DELIVERY", "CUSTOMER"

class AuthUserResponse(BaseModel):
    id: str
    name: str
    role: str
    login_id: str
    phone: Optional[str] = None
    email: Optional[str] = None
    assigned_area_or_route: Optional[str] = None
    customer_id: Optional[str] = None
    dairy_name: Optional[str] = "DairyPulse Farm HQ"
    token: str = "dairypulse_session_token"

# ----------------- AI DEMAND FORECASTING SCHEMAS -----------------
class VariantForecast(BaseModel):
    variant: str
    active_subscriptions_liters: float
    b2b_orders_liters: float
    weekday_multiplier: float
    total_predicted_demand: float
    current_available_stock: float
    safety_buffer_liters: float
    net_shortage: float
    suggested_procurement: float
    unit_cost_estimate: float
    estimated_procurement_cost: float

class DailyTrendPoint(BaseModel):
    day: str
    date: str
    predicted_liters: float
    actual_or_baseline_liters: float

class DemandForecastResponse(BaseModel):
    target_date: str
    target_day_name: str
    total_predicted_demand: float
    total_available_stock: float
    total_shortage: float
    total_suggested_procurement: float
    total_estimated_cost: float
    variants: List[VariantForecast]
    seven_day_trend: List[DailyTrendPoint]
    confidence_score: float
    recommendations: List[str]

# ----------------- WASTAGE INTELLIGENCE SCHEMAS -----------------
class WastageByReason(BaseModel):
    reason: str
    quantity_liters: float
    percentage: float
    financial_loss: float

class WastageByVariant(BaseModel):
    variant: str
    quantity_liters: float
    percentage: float
    financial_loss: float

class WastageInsightsResponse(BaseModel):
    total_wastage_liters: float
    total_procured_liters: float
    wastage_rate_percentage: float
    total_financial_loss: float
    benchmark_status: str  # "HEALTHY", "WARNING", "CRITICAL"
    reasons_breakdown: List[WastageByReason]
    variants_breakdown: List[WastageByVariant]
    cost_trend_vs_last_week_percentage: float
    mitigation_tips: List[str]

# ----------------- ROUTE OPTIMIZATION SCHEMAS -----------------
class OptimizedStop(BaseModel):
    stop_number: int
    delivery_id: str
    customer_name: str
    customer_phone: str
    address: str
    area: str
    product_variant: str
    quantity_liters: float
    slot: str
    estimated_arrival: str
    distance_from_prev_km: float

class RouteOptimizationResponse(BaseModel):
    route_name: str
    total_stops: int
    original_distance_km: float
    optimized_distance_km: float
    distance_saved_km: float
    original_time_mins: int
    optimized_time_mins: int
    time_saved_mins: int
    fuel_saved_liters: float
    stops: List[OptimizedStop]
    traffic_density: str
    is_applied: bool

# ----------------- FLEXIBLE SUBSCRIPTIONS & INSIGHTS SCHEMAS -----------------
class SkipDeliveryRequest(BaseModel):
    skip_date: str
    reason: Optional[str] = "Out of town / Personal"

class ModifyQuantityRequest(BaseModel):
    new_quantity_liters: float
    effective_date: str
    reason: Optional[str] = None

class ExtraMilkRequest(BaseModel):
    extra_liters: float
    date: str
    variant: Optional[str] = "Cow Milk"
    notes: Optional[str] = None

class CustomerInsightItem(BaseModel):
    id: str
    name: str
    type: str  # HOUSEHOLD, SHOP, RESTAURANT
    area: str
    phone: str
    status: str
    category: str  # "TOP_BUYER", "AT_RISK", "OVERDUE", "HIGH_VOLUME_SHOP"
    metric_label: str
    metric_value: str
    risk_level: str  # "LOW", "MEDIUM", "HIGH"
    recommended_action: str

class CustomerInsightsResponse(BaseModel):
    total_customers: int
    active_subscribers: int
    retention_rate_percentage: float
    at_risk_count: int
    overdue_count: int
    top_buyers_count: int
    insights: List[CustomerInsightItem]
    retention_tips: List[str]

# ----------------- OFFLINE DELIVERY SYNC SCHEMAS -----------------
class OfflineDeliveryAction(BaseModel):
    delivery_id: str
    status: str  # Delivered, Failed
    notes: Optional[str] = None
    bottles_returned: Optional[int] = 0
    cash_collected: Optional[float] = 0.0
    timestamp: str
    client_action_id: str

class DeliveryBatchSyncRequest(BaseModel):
    actions: List[OfflineDeliveryAction]
    rider_id: Optional[str] = "rider_1"
    rider_name: Optional[str] = "Rahul Deshmukh"
    device_info: Optional[str] = "PWA Mobile Client"

class DeliveryBatchSyncResponse(BaseModel):
    synced_count: int
    success: bool
    server_timestamp: str
    message: str
    results: List[dict]

# ----------------- IN-APP NOTIFICATIONS SCHEMAS -----------------
class NotificationItem(BaseModel):
    id: str
    title: str
    message: str
    category: str  # DELIVERY, INVENTORY, SUBSCRIPTION, BILLING, SYSTEM
    severity: str  # INFO, WARNING, URGENT, SUCCESS
    timestamp: str
    time_ago: str
    is_read: bool
    action_url: Optional[str] = None
    action_label: Optional[str] = None

class NotificationListResponse(BaseModel):
    notifications: List[NotificationItem]
    unread_count: int
    total_count: int

class NotificationCreateRequest(BaseModel):
    title: str
    message: str
    category: str
    severity: Optional[str] = "INFO"
    action_url: Optional[str] = None
    action_label: Optional[str] = None



