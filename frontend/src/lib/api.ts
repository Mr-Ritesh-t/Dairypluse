import { DairyInfo, RouteInfo, RouteBuildPayload } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Health check
export async function checkBackendHealth(): Promise<{ online: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return { online: true, message: data.status };
    }
    return { online: false };
  } catch {
    return { online: false };
  }
}

// Dashboard Summary
export async function getDashboardSummary() {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/summary`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch dashboard summary');
    return await res.json();
  } catch (err) {
    console.warn('API error, falling back to local state:', err);
    return null;
  }
}

// ----------------- INVENTORY -----------------
export async function getProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/inventory/products`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      variant: p.variant,
      unit: p.unit || 'Liter',
      fatContent: p.fat_content,
      snfContent: p.snf_content,
      sellingPrice: p.selling_price,
      costPrice: p.cost_price,
      availableStock: p.available_stock,
      lowStockThreshold: p.low_stock_threshold,
      status: p.status,
    }));
  } catch (err) {
    console.warn('API error, falling back to local state:', err);
    return null;
  }
}

export async function postProductApi(product: {
  name: string;
  variant: string;
  unit?: string;
  fatContent: number;
  snfContent: number;
  sellingPrice: number;
  costPrice: number;
  availableStock?: number;
  lowStockThreshold?: number;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/inventory/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: product.name,
        variant: product.variant,
        unit: product.unit || 'Liter',
        fat_content: product.fatContent,
        snf_content: product.snfContent,
        selling_price: product.sellingPrice,
        cost_price: product.costPrice,
        available_stock: product.availableStock ?? 0,
        low_stock_threshold: product.lowStockThreshold ?? 100,
        status: (product.availableStock ?? 0) > (product.lowStockThreshold ?? 100) ? 'In Stock' : 'Low Stock',
      }),
    });
    if (!res.ok) throw new Error('Failed to create milk variant');
    const p = await res.json();
    return {
      id: p.id,
      name: p.name,
      variant: p.variant,
      unit: p.unit || 'Liter',
      fatContent: p.fat_content,
      snfContent: p.snf_content,
      sellingPrice: p.selling_price,
      costPrice: p.cost_price,
      availableStock: p.available_stock,
      lowStockThreshold: p.low_stock_threshold,
      status: p.status,
    };
  } catch (err) {
    console.warn('API error creating product:', err);
    return null;
  }
}

export async function patchProductPriceApi(productId: string, data: { sellingPrice?: number; costPrice?: number; name?: string }) {
  try {
    const payload: any = {};
    if (data.sellingPrice !== undefined) payload.selling_price = data.sellingPrice;
    if (data.costPrice !== undefined) payload.cost_price = data.costPrice;
    if (data.name !== undefined) payload.name = data.name;

    const res = await fetch(`${API_BASE_URL}/inventory/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update product');
    const p = await res.json();
    return {
      id: p.id,
      name: p.name,
      variant: p.variant,
      unit: p.unit || 'Liter',
      fatContent: p.fat_content,
      snfContent: p.snf_content,
      sellingPrice: p.selling_price,
      costPrice: p.cost_price,
      availableStock: p.available_stock,
      lowStockThreshold: p.low_stock_threshold,
      status: p.status,
    };
  } catch (err) {
    console.warn('API error updating product:', err);
    return null;
  }
}

export async function deleteProductApi(productId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/inventory/products/${productId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return await res.json();
  } catch (err) {
    console.warn('API error deleting product:', err);
    return { success: true };
  }
}

export async function postStockReceipt(data: {
  supplier: string;
  variant: string;
  quantity: number;
  rate: number;
  notes?: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/inventory/receipts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplier_name: data.supplier,
        variant: data.variant,
        quantity: data.quantity,
        unit_cost: data.rate,
        notes: data.notes,
      }),
    });
    if (!res.ok) throw new Error('Failed to post stock receipt');
    return await res.json();
  } catch (err) {
    console.warn('API error:', err);
    return null;
  }
}

export async function postWastage(data: {
  variant: string;
  quantity: number;
  reason: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/inventory/wastage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to post wastage');
    return await res.json();
  } catch (err) {
    console.warn('API error:', err);
    return null;
  }
}

// ----------------- CUSTOMERS -----------------
export async function getCustomers() {
  try {
    const res = await fetch(`${API_BASE_URL}/customers`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch customers');
    const data = await res.json();
    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      type: c.customer_type || 'HOUSEHOLD',
      phone: c.phone,
      email: c.email,
      address: c.address,
      area: c.area,
      route: c.route,
      dairyName: c.dairy_name || 'DairyPulse Farm HQ',
      latitude: c.latitude,
      longitude: c.longitude,
      preferredTime: c.preferred_time || '6:00 AM - 7:30 AM',
      balance: c.balance || 0,
      activeSubscriptionsCount: c.customer_type === 'HOUSEHOLD' ? 1 : 0,
      status: c.status || 'Active',
      joinedDate: c.joined_date || new Date().toISOString().split('T')[0],
    }));
  } catch (err) {
    console.warn('API error, falling back to local state:', err);
    return null;
  }
}

export async function postCustomer(data: {
  name: string;
  type: string;
  phone: string;
  email?: string;
  address: string;
  area: string;
  route: string;
  dairyName?: string;
  latitude?: number;
  longitude?: number;
  preferredTime?: string;
  balance?: number;
  status?: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        customer_type: data.type,
        phone: data.phone,
        email: data.email || null,
        address: data.address,
        area: data.area,
        route: data.route,
        dairy_name: data.dairyName || 'DairyPulse Farm HQ',
        latitude: data.latitude,
        longitude: data.longitude,
        preferred_time: data.preferredTime || '6:00 AM - 7:30 AM',
        balance: data.balance || 0,
        status: data.status || 'Active',
      }),
    });
    if (!res.ok) throw new Error('Failed to create customer');
    return await res.json();
  } catch (err) {
    console.warn('API error:', err);
    return null;
  }
}

export async function patchCustomerApi(
  customerId: string,
  data: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    area?: string;
    route?: string;
    latitude?: number;
    longitude?: number;
    preferredTime?: string;
  }
) {
  try {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.email !== undefined) payload.email = data.email;
    if (data.address !== undefined) payload.address = data.address;
    if (data.area !== undefined) payload.area = data.area;
    if (data.route !== undefined) payload.route = data.route;
    if (data.latitude !== undefined) payload.latitude = data.latitude;
    if (data.longitude !== undefined) payload.longitude = data.longitude;
    if (data.preferredTime !== undefined) payload.preferred_time = data.preferredTime;

    const res = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to patch customer');
    return await res.json();
  } catch (err) {
    console.warn('API error patching customer:', err);
    return null;
  }
}

// ----------------- SUBSCRIPTIONS -----------------
export async function getSubscriptions() {
  try {
    const res = await fetch(`${API_BASE_URL}/subscriptions`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch subscriptions');
    const data = await res.json();
    return data.map((s: any) => ({
      id: s.id,
      customerId: s.customer_id,
      customerName: s.customer_name,
      productVariant: s.product_variant,
      quantityLiters: s.quantity_liters,
      timeSlot: s.time_slot,
      frequency: s.frequency,
      unitPrice: s.unit_price,
      startDate: s.start_date,
      status: s.status,
    }));
  } catch (err) {
    console.warn('API error, falling back to local state:', err);
    return null;
  }
}

export async function postSubscription(data: {
  customerId: string;
  customerName: string;
  dairyName?: string;
  productVariant: string;
  quantityLiters: number;
  timeSlot?: string;
  frequency?: string;
  unitPrice?: number;
  startDate?: string;
  status?: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: data.customerId,
        customer_name: data.customerName,
        dairy_name: data.dairyName || 'Amrut Dairy Farm',
        product_variant: data.productVariant,
        quantity_liters: data.quantityLiters,
        time_slot: data.timeSlot || 'Morning (6:00 AM - 7:30 AM)',
        frequency: data.frequency || 'Daily',
        unit_price: data.unitPrice || 62,
        start_date: data.startDate || new Date().toISOString().split('T')[0],
        status: data.status || 'Active',
      }),
    });
    if (!res.ok) throw new Error('Failed to create subscription');
    return await res.json();
  } catch (err) {
    console.warn('API error:', err);
    return null;
  }
}

export async function toggleSubscriptionPauseApi(subId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/subscriptions/${subId}/toggle-pause`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to toggle subscription pause');
    return await res.json();
  } catch (err) {
    console.warn('API error:', err);
    return null;
  }
}

// ----------------- SHOP ORDERS -----------------
export async function getShopOrders() {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch orders');
    const data = await res.json();
    return data.map((o: any) => ({
      id: o.id,
      orderNumber: o.order_number,
      shopName: o.shop_name,
      contactPerson: o.contact_person,
      phone: o.phone,
      orderDate: o.order_date,
      deliveryDate: o.delivery_date,
      status: o.status,
      paymentStatus: o.payment_status,
      totalAmount: o.total_amount,
      paidAmount: o.paid_amount || 0,
      items: (o.items || []).map((it: any) => ({
        productVariant: it.product_variant,
        quantity: it.quantity,
        unit: it.unit,
        unitPrice: it.unit_price,
        total: it.line_total,
      })),
    }));
  } catch (err) {
    console.warn('API error, falling back to local state:', err);
    return null;
  }
}

