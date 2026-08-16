import { Boxes, Target, AlertOctagon, Timer, Warehouse, ClipboardList, ArrowUp, ArrowDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn, formatCompact, formatCurrency } from "@/lib/utils";
import { kpis } from "@/data/mockData";

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
    label: "Expiring Stock Value",
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
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cardsConfig.map((cfg) => {
        const data = kpis[cfg.key];
        const Icon = cfg.icon;
        const isGoodTrend = data.trend === "up" || data.trend === "down_good";
        const TrendIcon = data.change >= 0 ? ArrowUp : ArrowDown;

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
            <div className="mt-3 flex items-center gap-1.5">
              <span
                className={cn(
                  "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                  isGoodTrend ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                )}
              >
                <TrendIcon className="h-3 w-3" />
                {Math.abs(data.change)}
                {cfg.key === "criticalShortages" || cfg.key === "replenishmentPending" ? "" : "%"}
              </span>
              <span className="text-[11px] text-muted-foreground">vs last period</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
