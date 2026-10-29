# DairyPulse — Frontend Architecture, UI Inventory & User Experience

This document details the complete frontend implementation of DairyPulse, covering every page, component, user action, state lifecycle, and UX interaction.

---

## 1. Complete UI Screen & Route Inventory

| Screen / Route | File Path | Purpose | Key Components Used | Data Source | User Actions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Executive Dashboard** (`/`) | `frontend/src/app/page.tsx` | High-level operations overview, KPI metrics, sales chart, and operational shortcuts | `SalesDispatchOverviewChart`, `WastageIntelligenceCard`, `CustomerInsightsCard` | `DairyPulseContext`, `GET /summary/dashboard` | Date range filtering (7d, 30d, 90d), module quick-navigation | **Verified Live** |
| **Authentication & Wizard** (`/login`) | `frontend/src/app/login/page.tsx` | Demo login with role switching + 3-step customer onboarding wizard with map pin drop | `MapLocationPicker`, `Building2`, `Clock`, `ArrowRight` | `AuthContext`, `POST /customers`, `POST /subscriptions` | Role login (`OWNER`, `DELIVERY`, `CUSTOMER`), 3-step customer registration, preferred time selection | **Verified Live** |
| **Delivery Management** (`/delivery`) | `frontend/src/app/delivery/page.tsx` | Sector route inspection, daily delivery task status tracking, address editing, stop reordering | `RouteBuilderStudio`, `MapLocationPicker`, `Truck`, `Sparkles` | `DairyPulseContext`, `GET /deliveries/today`, `GET /routes` | Launch Route Studio, Auto-cluster by society, edit delivery address, reassign rider, mark delivery status | **Verified Live** |
| **Interactive Route Studio** (Modal in `/delivery`) | `frontend/src/components/delivery/RouteBuilderStudio.tsx` | Visual route planning, customer pin selection, 1st/2nd/3rd sequencing, vehicle load bar, live dispatch | SVG Polyline, Dynamic coordinate projection, `ArrowUp`, `ArrowDown`, `Gauge` | `DairyPulseContext`, `POST /routes/build` | Select customers, move stops up/down in sequence, customize delivery slot, check vehicle capacity, dispatch | **Verified Live** |
| **Delivery Partner Mobile PWA** (`/mobile/delivery`) | `frontend/src/app/mobile/delivery/page.tsx` | Rider handheld interface with sequential stop cards, turn-by-turn navigation, bottle & cash logging | `useOfflineDeliverySync`, `Phone`, `Navigation`, `CheckCircle2` | `DairyPulseContext`, `IndexedDB`, `PATCH /deliveries/{id}/status` | Complete stop, mark failed reason, record returned empty bottles, log collected cash, toggle offline simulation | **Verified Live** |
| **Customer Mobile Portal** (`/mobile/customer`) | `frontend/src/app/mobile/customer/page.tsx` | Consumer self-service app for household subscribers | `Milk`, `Calendar`, `PauseCircle`, `Check` | `DairyPulseContext`, `PATCH /subscriptions/{id}/pause` | Pause milk for vacation, resume subscription, view doorstep timings & monthly balance | **Verified Live** |
| **Cold Chain Inventory** (`/inventory`) | `frontend/src/app/inventory/page.tsx` | Milk stock monitoring, batch arrival logs, Fat % and SNF % quality records, wastage logging | `Milk`, `AlertTriangle`, `Plus`, `Table` | `DairyPulseContext`, `POST /inventory/receipts`, `POST /inventory/wastage` | Log stock arrival with fat/SNF, record milk wastage with reasons, view available liters | **Verified Live** |
| **Billing & Invoices** (`/billing`) | `frontend/src/app/billing/page.tsx` | Monthly cycle billing, invoice generation, payment receipt logging, customer balance tracking | `Receipt`, `CreditCard`, `CheckCircle` | `DairyPulseContext`, `POST /invoices`, `POST /payments` | Generate customer invoices, record payments (UPI, Cash, Bank), download PDF receipt summary | **Verified Live** |
| **Commercial B2B Orders** (`/orders`) | `frontend/src/app/orders/page.tsx` | Wholesale order creation for sweet shops, restaurants, and retail stores | `ShoppingBag`, `Building`, `Plus` | `DairyPulseContext`, `POST /orders` | Create bulk crate orders with unit pricing, track order status (Pending, Dispatched, Delivered) | **Verified Live** |
| **Customer Directory** (`/customers`) | `frontend/src/app/customers/page.tsx` | Master list of all registered household & commercial customers with status and balances | `Users`, `Phone`, `MapPin`, `Search` | `DairyPulseContext`, `GET /customers` | Search by name/phone, filter by area, view subscription details and outstanding balances | **Verified Live** |
| **Staff & Rider Roster** (`/staff`) | `frontend/src/app/staff/page.tsx` | Personnel directory, rider delivery counts, shift duty statuses (On Duty, Off Duty, Leave) | `Users`, `BadgeCheck`, `Plus` | `DairyPulseContext`, `POST /staff` | Add new staff member, assign delivery sector, track daily delivery count | **Verified Live** |
| **Operational Expenses** (`/expenses`) | `frontend/src/app/expenses/page.tsx` | Expense ledger for vehicle fuel, packaging crates, testing reagents, and equipment maintenance | `DollarSign`, `PieChart`, `Plus` | `DairyPulseContext`, `POST /expenses` | Log new expense item, categorize cost, view total monthly operational spend | **Verified Live** |
| **Auditing & Reports** (`/reports`) | `frontend/src/app/reports/page.tsx` | Comprehensive operational summaries, route efficiency metrics, and monthly revenue ledgers | `BarChart3`, `FileText`, `Download` | `DairyPulseContext`, `GET /summary/dashboard` | Review revenue vs expenses, inspect delivery success percentage, view daily dispatch reports | **Verified Live** |

