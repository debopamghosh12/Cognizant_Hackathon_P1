// ============================================================================
// MedCare Pharma — Mock Data Layer
// All data below is synthetic and generated for demo/prototype purposes only.
// ============================================================================

export const warehouses = [
  {
    id: "wh-north",
    name: "North DC",
    region: "North Region",
    city: "Chandigarh",
    stockUnits: 482_600,
    capacityUnits: 560_000,
    capacityPct: 86,
    fillRate: 91,
    expiryExposurePct: 6.2,
    expiryExposureValue: 118_400,
    status: "critical", // capacity exceeded threshold
    skuCount: 342,
  },
  {
    id: "wh-south",
    name: "South DC",
    region: "South Region",
    city: "Chennai",
    stockUnits: 356_900,
    capacityUnits: 520_000,
    capacityPct: 69,
    fillRate: 88,
    expiryExposurePct: 3.1,
    expiryExposureValue: 54_200,
    status: "healthy",
    skuCount: 298,
  },
  {
    id: "wh-east",
    name: "East DC",
    region: "East Region",
    city: "Kolkata",
    stockUnits: 298_100,
    capacityUnits: 450_000,
    capacityPct: 66,
    fillRate: 84,
    expiryExposurePct: 4.8,
    expiryExposureValue: 76_900,
    status: "watch",
    skuCount: 261,
  },
  {
    id: "wh-west",
    name: "West DC",
    region: "West Region",
    city: "Pune",
    stockUnits: 411_300,
    capacityUnits: 500_000,
    capacityPct: 82,
    fillRate: 93,
    expiryExposurePct: 2.4,
    expiryExposureValue: 39_600,
    status: "healthy",
    skuCount: 315,
  },
];

export const categories = [
  "Antibiotics",
  "Analgesics",
  "Antipyretics",
  "Cardiac Care",
  "Diabetes Care",
  "Respiratory",
  "Gastro Care",
  "Vitamins & Supplements",
  "Dermatology",
  "Vaccines",
];

// ---------------------------------------------------------------------------
// KPI summary (top of dashboard)
// ---------------------------------------------------------------------------
export const kpis = {
  totalInventory: { value: 1_548_900, unit: "units", change: 4.2, trend: "up" },
  forecastAccuracy: { value: 91.4, unit: "%", change: 1.8, trend: "up" },
  criticalShortages: { value: 14, unit: "SKUs", change: 3, trend: "up_bad" },
  expiringStockValue: { value: 289_100, unit: "usd", change: -6.5, trend: "down_good" },
  warehouseFillRate: { value: 89.0, unit: "%", change: 2.1, trend: "up" },
  replenishmentPending: { value: 37, unit: "orders", change: 5, trend: "up_bad" },
};

// ---------------------------------------------------------------------------
// Demand forecast — 14 day horizon (line chart: forecast vs actual sensed)
// ---------------------------------------------------------------------------
export const demandForecast = [
  { day: "Aug 01", forecast: 12400, sensed: 12100, actual: 12250 },
  { day: "Aug 02", forecast: 12550, sensed: 12800, actual: 12700 },
  { day: "Aug 03", forecast: 12300, sensed: 12250, actual: 12180 },
  { day: "Aug 04", forecast: 13100, sensed: 13650, actual: 13500 },
  { day: "Aug 05", forecast: 13400, sensed: 13300, actual: 13350 },
  { day: "Aug 06", forecast: 14000, sensed: 14750, actual: 14600 },
  { day: "Aug 07", forecast: 13800, sensed: 13950, actual: null },
  { day: "Aug 08", forecast: 14200, sensed: 14500, actual: null },
  { day: "Aug 09", forecast: 14600, sensed: null, actual: null },
  { day: "Aug 10", forecast: 15100, sensed: null, actual: null },
  { day: "Aug 11", forecast: 14900, sensed: null, actual: null },
  { day: "Aug 12", forecast: 15400, sensed: null, actual: null },
  { day: "Aug 13", forecast: 15800, sensed: null, actual: null },
  { day: "Aug 14", forecast: 16200, sensed: null, actual: null },
];

