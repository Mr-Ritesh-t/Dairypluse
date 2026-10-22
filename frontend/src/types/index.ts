export type MilkVariant = 'Cow Milk' | 'Buffalo Milk' | 'Toned Milk' | 'Full Cream Milk' | 'A2 Desi Cow Milk';

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
  customerName: string;
  customerPhone: string;
  address: string;
  area: string;
  productVariant: MilkVariant;
  quantityLiters: number;
  slot: 'Morning' | 'Evening';
  assignedRider: string;
  status: 'Pending' | 'In Progress' | 'Delivered' | 'Failed';
  failedReason?: string;
  deliveredAt?: string;
  notes?: string;
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
}

export interface Expense {
  id: string;
  category: 'Cattle Feed' | 'Fuel & Transport' | 'Cold Storage Electricity' | 'Packaging Pouches' | 'Staff Salaries' | 'Veterinary & Healthcare' | 'Equipment Maintenance';
  amount: number;
  date: string;
  vendor: string;
  paymentMethod: 'UPI' | 'Cash' | 'Bank Transfer' | 'Cheque';
  notes?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Delivery Rider' | 'Dairy Plant Operator' | 'Quality Inspector' | 'Store Manager';
  phone: string;
  assignedArea: string;
  status: 'On Duty' | 'Off Duty' | 'On Leave';
  deliveriesToday: number;
  rating: number;
  joiningDate: string;
}
