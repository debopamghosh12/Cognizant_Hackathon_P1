import { useEffect, useState } from "react";
import { Boxes, Target, AlertOctagon, Timer, Warehouse, ClipboardList } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { cn, formatCompact, formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";

const cardsConfig = [
  {
    key: "totalInventory",
    label: "Total Inventory",
    icon: Boxes,
    color: "text-primary",
    bg: "bg-primary/10",
    format: (v) => `${formatCompact(v)} units`,
  },
  {
    key: "forecastAccuracy",
    label: "Forecast Accuracy",
    icon: Target,
    color: "text-teal",
    bg: "bg-teal/10",
    format: (v) => `${v}%`,
  },
  {
    key: "criticalShortages",
    label: "Critical SKU Shortages",
    icon: AlertOctagon,
    color: "text-destructive",
    bg: "bg-destructive/10",
    format: (v) => `${v} SKUs`,
  },
  {
    key: "expiringStockValue",
    label: "Expiring Stock Value (30d)",
    icon: Timer,
    color: "text-warning",
    bg: "bg-warning/10",
    format: (v) => formatCurrency(v),
  },
  {
    key: "warehouseFillRate",
    label: "Warehouse Fill Rate",
    icon: Warehouse,
    color: "text-primary",
    bg: "bg-primary/10",
    format: (v) => `${v}%`,
  },
  {
    key: "replenishmentPending",
    label: "Replenishment Orders Pending",
    icon: ClipboardList,
    color: "text-teal",
    bg: "bg-teal/10",
    format: (v) => `${v} orders`,
  },
];

export function KpiCards() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.forecastAll(), api.replenishAll(), api.expiryExposure(30), api.accuracy(7)])
      .then(([forecastAll, replenishAll, expiryExposure, accuracy]) => {
        if (cancelled) return;

        const totalInventory = forecastAll.reduce((s, r) => s + r.current_row.current_stock, 0);
        const totalCapacity = forecastAll.reduce((s, r) => s + r.current_row.warehouse_capacity, 0);
        const criticalShortages = new Set(
          replenishAll.filter((r) => r.needs_reorder && r.current_stock <= 0).map((r) => r.sku_id)
        ).size;

        setKpis({
          totalInventory: { value: Math.round(totalInventory) },
          forecastAccuracy: { value: accuracy.mape != null ? Math.round((100 - accuracy.mape) * 10) / 10 : "—" },
          criticalShortages: { value: criticalShortages },
          expiringStockValue: { value: Math.round(expiryExposure.total_value_at_risk) },
          warehouseFillRate: {
            value: totalCapacity > 0 ? Math.round((totalInventory / totalCapacity) * 1000) / 10 : 0,
          },
          replenishmentPending: { value: replenishAll.filter((r) => r.needs_reorder).length },
        });
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

  if (loading) return <LoadingState label="Loading KPIs..." />;
  if (error || !kpis) return <ErrorState />;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cardsConfig.map((cfg) => {
        const data = kpis[cfg.key];
        const Icon = cfg.icon;

        return (
          <Card key={cfg.key} className="animate-fade-in p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{cfg.label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono-num">
                  {cfg.format(data.value)}
                </p>
              </div>
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", cfg.bg)}>
                <Icon className={cn("h-5 w-5", cfg.color)} strokeWidth={2} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