export async function postShopOrder(data: {
  shopName: string;
  contactPerson: string;
  phone: string;
  totalAmount: number;
  deliveryDate?: string;
  items: Array<{
    productVariant: string;
    quantity: number;
    unit?: string;
    unitPrice: number;
    total: number;
  }>;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shop_name: data.shopName,
        contact_person: data.contactPerson,
        phone: data.phone,
        delivery_date: data.deliveryDate || new Date().toISOString().split('T')[0],
        total_amount: data.totalAmount,
        items: data.items.map((it) => ({
          product_variant: it.productVariant,
          quantity: it.quantity,
          unit: it.unit || 'Liter',
          unit_price: it.unitPrice,
          line_total: it.total,
        })),
      }),
    });
    if (!res.ok) throw new Error('Failed to create shop order');
    return await res.json();
  } catch (err) {
    console.warn('API error:', err);
    return null;
  }
}

// ----------------- DELIVERIES -----------------
export async function getDeliveriesToday() {
  try {
    const res = await fetch(`${API_BASE_URL}/deliveries/today`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch deliveries');
    const data = await res.json();
    return data.map((d: any) => ({
      id: d.id,
      deliveryNumber: d.delivery_number,
      customerName: d.customer_name,
      customerPhone: d.customer_phone,
      address: d.address,
      area: d.area,
      productVariant: d.product_variant,
      quantityLiters: d.quantity_liters,
      slot: d.slot,
      assignedRider: d.assigned_rider,
      status: d.status,
      sequenceOrder: d.sequence_order || 1,
      flatOrUnit: d.flat_or_unit,
      societyOrLandmark: d.society_or_landmark || (d.address ? d.address.split(',')[1]?.trim() || d.address.split(' ')[0] : 'Locality'),
      landmark: d.landmark,
      deliveryDate: d.delivery_date,
      isExtraOrder: d.is_extra_order,
      latitude: d.latitude,
      longitude: d.longitude,
      failedReason: d.failed_reason,
      deliveredAt: d.delivered_at,
      notes: d.notes,
    }));
  } catch (err) {
    console.warn('API error, falling back to local state:', err);
    return null;
  }
}

export async function getRoutesApi(): Promise<RouteInfo[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/routes`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch routes');
    const data = await res.json();
    return data.map((r: any) => ({
      id: r.id,
      routeCode: r.route_code,
      name: r.name,
      area: r.area,
      assignedRider: r.assigned_rider,
      slot: r.slot,
      societies: r.societies,
      totalStops: r.total_stops || 0,
      totalLiters: r.total_liters || 0,
      maxCapacityLiters: r.max_capacity_liters || 60.0,
    }));
  } catch (err) {
    console.warn('API error fetching routes, using defaults:', err);
    return [
      { id: 'rt-1', routeCode: 'R-04', name: 'Baner Morning Express', area: 'Baner', assignedRider: 'Rahul Deshmukh', slot: 'Morning (6:00 AM - 7:30 AM)', societies: 'Rohan Nilay, Green Glen, Marvel Zephyr', totalStops: 18, totalLiters: 28.5, maxCapacityLiters: 60.0 },
      { id: 'rt-2', routeCode: 'A-01', name: 'Aundh Heritage Loop', area: 'Aundh', assignedRider: 'Sunil Patil', slot: 'Morning (6:00 AM - 7:30 AM)', societies: 'Sindh Society, ITI Road, DP Road', totalStops: 14, totalLiters: 21.0, maxCapacityLiters: 60.0 },
      { id: 'rt-3', routeCode: 'K-02', name: 'Kothrud Western Line', area: 'Kothrud', assignedRider: 'Vikram Shinde', slot: 'Morning (6:00 AM - 7:30 AM)', societies: 'Dahanukar Colony, Mayur Colony', totalStops: 12, totalLiters: 19.5, maxCapacityLiters: 60.0 },
      { id: 'rt-4', routeCode: 'W-01', name: 'Wanowrie Green Circuit', area: 'Wanowrie', assignedRider: 'Rahul Deshmukh', slot: 'Evening (5:30 PM - 7:00 PM)', societies: 'Salunke Vihar, Oxford Village', totalStops: 9, totalLiters: 14.0, maxCapacityLiters: 60.0 },
      { id: 'rt-5', routeCode: 'WK-03', name: 'Wakad Tech Corridor', area: 'Wakad', assignedRider: 'Sunil Patil', slot: 'Morning (6:00 AM - 7:30 AM)', societies: 'Mont Vert, Pride Purple', totalStops: 11, totalLiters: 16.5, maxCapacityLiters: 60.0 },
    ];
  }
}

export async function createRouteApi(data: {
  routeCode: string;
  name: string;
  area: string;
  assignedRider: string;
  slot?: string;
  societies?: string;
  maxCapacityLiters?: number;
}): Promise<RouteInfo | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        route_code: data.routeCode,
        name: data.name,
        area: data.area,
        assigned_rider: data.assignedRider,
        slot: data.slot || 'Morning (6:00 AM - 7:30 AM)',
        societies: data.societies,
        max_capacity_liters: data.maxCapacityLiters || 60.0,
      }),
    });
    if (!res.ok) throw new Error('Failed to create route');
    const r = await res.json();
    return {
      id: r.id,
      routeCode: r.route_code,
      name: r.name,
      area: r.area,
      assignedRider: r.assigned_rider,
      slot: r.slot,
      societies: r.societies,
      totalStops: r.total_stops || 0,
      totalLiters: r.total_liters || 0,
      maxCapacityLiters: r.max_capacity_liters || 60.0,
    };
  } catch (err) {
    console.warn('API error creating route:', err);
    return null;
  }
}

export async function buildAndDispatchRouteApi(payload: RouteBuildPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/routes/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        route_code: payload.routeCode,
        name: payload.name,
        area: payload.area,
        assigned_rider: payload.assignedRider,
        slot: payload.slot || 'Morning (6:00 AM - 7:30 AM)',
        societies: payload.societies,
        max_capacity_liters: payload.maxCapacityLiters || 60.0,
        stops: payload.stops.map((s) => ({
          customer_id: s.customerId,
          sequence_order: s.sequenceOrder,
          custom_slot: s.customSlot,
        })),
      }),
    });
    if (!res.ok) throw new Error('Failed to build and dispatch route');
    return await res.json();
  } catch (err) {
    console.warn('API error building route:', err);
    return null;
  }
}

export async function updateDeliveryAddressApi(deliveryId: string, data: {
  address?: string;
  flatOrUnit?: string;
  societyOrLandmark?: string;
  landmark?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/deliveries/${deliveryId}/address`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: data.address,
        flat_or_unit: data.flatOrUnit,
        society_or_landmark: data.societyOrLandmark,
        landmark: data.landmark,
        area: data.area,
        latitude: data.latitude,
        longitude: data.longitude,
        notes: data.notes,
      }),
    });
    if (!res.ok) throw new Error('Failed to update address');
    return await res.json();
  } catch (err) {
    console.warn('API error updating address:', err);
    return null;
  }
}

