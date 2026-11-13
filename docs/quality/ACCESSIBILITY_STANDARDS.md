# DairyPulse Accessibility & Design Ergonomics (WCAG 2.1 AA)

Guided by the `impeccable` skill.

---

## 1. Ergonomics for Early-Morning Delivery Riders
1. **High Contrast Display:** Deep neutral backgrounds (`#1C1917` / `#0F766E`) with high-contrast text ratios exceeding **4.5:1** for normal text and **7:1** for key numbers (flat numbers, quantities).
2. **Touch Target Dimensions:** All interactive buttons on mobile views (`/mobile/delivery`, `/mobile/customer`) must satisfy a minimum touch target of **44x44 CSS pixels** to prevent mis-taps with gloved or wet hands.
3. **One-Thumb Operability:** Primary actions ("Mark Delivered", "Call Customer", "Next Stop") anchored within the bottom 40% of the mobile viewport.

---

## 2. Desktop Dashboard Accessibility
1. **Keyboard Navigation:** Full tab-order navigation across all tables, modal dialogs, and date pickers.
2. **Focus Indicators:** Explicit visible focus rings (`focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:outline-hidden`) on all interactive controls.
3. **ARIA Semantic Labels:** Screen-reader friendly table headers (`scope="col"`), descriptive button titles, and `aria-live` regions for live delivery updates.
