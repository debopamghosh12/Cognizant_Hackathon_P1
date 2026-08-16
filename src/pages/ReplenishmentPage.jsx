import { FiltersBar } from "@/components/layout/FiltersBar";
import { ReplenishmentTable } from "@/components/dashboard/ReplenishmentTable";
import { Card } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { formatNumber } from "@/lib/utils";
import { AlertOctagon, ArrowUpCircle, Clock3, CheckCircle2 } from "lucide-react";

function priorityOf(r) {
  if (r.current_stock <= 0) return "Critical";
  const daysOfCover = r.current_stock / Math.max(r.forecast_daily_demand, 1);
  if (daysOfCover < r.lead_time_days) return "High";
  return "Medium";
}

export function ReplenishmentPage({ filters, setFilters }) {
  const { data, loading, error } = useApi(() => api.replenishAll());
  const needsReorder = (data || []).filter((r) => r.needs_reorder);

  const byPriority = {
    Critical: needsReorder.filter((r) => priorityOf(r) === "Critical").length,
    High: needsReorder.filter((r) => priorityOf(r) === "High").length,
    Medium: needsReorder.filter((r) => priorityOf(r) === "Medium").length,
  };

  const totalReorderUnits = needsReorder.reduce((s, r) => s + r.suggested_order_qty, 0);

  const stats = [
    { label: "Critical Orders", value: byPriority.Critical, icon: AlertOctagon, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "High Priority", value: byPriority.High, icon: ArrowUpCircle, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Total Reorder Units", value: formatNumber(totalReorderUnits), icon: Clock3, color: "text-primary", bg: "bg-primary/10" },
    { label: "Medium Priority", value: byPriority.Medium, icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  ];

  return (
    <div className="space-y-5">
      <FiltersBar filters={filters} setFilters={setFilters} />

      {loading && <LoadingState label="Loading replenishment stats..." />}
      {!loading && (error || !data) && <ErrorState />}
      {!loading && !error && data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                    <p className="mt-2 text-2xl font-bold text-foreground font-mono-num">{s.value}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}>
                    <Icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ReplenishmentTable />
    </div>
  );
}
