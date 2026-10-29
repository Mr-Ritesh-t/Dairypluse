# DairyPulse — Route Planning & Offline Delivery Reliability

Milk delivery is a time-critical physical operation. This document examines the mathematical route projection engine, stop sequencing mechanics, vehicle load safety controls, and the client-side offline synchronization engine.

---

## 1. Route Planning & Interactive Studio Mechanics

### 1.1 Customer Geolocation & Coordinate Projection
In `frontend/src/components/delivery/RouteBuilderStudio.tsx`, real GPS coordinates are projected onto an interactive 2D street grid without requiring third-party map tiles:

```typescript
// Bounding box calculation with 15% margin
const minLat = Math.min(...validCoords.map(c => c.lat));
const maxLat = Math.max(...validCoords.map(c => c.lat));
const minLng = Math.min(...validCoords.map(c => c.lng));
const maxLng = Math.max(...validCoords.map(c => c.lng));

const projectToPercent = (lat?: number, lng?: number) => {
  if (!lat || !lng) return { x: 50, y: 50 };
  const x = Math.max(8, Math.min(92, ((lng - minLng) / (maxLng - minLng)) * 100));
  const y = Math.max(8, Math.min(92, 100 - ((lat - minLat) / (maxLat - minLat)) * 100));
  return { x, y };
};
```

- **X coordinate**: Maps longitude linearly from west (left) to east (right).
- **Y coordinate**: Maps latitude inversely from north (top) to south (bottom).
- **Visual Delivery Path**: An SVG `<polyline>` takes the projected points `points={polylinePoints}` and renders a glowing, dashed delivery path showing the travel order.

---

### 1.2 Stop Sequencing (Who Gets Delivered 1st, 2nd, 3rd)
- Instead of relying on a black-box TSP (Traveling Salesperson) algorithm that may disregard society gates or security clearance rules, DairyPulse gives operations managers complete control:
  - **`handleMoveUp(index)`**: Swaps a stop with its predecessor (`index - 1`).
  - **`handleMoveDown(index)`**: Swaps a stop with its successor (`index + 1`).
- The chosen index directly dictates `sequence_order = index + 1`.
- When dispatched, the backend (`build_and_dispatch_route` in `api_v1.py:315`) sorts stops by `sequence_order` and writes this integer directly to `DeliveryTask.sequence_order`.
- The rider mobile PWA queries `GET /deliveries/today` and receives tasks pre-sorted:
  ```json
  [
    { "sequence_order": 1, "customer_name": "Priya Kulkarni", "slot": "5:30 AM - 6:30 AM" },
    { "sequence_order": 2, "customer_name": "Amit Sharma", "slot": "6:00 AM - 7:30 AM" }
  ]
  ```

---

### 1.3 Vehicle Load Balancing vs Bike Capacity
- Milk delivery crates carried on motorbikes have physical weight and volume limitations (typically 40 to 60 liters).
- In `RouteBuilderStudio.tsx:90-105`:
  ```typescript
  const totalLiters = selectedStops.reduce((sum, stop) => {
    const sub = custSubMap.get(stop.customerId);
    return sum + (sub ? sub.quantity : 1.5);
  }, 0);

  const capacityPct = Math.min(Math.round((totalLiters / maxCapacity) * 100), 100);
  const isOverCapacity = totalLiters > maxCapacity;
  ```
- **Visual Feedback**:
  - `capacityPct <= 80%`: Green bar (Safe).
  - `80% < capacityPct <= 100%`: Amber bar (Near Capacity).
  - `capacityPct > 100%`: Red flashing alert with `AlertTriangle` warning: `"Assigned milk exceeds vehicle capacity!"`.
- This prevents rider motorbike spills and mid-route shortages.

---

## 2. Offline Synchronization Engine (`lib/offlineSync.ts`)

Riders frequently operate in basement parking garages, elevators, and peripheral rural roads with zero cellular signal.

### 2.1 Storage Architecture
The offline engine uses browser **IndexedDB** (`dairypulse_offline_db`, object store: `delivery_queue`) with a fallback to `localStorage`.

```typescript
export interface QueuedDeliveryEvent {
  id: string;              // UUID event identifier
  delivery_id: string;     // Task ID being updated
  status: string;          // "Delivered" | "Failed"
  failure_reason?: string; // Reason if failed
  bottles_returned: number;// Count of empty glass bottles collected
  cash_collected: number;  // Cash collected in Rupees
  timestamp: string;       // ISO 8601 execution timestamp
  rider_name: string;      // Authenticated rider
  sync_attempts: number;   // Retry counter
}
```

### 2.2 Offline Event Queue Lifecycle
1. **Disconnection Detection**:
   - Listens to native browser events: `window.addEventListener('online')` and `window.addEventListener('offline')`.
   - Also provides a developer/demo simulation toggle (`toggleSimulatedOffline()`).
2. **Action Queueing**:
   - When offline, `recordDeliveryStop(stopId, status, bottles, cash, notes)` generates a unique event UUID and appends it to IndexedDB.
   - The UI immediately marks the stop as complete (optimistic update).
   - An amber notification bar appears: `"Offline Mode Active - N stops queued locally"`.
3. **Reconnection & Automatic Replay**:
   - When the `online` event fires, `triggerManualSync()` initiates a background flush.
   - Iterates through queued events sequentially.
   - Dispatches `PATCH /api/v1/deliveries/{event.delivery_id}/status?status=Delivered&notes=...`.
   - Upon HTTP 200 confirmation, deletes the item from IndexedDB.
   - If an error occurs, increments `sync_attempts` and applies exponential backoff before retrying.

---

## 3. What Genuinely Works Offline vs. What Requires Network

| Feature / Action | Works 100% Offline? | Mechanism / Requirement |
| :--- | :--- | :--- |
| **Viewing Today's Stop List** | **Yes** (if loaded once) | Cached in browser memory and local session state |
| **Marking Delivery as Complete** | **Yes** | Queued in IndexedDB with local timestamp |
| **Logging Bottle Returns & Cash** | **Yes** | Stored inside queued event object in IndexedDB |
| **Marking Failed Delivery with Reason** | **Yes** | Stored in IndexedDB queue |
| **Google Maps Turn-by-Turn** | **Partial** | Launches native Google Maps app via `geo:lat,lng` intent (depends on device GPS/offline maps) |
| **Phone Calling Customer** | **Yes** | Uses native cellular dialer (`tel:+91...`) independent of mobile data |
| **Generating New Delivery Runs** | **No** | Requires backend database connection (`POST /deliveries/generate-daily`) |
| **Interactive Route Builder Studio** | **No** | Requires backend connection to update route tables (`POST /routes/build`) |
| **Generating Monthly Invoices** | **No** | Requires backend ledger aggregation |