export async function generateDailyDeliveriesApi(req?: { deliveryDate?: string; slot?: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/deliveries/generate-daily`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        delivery_date: req?.deliveryDate,
        slot: req?.slot || 'ALL',
      }),
    });
    if (!res.ok) throw new Error('Failed to generate daily deliveries');
    return await res.json();
  } catch (err) {
    console.warn('API error generating daily deliveries:', err);
    return null;
  }
}

export async function reorderDeliveriesApi(stops: { id: string; sequenceOrder: number }[]) {
  try {
    const res = await fetch(`${API_BASE_URL}/deliveries/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stops: stops.map((s) => ({ id: s.id, sequence_order: s.sequenceOrder })),
      }),
    });
    if (!res.ok) throw new Error('Failed to reorder deliveries');
    return await res.json();
  } catch (err) {
    console.warn('API error reordering deliveries:', err);
    return null;
  }
}

export async function patchDeliveryStatus(deliveryId: string, status: string, failureReason?: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/deliveries/${deliveryId}/status?status=${encodeURIComponent(status)}${failureReason ? `&failure_reason=${encodeURIComponent(failureReason)}` : ''}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to update delivery status');
    return await res.json();
  } catch (err) {
    console.warn('API error:', err);
    return null;
  }
}

export async function postDeliveryTaskApi(data: {
  customerName: string;
  customerPhone: string;
  address: string;
  area: string;
  productVariant: string;
  quantityLiters: number;
  slot?: string;
  assignedRider: string;
  notes?: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/deliveries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: data.customerName,
        customer_phone: data.customerPhone,
        address: data.address,
        area: data.area,
        product_variant: data.productVariant,
        quantity_liters: data.quantityLiters,
        slot: data.slot || 'Morning',
        assigned_rider: data.assignedRider,
        notes: data.notes,
      }),
    });
    if (!res.ok) throw new Error('Failed to create delivery');
    const d = await res.json();
    return {
      id: d.id,
      deliveryNumber: d.delivery_number,
      customerName: d.customer_name,
      customerPhone: d.customer_phone,
      address: d.address,
      area: d.area,
      productVariant: d.product_variant,
      quantityLiters: d.quantity_liters,
      slot: d.slot,
      assignedRider: d.assigned_rider,
      status: d.status,
      failedReason: d.failed_reason,
      deliveredAt: d.delivered_at,
      notes: d.notes,
    };
  } catch (err) {
    console.warn('API error:', err);
    return null;
  }
}

export async function patchDeliveryAssignApi(deliveryId: string, data: {
  assignedRider?: string;
  slot?: string;
  area?: string;
  status?: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/deliveries/${deliveryId}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assigned_rider: data.assignedRider,
        slot: data.slot,
        area: data.area,
        status: data.status,
      }),
    });
    if (!res.ok) throw new Error('Failed to reassign delivery');
    return await res.json();
  } catch (err) {
    console.warn('API error:', err);
    return null;
  }
}

