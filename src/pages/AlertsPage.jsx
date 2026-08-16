import { useState } from "react";
import { FiltersBar } from "@/components/layout/FiltersBar";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { cn, formatNumber } from "@/lib/utils";

const severities = ["all", "high", "medium"];

export function AlertsPage({ filters, setFilters }) {
  const [active, setActive] = useState("all");
  const { data, loading, error } = useApi((signal) => api.alerts(signal));
  const alerts = (data || []).map((a) => ({
    id: `${a.sku_id}-${a.region}`,
    severity: a.severity.toLowerCase(),
    title: `${a.sku_name} — predicted stockout risk`,
    message: `${a.region_name}: ${a.days_of_cover} days of cover left, reorder ${formatNumber(a.suggested_order_qty)} units`,
    cadence: a.recommended_review_cadence,
  }));

  const counts = {
    all: alerts.length,
    high: alerts.filter((a) => a.severity === "high").length,
    medium: alerts.filter((a) => a.severity === "medium").length,
  };

  return (
    <div className="space-y-5">
      <FiltersBar filters={filters} setFilters={setFilters} />

      <Card className="flex flex-wrap gap-2 p-3.5">
        {severities.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={active === s ? "default" : "outline"}
            onClick={() => setActive(s)}
            className="capitalize"
          >
            {s} <span className={cn("ml-1 rounded-full px-1.5 text-[10.5px]", active === s ? "bg-white/20" : "bg-muted")}>{counts[s]}</span>
          </Button>
        ))}
      </Card>

      {loading && <LoadingState label="Loading alerts..." />}
      {!loading && (error || !data) && <ErrorState />}
      {!loading && !error && data && (
        <>
          {active === "all" ? (
            <AlertsPanel />
          ) : (
            <Card>
              <div className="scrollbar-thin max-h-[600px] space-y-2.5 overflow-y-auto p-5">
                {alerts.filter((a) => a.severity === active).length === 0 && (
                  <p className="py-10 text-center text-sm text-muted-foreground">No alerts at this severity level.</p>
                )}
                {alerts
                  .filter((a) => a.severity === active)
                  .map((a) => (
                    <div key={a.id} className="rounded-lg border border-border p-3.5 hover:shadow-card-hover transition-shadow">
                      <p className="text-sm font-semibold text-foreground">{a.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.message}</p>
                      <p className="mt-1.5 text-[10.5px] text-muted-foreground/70">{a.cadence}</p>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
