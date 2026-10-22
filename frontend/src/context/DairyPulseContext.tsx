'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  InventoryMovement,
  Customer,
  Subscription,
  ShopOrder,
  DeliveryTask,
  Invoice,
  Expense,
  StaffMember,
  MilkVariant,
} from '@/types';

interface DairyPulseContextType {
  products: Product[];
  movements: InventoryMovement[];
  customers: Customer[];
  subscriptions: Subscription[];
  shopOrders: ShopOrder[];
  deliveries: DeliveryTask[];
  invoices: Invoice[];
  expenses: Expense[];
  staff: StaffMember[];
  
  // Modals state
  activeModal: string | null;
  openModal: (name: string) => void;
  closeModal: () => void;

  // Actions
  addStockReceipt: (variant: MilkVariant, quantity: number, supplier: string, rate: number, notes?: string) => void;
  recordWastage: (variant: MilkVariant, quantity: number, reason: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'joinedDate'>) => void;
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  toggleSubscriptionPause: (id: string) => void;
  addShopOrder: (order: Omit<ShopOrder, 'id' | 'orderNumber'>) => void;
  updateDeliveryStatus: (id: string, status: DeliveryTask['status'], failureReason?: string) => void;
  generateInvoice: (customerId: string, amount: number, period: string) => void;
  recordPayment: (invoiceId: string, amount: number) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
}

const initialProducts: Product[] = [
  {
    id: 'p1',
    name: 'Fresh Cow Milk',
    variant: 'Cow Milk',
    unit: 'Liter',
    fatContent: 4.2,
    snfContent: 8.5,
    sellingPrice: 62,
    costPrice: 48,
    availableStock: 1420,
    lowStockThreshold: 300,
    status: 'In Stock',
  },
  {
    id: 'p2',
    name: 'Pure Buffalo Milk',
    variant: 'Buffalo Milk',
    unit: 'Liter',
    fatContent: 7.0,
    snfContent: 9.0,
    sellingPrice: 78,
    costPrice: 60,
    availableStock: 890,
    lowStockThreshold: 200,
    status: 'In Stock',
  },
  {
    id: 'p3',
    name: 'Homogenized Toned Milk',
    variant: 'Toned Milk',
    unit: 'Liter',
    fatContent: 3.0,
    snfContent: 8.5,
    sellingPrice: 54,
    costPrice: 42,
    availableStock: 650,
    lowStockThreshold: 150,
    status: 'In Stock',
  },
  {
    id: 'p4',
    name: 'A2 Gir Cow Organic Milk',
    variant: 'A2 Desi Cow Milk',
    unit: 'Liter',
    fatContent: 4.5,
    snfContent: 8.8,
    sellingPrice: 95,
    costPrice: 70,
    availableStock: 180,
    lowStockThreshold: 50,
    status: 'Low Stock',
  },
];

const initialMovements: InventoryMovement[] = [
  {
    id: 'm1',
    date: '2026-10-23',
    type: 'RECEIPT',
    productVariant: 'Cow Milk',
    quantity: 850,
    supplierOrBatch: 'Sahyadri Farmers Dairy Co-Op',
    ratePerLiter: 48,
    notes: 'Morning batch intake (Temp: 4.2°C)',
    timestamp: '05:30 AM',
  },
  {
    id: 'm2',
    date: '2026-10-23',
    type: 'RECEIPT',
    productVariant: 'Buffalo Milk',
    quantity: 500,
    supplierOrBatch: 'Baramati Agro Chilling Center',
    ratePerLiter: 60,
    notes: 'FAT: 7.1%, SNF: 9.2%',
    timestamp: '05:45 AM',
  },
  {
    id: 'm3',
    date: '2026-10-23',
    type: 'DISPATCH',
    productVariant: 'Cow Milk',
    quantity: 420,
    supplierOrBatch: 'Route 1 & Route 2 Household Morning Runs',
    timestamp: '06:15 AM',
  },
  {
    id: 'm4',
    date: '2026-10-23',
    type: 'WASTAGE',
    productVariant: 'Cow Milk',
    quantity: 4.5,
    supplierOrBatch: 'Pouch packaging line calibration loss',
    timestamp: '06:40 AM',
  },
];