// ---------------------------------------------------------------------------
// Historical vs sensed demand (bar/line comparison — 6 months)
// ---------------------------------------------------------------------------
export const historicalVsSensed = [
  { month: "Mar", historical: 342_000, sensed: 358_000 },
  { month: "Apr", historical: 355_000, sensed: 361_000 },
  { month: "May", historical: 368_000, sensed: 402_000 },
  { month: "Jun", historical: 371_000, sensed: 389_000 },
  { month: "Jul", historical: 384_000, sensed: 421_000 },
  { month: "Aug", historical: 392_000, sensed: 445_000 },
];

// ---------------------------------------------------------------------------
// Inventory trend (30-day rolling, weekly points) — stacked by state
// ---------------------------------------------------------------------------
export const inventoryTrend = [
  { week: "Wk 1", healthy: 1_120_000, lowStock: 210_000, expiring: 98_000 },
  { week: "Wk 2", healthy: 1_085_000, lowStock: 232_000, expiring: 105_000 },
  { week: "Wk 3", healthy: 1_142_000, lowStock: 198_000, expiring: 112_000 },
  { week: "Wk 4", healthy: 1_098_000, lowStock: 246_000, expiring: 121_000 },
  { week: "Wk 5", healthy: 1_161_000, lowStock: 189_000, expiring: 108_000 },
  { week: "Wk 6", healthy: 1_203_000, lowStock: 175_000, expiring: 95_000 },
];

// ---------------------------------------------------------------------------
// Warehouse stock distribution (bar chart)
// ---------------------------------------------------------------------------
export const warehouseStockDistribution = warehouses.map((w) => ({
  name: w.name,
  stock: w.stockUnits,
  capacity: w.capacityUnits,
}));

// ---------------------------------------------------------------------------
// Expiry risk donut chart (by risk band, in units)
// ---------------------------------------------------------------------------
export const expiryRiskBands = [
  { name: "Critical (<15 days)", value: 42_300, color: "#dc2626" },
  { name: "High (15-30 days)", value: 68_900, color: "#f97316" },
  { name: "Medium (30-60 days)", value: 114_200, color: "#eab308" },
  { name: "Low (60-90 days)", value: 187_500, color: "#0d9488" },
];

// ---------------------------------------------------------------------------
// SKU master list (used across replenishment / inventory tables)
// ---------------------------------------------------------------------------
export const skus = [
  { sku: "SKU-204", name: "Amoxicillin 500mg", category: "Antibiotics", unit: "Strips" },
  { sku: "SKU-118", name: "Azithromycin 250mg", category: "Antibiotics", unit: "Strips" },
  { sku: "SKU-337", name: "Paracetamol 650mg", category: "Antipyretics", unit: "Strips" },
  { sku: "SKU-092", name: "Ibuprofen 400mg", category: "Analgesics", unit: "Strips" },
  { sku: "SKU-455", name: "Atorvastatin 20mg", category: "Cardiac Care", unit: "Strips" },
  { sku: "SKU-276", name: "Metformin 500mg", category: "Diabetes Care", unit: "Strips" },
  { sku: "SKU-513", name: "Insulin Glargine 100IU", category: "Diabetes Care", unit: "Vials" },
  { sku: "SKU-183", name: "Salbutamol Inhaler", category: "Respiratory", unit: "Units" },
  { sku: "SKU-604", name: "Omeprazole 20mg", category: "Gastro Care", unit: "Strips" },
  { sku: "SKU-329", name: "Cetirizine 10mg", category: "Antibiotics", unit: "Strips" },
  { sku: "SKU-741", name: "Vitamin D3 60K IU", category: "Vitamins & Supplements", unit: "Bottles" },
  { sku: "SKU-089", name: "Multivitamin Syrup", category: "Vitamins & Supplements", unit: "Bottles" },
  { sku: "SKU-410", name: "Clopidogrel 75mg", category: "Cardiac Care", unit: "Strips" },
  { sku: "SKU-562", name: "Betamethasone Cream", category: "Dermatology", unit: "Tubes" },
  { sku: "SKU-298", name: "Hepatitis B Vaccine", category: "Vaccines", unit: "Vials" },
  { sku: "SKU-651", name: "Pantoprazole 40mg", category: "Gastro Care", unit: "Strips" },
  { sku: "SKU-133", name: "Losartan 50mg", category: "Cardiac Care", unit: "Strips" },
  { sku: "SKU-987", name: "Ceftriaxone 1g Injection", category: "Antibiotics", unit: "Vials" },
];

