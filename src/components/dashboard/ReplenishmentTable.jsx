import { useState } from "react";
import { ArrowUpDown, Truck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PriorityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { replenishmentRecommendations } from "@/data/mockData";
import { formatNumber } from "@/lib/utils";

const priorityRank = { Critical: 0, High: 1, Medium: 2, Low: 3 };

export function ReplenishmentTable({ limit, showHeader = true }) {
  const [sortAsc, setSortAsc] = useState(true);

  const rows = [...replenishmentRecommendations]
    .sort((a, b) =>
      sortAsc ? priorityRank[a.priority] - priorityRank[b.priority] : priorityRank[b.priority] - priorityRank[a.priority]
    )
    .slice(0, limit || replenishmentRecommendations.length);

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
            {rows.map((r, i) => (
              <tr key={r.sku + i} className="border-b border-border last:border-0 hover:bg-muted/40">
                <td className="px-5 py-3">
                  <p className="font-semibold text-foreground">{r.sku}</p>
                  <p className="text-xs text-muted-foreground">{r.name}</p>
                </td>
                <td className="px-5 py-3 text-foreground">{r.warehouse}</td>
                <td className="px-5 py-3 text-right font-mono-num text-foreground">{formatNumber(r.currentStock)}</td>
                <td className="px-5 py-3 text-right font-mono-num text-foreground">{formatNumber(r.forecastDemand)}</td>
                <td className="px-5 py-3 text-right font-mono-num font-semibold text-primary">
                  {formatNumber(r.reorderQty)}
                </td>
                <td className="px-5 py-3">
                  <PriorityBadge priority={r.priority} />
                </td>
                <td className="px-5 py-3 text-muted-foreground">{r.eta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