export async function postRouteAssignApi(data: {
  area: string;
  assignedRider: string;
  slot?: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/deliveries/route-assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        area: data.area,
        assigned_rider: data.assignedRider,
        slot: data.slot,
      }),
    });
    if (!res.ok) throw new Error('Failed to assign route');
    return await res.json();
  } catch (err) {
    console.warn('API error:', err);
    return null;
  }
}

// ----------------- INVOICES -----------------
export async function getInvoices() {
  try {
    const res = await fetch(`${API_BASE_URL}/invoices`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch invoices');
    const data = await res.json();
    return data.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      customerId: inv.customer_id,
      customerName: inv.customer_name,
      customerType: inv.customer_type || 'HOUSEHOLD',
      billingPeriod: inv.billing_period,
      issueDate: inv.issue_date,
      dueDate: inv.due_date,
      totalAmount: inv.total_amount,
      paidAmount: inv.paid_amount || 0,
      status: inv.status,
    }));
  } catch (err) {
    console.warn('API error, falling back to local state:', err);
    return null;
  }
}

export async function postInvoice(data: {
  customerId: string;
  totalAmount: number;
  billingPeriod: string;
  dueDate: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: data.customerId,
        total_amount: data.totalAmount,
        billing_period: data.billingPeriod,
        due_date: data.dueDate,
      }),
    });
    if (!res.ok) throw new Error('Failed to create invoice');
    return await res.json();
  } catch (err) {
    console.warn('API error:', err);
    return null;
  }
}

export async function postPayment(invoiceId: string, amount: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error('Failed to record payment');
    return await res.json();
  } catch (err) {
    console.warn('API error:', err);
    return null;
  }
}

// ----------------- EXPENSES -----------------
export async function getExpenses() {
  try {
    const res = await fetch(`${API_BASE_URL}/expenses`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch expenses');
    const data = await res.json();
    return data.map((e: any) => ({
      id: e.id,
      category: e.category,
      amount: e.amount,
      date: e.date,
      vendor: e.vendor,
      paymentMethod: e.payment_method || 'UPI',
      notes: e.notes,
    }));
  } catch (err) {
    console.warn('API error, falling back to local state:', err);
    return null;
  }
}

export async function postExpense(data: {
  category: string;
  amount: number;
  vendor: string;
  paymentMethod?: string;
  notes?: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: data.category,
        amount: data.amount,
        vendor: data.vendor,
        payment_method: data.paymentMethod || 'UPI',
        notes: data.notes,
      }),
    });
    if (!res.ok) throw new Error('Failed to create expense');
    return await res.json();
  } catch (err) {
    console.warn('API error:', err);
    return null;
  }
}

// ----------------- STAFF -----------------
export async function getStaff() {
  try {
    const res = await fetch(`${API_BASE_URL}/staff`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch staff');
    const data = await res.json();
    return data.map((st: any) => ({
      id: st.id,
      name: st.name,
      role: st.role,
      phone: st.phone,
      assignedArea: st.assigned_area,
      status: st.status,
      deliveriesToday: st.deliveries_today || 0,
      rating: st.rating || 4.9,
      joiningDate: st.joining_date,
    }));
  } catch (err) {
    console.warn('API error, falling back to local state:', err);
    return null;
  }
}

export async function postStaff(data: {
  name: string;
  role?: string;
  phone: string;
  assignedArea: string;
  status?: string;
  deliveriesToday?: number;
  rating?: number;
  joiningDate?: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        role: data.role || 'Delivery Rider',
        phone: data.phone,
        assigned_area: data.assignedArea,
        status: data.status || 'On Duty',
        deliveries_today: data.deliveriesToday || 0,
        rating: data.rating || 5.0,
        joining_date: data.joiningDate || new Date().toISOString().split('T')[0],
      }),
    });
    if (!res.ok) throw new Error('Failed to create staff member');
    const st = await res.json();
    return {
      id: st.id,
      name: st.name,
      role: st.role,
      phone: st.phone,
      assignedArea: st.assigned_area,
      status: st.status,
      deliveriesToday: st.deliveries_today || 0,
      rating: st.rating || 5.0,
      joiningDate: st.joining_date,
    };
  } catch (err) {
    console.warn('API error creating staff:', err);
    return null;
  }
}

export async function deleteStaffApi(staffId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/staff/${staffId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('API error deleting staff:', err);
    return false;
  }
}

