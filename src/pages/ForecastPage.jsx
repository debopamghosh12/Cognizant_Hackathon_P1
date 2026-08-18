import { TrendingUp, Target, Activity, ShieldAlert } from "lucide-react";
import { FiltersBar } from "@/components/layout/FiltersBar";
import { DemandForecastChart } from "@/components/charts/DemandForecastChart";
import { HistoricalVsSensedChart } from "@/components/charts/HistoricalVsSensedChart";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

export function ForecastPage({ filters, setFilters }) {
  const { data, loading, error } = useApi(
    (signal) =>
      Promise.all([
        api.accuracy(3, signal),
        api.categoryBreakdown(signal),
        api.skus(signal),
        api.forecastAll(undefined, signal),
      ]),
    [],
    15000
  );
  const [accuracy, categoryBreakdown, skus, forecastAll] = data || [null, null, null, null];
  const totalDemand = categoryBreakdown ? categoryBreakdown.reduce((s, c) => s + c.demand, 0) : 0;
  const criticalSkuCount = skus ? skus.filter((s) => s.criticality === "Critical").length : null;
  const forecastsPerDay = forecastAll ? forecastAll.length : null;
  const fallbackMessage =
    error?.message === "Request timed out"
      ? "Accuracy stats unavailable — try refreshing."
      : undefined;

  return (
    <div className="space-y-5">
      <FiltersBar filters={filters} setFilters={setFilters} />

      {loading && <LoadingState label="Loading forecast stats..." />}
      {!loading && (error || !accuracy) && <ErrorState message={fallbackMessage} />}
      {!loading && !error && accuracy && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Forecast Error (MAPE, 3-day backtest)</p>
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
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Critical SKUs Monitored</p>
                <p className="mt-2 text-2xl font-bold text-foreground font-mono-num">
                  {criticalSkuCount != null ? criticalSkuCount : "—"}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal/10">
                <ShieldAlert className="h-5 w-5 text-teal" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Forecasts Generated / Day</p>
                <p className="mt-2 text-2xl font-bold text-foreground font-mono-num">
                  {forecastsPerDay != null ? forecastsPerDay : "—"}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Activity className="h-5 w-5 text-warning" />
              </div>
            </div>
          </Card>
        </div>
      )}

      <DemandForecastChart filters={filters} setFilters={setFilters} />
      <HistoricalVsSensedChart />

      <Card>
        <CardHeader>
          <CardTitle>Category-Level Demand Breakdown</CardTitle>
          <CardDescription>Share of total sensed demand by therapeutic category</CardDescription>
        </CardHeader>
        {loading && <LoadingState label="Loading category breakdown..." />}
        {!loading && (error || !categoryBreakdown) && <ErrorState message={fallbackMessage} />}
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