---

## 2. Key UX Interactions & User Journeys

### 2.1 The Customer Registration Journey (`/login`)
1. **Account Creation**: The user enters their name, phone, and email. Form validation ensures required fields are filled.
2. **Dairy Selection**: The user selects which local dairy farm will process and bottle their milk (e.g. *Amrut Dairy Farm*, *Gokul Pure Milk*).
3. **Address & Geolocation**:
   - The user inputs their flat number and society name.
   - [MapLocationPicker.tsx](file:///d:/coding/dairypluse/frontend/src/components/delivery/MapLocationPicker.tsx) renders an interactive map. Tapping **"Use Current Location"** triggers `navigator.geolocation.getCurrentPosition`, locking coordinates with 5 decimal places (~1m accuracy).
   - The user selects their **Preferred Delivery Window** from a dropdown (`Early Morning: 5:30 - 6:30 AM`, `Morning: 6:00 - 7:30 AM`, `Late Morning: 7:30 - 8:30 AM`, `Evening: 5:30 - 7:00 PM`).
   - The user chooses their milk variant and quantity (e.g. `1.0 L Cow Milk`).
4. **Instant Portal Access**: Upon submission, the customer profile and active subscription are created on the backend, and the user is redirected to their self-service dashboard.

---

### 2.2 The Interactive Route Builder Studio Journey (`/delivery`)
1. The admin clicks the **"Interactive Route Studio"** button.
2. The modal renders:
   - **Header**: Route Code (`R-05`), Route Name (`Baner Morning Express`), Area Sector (`Baner`), Assigned Rider (`Rahul Deshmukh`), and Delivery Shift.
   - **Interactive Live Map**: Every customer in Baner is plotted as a pin on a dark street grid. Pins are positioned mathematically using normalized coordinate projection.
   - **Stop Sequencing Panel**: Shows currently selected stops. The admin can click **`▲`** or **`▼`** to reorder stops. The first stop is prominently tagged `#1 (1st Stop - START)`.
   - **Live Capacity Meter**: Total liters (e.g. 24.5 L) are compared against the vehicle capacity (60 L). If capacity is exceeded, an Amber/Red warning appears.
3. The admin clicks **"Save Route & Dispatch to Rider"**. The backend updates customer route assignments, updates today's delivery tasks with explicit sequence order numbers, and refreshes the live operations view.

---

### 2.3 The Rider Delivery Run Journey (`/mobile/delivery`)
1. The rider logs in or switches to the `DELIVERY` role.
2. The app displays stops strictly ordered by sequence:
   - **Stop #1**: Flat 402, Rohan Nilay • Preferred: 5:30 AM - 6:30 AM
   - **Stop #2**: Flat 104, Green Glen • Preferred: 6:00 AM - 7:30 AM
3. The rider taps **"Google Maps"** for turn-by-turn navigation.
4. At the doorstep, the rider enters returned empty bottles (`2`) and cash collected (`₹124`), then taps **"Mark Delivered"**.
5. If in an elevator or basement with no signal, the action is queued in IndexedDB. When signal returns, the sync engine sends the update to the server automatically.

---

## 3. Design System, Tokens & Styling Architecture

The project utilizes modern CSS and Tailwind tokens defined in `frontend/src/app/globals.css`:
- **Color Palette**:
  - Primary / Brand: Emerald (`#059669`, `#10b981`, `#047857`) representing fresh dairy agriculture.
  - Secondary / Accent: Teal (`#0d9488`) and Sky Blue (`#0284c7`).
  - Dark Surface: Deep Slate (`#0f172a`, `#1e293b`) for the Route Studio map viewport.
  - Warnings & Status: Amber (`#f59e0b`) for pending/queued stops, Rose (`#f43f5e`) for failed deliveries and capacity overload.
- **Typography**: Clean system sans-serif hierarchy using Inter/Roboto with explicit font weight tokens (`font-bold`, `font-extrabold`, `font-black`).
- **Responsive Breakpoints**:
  - `sm` (640px): Adapts table views to cards.
  - `md` (768px): Two-column forms and grid layouts.
  - `lg` (1024px): 12-column grid in Route Builder Studio (7 cols map + 5 cols sequencing panel).