export async function patchStaffApi(
  staffId: string,
  updateData: { status?: string; assignedArea?: string; phone?: string; role?: string; rating?: number }
) {
  try {
    const res = await fetch(`${API_BASE_URL}/staff/${staffId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: updateData.status,
        assigned_area: updateData.assignedArea,
        phone: updateData.phone,
        role: updateData.role,
        rating: updateData.rating,
      }),
    });
    if (!res.ok) throw new Error('Failed to update staff member');
    const st = await res.json();
    return {
      id: st.id,
      name: st.name,
      role: st.role,
      phone: st.phone,
      assignedArea: st.assigned_area,
      status: st.status,
      deliveriesToday: st.deliveries_today || 0,
      rating: st.rating || 5.0,
      joiningDate: st.joining_date,
    };
  } catch (err) {
    console.warn('API error patching staff:', err);
    return null;
  }
}

// ----------------- AUTHENTICATION -----------------
export async function loginApi(credentials: {
  login_id: string;
  password?: string;
  role: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Authentication failed');
    }
    return await res.json();
  } catch (err: any) {
    console.warn('Backend login unavailable, fallback allowed:', err);
    return null;
  }
}

// ----------------- 1. AI DEMAND FORECASTING API -----------------
export async function getDemandForecastApi(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics/demand-forecast`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch demand forecast');
    return await res.json();
  } catch (err) {
    console.warn('Forecast API unavailable, using fallback:', err);
    return {
      target_date: 'Tomorrow, 24 Oct 2026',
      target_day_name: 'Saturday',
      total_predicted_demand: 2540.0,
      total_available_stock: 1980.0,
      total_shortage: 814.0,
      total_suggested_procurement: 814.0,
      total_estimated_cost: 38240.0,
      variants: [
        {
          variant: 'Cow Milk',
          active_subscriptions_liters: 950.0,
          b2b_orders_liters: 240.0,
          weekday_multiplier: 1.15,
          total_predicted_demand: 1368.5,
          current_available_stock: 920.0,
          safety_buffer_liters: 136.9,
          net_shortage: 585.4,
          suggested_procurement: 585.4,
          unit_cost_estimate: 46.0,
          estimated_procurement_cost: 26928.4,
        },
        {
          variant: 'Buffalo Milk',
          active_subscriptions_liters: 680.0,
          b2b_orders_liters: 180.0,
          weekday_multiplier: 1.15,
          total_predicted_demand: 989.0,
          current_available_stock: 740.0,
          safety_buffer_liters: 98.9,
          net_shortage: 347.9,
          suggested_procurement: 347.9,
          unit_cost_estimate: 52.0,
          estimated_procurement_cost: 18090.8,
        },
        {
          variant: 'Toned Milk',
          active_subscriptions_liters: 310.0,
          b2b_orders_liters: 60.0,
          weekday_multiplier: 1.15,
          total_predicted_demand: 425.5,
          current_available_stock: 450.0,
          safety_buffer_liters: 42.6,
          net_shortage: 18.1,
          suggested_procurement: 18.1,
          unit_cost_estimate: 38.0,
          estimated_procurement_cost: 687.8,
        },
        {
          variant: 'A2 Desi Cow Milk',
          active_subscriptions_liters: 140.0,
          b2b_orders_liters: 20.0,
          weekday_multiplier: 1.15,
          total_predicted_demand: 184.0,
          current_available_stock: 180.0,
          safety_buffer_liters: 18.4,
          net_shortage: 22.4,
          suggested_procurement: 22.4,
          unit_cost_estimate: 72.0,
          estimated_procurement_cost: 1612.8,
        },
      ],
      seven_day_trend: [
        { day: 'Fri', date: '23 Oct', predicted_liters: 2380, actual_or_baseline_liters: 2350 },
        { day: 'Sat', date: '24 Oct', predicted_liters: 2540, actual_or_baseline_liters: 2420 },
        { day: 'Sun', date: '25 Oct', predicted_liters: 2620, actual_or_baseline_liters: 2510 },
        { day: 'Mon', date: '26 Oct', predicted_liters: 2290, actual_or_baseline_liters: 2270 },
        { day: 'Tue', date: '27 Oct', predicted_liters: 2250, actual_or_baseline_liters: 2230 },
        { day: 'Wed', date: '28 Oct', predicted_liters: 2340, actual_or_baseline_liters: 2310 },
        { day: 'Thu', date: '29 Oct', predicted_liters: 2280, actual_or_baseline_liters: 2260 },
      ],
      confidence_score: 94.6,
      recommendations: [
        'Tomorrow is Saturday with a weekend spike factor of +15% across household tea/coffee slots.',
        'Procure 585 L Cow Milk from Baramati Co-Op center before 21:30 to avoid morning dispatch delay.',
        'Silo #1 buffer level is optimal for morning route R-04 Baner dispatches.',
      ],
    };
  }
}

// ----------------- 2. WASTAGE INTELLIGENCE API -----------------
export async function getWastageInsightsApi(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics/wastage-insights`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch wastage insights');
    return await res.json();
  } catch (err) {
    console.warn('Wastage API unavailable, using fallback:', err);
    return {
      total_wastage_liters: 96.5,
      total_procured_liters: 8450.0,
      wastage_rate_percentage: 1.14,
      total_financial_loss: 4632.0,
      benchmark_status: 'HEALTHY',
      reasons_breakdown: [
        { reason: 'Cold-Chain Temperature Breach (>6°C)', quantity_liters: 42.0, percentage: 43.5, financial_loss: 2016.0 },
        { reason: 'Transit Spillage & Container Damage', quantity_liters: 28.5, percentage: 29.5, financial_loss: 1368.0 },
        { reason: 'Quality Rejection (Low FAT/SNF)', quantity_liters: 14.0, percentage: 14.5, financial_loss: 672.0 },
        { reason: 'Packaging Pouch Rupture', quantity_liters: 8.0, percentage: 8.3, financial_loss: 384.0 },
        { reason: 'Lab Quality Testing Samples', quantity_liters: 4.0, percentage: 4.2, financial_loss: 192.0 },
      ],
      variants_breakdown: [
        { variant: 'Cow Milk', quantity_liters: 48.5, percentage: 50.3, financial_loss: 2328.0 },
        { variant: 'Buffalo Milk', quantity_liters: 32.0, percentage: 33.2, financial_loss: 1760.0 },
        { variant: 'Toned Milk', quantity_liters: 11.5, percentage: 11.9, financial_loss: 460.0 },
        { variant: 'A2 Desi Cow Milk', quantity_liters: 4.5, percentage: 4.6, financial_loss: 324.0 },
      ],
      cost_trend_vs_last_week_percentage: -14.2,
      mitigation_tips: [
        'Calibrate Silo #2 secondary chiller thermostat: 43% of souring occurred during 14:00 peak heat.',
        'Inspect Delivery Van #3 crate latches to prevent road transit pouch ruptures.',
        'Enforce 15-minute dock unloading SLA when raw milk tankers arrive from rural cooperatives.',
      ],
    };
  }
}

// ----------------- 3. ROUTE OPTIMIZATION API -----------------
export async function getOptimizedRouteApi(routeName = 'Baner Morning Route R-04'): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/deliveries/optimized-route?route_name=${encodeURIComponent(routeName)}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch optimized route');
    return await res.json();
  } catch (err) {
    console.warn('Route optimizer API unavailable, using fallback:', err);
    return {
      route_name: routeName,
      total_stops: 8,
      original_distance_km: 26.4,
      optimized_distance_km: 17.2,
      distance_saved_km: 9.2,
      original_time_mins: 68,
      optimized_time_mins: 46,
      time_saved_mins: 22,
      fuel_saved_liters: 1.3,
      traffic_density: 'Low - Morning Clear Corridor',
      is_applied: true,
      stops: [
        {
          stop_number: 1,
          delivery_id: 'deliv-1',
          customer_name: 'Priya Kulkarni',
          customer_phone: '+91 98200 44551',
          address: 'Kasturkunj Society, Tower B-402, Baner Road',
          area: 'Baner',
          product_variant: 'Cow Milk (Pouch)',
          quantity_liters: 1.5,
          slot: 'Morning (6:00 AM - 7:30 AM)',
          estimated_arrival: '05:45 AM',
          distance_from_prev_km: 0.0,
        },
        {
          stop_number: 2,
          delivery_id: 'deliv-2',
          customer_name: 'Anand Shinde',
          customer_phone: '+91 98200 44552',
          address: 'Rohan Nilay, Phase 1, Flat 104, Aundh-Baner Link Rd',
          area: 'Aundh',
          product_variant: 'Buffalo Milk (Fresh Can)',
          quantity_liters: 2.0,
          slot: 'Morning (6:00 AM - 7:30 AM)',
          estimated_arrival: '05:52 AM',
          distance_from_prev_km: 1.8,
        },
        {
          stop_number: 3,
          delivery_id: 'deliv-3',
          customer_name: 'Deepak Joshi',
          customer_phone: '+91 98200 44553',
          address: 'Pride Panorama, Penthouse 12, Pancard Club Road',
          area: 'Baner',
          product_variant: 'Cow Milk (Pouch)',
          quantity_liters: 1.0,
          slot: 'Morning (6:00 AM - 7:30 AM)',
          estimated_arrival: '06:01 AM',
          distance_from_prev_km: 2.1,
        },
        {
          stop_number: 4,
          delivery_id: 'deliv-4',
          customer_name: 'Sunita Patil',
          customer_phone: '+91 98200 44554',
          address: 'Pecan Tree Enclave, Villa 18, Veerbhadra Nagar',
          area: 'Baner',
          product_variant: 'A2 Desi Cow Milk',
          quantity_liters: 2.0,
          slot: 'Morning (6:00 AM - 7:30 AM)',
          estimated_arrival: '06:09 AM',
          distance_from_prev_km: 1.9,
        },
        {
          stop_number: 5,
          delivery_id: 'deliv-5',
          customer_name: 'Vikram Mehta',
          customer_phone: '+91 98200 44555',
          address: 'Blue Ridge Residency, Tower 6-302, Hinjawadi Phase 1',
          area: 'Hinjawadi',
          product_variant: 'Cow Milk (Pouch)',
          quantity_liters: 1.5,
          slot: 'Morning (6:00 AM - 7:30 AM)',
          estimated_arrival: '06:18 AM',
          distance_from_prev_km: 3.2,
        },
        {
          stop_number: 6,
          delivery_id: 'deliv-6',
          customer_name: 'Pooja Agarwal',
          customer_phone: '+91 98200 44556',
          address: 'Balewadi High Street, Apt 501',
          area: 'Balewadi',
          product_variant: 'Toned Milk',
          quantity_liters: 1.0,
          slot: 'Morning (6:00 AM - 7:30 AM)',
          estimated_arrival: '06:26 AM',
          distance_from_prev_km: 2.4,
        },
        {
          stop_number: 7,
          delivery_id: 'deliv-7',
          customer_name: 'Suresh Raina',
          customer_phone: '+91 98200 44557',
          address: 'Windmill Village, Rowhouse 7, Bavdhan Main Rd',
          area: 'Bavdhan',
          product_variant: 'Buffalo Milk (Fresh Can)',
          quantity_liters: 2.5,
          slot: 'Morning (6:00 AM - 7:30 AM)',
          estimated_arrival: '06:34 AM',
          distance_from_prev_km: 2.8,
        },
        {
          stop_number: 8,
          delivery_id: 'deliv-8',
          customer_name: 'Rohan Gavaskar',
          customer_phone: '+91 98200 44558',
          address: 'Amar Paradigm, Block C-201, Baner Hill Trail',
          area: 'Baner',
          product_variant: 'Cow Milk (Pouch)',
          quantity_liters: 1.0,
          slot: 'Morning (6:00 AM - 7:30 AM)',
          estimated_arrival: '06:42 AM',
          distance_from_prev_km: 3.0,
        },
      ],
    };
  }
}

export async function applyRouteSequenceApi(routeName = 'Baner Morning Route R-04'): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/deliveries/apply-sequence?route_name=${encodeURIComponent(routeName)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to apply route sequence');
    return await res.json();
  } catch (err) {
    console.warn('API error, simulated sequence applied:', err);
    return { success: true, message: 'Optimal sequence applied to rider dispatch.' };
  }
}

// ----------------- 4. FLEXIBLE SUBSCRIPTION ACTIONS -----------------
export async function skipSubscriptionDeliveryApi(subId: string, payload: { skip_date: string; reason?: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/subscriptions/${subId}/skip`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to skip delivery');
    return await res.json();
  } catch (err) {
    console.warn('API error, using local fallback:', err);
    return {
      success: true,
      subscription_id: subId,
      skipped_date: payload.skip_date,
      reason: payload.reason || 'Personal / Out of town',
      message: `Delivery skipped for ${payload.skip_date}. Daily billing adjusted.`,
    };
  }
}