const initialCustomers: Customer[] = [
  {
    id: 'c1',
    name: 'Sharma Sweets & Dairy',
    type: 'SHOP',
    phone: '+91 98221 44321',
    email: 'sharmasweets@gmail.com',
    address: 'Shop 14, Main Market, MG Road',
    area: 'Central Market',
    route: 'Route A - Commercial',
    balance: 14200,
    activeSubscriptionsCount: 0,
    status: 'Active',
    joinedDate: '2025-06-15',
  },
  {
    id: 'c2',
    name: 'Priya Kulkarni',
    type: 'HOUSEHOLD',
    phone: '+91 94230 77812',
    email: 'priya.kulkarni@gmail.com',
    address: 'Flat 402, Green Acre Residency, Baner',
    area: 'Baner',
    route: 'Route 1 - Morning Baner',
    balance: 0,
    activeSubscriptionsCount: 1,
    status: 'Active',
    joinedDate: '2025-09-10',
  },
  {
    id: 'c3',
    name: 'Rajesh Patil',
    type: 'HOUSEHOLD',
    phone: '+91 98901 33214',
    address: 'B-12, Ganga Satellite, Wanowrie',
    area: 'Wanowrie',
    route: 'Route 2 - Camp & Wanowrie',
    balance: -650, // Advance credit
    activeSubscriptionsCount: 1,
    status: 'Active',
    joinedDate: '2025-11-04',
  },
  {
    id: 'c4',
    name: 'Hotel Green Park & Cafe',
    type: 'RESTAURANT',
    phone: '+91 97654 22109',
    address: 'Plot 88, Near Highway Junction, Wakad',
    area: 'Wakad',
    route: 'Route B - Commercial Bulk',
    balance: 28500,
    activeSubscriptionsCount: 0,
    status: 'Active',
    joinedDate: '2026-01-18',
  },
  {
    id: 'c5',
    name: 'Ananya Deshmukh',
    type: 'HOUSEHOLD',
    phone: '+91 99234 55678',
    address: 'Villa 7, Clover Highlands, NIBM',
    area: 'NIBM',
    route: 'Route 3 - South Hub',
    balance: 1240,
    activeSubscriptionsCount: 1,
    status: 'Paused',
    joinedDate: '2026-02-12',
  },
];

const initialSubscriptions: Subscription[] = [
  {
    id: 'sub1',
    customerId: 'c2',
    customerName: 'Priya Kulkarni',
    productVariant: 'Cow Milk',
    quantityLiters: 1.5,
    timeSlot: 'Morning (6:00 AM - 7:30 AM)',
    frequency: 'Daily',
    unitPrice: 62,
    startDate: '2025-09-15',
    status: 'Active',
  },
  {
    id: 'sub2',
    customerId: 'c3',
    customerName: 'Rajesh Patil',
    productVariant: 'Buffalo Milk',
    quantityLiters: 2.0,
    timeSlot: 'Morning (6:00 AM - 7:30 AM)',
    frequency: 'Daily',
    unitPrice: 78,
    startDate: '2025-11-10',
    status: 'Active',
  },
  {
    id: 'sub3',
    customerId: 'c5',
    customerName: 'Ananya Deshmukh',
    productVariant: 'A2 Desi Cow Milk',
    quantityLiters: 1.0,
    timeSlot: 'Morning (6:00 AM - 7:30 AM)',
    frequency: 'Daily',
    unitPrice: 95,
    startDate: '2026-02-15',
    status: 'Paused',
    pausedUntil: '2026-10-28',
  },
];

