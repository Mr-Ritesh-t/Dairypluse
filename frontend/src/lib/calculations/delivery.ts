/**
 * Delivery domain business logic & calculations
 */

export interface RouteProgress {
  total: number;
  completed: number;
  remaining: number;
  percentage: number;
  isComplete: boolean;
}

/**
 * Computes completion metrics for a delivery run
 */
export function calculateRouteProgress(completed: number, total: number): RouteProgress {
  const safeTotal = Math.max(0, total);
  const safeCompleted = Math.min(Math.max(0, completed), safeTotal);
  const remaining = Math.max(0, safeTotal - safeCompleted);
  const percentage = safeTotal === 0 ? 0 : Math.round((safeCompleted / safeTotal) * 100);

  return {
    total: safeTotal,
    completed: safeCompleted,
    remaining,
    percentage,
    isComplete: safeTotal > 0 && safeCompleted >= safeTotal,
  };
}

/**
 * Formats estimated time of arrival based on minutes remaining
 */
export function formatEstimatedArrival(minutesRemaining: number): string {
  if (minutesRemaining <= 0) return 'Arrived';
  if (minutesRemaining < 60) return `${minutesRemaining} min`;
  const hours = Math.floor(minutesRemaining / 60);
  const mins = minutesRemaining % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Sorts delivery items by designated sequence order safely
 */
export function sortDeliveriesBySequence<T extends { sequence_order?: number | null }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const orderA = a.sequence_order ?? 9999;
    const orderB = b.sequence_order ?? 9999;
    return orderA - orderB;
  });
}

/**
 * Aggregates total milk volume in liters for an array of items
 */
export function calculateTotalVolume<T extends { quantity?: number | string | null }>(
  items: T[]
): number {
  return items.reduce((acc, item) => {
    const qty = typeof item.quantity === 'number' ? item.quantity : parseFloat(String(item.quantity || 0));
    return acc + (isNaN(qty) ? 0 : qty);
  }, 0);
}