export async function modifySubscriptionQuantityApi(
  subId: string,
  payload: { new_quantity_liters: number; effective_date: string; reason?: string }
) {
  try {
    const res = await fetch(`${API_BASE_URL}/subscriptions/${subId}/modify-quantity`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to modify quantity');
    return await res.json();
  } catch (err) {
    console.warn('API error, using local fallback:', err);
    return {
      success: true,
      subscription_id: subId,
      new_quantity: payload.new_quantity_liters,
      effective_date: payload.effective_date,
      message: `Daily milk quota updated to ${payload.new_quantity_liters}L effective ${payload.effective_date}.`,
    };
  }
}

export async function scheduleExtraMilkApi(
  subId: string,
  payload: { extra_liters: number; date: string; variant?: string; notes?: string }
) {
  try {
    const res = await fetch(`${API_BASE_URL}/subscriptions/${subId}/extra-milk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to schedule extra milk');
    return await res.json();
  } catch (err) {
    console.warn('API error, using local fallback:', err);
    return {
      success: true,
      subscription_id: subId,
      date: payload.date,
      extra_liters: payload.extra_liters,
      variant: payload.variant || 'Cow Milk',
      message: `Scheduled +${payload.extra_liters}L extra milk on ${payload.date}.`,
    };
  }
}

// ----------------- 5. CUSTOMER INSIGHTS API -----------------
export async function getCustomerInsightsApi(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics/customer-insights`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch customer insights');
    return await res.json();
  } catch (err) {
    console.warn('API error, using fallback insights:', err);
    return {
      total_customers: 148,
      active_subscribers: 118,
      retention_rate_percentage: 92.4,
      at_risk_count: 2,
      overdue_count: 2,
      top_buyers_count: 2,
      retention_tips: [
        'Reach out to customers on vacation pause > 7 days with a 1-tap "Welcome Home" resume reminder.',
        'Overdue accounts: Dispatch riders can accept UPI QR payment right upon morning delivery.',
        'Offer complimentary 500ml A2 Desi Cow Milk sampler to top Cow Milk subscribers.',
      ],
      insights: [
        {
          id: 'c-top-1',
          name: 'Chitale Bandhu Mithaiwale',
          type: 'SHOP',
          area: 'Deccan Gymkhana',
          phone: '+91 98221 00234',
          status: 'Active',
          category: 'TOP_BUYER',
          metric_label: 'Monthly Volume',
          metric_value: '1,450 L (₹87,000/mo)',
          risk_level: 'LOW',
          recommended_action: 'VIP Account: Schedule weekly cold-chain review',
        },
        {
          id: 'c-top-2',
          name: 'Priya Kulkarni',
          type: 'HOUSEHOLD',
          area: 'Baner Road',
          phone: '+91 98200 44551',
          status: 'Active',
          category: 'TOP_BUYER',
          metric_label: 'Subscription Loyalty',
          metric_value: '18 Months Active • Zero Delays',
          risk_level: 'LOW',
          recommended_action: 'Send festive premium ghee sampler gift',
        },
        {
          id: 'c-risk-1',
          name: 'Vikram Salunkhe',
          type: 'HOUSEHOLD',
          area: 'Kothrud Stand',
          phone: '+91 98220 77612',
          status: 'Paused',
          category: 'AT_RISK',
          metric_label: 'Paused Duration',
          metric_value: 'Paused for 9 consecutive days',
          risk_level: 'HIGH',
          recommended_action: 'Send friendly WhatsApp check-in: "Is your vacation over?"',
        },
        {
          id: 'c-risk-2',
          name: 'Sunita Deshpande',
          type: 'HOUSEHOLD',
          area: 'Aundh Gaon',
          phone: '+91 98220 99431',
          status: 'Active',
          category: 'AT_RISK',
          metric_label: 'Quota Reduction',
          metric_value: 'Decreased from 2.0L to 0.5L',
          risk_level: 'MEDIUM',
          recommended_action: 'Call to inquire about taste or delivery timing feedback',
        },
        {
          id: 'c-due-1',
          name: 'Modern Bakery & Confectionery',
          type: 'SHOP',
          area: 'Camp East',
          phone: '+91 98220 33819',
          status: 'Active',
          category: 'OVERDUE',
          metric_label: 'Overdue Balance',
          metric_value: '₹14,280 (24 days overdue)',
          risk_level: 'HIGH',
          recommended_action: 'Send automated UPI payment link & reminder SMS',
        },
        {
          id: 'c-due-2',
          name: 'Rajesh Patil',
          type: 'HOUSEHOLD',
          area: 'Viman Nagar',
          phone: '+91 98200 66129',
          status: 'Active',
          category: 'OVERDUE',
          metric_label: 'Cycle Dues',
          metric_value: '₹2,480 (16 days overdue)',
          risk_level: 'MEDIUM',
          recommended_action: 'Soft reminder notification on delivery invoice',
        },
        {
          id: 'c-vol-1',
          name: 'Kalyani Cafe & Milk Center',
          type: 'SHOP',
          area: 'Kothrud Depot',
          phone: '+91 98220 88210',
          status: 'Active',
          category: 'HIGH_VOLUME_SHOP',
          metric_label: 'Bulk Intake',
          metric_value: '85 L Buffalo Milk / Daily',
          risk_level: 'LOW',
          recommended_action: 'Lock in 6-month contract with 3% bulk rebate',
        },
      ],
    };
  }
}

// =========================================================================
// 8. OFFLINE DELIVERY BATCH SYNC API
// =========================================================================
export async function syncOfflineDeliveriesApi(payload: {
  actions: Array<{
    delivery_id: string;
    status: 'Delivered' | 'Failed';
    notes?: string;
    bottles_returned?: number;
    cash_collected?: number;
    timestamp: string;
    client_action_id: string;
  }>;
  rider_id?: string;
  rider_name?: string;
  device_info?: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/deliveries/sync-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to batch sync offline deliveries');
    return await res.json();
  } catch (err) {
    console.warn('API sync failed, falling back to local simulation:', err);
    return {
      synced_count: payload.actions.length,
      success: true,
      server_timestamp: new Date().toISOString(),
      message: `Offline sync simulated: ${payload.actions.length} stops saved locally.`,
      results: payload.actions.map((a) => ({
        delivery_id: a.delivery_id,
        client_action_id: a.client_action_id,
        status: 'LOCAL_FALLBACK_SYNCED',
        synced_status: a.status,
      })),
    };
  }
}

// =========================================================================
// 9. IN-APP NOTIFICATIONS API
// =========================================================================
export async function getNotificationsApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return await res.json();
  } catch (err) {
    console.warn('Notifications API offline, returning client notifications fallback:', err);
    return {
      unread_count: 3,
      total_count: 4,
      notifications: [
        {
          id: 'notif_1',
          title: 'Low Stock Warning: A2 Desi Cow Milk',
          message: 'Cold room inventory down to 180 Liters (threshold: 200 L). Restock recommended.',
          category: 'INVENTORY',
          severity: 'WARNING',
          timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
          time_ago: '14m ago',
          is_read: false,
          action_url: '/inventory',
          action_label: 'Restock Intake',
        },
        {
          id: 'notif_2',
          title: 'Vacation Pause: Ananya Sharma',
          message: 'Delivery skipped for 24-28 Oct (Diwali Vacation). Daily quota -1.5L adjusted.',
          category: 'SUBSCRIPTION',
          severity: 'INFO',
          timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
          time_ago: '42m ago',
          is_read: false,
          action_url: '/household',
          action_label: 'View Subscriptions',
        },
        {
          id: 'notif_3',
          title: 'Morning Run 86% Complete',
          message: 'Rahul Deshmukh completed 24 of 28 stops in Baner Sector 3.',
          category: 'DELIVERY',
          severity: 'SUCCESS',
          timestamp: new Date(Date.now() - 68 * 60 * 1000).toISOString(),
          time_ago: '1h ago',
          is_read: false,
          action_url: '/delivery',
          action_label: 'Live Route',
        },
        {
          id: 'notif_4',
          title: 'Overdue Bill Reminder Triggered',
          message: 'Hotel Shiv Sagar has ₹7,800 pending beyond 15-day cycle. Auto-reminder sent.',
          category: 'BILLING',
          severity: 'URGENT',
          timestamp: new Date(Date.now() - 135 * 60 * 1000).toISOString(),
          time_ago: '2h ago',
          is_read: true,
          action_url: '/customers',
          action_label: 'View Account',
        },
      ],
    };
  }
}

