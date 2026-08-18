import { useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

const HORIZON_DAYS = 10;

async function fetchOptions(signal) {
  const [skus, regions] = await Promise.all([api.skus(signal), api.regions(signal)]);
  return { skus, regions };
}

async function fetchForecastSeries(skuId, regionId, signal) {
  const today = new Date();
  const dates = Array.from({ length: HORIZON_DAYS }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });
  const results = await Promise.all(
    dates.map((d) => api.predict(skuId, regionId, d.toISOString().slice(0, 10), signal))
  );
  return results.map((r) => ({
    day: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    forecast: r.forecast_demand,
  }));
}

// `filters.region` (set by the page-level FiltersBar) drives this chart's
// region so that filter isn't dead UI on this page — the Region select
// rendered here reads/writes that same shared state. The SKU select has no
// page-level filter equivalent, so it stays local to this chart.
export function DemandForecastChart({ filters, setFilters }) {
  const { data: options, loading: optionsLoading, error: optionsError } = useApi((signal) => fetchOptions(signal));
  const [skuId, setSkuId] = useState("");

  const skus = options?.skus ?? [];
  const regions = options?.regions ?? [];

  const effectiveSkuId = skuId || skus[0]?.sku_id || "";
  const selectedByFilterName = regions.find((r) => r.name === filters.region);
  const effectiveRegionId = selectedByFilterName?.region_id || regions[0]?.region_id || "";

  const {
    data: chartData,
    loading: seriesLoading,
    error: seriesError,
  } = useApi(
    (signal) =>
      effectiveSkuId && effectiveRegionId
        ? fetchForecastSeries(effectiveSkuId, effectiveRegionId, signal)
        : Promise.resolve(null),
    [effectiveSkuId, effectiveRegionId]
  );

  const selectedSku = skus.find((s) => s.sku_id === effectiveSkuId);
  const selectedRegion = regions.find((r) => r.region_id === effectiveRegionId);
  const label = selectedSku && selectedRegion ? `${selectedSku.name} — ${selectedRegion.name}` : "";

  const loading = optionsLoading || seriesLoading;
  const error = optionsError || seriesError;

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle>Demand Forecast</CardTitle>
          <CardDescription>
            {label ? `${HORIZON_DAYS}-day model forecast — ${label}` : "Model-generated demand forecast"}
          </CardDescription>
        </div>
        {!optionsLoading && !optionsError && (
          <div className="flex gap-2">
            <Select className="w-44" value={effectiveSkuId} onChange={(e) => setSkuId(e.target.value)}>
              {skus.map((s) => (
                <option key={s.sku_id} value={s.sku_id}>
                  {s.name}
                </option>
              ))}
            </Select>
            <Select
              className="w-36"
              value={selectedRegion?.name ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value }))}
            >
              {regions.map((r) => (
                <option key={r.region_id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </Select>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading && <LoadingState label="Fetching forecast..." />}
        {!loading && (error || !chartData) && <ErrorState />}
        {!loading && !error && chartData && (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid hsl(var(--border))",
                  backgroundColor: "hsl(var(--card))",
                  color: "hsl(var(--foreground))",
                  fontSize: 12,
                  boxShadow: "0 4px 12px rgba(16,24,40,0.08)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecast"
                stroke="hsl(212 92% 43%)"
                strokeWidth={2.5}
                dot={{ r: 2.5 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
