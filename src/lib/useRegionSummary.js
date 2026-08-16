import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

// Thin wrapper around GET /warehouses/summary, normalized for the DC overview
// cards and warehouse master table.
export function useRegionSummary() {
  const { data, loading, error } = useApi((signal) => api.warehousesSummary(signal));

  const warehouses = data?.map((w) => {
    const status =
      w.critical_stockout_sku_count >= 3 ? "critical" : w.stockout_sku_count > 0 ? "watch" : "healthy";
    return {
      id: w.region_id,
      name: w.name,
      city: w.city,
      region: w.region_type,
      stockUnits: Math.round(w.total_stock),
      capacityUnits: Math.round(w.total_capacity),
      capacityPct: w.utilization_pct,
      stockoutCount: w.stockout_sku_count,
      criticalStockoutCount: w.critical_stockout_sku_count,
      expiryExposureValue: Math.round(w.expiring_30d_value),
      status,
    };
  });

  return { data: warehouses, loading, error };
}