// ---------------------------------------------------------------------------
// Replenishment recommendations
// ---------------------------------------------------------------------------
export const replenishmentRecommendations = [
  { sku: "SKU-204", name: "Amoxicillin 500mg", warehouse: "North DC", currentStock: 3200, forecastDemand: 9800, reorderQty: 8500, priority: "Critical", eta: "Aug 18, 2026" },
  { sku: "SKU-513", name: "Insulin Glargine 100IU", warehouse: "East DC", currentStock: 1150, forecastDemand: 4200, reorderQty: 3600, priority: "Critical", eta: "Aug 19, 2026" },
  { sku: "SKU-987", name: "Ceftriaxone 1g Injection", warehouse: "North DC", currentStock: 890, forecastDemand: 3100, reorderQty: 2800, priority: "Critical", eta: "Aug 20, 2026" },
  { sku: "SKU-118", name: "Azithromycin 250mg", warehouse: "South DC", currentStock: 4100, forecastDemand: 8200, reorderQty: 5200, priority: "High", eta: "Aug 22, 2026" },
  { sku: "SKU-183", name: "Salbutamol Inhaler", warehouse: "North DC", currentStock: 2600, forecastDemand: 5900, reorderQty: 4100, priority: "High", eta: "Aug 21, 2026" },
  { sku: "SKU-276", name: "Metformin 500mg", warehouse: "West DC", currentStock: 6700, forecastDemand: 12400, reorderQty: 6800, priority: "High", eta: "Aug 23, 2026" },
  { sku: "SKU-410", name: "Clopidogrel 75mg", warehouse: "East DC", currentStock: 3900, forecastDemand: 7100, reorderQty: 3900, priority: "High", eta: "Aug 24, 2026" },
  { sku: "SKU-604", name: "Omeprazole 20mg", warehouse: "South DC", currentStock: 8200, forecastDemand: 11900, reorderQty: 4200, priority: "Medium", eta: "Aug 27, 2026" },
  { sku: "SKU-455", name: "Atorvastatin 20mg", warehouse: "West DC", currentStock: 9100, forecastDemand: 13200, reorderQty: 4600, priority: "Medium", eta: "Aug 28, 2026" },
  { sku: "SKU-651", name: "Pantoprazole 40mg", warehouse: "North DC", currentStock: 7400, forecastDemand: 10100, reorderQty: 3100, priority: "Medium", eta: "Aug 29, 2026" },
  { sku: "SKU-329", name: "Cetirizine 10mg", warehouse: "South DC", currentStock: 11200, forecastDemand: 14800, reorderQty: 3900, priority: "Medium", eta: "Aug 30, 2026" },
  { sku: "SKU-133", name: "Losartan 50mg", warehouse: "East DC", currentStock: 10500, forecastDemand: 12900, reorderQty: 2600, priority: "Low", eta: "Sep 02, 2026" },
  { sku: "SKU-741", name: "Vitamin D3 60K IU", warehouse: "West DC", currentStock: 15800, forecastDemand: 17200, reorderQty: 1900, priority: "Low", eta: "Sep 03, 2026" },
  { sku: "SKU-089", name: "Multivitamin Syrup", warehouse: "North DC", currentStock: 13400, forecastDemand: 15100, reorderQty: 2200, priority: "Low", eta: "Sep 04, 2026" },
];