const initialShopOrders: ShopOrder[] = [
  {
    id: 'ord1',
    orderNumber: 'SO-1001',
    shopName: 'Sharma Sweets & Dairy',
    contactPerson: 'Ramesh Sharma',
    phone: '+91 98221 44321',
    orderDate: '2026-10-23',
    deliveryDate: '2026-10-23',
    status: 'Dispatched',
    paymentStatus: 'Partial',
    totalAmount: 9360,
    paidAmount: 5000,
    items: [
      { productVariant: 'Buffalo Milk', quantity: 120, unit: 'Liter', unitPrice: 78, total: 9360 },
    ],
  },
  {
    id: 'ord2',
    orderNumber: 'SO-1002',
    shopName: 'Hotel Green Park & Cafe',
    contactPerson: 'Chef Anand',
    phone: '+91 97654 22109',
    orderDate: '2026-10-23',
    deliveryDate: '2026-10-23',
    status: 'Pending',
    paymentStatus: 'Pending',
    totalAmount: 12400,
    paidAmount: 0,
    items: [
      { productVariant: 'Cow Milk', quantity: 200, unit: 'Liter', unitPrice: 62, total: 12400 },
    ],
  },
];

const initialDeliveries: DeliveryTask[] = [
  {
    id: 'd1',
    deliveryNumber: 'DEL-2026-01',
    customerName: 'Priya Kulkarni',
    customerPhone: '+91 94230 77812',
    address: 'Flat 402, Green Acre Residency, Baner',
    area: 'Baner',
    productVariant: 'Cow Milk',
    quantityLiters: 1.5,
    slot: 'Morning',
    assignedRider: 'Rahul Deshmukh',
    status: 'Delivered',
    deliveredAt: '06:42 AM',
    notes: 'Left at doorstep milk bag ring',
  },
  {
    id: 'd2',
    deliveryNumber: 'DEL-2026-02',
    customerName: 'Rajesh Patil',
    customerPhone: '+91 98901 33214',
    address: 'B-12, Ganga Satellite, Wanowrie',
    area: 'Wanowrie',
    productVariant: 'Buffalo Milk',
    quantityLiters: 2.0,
    slot: 'Morning',
    assignedRider: 'Amit Shinde',
    status: 'Delivered',
    deliveredAt: '06:55 AM',
  },
  {
    id: 'd3',
    deliveryNumber: 'DEL-2026-03',
    customerName: 'Sharma Sweets & Dairy',
    customerPhone: '+91 98221 44321',
    address: 'Shop 14, Main Market, MG Road',
    area: 'Central Market',
    productVariant: 'Buffalo Milk',
    quantityLiters: 120,
    slot: 'Morning',
    assignedRider: 'Rahul Deshmukh',
    status: 'In Progress',
    notes: '2 Cans of 60L each',
  },
  {
    id: 'd4',
    deliveryNumber: 'DEL-2026-04',
    customerName: 'Hotel Green Park & Cafe',
    customerPhone: '+91 97654 22109',
    address: 'Plot 88, Near Highway Junction, Wakad',
    area: 'Wakad',
    productVariant: 'Cow Milk',
    quantityLiters: 200,
    slot: 'Morning',
    assignedRider: 'Sachin Kamble',
    status: 'Pending',
    notes: 'Scheduled for 08:30 AM delivery slot',
  },
];

