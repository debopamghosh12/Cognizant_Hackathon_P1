import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

const HORIZON_DAYS = 10;

async function fetchForecast(signal) {
  const [skus, regions] = await Promise.all([api.skus(signal), api.regions(signal)]);
  if (skus.length === 0 || regions.length === 0) return null;

  const sku = skus[0];
  const region = regions[0];

  const today = new Date();
  const dates = Array.from({ length: HORIZON_DAYS }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  const results = await Promise.all(
    dates.map((d) => api.predict(sku.sku_id, region.region_id, d.toISOString().slice(0, 10), signal))
  );

  return {
    label: `${sku.name} — ${region.name}`,
    chartData: results.map((r) => ({
      day: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      forecast: r.forecast_demand,
    })),
  };
}

export function DemandForecastChart() {
  const { data, loading, error } = useApi((signal) => fetchForecast(signal));
  const label = data?.label ?? "";
  const chartData = data?.chartData ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demand Forecast</CardTitle>
        <CardDescription>
          {label ? `${HORIZON_DAYS}-day model forecast — ${label}` : "Model-generated demand forecast"}
        </CardDescription>
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
