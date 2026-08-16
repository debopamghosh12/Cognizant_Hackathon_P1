import { useState } from "react";
import { FiltersBar } from "@/components/layout/FiltersBar";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { alerts } from "@/data/mockData";
import { cn } from "@/lib/utils";

const severities = ["all", "critical", "high", "medium", "low"];

export function AlertsPage({ filters, setFilters }) {
  const [active, setActive] = useState("all");

  const counts = {
    all: alerts.length,
    critical: alerts.filter((a) => a.severity === "critical").length,
    high: alerts.filter((a) => a.severity === "high").length,
    medium: alerts.filter((a) => a.severity === "medium").length,
    low: alerts.filter((a) => a.severity === "low").length,
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

      <AlertsPanelFiltered severity={active} />
    </div>
  );
}

function AlertsPanelFiltered({ severity }) {
  if (severity === "all") return <AlertsPanel />;
  return <AlertsPanelInner severity={severity} />;
}

function AlertsPanelInner({ severity }) {
  // Lightweight wrapper reusing the same visual language as AlertsPanel
  const filtered = alerts.filter((a) => a.severity === severity);
  return (
    <Card>
      <div className="scrollbar-thin max-h-[600px] space-y-2.5 overflow-y-auto p-5">
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No alerts at this severity level.</p>
        )}
        {filtered.map((a) => (
          <div key={a.id} className="rounded-lg border border-border p-3.5 hover:shadow-card-hover transition-shadow">
            <p className="text-sm font-semibold text-foreground">{a.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{a.message}</p>
            <p className="mt-1.5 text-[10.5px] text-muted-foreground/70">{a.time}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
