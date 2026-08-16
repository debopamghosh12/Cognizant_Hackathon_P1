import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// Aggregates per-region (distribution-center) stats client-side, since the
// backend exposes per-SKU x region rows but no pre-aggregated per-DC view.
export function useRegionSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([api.regions(), api.forecastAll(), api.replenishAll(), api.batches()])
      .then(([regions, forecastAll, replenishAll, batches]) => {
        if (cancelled) return;

        const byRegion = {};
        for (const region of regions) {
          byRegion[region.region_id] = {
            id: region.region_id,
            name: region.name,
            city: region.city,
            regionType: region.region_type,
            stockUnits: 0,
            capacityUnits: 0,
            skuCount: 0,
            reorderCount: 0,
            rowCount: 0,
            expiryValue: 0,
          };
        }

        for (const row of forecastAll) {
          const r = byRegion[row.region];
          if (!r) continue;
          r.stockUnits += row.current_row.current_stock;
          r.capacityUnits += row.current_row.warehouse_capacity;
          r.skuCount += 1;
          r.rowCount += 1;
        }

        for (const row of replenishAll) {
          const r = byRegion[row.region];
          if (!r) continue;
          if (row.needs_reorder) r.reorderCount += 1;
        }

        for (const batch of batches) {
          const r = byRegion[batch.region];
          if (!r) continue;
          r.expiryValue += batch.value;
        }

        const warehouses = Object.values(byRegion).map((r) => {
          const capacityPct = r.capacityUnits > 0 ? Math.round((r.stockUnits / r.capacityUnits) * 100) : 0;
          const stockHealthPct = r.rowCount > 0 ? Math.round(100 - (r.reorderCount / r.rowCount) * 100) : 100;
          const status = capacityPct >= 85 ? "critical" : capacityPct >= 70 ? "watch" : "healthy";
          return {
            id: r.id,
            name: r.name,
            city: r.city,
            region: r.regionType,
            stockUnits: Math.round(r.stockUnits),
            capacityUnits: Math.round(r.capacityUnits),
            capacityPct,
            stockHealthPct,
            skuCount: r.skuCount,
            expiryExposureValue: Math.round(r.expiryValue),
            status,
          };
        });

        setData(warehouses);
      })
      .catch((e) => {
        if (!cancelled) setError(e);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
