import { TrendingUp, Target, Activity, Zap } from "lucide-react";
import { FiltersBar } from "@/components/layout/FiltersBar";
import { DemandForecastChart } from "@/components/charts/DemandForecastChart";
import { HistoricalVsSensedChart } from "@/components/charts/HistoricalVsSensedChart";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

// "Demand Sensing Uplift" and "Signals Processed / Day" have no backend source yet
// (no sensed-vs-statistical comparison or signal-ingestion metric exists) — left static.
const staticStats = [
  { label: "Demand Sensing Uplift", value: "N/A", icon: Zap, color: "text-teal", bg: "bg-teal/10" },
  { label: "Signals Processed / Day", value: "N/A", icon: Activity, color: "text-warning", bg: "bg-warning/10" },
];

export function ForecastPage({ filters, setFilters }) {
  const { data, loading, error } = useApi(() =>
    Promise.all([api.accuracy(7), api.categoryBreakdown()])
  );
  const [accuracy, categoryBreakdown] = data || [null, null];
  const totalDemand = categoryBreakdown ? categoryBreakdown.reduce((s, c) => s + c.demand, 0) : 0;

  return (
    <div className="space-y-5">
      <FiltersBar filters={filters} setFilters={setFilters} />

      {loading && <LoadingState label="Loading forecast stats..." />}
      {!loading && (error || !accuracy) && <ErrorState />}
      {!loading && !error && accuracy && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Forecast Error (MAPE, 7-day backtest)</p>
                <p className="mt-2 text-2xl font-bold text-foreground font-mono-num">
                  {accuracy.mape != null ? `${accuracy.mape}%` : "—"}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Categories Tracked</p>
                <p className="mt-2 text-2xl font-bold text-foreground font-mono-num">
                  {categoryBreakdown ? categoryBreakdown.length : "—"}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </div>
          </Card>
          {staticStats.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                    <p className="mt-2 text-2xl font-bold text-foreground font-mono-num">{s.value}</p>
                  </div>
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", s.bg)}>
                    <Icon className={cn("h-5 w-5", s.color)} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <DemandForecastChart />
      <HistoricalVsSensedChart />

      <Card>
        <CardHeader>
          <CardTitle>Category-Level Demand Breakdown</CardTitle>
          <CardDescription>Share of total sensed demand by therapeutic category</CardDescription>
        </CardHeader>
        {loading && <LoadingState label="Loading category breakdown..." />}
        {!loading && (error || !categoryBreakdown) && <ErrorState />}
        {!loading && !error && categoryBreakdown && (
          <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-3">
            {categoryBreakdown.map((c) => (
              <div
                key={c.category}
                className="flex items-center justify-between rounded-lg border border-border p-3.5 hover:shadow-card-hover transition-shadow"
              >
                <span className="text-sm font-medium text-foreground">{c.category}</span>
                <Badge variant="muted">{Math.round((c.demand / totalDemand) * 1000) / 10}%</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
