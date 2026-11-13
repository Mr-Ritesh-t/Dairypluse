# DairyPulse Web Performance & Latency Benchmarks

Guided by the `web-perf` skill.

---

## 1. Core Web Vitals Targets (Field & Lab)
- **Largest Contentful Paint (LCP):** < 2.2 seconds on 4G mobile devices.
- **First Input Delay (FID) / Interaction to Next Paint (INP):** < 100 milliseconds for modal opens, checkbox toggles, and status taps.
- **Cumulative Layout Shift (CLS):** < 0.05 (Zero jumping buttons or shifts while loading delivery tables).

---

## 2. API Response Latency Budgets
- **Rider Stop Marking (`PATCH /deliveries/{id}/status`):** < 60ms.
- **Daily Route Generation (`POST /deliveries/generate-daily`):** < 400ms for 500 stops.
- **Customer Portal Load (`GET /mobile/customer`):** < 150ms.
- **Invoice & Dues Summary (`GET /billing/monthly-due-reminders`):** < 250ms.

---

## 3. Frontend Optimization Guidelines
- Static page pre-rendering (Next.js SSG / ISR) for all marketing, dashboard shells, and mobile frames.
- Image optimization using `next/image` with WebP/AVIF formats.
- Avoid large heavy icon bundles; import atomic Lucide icons.
- Avoid unnecessary external client-side analytics scripts on low-bandwidth rider mobile routes.

