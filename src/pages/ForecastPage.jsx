import { TrendingUp, Target, Activity, Zap } from "lucide-react";
import { FiltersBar } from "@/components/layout/FiltersBar";
import { DemandForecastChart } from "@/components/charts/DemandForecastChart";
import { HistoricalVsSensedChart } from "@/components/charts/HistoricalVsSensedChart";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const forecastStats = [
  { label: "Forecast Accuracy (MAPE)", value: "91.4%", icon: Target, color: "text-primary", bg: "bg-primary/10" },
  { label: "Demand Sensing Uplift", value: "+8.9%", icon: Zap, color: "text-teal", bg: "bg-teal/10" },
  { label: "Signals Processed / Day", value: "1.2M", icon: Activity, color: "text-warning", bg: "bg-warning/10" },
  { label: "Categories Trending Up", value: "6 of 10", icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
];

const categoryDemand = [
  { name: "Antibiotics", change: 34, direction: "up" },
  { name: "Respiratory", change: 22, direction: "up" },
  { name: "Cardiac Care", change: 11, direction: "up" },
  { name: "Diabetes Care", change: 9, direction: "up" },
  { name: "Vaccines", change: 6, direction: "up" },
  { name: "Gastro Care", change: 4, direction: "up" },
  { name: "Analgesics", change: -2, direction: "down" },
  { name: "Antipyretics", change: -3, direction: "down" },
  { name: "Dermatology", change: -5, direction: "down" },
  { name: "Vitamins & Supplements", change: -6, direction: "down" },
];

export function ForecastPage({ filters, setFilters }) {
  return (
    <div className="space-y-5">
      <FiltersBar filters={filters} setFilters={setFilters} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {forecastStats.map((s) => {
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

      <DemandForecastChart />
      <HistoricalVsSensedChart />

      <Card>
        <CardHeader>
          <CardTitle>Category-Level Demand Signal</CardTitle>
          <CardDescription>7-day sensed demand change vs. rolling average, by therapeutic category</CardDescription>
        </CardHeader>
        <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-3">
          {categoryDemand.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between rounded-lg border border-border p-3.5 hover:shadow-card-hover transition-shadow"
            >
              <span className="text-sm font-medium text-foreground">{c.name}</span>
              <Badge variant={c.direction === "up" ? "success" : "muted"}>
                {c.direction === "up" ? "+" : ""}
                {c.change}%
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