// ---------------------------------------------------------------------------
// Expiry risk detail cards
// ---------------------------------------------------------------------------
export const expiringItems = [
  { sku: "SKU-987", name: "Ceftriaxone 1g Injection", batchId: "BX-991", daysToExpiry: 12, quantity: 2400, unit: "Vials", estimatedLoss: 28_800, warehouse: "North DC" },
  { sku: "SKU-513", name: "Insulin Glargine 100IU", batchId: "BX-847", daysToExpiry: 8, quantity: 1100, unit: "Vials", estimatedLoss: 24_200, warehouse: "East DC" },
  { sku: "SKU-298", name: "Hepatitis B Vaccine", batchId: "BX-732", daysToExpiry: 5, quantity: 850, unit: "Vials", estimatedLoss: 19_550, warehouse: "West DC" },
  { sku: "SKU-204", name: "Amoxicillin 500mg", batchId: "BX-655", daysToExpiry: 21, quantity: 5200, unit: "Strips", estimatedLoss: 15_600, warehouse: "North DC" },
  { sku: "SKU-118", name: "Azithromycin 250mg", batchId: "BX-609", daysToExpiry: 27, quantity: 3800, unit: "Strips", estimatedLoss: 11_400, warehouse: "South DC" },
  { sku: "SKU-562", name: "Betamethasone Cream", batchId: "BX-583", daysToExpiry: 34, quantity: 2100, unit: "Tubes", estimatedLoss: 8_400, warehouse: "East DC" },
  { sku: "SKU-183", name: "Salbutamol Inhaler", batchId: "BX-521", daysToExpiry: 45, quantity: 1600, unit: "Units", estimatedLoss: 12_800, warehouse: "North DC" },
  { sku: "SKU-651", name: "Pantoprazole 40mg", batchId: "BX-498", daysToExpiry: 58, quantity: 4400, unit: "Strips", estimatedLoss: 9_680, warehouse: "West DC" },
];

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------
export const alerts = [
  { id: "AL-001", type: "stockout", severity: "critical", title: "Predicted stock-out", message: "SKU-204 (Amoxicillin 500mg) predicted stock-out in 3 days at North DC", time: "12 min ago" },
  { id: "AL-002", type: "expiry", severity: "high", title: "Batch nearing expiry", message: "Batch BX-991 (Ceftriaxone 1g) expires in 12 days — 2,400 vials at risk", time: "38 min ago" },
  { id: "AL-003", type: "capacity", severity: "critical", title: "Warehouse capacity exceeded", message: "North DC capacity exceeded 90% — inbound shipments at risk of delay", time: "1 hr ago" },
  { id: "AL-004", type: "demand", severity: "high", title: "Demand spike detected", message: "Demand spike detected for Antibiotics category (+34% vs 7-day average)", time: "2 hr ago" },
  { id: "AL-005", type: "stockout", severity: "high", title: "Low stock warning", message: "SKU-513 (Insulin Glargine) below safety stock threshold at East DC", time: "3 hr ago" },
  { id: "AL-006", type: "expiry", severity: "medium", title: "Batch nearing expiry", message: "Batch BX-847 (Insulin Glargine) expires in 8 days — 1,100 vials at risk", time: "5 hr ago" },
  { id: "AL-007", type: "replenishment", severity: "medium", title: "Replenishment order pending approval", message: "PO-2291 for South DC pending manager approval for 2 days", time: "6 hr ago" },
  { id: "AL-008", type: "demand", severity: "low", title: "Forecast variance", message: "Sensed demand for Vitamins & Supplements trending 6% below forecast", time: "9 hr ago" },
];

