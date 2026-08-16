import { useMemo, useState } from "react";
import { Search, Package } from "lucide-react";
import { FiltersBar } from "@/components/layout/FiltersBar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { cn, formatNumber } from "@/lib/utils";

const statusVariant = {
  Critical: "destructive",
  Low: "warning",
  Healthy: "success",
};

function statusOf(currentStock, safetyStock) {
  if (currentStock <= 0) return "Critical";
  if (currentStock < safetyStock) return "Low";
  return "Healthy";
}

export function InventoryPage({ filters, setFilters }) {
  const [query, setQuery] = useState("");
  const { data, loading, error } = useApi(() =>
    Promise.all([api.forecastAll(), api.replenishAll(), api.skus()])
  );
  const [forecastAll, replenishAll, skus] = data || [null, null, null];

  const inventoryItems = useMemo(() => {
    if (!forecastAll || !replenishAll || !skus) return null;
    const safetyBySkuRegion = Object.fromEntries(
      replenishAll.map((r) => [`${r.sku_id}|${r.region}`, r.safety_stock])
    );
    const categoryBySku = Object.fromEntries(skus.map((s) => [s.sku_id, s.category]));
    return forecastAll.map((r) => {
      const safetyStock = safetyBySkuRegion[`${r.sku_id}|${r.region}`] ?? 0;
      return {
        sku: r.sku_id,
        name: r.sku_name,
        category: categoryBySku[r.sku_id] ?? "Other",
        warehouse: r.region_name,
        stock: Math.round(r.current_row.current_stock),
        safetyStock: Math.round(safetyStock),
        status: statusOf(r.current_row.current_stock, safetyStock),
        leadTimeDays: r.current_row.lead_time_days,
      };
    });
  }, [forecastAll, replenishAll, skus]);

  const filtered = useMemo(() => {
    if (!inventoryItems) return [];
    return inventoryItems.filter((item) => {
      if (filters.warehouse !== "All" && item.warehouse !== filters.warehouse) return false;
      if (filters.category !== "All" && item.category !== filters.category) return false;
      if (query && !`${item.sku} ${item.name}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [inventoryItems, filters, query]);

  const summary = inventoryItems
    ? {
        total: inventoryItems.length,
        critical: inventoryItems.filter((i) => i.status === "Critical").length,
        low: inventoryItems.filter((i) => i.status === "Low").length,
        healthy: inventoryItems.filter((i) => i.status === "Healthy").length,
      }
    : null;

  return (
    <div className="space-y-5">
      <FiltersBar filters={filters} setFilters={setFilters} />

      {loading && <LoadingState label="Loading inventory..." />}
      {!loading && (error || !summary) && <ErrorState />}
      {!loading && !error && summary && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Total SKU x Region Rows</p>
              <p className="mt-1 text-xl font-bold text-foreground font-mono-num">{summary.total}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Critical</p>
              <p className="mt-1 text-xl font-bold text-destructive font-mono-num">{summary.critical}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Low Stock</p>
              <p className="mt-1 text-xl font-bold text-warning font-mono-num">{summary.low}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Healthy</p>
              <p className="mt-1 text-xl font-bold text-success font-mono-num">{summary.healthy}</p>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  SKU-Level Inventory
                </CardTitle>
                <CardDescription>Current stock against safety-stock thresholds</CardDescription>
              </div>
              <div className="relative w-56">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search SKU or name..."
                  className="pl-8"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-y border-border bg-muted/50 text-left text-xs font-semibold text-muted-foreground">
                    <th className="px-5 py-2.5">SKU</th>
                    <th className="px-5 py-2.5">Category</th>
                    <th className="px-5 py-2.5">Warehouse</th>
                    <th className="px-5 py-2.5 text-right">Stock</th>
                    <th className="px-5 py-2.5 text-right">Safety Stock</th>
                    <th className="px-5 py-2.5">Status</th>
                    <th className="px-5 py-2.5 text-right">Lead Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.sku + item.warehouse} className="border-b border-border last:border-0 hover:bg-muted/40">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-foreground">{item.sku}</p>
                        <p className="text-xs text-muted-foreground">{item.name}</p>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{item.category}</td>
                      <td className="px-5 py-3 text-foreground">{item.warehouse}</td>
                      <td
                        className={cn(
                          "px-5 py-3 text-right font-mono-num font-medium",
                          item.stock < item.safetyStock ? "text-destructive" : "text-foreground"
                        )}
                      >
                        {formatNumber(item.stock)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono-num text-muted-foreground">
                        {formatNumber(item.safetyStock)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right text-xs text-muted-foreground">{item.leadTimeDays} days</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-sm text-muted-foreground">
                        No SKUs match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