const initialInvoices: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-2026-089',
    customerId: 'c1',
    customerName: 'Sharma Sweets & Dairy',
    customerType: 'SHOP',
    billingPeriod: '15 Oct - 22 Oct 2026',
    issueDate: '2026-10-22',
    dueDate: '2026-10-29',
    totalAmount: 28500,
    paidAmount: 14300,
    status: 'Partial',
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV-2026-088',
    customerId: 'c2',
    customerName: 'Priya Kulkarni',
    customerType: 'HOUSEHOLD',
    billingPeriod: '01 Oct - 15 Oct 2026',
    issueDate: '2026-10-16',
    dueDate: '2026-10-23',
    totalAmount: 2790,
    paidAmount: 2790,
    status: 'Paid',
  },
  {
    id: 'inv3',
    invoiceNumber: 'INV-2026-087',
    customerId: 'c4',
    customerName: 'Hotel Green Park & Cafe',
    customerType: 'SHOP',
    billingPeriod: '01 Oct - 15 Oct 2026',
    issueDate: '2026-10-16',
    dueDate: '2026-10-23',
    totalAmount: 48000,
    paidAmount: 19500,
    status: 'Overdue',
  },
];

const initialExpenses: Expense[] = [
  {
    id: 'e1',
    category: 'Cattle Feed',
    amount: 32000,
    date: '2026-10-22',
    vendor: 'Godrej Agrovet Cattle Feeds',
    paymentMethod: 'Bank Transfer',
    notes: '40 Bags High-Yield Dairy Cattle Pellet Feed',
  },
  {
    id: 'e2',
    category: 'Fuel & Transport',
    amount: 4500,
    date: '2026-10-21',
    vendor: 'Indian Oil Petrol Pump, Highway',
    paymentMethod: 'UPI',
    notes: 'Diesel for delivery bolero pickup van #1 and #2',
  },
  {
    id: 'e3',
    category: 'Packaging Pouches',
    amount: 11200,
    date: '2026-10-20',
    vendor: 'Shree Polyfilms & Packaging',
    paymentMethod: 'UPI',
    notes: '20,000 Food-Grade Virgin Milk Pouches 500ml/1000ml',
  },
  {
    id: 'e4',
    category: 'Cold Storage Electricity',
    amount: 18450,
    date: '2026-10-18',
    vendor: 'MSEDCL Maharashtra State Electricity',
    paymentMethod: 'Bank Transfer',
    notes: 'Chilling Plant & Cold Room Commercial Meter Bill',
  },
];

const initialStaff: StaffMember[] = [
  {
    id: 'st1',
    name: 'Rahul Deshmukh',
    role: 'Delivery Rider',
    phone: '+91 98220 11984',
    assignedArea: 'Baner & Central Market',
    status: 'On Duty',
    deliveriesToday: 24,
    rating: 4.9,
    joiningDate: '2024-03-15',
  },
  {
    id: 'st2',
    name: 'Amit Shinde',
    role: 'Delivery Rider',
    phone: '+91 94220 88712',
    assignedArea: 'Camp & Wanowrie',
    status: 'On Duty',
    deliveriesToday: 18,
    rating: 4.8,
    joiningDate: '2024-07-20',
  },
  {
    id: 'st3',
    name: 'Sachin Kamble',
    role: 'Delivery Rider',
    phone: '+91 99210 33456',
    assignedArea: 'Wakad & Hinjawadi',
    status: 'On Duty',
    deliveriesToday: 14,
    rating: 4.7,
    joiningDate: '2025-01-10',
  },
  {
    id: 'st4',
    name: 'Ganesh More',
    role: 'Dairy Plant Operator',
    phone: '+91 97630 44512',
    assignedArea: 'Central Processing Plant',
    status: 'On Duty',
    deliveriesToday: 0,
    rating: 5.0,
    joiningDate: '2023-11-01',
  },
];

const DairyPulseContext = createContext<DairyPulseContextType | undefined>(undefined);