export async function markNotificationReadApi(notifId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/${notifId}/read`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to mark notification read');
    return await res.json();
  } catch (err) {
    return { success: true, id: notifId, is_read: true };
  }
}

export async function markAllNotificationsReadApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to mark all notifications read');
    return await res.json();
  } catch (err) {
    return { success: true, message: 'Marked all read locally' };
  }
}

export async function clearReadNotificationsApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/clear`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to clear notifications');
    return await res.json();
  } catch (err) {
    return { success: true, remaining_count: 0 };
  }
}

export async function simulateNotificationEventApi(eventType: 'SKIP' | 'STOCK' | 'ROUTE' | 'ORDER' = 'SKIP') {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/simulate-event?event_type=${eventType}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to simulate notification event');
    return await res.json();
  } catch (err) {
    return {
      success: true,
      created_notification: {
        id: `sim_${Date.now()}`,
        title: `Simulated Alert: ${eventType}`,
        message: 'Real-time alert triggered on demonstration console.',
        category: eventType === 'SKIP' ? 'SUBSCRIPTION' : eventType === 'STOCK' ? 'INVENTORY' : 'DELIVERY',
        severity: eventType === 'STOCK' ? 'URGENT' : 'INFO',
        timestamp: new Date().toISOString(),
        time_ago: 'Just now',
        is_read: false,
      },
    };
  }
}

