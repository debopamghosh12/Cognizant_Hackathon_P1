import { useState } from "react";
import { ArrowUpDown, Truck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PriorityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { formatNumber } from "@/lib/utils";

const priorityRank = { Critical: 0, High: 1, Medium: 2 };

function priorityOf(r) {
  if (r.current_stock <= 0) return "Critical";
  const daysOfCover = r.current_stock / Math.max(r.forecast_daily_demand, 1);
  if (daysOfCover < r.lead_time_days) return "High";
  return "Medium";
}

function etaOf(leadTimeDays) {
  const d = new Date();
  d.setDate(d.getDate() + leadTimeDays);
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export function ReplenishmentTable({ limit, showHeader = true }) {
  const [sortAsc, setSortAsc] = useState(true);
  const { data, loading, error } = useApi(() => api.replenishAll());

  const rows = (data || [])
    .filter((r) => r.needs_reorder)
    .map((r) => ({ ...r, priority: priorityOf(r), eta: etaOf(r.lead_time_days) }))
    .sort((a, b) =>
      sortAsc ? priorityRank[a.priority] - priorityRank[b.priority] : priorityRank[b.priority] - priorityRank[a.priority]
    )
    .slice(0, limit || undefined);

  return (
    <Card>
      {showHeader && (
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Replenishment Recommendations</CardTitle>
            <CardDescription>System-generated reorder plan based on sensed demand</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Truck className="h-3.5 w-3.5" />
            Create POs
          </Button>
        </CardHeader>
      )}
      {loading && <LoadingState label="Loading replenishment plan..." />}
      {!loading && (error || !data) && <ErrorState />}
      {!loading && !error && data && (
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-y border-border bg-muted/50 text-left text-xs font-semibold text-muted-foreground">
                <th className="px-5 py-2.5">SKU</th>
                <th className="px-5 py-2.5">Warehouse</th>
                <th className="px-5 py-2.5 text-right">Current Stock</th>
                <th className="px-5 py-2.5 text-right">Forecast Demand</th>
                <th className="px-5 py-2.5 text-right">Reorder Qty</th>
                <th className="px-5 py-2.5">
                  <button className="flex items-center gap-1" onClick={() => setSortAsc((v) => !v)}>
                    Priority <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-5 py-2.5">ETA</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.sku_id + r.region} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-foreground">{r.sku_id}</p>
                    <p className="text-xs text-muted-foreground">{r.sku_name}</p>
                  </td>
                  <td className="px-5 py-3 text-foreground">{r.region_name}</td>
                  <td className="px-5 py-3 text-right font-mono-num text-foreground">{formatNumber(Math.round(r.current_stock))}</td>
                  <td className="px-5 py-3 text-right font-mono-num text-foreground">{formatNumber(Math.round(r.forecast_daily_demand))}</td>
                  <td className="px-5 py-3 text-right font-mono-num font-semibold text-primary">
                    {formatNumber(r.suggested_order_qty)}
                  </td>
                  <td className="px-5 py-3">
                    <PriorityBadge priority={r.priority} />
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{r.eta}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No SKUs currently need reordering.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
