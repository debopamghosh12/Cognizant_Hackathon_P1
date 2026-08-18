import { useState } from "react";
import { Warehouse as WarehouseIcon, MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { WarehouseDetailDialog } from "@/components/dashboard/WarehouseDetailDialog";
import { useRegionSummary } from "@/lib/useRegionSummary";
import { cn, formatNumber, formatCurrency } from "@/lib/utils";

const statusMeta = {
  healthy: { label: "Healthy", cls: "bg-success/10 text-success border-success/20", dot: "bg-success" },
  watch: { label: "Watch", cls: "bg-warning/10 text-warning border-warning/20", dot: "bg-warning" },
  critical: { label: "Critical", cls: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
};

export function WarehouseOverview() {
  const { data: warehouses, loading, error } = useRegionSummary();
  const [selected, setSelected] = useState(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WarehouseIcon className="h-4 w-4 text-primary" />
          Distribution Center Overview
        </CardTitle>
        <CardDescription>Live capacity, stockouts, and expiry exposure by DC</CardDescription>
      </CardHeader>
      {loading && <LoadingState label="Loading warehouse overview..." />}
      {!loading && (error || !warehouses) && <ErrorState />}
      {!loading && !error && warehouses && (
        <div className="grid grid-cols-1 gap-4 px-5 pb-5 sm:grid-cols-2 xl:grid-cols-4">
          {warehouses.map((w) => {
            const status = statusMeta[w.status];
            const barColor =
              w.capacityPct >= 85 ? "bg-destructive" : w.capacityPct >= 70 ? "bg-warning" : "bg-primary";
            return (
              <div
                key={w.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(w)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(w);
                  }
                }}
                className="flex cursor-pointer flex-col rounded-lg border border-border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">{w.name}</p>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {w.city}
                    </p>
                  </div>
                  <Badge className={cn("border", status.cls)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                    {status.label}
                  </Badge>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-mono-num font-semibold text-foreground">{w.capacityPct}%</span>
                  </div>
                  <Progress value={w.capacityPct} barClassName={barColor} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Stock Level</p>
                    <p className="font-mono-num font-semibold text-foreground">{formatNumber(w.stockUnits)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Stockouts</p>
                    <p
                      className={cn(
                        "font-mono-num font-semibold",
                        w.criticalStockoutCount > 0 ? "text-destructive" : "text-foreground"
                      )}
                    >
                      {w.stockoutCount} SKUs ({w.criticalStockoutCount} critical)
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Expiry Exposure (30d)</p>
                    <p className="font-mono-num font-semibold text-warning">
                      {formatCurrency(w.expiryExposureValue)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <WarehouseDetailDialog warehouse={selected} onClose={() => setSelected(null)} />
    </Card>
  );
}
