'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
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
  DairyInfo,
  RouteInfo,
  RouteBuildPayload,
  DriverRating,
} from '@/types';
import {
  getProducts,
  postStockReceipt,
  postWastage,
  getCustomers,
  postCustomer,
  patchCustomerApi,
  getSubscriptions,
  postSubscription,
  toggleSubscriptionPauseApi,
  getShopOrders,
  postShopOrder,
  getDeliveriesToday,
  patchDeliveryStatus,
  getInvoices,
  postInvoice,
  postPayment,
  getExpenses,
  postExpense,
  getStaff,
  postStaff,
  deleteStaffApi,
  patchStaffApi,
  getDairiesApi,
  postDairyApi,
  patchDairyApi,
  postProductApi,
  patchProductPriceApi,
  deleteProductApi,
  postDeliveryTaskApi,
  patchDeliveryAssignApi,
  postRouteAssignApi,
  getRoutesApi,
  reorderDeliveriesApi,
  createRouteApi,
  buildAndDispatchRouteApi,
  updateDeliveryAddressApi,
  generateDailyDeliveriesApi,
  postDriverRatingApi,
  getDriverRatingsApi,
} from '@/lib/api';

interface DairyPulseContextType {
  products: Product[];
  movements: InventoryMovement[];
  customers: Customer[];
  allCustomers: Customer[];
  subscriptions: Subscription[];
  shopOrders: ShopOrder[];
  deliveries: DeliveryTask[];
  invoices: Invoice[];
  expenses: Expense[];
  staff: StaffMember[];
  dairies: DairyInfo[];
  routes: RouteInfo[];
  driverRatings: DriverRating[];
  refreshDairies: () => Promise<DairyInfo[]>;
  activeDairy: DairyInfo | null;
  setActiveDairy: (dairy: DairyInfo) => void;
  
  // Modals state
  activeModal: string | null;
  openModal: (name: string) => void;
  closeModal: () => void;

  // Actions
  rateDriver: (payload: {
    driverName: string;
    driverId?: string;
    customerId?: string;
    customerName: string;
    deliveryId?: string;
    rating: number;
    tags?: string[];
    feedback?: string;
  }) => Promise<boolean>;
  getRatingsForDriver: (driverName: string) => DriverRating[];
  addStockReceipt: (variant: MilkVariant, quantity: number, supplier: string, rate: number, notes?: string) => void;
  recordWastage: (variant: MilkVariant, quantity: number, reason: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'joinedDate'>) => Promise<Customer>;
  updateCustomer: (id: string, updateData: Partial<Customer>) => Promise<boolean>;
  addStaff: (member: Omit<StaffMember, 'id' | 'joiningDate'>) => Promise<StaffMember>;
  updateStaff: (id: string, updateData: Partial<StaffMember>) => Promise<boolean>;
  deleteStaff: (id: string) => Promise<boolean>;
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  toggleSubscriptionPause: (id: string) => void;
  addShopOrder: (order: Omit<ShopOrder, 'id' | 'orderNumber'>) => void;
  updateDeliveryStatus: (id: string, status: DeliveryTask['status'], failureReason?: string) => void;
  generateInvoice: (customerId: string, amount: number, period: string) => void;
  recordPayment: (invoiceId: string, amount: number) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addDairy: (dairy: {
    name: string;
    ownerName: string;
    email: string;
    phone: string;
    city?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    password?: string;
  }) => Promise<DairyInfo | null>;
  updateDairy: (id: string, updateData: Partial<DairyInfo>) => Promise<boolean>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product | null>;
  updateProductPrice: (productId: string, sellingPrice: number, costPrice?: number) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<boolean>;
  assignDelivery: (deliveryId: string, assignedRider: string, slot?: string, area?: string) => Promise<boolean>;
  assignRouteToRider: (area: string, assignedRider: string, slot?: string) => Promise<boolean>;
  addDeliveryTask: (task: Omit<DeliveryTask, 'id' | 'deliveryNumber' | 'status'>) => Promise<DeliveryTask | null>;
  reorderDeliveries: (stops: { id: string; sequenceOrder: number }[]) => Promise<boolean>;
  moveDeliveryStop: (id: string, direction: 'UP' | 'DOWN') => Promise<void>;
  autoSequenceRoute: (area: string) => Promise<void>;
  createRoute: (route: Omit<RouteInfo, 'id'>) => Promise<RouteInfo | null>;
  buildAndDispatchRoute: (payload: RouteBuildPayload) => Promise<boolean>;
  updateDeliveryAddress: (id: string, addrData: { address?: string; flatOrUnit?: string; societyOrLandmark?: string; landmark?: string; area?: string; latitude?: number; longitude?: number; notes?: string }) => Promise<boolean>;
  generateDailyDeliveries: (deliveryDate?: string, slot?: string) => Promise<{ success: boolean; created_count: number; skipped_duplicates: number; total_stops: number } | null>;
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
    availableStock: 0,
    lowStockThreshold: 100,
    status: 'Out of Stock',
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
    availableStock: 0,
    lowStockThreshold: 100,
    status: 'Out of Stock',
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
    availableStock: 0,
    lowStockThreshold: 100,
    status: 'Out of Stock',
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
    availableStock: 0,
    lowStockThreshold: 50,
    status: 'Out of Stock',
  },
];

