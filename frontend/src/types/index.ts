export type MilkVariant = 'Cow Milk' | 'Buffalo Milk' | 'Toned Milk' | 'Full Cream Milk' | 'A2 Desi Cow Milk' | (string & {});

export interface Product {
  id: string;
  name: string;
  variant: MilkVariant;
  unit: string;
  fatContent: number;
  snfContent: number;
  sellingPrice: number;
  costPrice: number;
  availableStock: number;
  lowStockThreshold: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  dairyName?: string;
}

export interface InventoryMovement {
  id: string;
  date: string;
  type: 'RECEIPT' | 'DISPATCH' | 'WASTAGE' | 'ADJUSTMENT';
  productVariant: MilkVariant;
  quantity: number;
  supplierOrBatch: string;
  ratePerLiter?: number;
  notes?: string;
  timestamp: string;
  dairyName?: string;
}

export interface Customer {
  id: string;
  name: string;
  type: 'HOUSEHOLD' | 'SHOP' | 'RESTAURANT';
  phone: string;
  email?: string;
  address: string;
  area: string;
  route: string;
  dairyName?: string;
  latitude?: number;
  longitude?: number;
  preferredTime?: string;
  balance: number;
  activeSubscriptionsCount: number;
  status: 'Active' | 'Paused' | 'Inactive';
  joinedDate: string;
}

export interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  productVariant: MilkVariant;
  quantityLiters: number;
  timeSlot: 'Morning (6:00 AM - 7:30 AM)' | 'Evening (5:30 PM - 7:00 PM)' | 'Both';
  frequency: 'Daily' | 'Alternate Days' | 'Weekdays';
  unitPrice: number;
  dairyName?: string;
  startDate: string;
  status: 'Active' | 'Paused' | 'Expired';
  pausedUntil?: string;
}

export interface ShopOrder {
  id: string;
  orderNumber: string;
  shopName: string;
  contactPerson: string;
  phone: string;
  dairyName?: string;
  orderDate: string;
  deliveryDate: string;
  status: 'Pending' | 'Dispatched' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Paid' | 'Partial' | 'Pending';
  totalAmount: number;
  paidAmount: number;
  items: {
    productVariant: MilkVariant;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }[];
}

export interface DeliveryTask {
  id: string;
  deliveryNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  address: string;
  flatOrUnit?: string;
  societyOrLandmark?: string;
  landmark?: string;
  area: string;
  dairyName?: string;
  productVariant: MilkVariant;
  quantityLiters: number;
  slot: 'Morning' | 'Evening' | (string & {});
  assignedRider: string;
  status: 'Pending' | 'Assigned' | 'Out for Delivery' | 'In Progress' | 'Delivered' | 'Failed';
  sequenceOrder?: number;
  deliveryDate?: string;
  isExtraOrder?: boolean;
  latitude?: number;
  longitude?: number;
  failedReason?: string;
  deliveredAt?: string;
  notes?: string;
  driverRating?: number;
  driverRatingFeedback?: string;
  ratedAt?: string;
}

export interface DriverRating {
  id: string;
  driverName: string;
  driverId?: string;
  customerId?: string;
  customerName: string;
  deliveryId?: string;
  rating: number; // 1 to 5
  tags?: string;
  feedback?: string;
  createdAt?: string;
}

export interface RouteInfo {
  id: string;
  routeCode: string;
  name: string;
  area: string;
  assignedRider: string;
  slot: string;
  societies?: string | string[];
  totalStops: number;
  totalLiters: number;
  maxCapacityLiters?: number;
  dairyName?: string;
}

export interface RouteCustomerStop {
  customerId: string;
  sequenceOrder: number;
  customSlot?: string;
}

export interface RouteBuildPayload {
  routeCode: string;
  name: string;
  area: string;
  assignedRider: string;
  slot?: string;
  societies?: string;
  maxCapacityLiters?: number;
  stops: RouteCustomerStop[];
  dairyName?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerType: 'HOUSEHOLD' | 'SHOP';
  billingPeriod: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  status: 'Paid' | 'Partial' | 'Unpaid' | 'Overdue';
  dairyName?: string;
}

export interface Expense {
  id: string;
  category: 'Cattle Feed' | 'Fuel & Transport' | 'Cold Storage Electricity' | 'Packaging Pouches' | 'Staff Salaries' | 'Veterinary & Healthcare' | 'Equipment Maintenance';
  amount: number;
  date: string;
  vendor: string;
  paymentMethod: 'UPI' | 'Cash' | 'Bank Transfer' | 'Cheque';
  notes?: string;
  dairyName?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Delivery Rider' | 'Dairy Plant Operator' | 'Quality Inspector' | 'Store Manager';
  phone: string;
  email?: string;
  password?: string;
  assignedArea: string;
  status: 'On Duty' | 'Off Duty' | 'On Leave';
  deliveriesToday: number;
  rating: number;
  joiningDate: string;
  dairyName?: string;
}