// ---------------------------------------------------------------------------
// Inventory table (full SKU-level view)
// ---------------------------------------------------------------------------
export const inventoryItems = [
  { sku: "SKU-204", name: "Amoxicillin 500mg", category: "Antibiotics", warehouse: "North DC", stock: 3200, safetyStock: 6000, status: "Critical", lastUpdated: "2 hr ago" },
  { sku: "SKU-118", name: "Azithromycin 250mg", category: "Antibiotics", warehouse: "South DC", stock: 4100, safetyStock: 6500, status: "Low", lastUpdated: "1 hr ago" },
  { sku: "SKU-337", name: "Paracetamol 650mg", category: "Antipyretics", warehouse: "West DC", stock: 24800, safetyStock: 15000, status: "Healthy", lastUpdated: "4 hr ago" },
  { sku: "SKU-092", name: "Ibuprofen 400mg", category: "Analgesics", warehouse: "South DC", stock: 18200, safetyStock: 12000, status: "Healthy", lastUpdated: "3 hr ago" },
  { sku: "SKU-455", name: "Atorvastatin 20mg", category: "Cardiac Care", warehouse: "West DC", stock: 9100, safetyStock: 8000, status: "Healthy", lastUpdated: "5 hr ago" },
  { sku: "SKU-276", name: "Metformin 500mg", category: "Diabetes Care", warehouse: "West DC", stock: 6700, safetyStock: 9000, status: "Low", lastUpdated: "2 hr ago" },
  { sku: "SKU-513", name: "Insulin Glargine 100IU", category: "Diabetes Care", warehouse: "East DC", stock: 1150, safetyStock: 3000, status: "Critical", lastUpdated: "40 min ago" },
  { sku: "SKU-183", name: "Salbutamol Inhaler", category: "Respiratory", warehouse: "North DC", stock: 2600, safetyStock: 4500, status: "Low", lastUpdated: "1 hr ago" },
  { sku: "SKU-604", name: "Omeprazole 20mg", category: "Gastro Care", warehouse: "South DC", stock: 8200, safetyStock: 7000, status: "Healthy", lastUpdated: "6 hr ago" },
  { sku: "SKU-329", name: "Cetirizine 10mg", category: "Antibiotics", warehouse: "South DC", stock: 11200, safetyStock: 8500, status: "Healthy", lastUpdated: "3 hr ago" },
  { sku: "SKU-741", name: "Vitamin D3 60K IU", category: "Vitamins & Supplements", warehouse: "West DC", stock: 15800, safetyStock: 10000, status: "Healthy", lastUpdated: "7 hr ago" },
  { sku: "SKU-089", name: "Multivitamin Syrup", category: "Vitamins & Supplements", warehouse: "North DC", stock: 13400, safetyStock: 9000, status: "Healthy", lastUpdated: "5 hr ago" },
  { sku: "SKU-410", name: "Clopidogrel 75mg", category: "Cardiac Care", warehouse: "East DC", stock: 3900, safetyStock: 5500, status: "Low", lastUpdated: "2 hr ago" },
  { sku: "SKU-562", name: "Betamethasone Cream", category: "Dermatology", warehouse: "East DC", stock: 6100, safetyStock: 4000, status: "Healthy", lastUpdated: "8 hr ago" },
  { sku: "SKU-298", name: "Hepatitis B Vaccine", category: "Vaccines", warehouse: "West DC", stock: 2850, safetyStock: 2500, status: "Healthy", lastUpdated: "1 hr ago" },
  { sku: "SKU-651", name: "Pantoprazole 40mg", category: "Gastro Care", warehouse: "North DC", stock: 7400, safetyStock: 6000, status: "Healthy", lastUpdated: "4 hr ago" },
  { sku: "SKU-133", name: "Losartan 50mg", category: "Cardiac Care", warehouse: "East DC", stock: 10500, safetyStock: 8000, status: "Healthy", lastUpdated: "3 hr ago" },
  { sku: "SKU-987", name: "Ceftriaxone 1g Injection", category: "Antibiotics", warehouse: "North DC", stock: 890, safetyStock: 2000, status: "Critical", lastUpdated: "25 min ago" },
];

// ---------------------------------------------------------------------------
// Regions (for filters)
// ---------------------------------------------------------------------------
export const regions = ["North Region", "South Region", "East Region", "West Region"];

// ---------------------------------------------------------------------------
// Reports (for Reports page)
// ---------------------------------------------------------------------------
export const reports = [
  { id: "RPT-001", name: "Weekly Replenishment Summary", type: "Replenishment", generated: "Aug 14, 2026", size: "1.2 MB", format: "PDF" },
  { id: "RPT-002", name: "Monthly Expiry Risk Report", type: "Expiry", generated: "Aug 12, 2026", size: "860 KB", format: "XLSX" },
  { id: "RPT-003", name: "Demand Forecast Accuracy — Q3", type: "Forecast", generated: "Aug 10, 2026", size: "2.4 MB", format: "PDF" },
  { id: "RPT-004", name: "Warehouse Utilization Audit", type: "Warehouse", generated: "Aug 08, 2026", size: "1.8 MB", format: "XLSX" },
  { id: "RPT-005", name: "Critical SKU Shortage Log", type: "Inventory", generated: "Aug 05, 2026", size: "540 KB", format: "PDF" },
  { id: "RPT-006", name: "Regional Demand Sensing Digest", type: "Forecast", generated: "Aug 01, 2026", size: "3.1 MB", format: "PDF" },
];