const initialMovements: InventoryMovement[] = [];

const initialCustomers: Customer[] = [];

const initialSubscriptions: Subscription[] = [];

const initialShopOrders: ShopOrder[] = [];

const initialDeliveries: DeliveryTask[] = [];

const initialInvoices: Invoice[] = [];
const initialExpenses: Expense[] = [];
const initialStaff: StaffMember[] = [];

const DairyPulseContext = createContext<DairyPulseContextType | undefined>(undefined);

export function DairyPulseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [movements, setMovements] = useState<InventoryMovement[]>(initialMovements);
  
  // Master raw state arrays
  const [rawCustomers, setRawCustomers] = useState<Customer[]>(initialCustomers);
  const [rawSubscriptions, setRawSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [rawShopOrders, setRawShopOrders] = useState<ShopOrder[]>(initialShopOrders);
  const [rawDeliveries, setRawDeliveries] = useState<DeliveryTask[]>(initialDeliveries);
  const [rawInvoices, setRawInvoices] = useState<Invoice[]>(initialInvoices);
  const [rawExpenses, setRawExpenses] = useState<Expense[]>(initialExpenses);
  const [rawStaff, setRawStaff] = useState<StaffMember[]>(initialStaff);
  const [rawRoutes, setRawRoutes] = useState<RouteInfo[]>([]);

  // Aliases so all existing mutators cleanly update the master raw state
  const setCustomers = setRawCustomers;
  const setSubscriptions = setRawSubscriptions;
  const setShopOrders = setRawShopOrders;
  const setDeliveries = setRawDeliveries;
  const setInvoices = setRawInvoices;
  const setExpenses = setRawExpenses;
  const setStaff = setRawStaff;
  const setRoutes = setRawRoutes;

  const [dairies, setDairies] = useState<DairyInfo[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('dairypulse_registered_dairies');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });
  const [selectedActiveDairy, setSelectedActiveDairy] = useState<DairyInfo | null>(null);

  // Active Dairy: prioritized by explicit user selection, or user's assigned dairyName, or first registered dairy
  const activeDairy = useMemo(() => {
    if (selectedActiveDairy) return selectedActiveDairy;
    if (user?.dairyName) {
      const match = dairies.find((d) => d.name.trim().toLowerCase() === user.dairyName?.trim().toLowerCase());
      if (match) return match;
    }
    return dairies.length > 0 ? dairies[0] : null;
  }, [selectedActiveDairy, user, dairies]);

  const setActiveDairy = (dairy: DairyInfo) => setSelectedActiveDairy(dairy);

  // Scoped views: strictly filter data so customers and operations only show for their related dairy
  const customers = useMemo(() => {
    if (!activeDairy) return rawCustomers;
    const activeName = activeDairy.name.trim().toLowerCase();
    return rawCustomers.filter((c) => {
      if (!c.dairyName) {
        return activeName === 'dairypulse farm hq' || activeName === 'amrut dairy farm';
      }
      return c.dairyName.trim().toLowerCase() === activeName;
    });
  }, [rawCustomers, activeDairy]);

  const subscriptions = useMemo(() => {
    if (!activeDairy) return rawSubscriptions;
    const activeName = activeDairy.name.trim().toLowerCase();
    const custIds = new Set(customers.map((c) => c.id));
    return rawSubscriptions.filter((s) => {
      if (custIds.has(s.customerId)) return true;
      if (s.dairyName) return s.dairyName.trim().toLowerCase() === activeName;
      return activeName === 'dairypulse farm hq' || activeName === 'amrut dairy farm';
    });
  }, [rawSubscriptions, activeDairy, customers]);

  const deliveries = useMemo(() => {
    if (!activeDairy) return rawDeliveries;
    const activeName = activeDairy.name.trim().toLowerCase();
    const custNames = new Set(customers.map((c) => c.name.trim().toLowerCase()));
    return rawDeliveries.filter((d) => {
      if (custNames.has(d.customerName.trim().toLowerCase())) return true;
      if (d.dairyName) return d.dairyName.trim().toLowerCase() === activeName;
      return activeName === 'dairypulse farm hq' || activeName === 'amrut dairy farm';
    });
  }, [rawDeliveries, activeDairy, customers]);

  const shopOrders = useMemo(() => {
    if (!activeDairy) return rawShopOrders;
    const activeName = activeDairy.name.trim().toLowerCase();
    return rawShopOrders.filter((o) => {
      if (o.dairyName) return o.dairyName.trim().toLowerCase() === activeName;
      return activeName === 'dairypulse farm hq' || activeName === 'amrut dairy farm';
    });
  }, [rawShopOrders, activeDairy]);

  const staff = useMemo(() => {
    if (!activeDairy) return rawStaff;
    const activeName = activeDairy.name.trim().toLowerCase();
    return rawStaff.filter((st) => {
      if (st.dairyName) return st.dairyName.trim().toLowerCase() === activeName;
      return activeName === 'dairypulse farm hq' || activeName === 'amrut dairy farm';
    });
  }, [rawStaff, activeDairy]);

  const routes = useMemo(() => {
    if (!activeDairy) return rawRoutes;
    const activeName = activeDairy.name.trim().toLowerCase();
    return rawRoutes.filter((r) => {
      if (r.dairyName) return r.dairyName.trim().toLowerCase() === activeName;
      return activeName === 'dairypulse farm hq' || activeName === 'amrut dairy farm';
    });
  }, [rawRoutes, activeDairy]);

  const invoices = useMemo(() => {
    if (!activeDairy) return rawInvoices;
    const activeName = activeDairy.name.trim().toLowerCase();
    const custIds = new Set(customers.map((c) => c.id));
    return rawInvoices.filter((inv) => {
      if (custIds.has(inv.customerId)) return true;
      if (inv.dairyName) return inv.dairyName.trim().toLowerCase() === activeName;
      return activeName === 'dairypulse farm hq' || activeName === 'amrut dairy farm';
    });
  }, [rawInvoices, activeDairy, customers]);

  const expenses = useMemo(() => {
    if (!activeDairy) return rawExpenses;
    const activeName = activeDairy.name.trim().toLowerCase();
    return rawExpenses.filter((e) => {
      if (e.dairyName) return e.dairyName.trim().toLowerCase() === activeName;
      return activeName === 'dairypulse farm hq' || activeName === 'amrut dairy farm';
    });
  }, [rawExpenses, activeDairy]);

  const refreshDairies = async (): Promise<DairyInfo[]> => {
    try {
      const data = await getDairiesApi();
      if (data && Array.isArray(data) && data.length > 0) {
        setDairies(data);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('dairypulse_registered_dairies', JSON.stringify(data));
          } catch (e) {}
        }
        return data;
      }
    } catch (e) {
      console.warn('refreshDairies error:', e);
    }
    return dairies;
  };

  const [driverRatings, setDriverRatings] = useState<DriverRating[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (name: string) => setActiveModal(name);
  const closeModal = () => setActiveModal(null);

  // Sync state with FastAPI backend if online
  useEffect(() => {
    refreshDairies();
    getProducts().then((data) => {
      if (data && Array.isArray(data)) setProducts(data);
    });
    getCustomers().then((data) => {
      if (data && Array.isArray(data)) setRawCustomers(data);
    });
    getSubscriptions().then((data) => {
      if (data && Array.isArray(data)) setRawSubscriptions(data);
    });
    getShopOrders().then((data) => {
      if (data && Array.isArray(data)) setRawShopOrders(data);
    });
    getDeliveriesToday().then((data) => {
      if (data && Array.isArray(data)) {
        const sorted = [...data].sort((a: any, b: any) => (a.sequenceOrder || 1) - (b.sequenceOrder || 1));
        setRawDeliveries(sorted);
      }
    });
    getInvoices().then((data) => {
      if (data && Array.isArray(data)) setRawInvoices(data);
    });
    getExpenses().then((data) => {
      if (data && Array.isArray(data)) setRawExpenses(data);
    });
    getStaff().then((data) => {
      if (data && Array.isArray(data)) setRawStaff(data);
    });
    getRoutesApi().then((data) => {
      if (data && Array.isArray(data)) setRawRoutes(data);
    });
    getDriverRatingsApi().then((data) => {
      if (data && Array.isArray(data)) setDriverRatings(data);
    });
  }, []);

  const addStockReceipt = (variant: MilkVariant, quantity: number, supplier: string, rate: number, notes?: string) => {
    // 1. Update stock optimistically
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

    // 3. Sync with backend API
    postStockReceipt({ variant, quantity, supplier, rate, notes });
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

    // Backend sync
    postWastage({ variant, quantity, reason });
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'joinedDate'>): Promise<Customer> => {
    const newCustomer: Customer = {
      ...customerData,
      id: `c_${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCustomer, ...prev]);

    // Backend sync
    const res = await postCustomer(customerData);
    if (res && res.id) {
      newCustomer.id = res.id;
    }
    return newCustomer;
  };

  const updateCustomer = async (id: string, updateData: Partial<Customer>): Promise<boolean> => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updateData } : c))
    );
    if (updateData.address || updateData.latitude !== undefined || updateData.longitude !== undefined) {
      setDeliveries((prev) =>
        prev.map((d) => {
          if (d.customerId === id || d.customerName === updateData.name) {
            return {
              ...d,
              ...(updateData.address ? { address: updateData.address } : {}),
              ...(updateData.area ? { area: updateData.area } : {}),
              ...(updateData.latitude !== undefined ? { latitude: updateData.latitude } : {}),
              ...(updateData.longitude !== undefined ? { longitude: updateData.longitude } : {}),
            };
          }
          return d;
        })
      );
    }
    if (updateData.dairyName) {
      setSubscriptions((prev) =>
        prev.map((s) => (s.customerId === id || s.customerName === updateData.name ? { ...s, dairyName: updateData.dairyName } : s))
      );
      setDeliveries((prev) =>
        prev.map((d) => (d.customerId === id || d.customerName === updateData.name ? { ...d, dairyName: updateData.dairyName } : d))
      );
    }
    const res = await patchCustomerApi(id, {
      name: updateData.name,
      phone: updateData.phone,
      email: updateData.email,
      address: updateData.address,
      area: updateData.area,
      route: updateData.route,
      dairyName: updateData.dairyName,
      latitude: updateData.latitude,
      longitude: updateData.longitude,
      preferredTime: updateData.preferredTime,
    });
    return !!res;
  };

  const addStaff = async (memberData: Omit<StaffMember, 'id' | 'joiningDate'>): Promise<StaffMember> => {
    const today = new Date().toISOString().split('T')[0];
    const newMember: StaffMember = {
      ...memberData,
      id: `st_${Date.now()}`,
      joiningDate: today,
      rating: 5.0,
      deliveriesToday: 0,
      dairyName: memberData.dairyName || activeDairy?.name,
    };
    setStaff((prev) => [newMember, ...prev]);

    // Backend sync
    const res = await postStaff({
      name: memberData.name,
      role: memberData.role,
      phone: memberData.phone,
      email: memberData.email,
      password: memberData.password,
      assignedArea: memberData.assignedArea,
      status: memberData.status,
      dairyName: memberData.dairyName || activeDairy?.name,
    });
    if (res) {
      setStaff((prev) => prev.map((s) => (s.id === newMember.id ? (res as StaffMember) : s)));
      return res as StaffMember;
    }
    return newMember;
  };

  const updateStaff = async (id: string, updateData: Partial<StaffMember>): Promise<boolean> => {
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updateData } : s))
    );
    const updated = await patchStaffApi(id, {
      status: updateData.status,
      assignedArea: updateData.assignedArea,
      phone: updateData.phone,
      email: updateData.email,
      password: updateData.password,
      role: updateData.role,
      rating: updateData.rating,
      dairyName: updateData.dairyName || activeDairy?.name,
    });
    return !!updated;
  };

  const deleteStaff = async (id: string): Promise<boolean> => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    const success = await deleteStaffApi(id);
    return success;
  };

  const addSubscription = (subData: Omit<Subscription, 'id'>) => {
    const newSub: Subscription = {
      ...subData,
      id: `sub_${Date.now()}`,
    };
    setSubscriptions((prev) => [newSub, ...prev]);

    // Backend sync
    postSubscription(subData);
  };

  const toggleSubscriptionPause = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'Active' ? 'Paused' : 'Active' } : s))
    );

    // Backend sync
    toggleSubscriptionPauseApi(id);
  };

  const addShopOrder = (orderData: Omit<ShopOrder, 'id' | 'orderNumber'>) => {
    const newOrder: ShopOrder = {
      ...orderData,
      id: `ord_${Date.now()}`,
      orderNumber: `SO-${1000 + shopOrders.length + 1}`,
    };
    setShopOrders((prev) => [newOrder, ...prev]);

    // Backend sync
    postShopOrder({
      shopName: orderData.shopName,
      contactPerson: orderData.contactPerson,
      phone: orderData.phone,
      totalAmount: orderData.totalAmount,
      deliveryDate: orderData.deliveryDate,
      items: orderData.items,
    });
  };

  const updateDeliveryStatus = (id: string, status: DeliveryTask['status'], failureReason?: string) => {
    let affectedTask: DeliveryTask | undefined;

    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          affectedTask = d;
          return {
            ...d,
            status,
            failedReason: failureReason,
            deliveredAt:
              status === 'Delivered'
                ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : undefined,
          };
        }
        return d;
      })
    );

    // If marked Delivered, update rider deliveriesToday and deduct product stock
    if (status === 'Delivered') {
      if (affectedTask?.assignedRider) {
        setStaff((prev) =>
          prev.map((s) =>
            s.name.toLowerCase() === affectedTask!.assignedRider.toLowerCase()
              ? { ...s, deliveriesToday: (s.deliveriesToday || 0) + 1 }
              : s
          )
        );
      }

      if (affectedTask?.productVariant && affectedTask.quantityLiters > 0) {
        setProducts((prev) =>
          prev.map((p) => {
            if (p.variant === affectedTask!.productVariant) {
              const newStock = Math.max(0, Number((p.availableStock - affectedTask!.quantityLiters).toFixed(1)));
              return {
                ...p,
                availableStock: newStock,
                status: newStock <= 0 ? 'Out of Stock' : newStock <= p.lowStockThreshold ? 'Low Stock' : 'In Stock',
              };
            }
            return p;
          })
        );

        // Record dispatch movement in inventory ledger
        setMovements((prev) => [
          {
            id: `m_dispatch_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'DISPATCH',
            productVariant: affectedTask!.productVariant,
            quantity: affectedTask!.quantityLiters,
            supplierOrBatch: `Doorstep Run (${affectedTask!.customerName})`,
            notes: `Delivered by ${affectedTask!.assignedRider || 'Rider'}`,
          },
          ...prev,
        ]);
      }
    }

    // Backend sync
    patchDeliveryStatus(id, status, failureReason);
  };

  const generateInvoice = (customerId: string, amount: number, period: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 7);

    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-${today.getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
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

    // Update customer balance
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, balance: (c.balance || 0) + amount } : c))
    );

    // Backend sync
    postInvoice({
      customerId,
      totalAmount: amount,
      billingPeriod: period,
      dueDate: dueDate.toISOString().split('T')[0],
    });
  };

  const recordPayment = (invoiceId: string, amount: number) => {
    let matchedCustomerId: string | undefined;

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          matchedCustomerId = inv.customerId;
          const newPaid = inv.paidAmount + amount;
          const status = newPaid >= inv.totalAmount ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';
          return { ...inv, paidAmount: newPaid, status };
        }
        return inv;
      })
    );

    // Deduct customer balance
    if (matchedCustomerId) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === matchedCustomerId ? { ...c, balance: Math.max(0, (c.balance || 0) - amount) } : c
        )
      );
    }

    // Backend sync
    postPayment(invoiceId, amount);
  };

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `e_${Date.now()}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);

    // Backend sync
    postExpense(expenseData);
  };

  const addDairy = async (dairyData: {
    name: string;
    ownerName: string;
    email: string;
    phone: string;
    city?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    password?: string;
  }): Promise<DairyInfo | null> => {
    const newDairy: DairyInfo = {
      id: `dairy_${Date.now()}`,
      name: dairyData.name.trim(),
      ownerName: dairyData.ownerName.trim(),
      email: dairyData.email.trim(),
      phone: dairyData.phone.trim(),
      city: dairyData.city?.trim() || 'Pune',
      address: dairyData.address?.trim() || '',
      latitude: dairyData.latitude || 18.5520,
      longitude: dairyData.longitude || 73.7880,
      rating: 5.0,
      createdAt: new Date().toISOString(),
    };

    // 1. Prepend immediately to state and localStorage so any screen sees it without delay
    setDairies((prev) => {
      const filtered = prev.filter((d) => d.name.trim().toLowerCase() !== newDairy.name.toLowerCase());
      const updated = [newDairy, ...filtered];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('dairypulse_registered_dairies', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
    setSelectedActiveDairy(newDairy);

    // 2. Sync with backend API
    const res = await postDairyApi(dairyData);
    if (res && res.id) {
      setDairies((prev) => {
        const updated = prev.map((d) => (d.name.trim().toLowerCase() === newDairy.name.toLowerCase() ? { ...d, ...res } : d));
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('dairypulse_registered_dairies', JSON.stringify(updated));
          } catch (e) {}
        }
        return updated;
      });
      return res;
    }
    return newDairy;
  };

  const updateDairy = async (id: string, updateData: Partial<DairyInfo>): Promise<boolean> => {
    setDairies((prev) =>
      prev.map((d) => (d.id === id || d.name === id ? { ...d, ...updateData } : d))
    );
    const res = await patchDairyApi(id, {
      name: updateData.name,
      ownerName: updateData.ownerName || updateData.owner_name,
      email: updateData.email,
      phone: updateData.phone,
      city: updateData.city,
      address: updateData.address,
      latitude: updateData.latitude,
      longitude: updateData.longitude,
    });
    return !!res;
  };

  const addProduct = async (prodData: Omit<Product, 'id'>): Promise<Product | null> => {
    const newProduct: Product = {
      ...prodData,
      id: `p_${Date.now()}`,
    };
    setProducts((prev) => [...prev, newProduct]);

    const res = await postProductApi(prodData);
    if (res && res.id) {
      newProduct.id = res.id;
      return res as Product;
    }
    return newProduct;
  };

  const updateProductPrice = async (productId: string, sellingPrice: number, costPrice?: number): Promise<boolean> => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            sellingPrice,
            costPrice: costPrice !== undefined ? costPrice : p.costPrice,
          };
        }
        return p;
      })
    );

    const res = await patchProductPriceApi(productId, { sellingPrice, costPrice });
    return !!res;
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    const res = await deleteProductApi(productId);
    return !!res;
  };

  const assignDelivery = async (deliveryId: string, assignedRider: string, slot?: string, area?: string): Promise<boolean> => {
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id === deliveryId) {
          return {
            ...d,
            assignedRider,
            slot: slot || d.slot,
            area: area || d.area,
          };
        }
        return d;
      })
    );
    const res = await patchDeliveryAssignApi(deliveryId, { assignedRider, slot, area });
    return !!res;
  };

  const assignRouteToRider = async (area: string, assignedRider: string, slot?: string): Promise<boolean> => {
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.area === area) {
          return {
            ...d,
            assignedRider,
            slot: slot || d.slot,
          };
        }
        return d;
      })
    );
    const res = await postRouteAssignApi({ area, assignedRider, slot });
    return !!res;
  };

  const addDeliveryTask = async (taskData: Omit<DeliveryTask, 'id' | 'deliveryNumber' | 'status'>): Promise<DeliveryTask | null> => {
    const count = deliveries.length + 1;
    const newTask: DeliveryTask = {
      ...taskData,
      id: `del_${Date.now()}`,
      deliveryNumber: `DEL-2026-${String(count).padStart(3, '0')}`,
      sequenceOrder: count,
      societyOrLandmark: taskData.societyOrLandmark || (taskData.address ? taskData.address.split(',')[1]?.trim() || taskData.address.split(' ')[0] : 'Locality'),
      status: 'Pending',
    };
    setDeliveries((prev) => [...prev, newTask]);
    const res = await postDeliveryTaskApi(taskData);
    if (res && res.id) {
      newTask.id = res.id;
      return res as DeliveryTask;
    }
    return newTask;
  };

  const reorderDeliveries = async (stops: { id: string; sequenceOrder: number }[]): Promise<boolean> => {
    const orderMap = new Map(stops.map((s) => [s.id, s.sequenceOrder]));
    setDeliveries((prev) => {
      const updated = prev.map((d) => {
        if (orderMap.has(d.id)) {
          return { ...d, sequenceOrder: orderMap.get(d.id)! };
        }
        return d;
      });
      return [...updated].sort((a, b) => (a.sequenceOrder || 1) - (b.sequenceOrder || 1));
    });
    const res = await reorderDeliveriesApi(stops);
    return !!res;
  };

  const moveDeliveryStop = async (id: string, direction: 'UP' | 'DOWN'): Promise<void> => {
    const sorted = [...deliveries].sort((a, b) => (a.sequenceOrder || 1) - (b.sequenceOrder || 1));
    const idx = sorted.findIndex((d) => d.id === id);
    if (idx === -1) return;
    if (direction === 'UP' && idx === 0) return;
    if (direction === 'DOWN' && idx === sorted.length - 1) return;

    const swapIdx = direction === 'UP' ? idx - 1 : idx + 1;
    const current = sorted[idx];
    const target = sorted[swapIdx];

    const currentOrder = current.sequenceOrder || (idx + 1);
    const targetOrder = target.sequenceOrder || (swapIdx + 1);

    await reorderDeliveries([
      { id: current.id, sequenceOrder: targetOrder },
      { id: target.id, sequenceOrder: currentOrder },
    ]);
  };

  const autoSequenceRoute = async (area: string): Promise<void> => {
    // Cluster stops in this area by societyOrLandmark or address keywords
    const areaDeliveries = deliveries.filter((d) => d.area === area);
    const sortedArea = [...areaDeliveries].sort((a, b) => {
      const socA = (a.societyOrLandmark || a.address || '').toLowerCase();
      const socB = (b.societyOrLandmark || b.address || '').toLowerCase();
      return socA.localeCompare(socB);
    });

    const updates = sortedArea.map((d, i) => ({
      id: d.id,
      sequenceOrder: i + 1,
    }));

    await reorderDeliveries(updates);
  };

  const createRoute = async (routeData: Omit<RouteInfo, 'id'>): Promise<RouteInfo | null> => {
    const newRoute: RouteInfo = {
      ...routeData,
      id: `rt-${Date.now()}`,
      totalStops: routeData.totalStops || 0,
      totalLiters: routeData.totalLiters || 0,
      maxCapacityLiters: routeData.maxCapacityLiters || 60.0,
    };
    setRoutes((prev) => [...prev, newRoute]);
    const res = await createRouteApi({
      routeCode: routeData.routeCode,
      name: routeData.name,
      area: routeData.area,
      assignedRider: routeData.assignedRider,
      slot: routeData.slot,
      societies: typeof routeData.societies === 'string' ? routeData.societies : Array.isArray(routeData.societies) ? routeData.societies.join(', ') : undefined,
      maxCapacityLiters: routeData.maxCapacityLiters,
    });
    if (res && res.id) {
      newRoute.id = res.id;
      return res;
    }
    return newRoute;
  };

  const updateDeliveryAddress = async (
    id: string,
    addrData: { address?: string; flatOrUnit?: string; societyOrLandmark?: string; landmark?: string; area?: string; latitude?: number; longitude?: number; notes?: string }
  ): Promise<boolean> => {
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          return {
            ...d,
            address: addrData.address || d.address,
            flatOrUnit: addrData.flatOrUnit || d.flatOrUnit,
            societyOrLandmark: addrData.societyOrLandmark || d.societyOrLandmark,
            landmark: addrData.landmark || d.landmark,
            area: addrData.area || d.area,
            latitude: addrData.latitude !== undefined ? addrData.latitude : d.latitude,
            longitude: addrData.longitude !== undefined ? addrData.longitude : d.longitude,
            notes: addrData.notes || d.notes,
          };
        }
        return d;
      })
    );
    const res = await updateDeliveryAddressApi(id, addrData);
    return !!res;
  };

  const buildAndDispatchRoute = async (payload: RouteBuildPayload) => {
    const res = await buildAndDispatchRouteApi(payload);
    if (res && res.success) {
      const freshDeliveries = await getDeliveriesToday();
      if (freshDeliveries) setDeliveries(freshDeliveries);
      const freshRoutes = await getRoutesApi();
      if (freshRoutes) setRoutes(freshRoutes);
      const freshCustomers = await getCustomers();
      if (freshCustomers) setCustomers(freshCustomers);
      return true;
    }
    return false;
  };

  const generateDailyDeliveries = async (deliveryDate?: string, slot?: string) => {
    const res = await generateDailyDeliveriesApi({ deliveryDate, slot });
    if (res && res.success) {
      const freshDeliveries = await getDeliveriesToday();
      if (freshDeliveries) setDeliveries(freshDeliveries);
      const freshRoutes = await getRoutesApi();
      if (freshRoutes) setRoutes(freshRoutes);
      return res;
    }
    return null;
  };

  const rateDriver = async (payload: {
    driverName: string;
    driverId?: string;
    customerId?: string;
    customerName: string;
    deliveryId?: string;
    rating: number;
    tags?: string[];
    feedback?: string;
  }): Promise<boolean> => {
    const clampedRating = Math.max(1, Math.min(5, Math.round(payload.rating)));
    const newRatingObj: DriverRating = {
      id: `rating_${Date.now()}`,
      driverName: payload.driverName,
      driverId: payload.driverId,
      customerId: payload.customerId,
      customerName: payload.customerName,
      deliveryId: payload.deliveryId,
      rating: clampedRating,
      tags: payload.tags?.join(', '),
      feedback: payload.feedback,
      createdAt: new Date().toISOString(),
    };

    // 1. Optimistically append to state
    setDriverRatings((prev) => [newRatingObj, ...prev]);

    // 2. If delivery task is provided, update its rating info
    if (payload.deliveryId) {
      setDeliveries((prev) =>
        prev.map((d) =>
          d.id === payload.deliveryId
            ? {
                ...d,
                driverRating: clampedRating,
                driverRatingFeedback: payload.feedback || payload.tags?.join(', '),
                ratedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }
            : d
        )
      );
    }

    // 3. Recalculate average rating for this driver in staff state
    const existingDriverRatings = driverRatings.filter(
      (r) => r.driverName.toLowerCase() === payload.driverName.toLowerCase()
    );
    const allRatingsList = [...existingDriverRatings.map((r) => r.rating), clampedRating];
    const avgRating = Number(
      (allRatingsList.reduce((acc, curr) => acc + curr, 0) / allRatingsList.length).toFixed(1)
    );

    const matchingStaff = staff.find(
      (s) =>
        s.name.toLowerCase() === payload.driverName.toLowerCase() ||
        (payload.driverId && s.id === payload.driverId)
    );
    if (matchingStaff) {
      updateStaff(matchingStaff.id, { rating: avgRating });
    }

    // 4. Call backend API
    await postDriverRatingApi({
      ...payload,
      rating: clampedRating,
    });

    return true;
  };

  const getRatingsForDriver = (driverName: string): DriverRating[] => {
    return driverRatings.filter((r) => r.driverName.toLowerCase() === driverName.toLowerCase());
  };

  return (
    <DairyPulseContext.Provider
      value={{
        products,
        movements,
        customers,
        allCustomers: rawCustomers,
        subscriptions,
        shopOrders,
        deliveries,
        invoices,
        expenses,
        staff,
        dairies,
        activeDairy,
        setActiveDairy,
        refreshDairies,
        routes,
        driverRatings,
        rateDriver,
        getRatingsForDriver,
        activeModal,
        openModal,
        closeModal,
        addStockReceipt,
        recordWastage,
        addCustomer,
        updateCustomer,
        addStaff,
        updateStaff,
        deleteStaff,
        addSubscription,
        toggleSubscriptionPause,
        addShopOrder,
        updateDeliveryStatus,
        generateInvoice,
        recordPayment,
        addExpense,
        addDairy,
        updateDairy,
        addProduct,
        updateProductPrice,
        deleteProduct,
        assignDelivery,
        assignRouteToRider,
        addDeliveryTask,
        reorderDeliveries,
        moveDeliveryStop,
        autoSequenceRoute,
        createRoute,
        buildAndDispatchRoute,
        updateDeliveryAddress,
        generateDailyDeliveries,
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
