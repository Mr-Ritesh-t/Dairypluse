'use client';

import { useState, useEffect, useCallback } from 'react';
import { OfflineDeliveryAction, DeliveryBatchSyncResponse } from '@/types';
import { syncOfflineDeliveriesApi } from './api';

const QUEUE_STORAGE_KEY = 'dairypulse_offline_delivery_queue_v1';
const SIMULATED_OFFLINE_KEY = 'dairypulse_simulated_offline_v1';

export function getOfflineDeliveryQueue(): OfflineDeliveryAction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read offline delivery queue:', err);
    return [];
  }
}

export function saveOfflineDeliveryAction(action: OfflineDeliveryAction): OfflineDeliveryAction[] {
  if (typeof window === 'undefined') return [];
  try {
    const queue = getOfflineDeliveryQueue();
    // Replace if same delivery_id already has a pending action, or append
    const existingIndex = queue.findIndex((a) => a.delivery_id === action.delivery_id);
    if (existingIndex >= 0) {
      queue[existingIndex] = action;
    } else {
      queue.push(action);
    }
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    return queue;
  } catch (err) {
    console.error('Failed to save offline delivery action:', err);
    return [];
  }
}

export function clearOfflineDeliveryQueue(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(QUEUE_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear offline queue:', err);
  }
}

export function useOfflineDeliverySync(riderName: string = 'Rahul Deshmukh') {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [pendingQueue, setPendingQueue] = useState<OfflineDeliveryAction[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncResult, setLastSyncResult] = useState<DeliveryBatchSyncResponse | null>(null);

  // Initialize online status and load queue
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);
    const simState = localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';
    setIsSimulatedOffline(simState);
    setPendingQueue(getOfflineDeliveryQueue());

    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when reconnecting if not in simulated offline mode
      if (!simState && getOfflineDeliveryQueue().length > 0) {
        flushQueue();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const effectiveOnline = isOnline && !isSimulatedOffline;

  const toggleSimulatedOffline = useCallback(() => {
    setIsSimulatedOffline((prev) => {
      const next = !prev;
      localStorage.setItem(SIMULATED_OFFLINE_KEY, String(next));
      if (!next && isOnline && getOfflineDeliveryQueue().length > 0) {
        // Just returned online from simulated offline
        setTimeout(() => flushQueue(), 300);
      }
      return next;
    });
  }, [isOnline]);

  const flushQueue = useCallback(async () => {
    const queue = getOfflineDeliveryQueue();
    if (queue.length === 0) return null;

    setIsSyncing(true);
    try {
      const res: DeliveryBatchSyncResponse = await syncOfflineDeliveriesApi({
        actions: queue,
        rider_id: 'rider_1',
        rider_name: riderName,
        device_info: `${navigator.userAgent.slice(0, 40)} (PWA Cache)`,
      });

      if (res.success) {
        clearOfflineDeliveryQueue();
        setPendingQueue([]);
        setLastSyncResult(res);
      }
      return res;
    } catch (err) {
      console.error('Offline flush error:', err);
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [riderName]);

  const recordDeliveryStop = useCallback(
    async (
      deliveryId: string,
      status: 'Delivered' | 'Failed',
      notes?: string,
      bottlesReturned: number = 0,
      cashCollected: number = 0
    ) => {
      const action: OfflineDeliveryAction = {
        delivery_id: deliveryId,
        status,
        notes,
        bottles_returned: bottlesReturned,
        cash_collected: cashCollected,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        client_action_id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      };

      if (!effectiveOnline) {
        // Network unavailable or simulated offline: queue locally!
        const updatedQueue = saveOfflineDeliveryAction(action);
        setPendingQueue([...updatedQueue]);
        return { offlineQueued: true, action };
      } else {
        // Online: Attempt immediate sync, fallback to queue if network drop occurs
        try {
          const res = await syncOfflineDeliveriesApi({
            actions: [action],
            rider_name: riderName,
          });
          setLastSyncResult(res);
          return { offlineQueued: false, action, result: res };
        } catch {
          const updatedQueue = saveOfflineDeliveryAction(action);
          setPendingQueue([...updatedQueue]);
          return { offlineQueued: true, action };
        }
      }
    },
    [effectiveOnline, riderName]
  );

  return {
    isOnline: effectiveOnline,
    realNetworkOnline: isOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    pendingQueue,
    pendingCount: pendingQueue.length,
    isSyncing,
    lastSyncResult,
    recordDeliveryStop,
    triggerManualSync: flushQueue,
  };
}