export type UserRole = 'OWNER' | 'DELIVERY' | 'CUSTOMER';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  loginId: string;
  phone?: string;
  email?: string;
  assignedAreaOrRoute?: string;
  customerId?: string;
  dairyName?: string;
  token?: string;
}

export interface DairyInfo {
  id: string;
  name: string;
  owner_name?: string;
  ownerName?: string;
  email: string;
  phone: string;
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  createdAt?: string;
  created_at?: string;
}

// ----------------- AI DEMAND FORECASTING TYPES -----------------
export interface VariantForecast {
  variant: string;
  active_subscriptions_liters: number;
  b2b_orders_liters: number;
  weekday_multiplier: number;
  total_predicted_demand: number;
  current_available_stock: number;
  safety_buffer_liters: number;
  net_shortage: number;
  suggested_procurement: number;
  unit_cost_estimate: number;
  estimated_procurement_cost: number;
}

export interface DailyTrendPoint {
  day: string;
  date: string;
  predicted_liters: number;
  actual_or_baseline_liters: number;
}

export interface DemandForecastResponse {
  target_date: string;
  target_day_name: string;
  total_predicted_demand: number;
  total_available_stock: number;
  total_shortage: number;
  total_suggested_procurement: number;
  total_estimated_cost: number;
  variants: VariantForecast[];
  seven_day_trend: DailyTrendPoint[];
  confidence_score: number;
  recommendations: string[];
}

// ----------------- WASTAGE INTELLIGENCE TYPES -----------------
export interface WastageByReason {
  reason: string;
  quantity_liters: number;
  percentage: number;
  financial_loss: number;
}

export interface WastageByVariant {
  variant: string;
  quantity_liters: number;
  percentage: number;
  financial_loss: number;
}

export interface WastageInsightsResponse {
  total_wastage_liters: number;
  total_procured_liters: number;
  wastage_rate_percentage: number;
  total_financial_loss: number;
  benchmark_status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  reasons_breakdown: WastageByReason[];
  variants_breakdown: WastageByVariant[];
  cost_trend_vs_last_week_percentage: number;
  mitigation_tips: string[];
}

// ----------------- ROUTE OPTIMIZATION TYPES -----------------
export interface OptimizedStop {
  stop_number: number;
  delivery_id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  area: string;
  product_variant: string;
  quantity_liters: number;
  slot: string;
  estimated_arrival: string;
  distance_from_prev_km: number;
}

export interface RouteOptimizationResponse {
  route_name: string;
  total_stops: number;
  original_distance_km: number;
  optimized_distance_km: number;
  distance_saved_km: number;
  original_time_mins: number;
  optimized_time_mins: number;
  time_saved_mins: number;
  fuel_saved_liters: number;
  stops: OptimizedStop[];
  traffic_density: string;
  is_applied: boolean;
}

// ----------------- CUSTOMER INSIGHTS & RETENTION TYPES -----------------
export interface CustomerInsightItem {
  id: string;
  name: string;
  type: 'HOUSEHOLD' | 'SHOP' | 'RESTAURANT';
  area: string;
  phone: string;
  status: string;
  category: 'TOP_BUYER' | 'AT_RISK' | 'OVERDUE' | 'HIGH_VOLUME_SHOP';
  metric_label: string;
  metric_value: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  recommended_action: string;
}

export interface CustomerInsightsResponse {
  total_customers: number;
  active_subscribers: number;
  retention_rate_percentage: number;
  at_risk_count: number;
  overdue_count: number;
  top_buyers_count: number;
  insights: CustomerInsightItem[];
  retention_tips: string[];
}

export interface SkipDeliveryPayload {
  skip_date: string;
  reason?: string;
}

export interface ModifyQuantityPayload {
  new_quantity_liters: number;
  effective_date: string;
  reason?: string;
}

export interface ExtraMilkPayload {
  extra_liters: number;
  date: string;
  variant?: string;
  notes?: string;
}

// ----------------- IN-APP NOTIFICATIONS TYPES -----------------
export type NotificationCategory = 'DELIVERY' | 'INVENTORY' | 'SUBSCRIPTION' | 'BILLING' | 'SYSTEM';
export type NotificationSeverity = 'INFO' | 'WARNING' | 'URGENT' | 'SUCCESS';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  timestamp: string;
  time_ago: string;
  is_read: boolean;
  action_url?: string;
  action_label?: string;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  unread_count: number;
  total_count: number;
}

// ----------------- OFFLINE DELIVERY SYNC TYPES -----------------
export interface OfflineDeliveryAction {
  delivery_id: string;
  status: 'Delivered' | 'Failed';
  notes?: string;
  bottles_returned?: number;
  cash_collected?: number;
  timestamp: string;
  client_action_id: string;
}

export interface DeliveryBatchSyncRequest {
  actions: OfflineDeliveryAction[];
  rider_id?: string;
  rider_name?: string;
  device_info?: string;
}

export interface DeliveryBatchSyncResponse {
  synced_count: number;
  success: boolean;
  server_timestamp: string;
  message: string;
  results: Array<{
    delivery_id: string;
    client_action_id: string;
    status: string;
    customer?: string;
    synced_status?: string;
  }>;
}




