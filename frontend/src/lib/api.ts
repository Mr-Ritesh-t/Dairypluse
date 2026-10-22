// DairyPulse API Client for communicating with FastAPI Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

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
  } catch (err) {
    return { online: false };
  }
}

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

export async function getProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/products`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
  } catch (err) {
    console.warn('API error, falling back to local state:', err);
    return null;
  }
}

export async function postStockReceipt(data: {
  product_id: string;
  supplier: string;
  quantity: number;
  cost_price: number;
  notes?: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/inventory/receipts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to post stock receipt');
    return await res.json();
  } catch (err) {
    console.error('API error:', err);
    return null;
  }
}

export async function getDeliveriesToday() {
  try {
    const res = await fetch(`${API_BASE_URL}/deliveries/today`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch deliveries');
    return await res.json();
  } catch (err) {
    console.warn('API error, falling back to local state:', err);
    return null;
  }
}

export async function markDeliveryComplete(deliveryId: string, deliveredQty: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/deliveries/${deliveryId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delivered_quantity: deliveredQty }),
    });
    if (!res.ok) throw new Error('Failed to complete delivery');
    return await res.json();
  } catch (err) {
    console.error('API error:', err);
    return null;
  }
}