export function DairyPulseProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [movements, setMovements] = useState<InventoryMovement[]>(initialMovements);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [shopOrders, setShopOrders] = useState<ShopOrder[]>(initialShopOrders);
  const [deliveries, setDeliveries] = useState<DeliveryTask[]>(initialDeliveries);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (name: string) => setActiveModal(name);
  const closeModal = () => setActiveModal(null);

  const addStockReceipt = (variant: MilkVariant, quantity: number, supplier: string, rate: number, notes?: string) => {
    // 1. Update stock
    setProducts((prev) =>
      prev.map((p) => {
        if (p.variant === variant) {
          const newQty = p.availableStock + quantity;
          return {
            ...p,
            availableStock: newQty,
            status: newQty > p.lowStockThreshold ? 'In Stock' : 'Low Stock',
          };
        }
        return p;
      })
    );

    // 2. Record movement
    const newMovement: InventoryMovement = {
      id: `m_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'RECEIPT',
      productVariant: variant,
      quantity,
      supplierOrBatch: supplier,
      ratePerLiter: rate,
      notes,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMovements((prev) => [newMovement, ...prev]);
  };

  const recordWastage = (variant: MilkVariant, quantity: number, reason: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.variant === variant) {
          const newQty = Math.max(0, p.availableStock - quantity);
          return {
            ...p,
            availableStock: newQty,
            status: newQty > p.lowStockThreshold ? 'In Stock' : 'Low Stock',
          };
        }
        return p;
      })
    );

    const newMovement: InventoryMovement = {
      id: `m_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'WASTAGE',
      productVariant: variant,
      quantity,
      supplierOrBatch: reason,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMovements((prev) => [newMovement, ...prev]);
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'joinedDate'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `c_${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCustomer, ...prev]);
  };

  const addSubscription = (subData: Omit<Subscription, 'id'>) => {
    const newSub: Subscription = {
      ...subData,
      id: `sub_${Date.now()}`,
    };
    setSubscriptions((prev) => [newSub, ...prev]);
  };

  const toggleSubscriptionPause = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'Active' ? 'Paused' : 'Active' } : s))
    );
  };

  const addShopOrder = (orderData: Omit<ShopOrder, 'id' | 'orderNumber'>) => {
    const newOrder: ShopOrder = {
      ...orderData,
      id: `ord_${Date.now()}`,
      orderNumber: `SO-${1000 + shopOrders.length + 1}`,
    };
    setShopOrders((prev) => [newOrder, ...prev]);
  };

  const updateDeliveryStatus = (id: string, status: DeliveryTask['status'], failureReason?: string) => {
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          return {
            ...d,
            status,
            failedReason: failureReason,
            deliveredAt: status === 'Delivered' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          };
        }
        return d;
      })
    );
  };

  const generateInvoice = (customerId: string, amount: number, period: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 7);

    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-${today.getFullYear()}-${String(invoices.length + 90).padStart(3, '0')}`,
      customerId,
      customerName: customer.name,
      customerType: customer.type === 'SHOP' || customer.type === 'RESTAURANT' ? 'SHOP' : 'HOUSEHOLD',
      billingPeriod: period,
      issueDate: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      totalAmount: amount,
      paidAmount: 0,
      status: 'Unpaid',
    };
    setInvoices((prev) => [newInvoice, ...prev]);
  };

  const recordPayment = (invoiceId: string, amount: number) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const newPaid = inv.paidAmount + amount;
          const status = newPaid >= inv.totalAmount ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';
          return { ...inv, paidAmount: newPaid, status };
        }
        return inv;
      })
    );
  };

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `e_${Date.now()}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  return (
    <DairyPulseContext.Provider
      value={{
        products,
        movements,
        customers,
        subscriptions,
        shopOrders,
        deliveries,
        invoices,
        expenses,
        staff,
        activeModal,
        openModal,
        closeModal,
        addStockReceipt,
        recordWastage,
        addCustomer,
        addSubscription,
        toggleSubscriptionPause,
        addShopOrder,
        updateDeliveryStatus,
        generateInvoice,
        recordPayment,
        addExpense,
      }}
    >
      {children}
    </DairyPulseContext.Provider>
  );
}

export function useDairyPulse() {
  const context = useContext(DairyPulseContext);
  if (!context) {
    throw new Error('useDairyPulse must be used within a DairyPulseProvider');
  }
  return context;
}