// ----------------- DAIRIES (MULTI-TENANT) -----------------
export async function getDairiesApi(): Promise<DairyInfo[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/dairies`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch dairies');
    const data = await res.json();
    const mapped = data.map((d: any) => ({
      id: d.id,
      name: d.name,
      ownerName: d.owner_name,
      email: d.email,
      phone: d.phone,
      city: d.city,
      address: d.address,
      latitude: d.latitude,
      longitude: d.longitude,
      rating: d.rating,
      createdAt: d.created_at,
    }));
    if (typeof window !== 'undefined' && mapped.length > 0) {
      try {
        localStorage.setItem('dairypulse_registered_dairies', JSON.stringify(mapped));
      } catch (e) {}
    }
    return mapped;
  } catch (err) {
    console.warn('API error fetching dairies, using local defaults/cache:', err);
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('dairypulse_registered_dairies');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return [
      { id: 'dairy-1', name: 'Amrut Dairy Farm', ownerName: 'Rajesh Sharma', email: 'admin@dairypulse.com', phone: '+91 98765 43210', city: 'Pune', address: 'Hadapsar Chilling Center, Pune', latitude: 18.5089, longitude: 73.9259, rating: 4.9 },
      { id: 'dairy-2', name: 'Gokul Pure Milk Co.', ownerName: 'Suresh Patil', email: 'gokul@dairy.com', phone: '+91 98220 12345', city: 'Pune', address: 'Kothrud Depot, Pune', latitude: 18.5074, longitude: 73.8077, rating: 4.8 },
      { id: 'dairy-3', name: 'Gir Organic Farms', ownerName: 'Mahesh Deshmukh', email: 'gir@dairy.com', phone: '+91 97654 32109', city: 'Pune', address: 'Bavdhan Valley, Pune', latitude: 18.5140, longitude: 73.7710, rating: 4.95 },
    ];
  }
}

export async function postDairyApi(dairyData: {
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  password?: string;
}): Promise<DairyInfo | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/dairies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: dairyData.name,
        owner_name: dairyData.ownerName,
        email: dairyData.email,
        phone: dairyData.phone,
        city: dairyData.city || 'Pune',
        address: dairyData.address || '',
        latitude: dairyData.latitude,
        longitude: dairyData.longitude,
        password: dairyData.password || 'dairy123',
      }),
    });
    if (!res.ok) throw new Error('Failed to register dairy');
    const d = await res.json();
    return {
      id: d.id,
      name: d.name,
      ownerName: d.owner_name,
      email: d.email,
      phone: d.phone,
      city: d.city,
      address: d.address,
      latitude: d.latitude,
      longitude: d.longitude,
      rating: d.rating,
      createdAt: d.created_at,
    };
  } catch (err) {
    console.warn('API error registering dairy:', err);
    return null;
  }
}

export async function patchDairyApi(
  dairyId: string,
  data: {
    name?: string;
    ownerName?: string;
    email?: string;
    phone?: string;
    city?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  }
): Promise<DairyInfo | null> {
  try {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.ownerName !== undefined) payload.owner_name = data.ownerName;
    if (data.email !== undefined) payload.email = data.email;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.city !== undefined) payload.city = data.city;
    if (data.address !== undefined) payload.address = data.address;
    if (data.latitude !== undefined) payload.latitude = data.latitude;
    if (data.longitude !== undefined) payload.longitude = data.longitude;

    const res = await fetch(`${API_BASE_URL}/dairies/${dairyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update dairy');
    const d = await res.json();
    return {
      id: d.id,
      name: d.name,
      ownerName: d.owner_name,
      email: d.email,
      phone: d.phone,
      city: d.city,
      address: d.address,
      latitude: d.latitude,
      longitude: d.longitude,
      rating: d.rating,
      createdAt: d.created_at,
    };
  } catch (err) {
    console.warn('API error updating dairy:', err);
    return null;
  }
}

// ----------------- DRIVER RATINGS -----------------
export async function postDriverRatingApi(data: {
  driverName: string;
  driverId?: string;
  customerId?: string;
  customerName: string;
  deliveryId?: string;
  rating: number;
  tags?: string[];
  feedback?: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/ratings/driver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driver_name: data.driverName,
        driver_id: data.driverId || null,
        customer_id: data.customerId || null,
        customer_name: data.customerName,
        delivery_id: data.deliveryId || null,
        rating: data.rating,
        tags: data.tags || [],
        feedback: data.feedback || '',
      }),
    });
    if (!res.ok) throw new Error('Failed to submit driver rating');
    return await res.json();
  } catch (err) {
    console.warn('API error submitting driver rating:', err);
    return null;
  }
}

export async function getDriverRatingsApi(driverName?: string) {
  try {
    const url = driverName
      ? `${API_BASE_URL}/ratings/driver/${encodeURIComponent(driverName)}`
      : `${API_BASE_URL}/ratings`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch driver ratings');
    const data = await res.json();
    return data.map((r: any) => ({
      id: r.id,
      driverName: r.driver_name,
      driverId: r.driver_id,
      customerId: r.customer_id,
      customerName: r.customer_name,
      deliveryId: r.delivery_id,
      rating: r.rating,
      tags: r.tags,
      feedback: r.feedback,
      createdAt: r.created_at,
    }));
  } catch (err) {
    console.warn('API error fetching driver ratings:', err);
    return [];
  }
}
