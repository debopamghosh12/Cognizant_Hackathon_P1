# MedCare Pharma — Demand Sensing & Replenishment Planning Dashboard

A frontend-only, enterprise-grade planning dashboard prototype for a pharmaceutical
distribution network. Built for hackathon / college project demo purposes with
fully realistic mock data — **no backend required**.

## Tech Stack

- React 19 + Vite
- Tailwind CSS (shadcn/ui-style design tokens)
- Recharts (line, bar, area, donut charts)
- Lucide React (icons)
- Fully responsive (mobile, tablet, desktop)

## Getting Started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

To build a production bundle:

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
  components/
    ui/            → shadcn-style primitives (Card, Badge, Button, Select, Input, Progress)
    layout/         → Sidebar, Topbar, FiltersBar, Footer
    dashboard/      → KpiCards, ReplenishmentTable, ExpiryRiskSection,
                       WarehouseOverview, AlertsPanel
    charts/         → DemandForecastChart, HistoricalVsSensedChart,
                       InventoryTrendChart, WarehouseDistributionChart,
                       ExpiryRiskDonutChart
  pages/            → One page component per sidebar nav item
  data/
    mockData.js     → All synthetic pharmaceutical data (SKUs, warehouses,
                       demand, expiry, replenishment, alerts, reports)
  lib/
    utils.js        → cn() class merge helper + number/currency formatters
  App.jsx           → Layout shell + state-based page routing
  main.jsx          → React entry point
  index.css         → Tailwind + design token (CSS variable) definitions
```

## Pages / Features

1. **Dashboard** — KPI cards, demand forecast chart, historical vs sensed demand,
   inventory trend, warehouse stock distribution, expiry risk donut, warehouse
   overview, top replenishment recommendations, and live alerts — all in one view.
2. **Demand Forecast** — Forecast accuracy stats, forecast vs sensed demand charts,
   category-level demand signal breakdown.
3. **Inventory** — Searchable, filterable SKU-level inventory table with
   safety-stock status badges.
4. **Expiry Risk** — Batch-level expiry cards (SKU, batch ID, days to expiry,
   quantity, estimated loss) plus a risk-band donut chart.
5. **Warehouses** — Card overview of all 4 distribution centers (North, South,
   East, West) with capacity, fill rate, and expiry exposure, plus a master
   data table.
6. **Replenishment Planner** — Full reorder recommendation table with
   color-coded priority badges (Critical / High / Medium / Low) and ETAs.
7. **Alerts** — Live alert feed with severity filters (stock-outs, expiry,
   capacity, demand spikes, replenishment approvals).
8. **Reports** — Downloadable report cards (mock) for weekly/monthly planning
   and audit reports.

## Design

Light theme, blue + teal accent palette, rounded-xl cards, subtle shadows that
lift on hover, and a professional Inter typeface — styled to resemble
enterprise BI tools like Power BI, SAP Fiori, or Oracle Cloud dashboards.

## Notes

- All data in `src/data/mockData.js` is synthetic and for demonstration only.
- No backend, API, or database is required — everything runs client-side.
- Built to be easily extended: swap `mockData.js` for real API calls when
  ready to connect a backend.

---
*MedCare Pharma Planning Dashboard – Frontend Prototype*
