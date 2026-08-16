import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { formatCompact } from "@/lib/utils";

export function HistoricalVsSensedChart() {
  const { data, loading, error } = useApi((signal) => api.demandTrend(signal));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Demand Trend</CardTitle>
        <CardDescription>Total sensed demand by month, network-wide</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <LoadingState label="Loading demand trend..." />}
        {!loading && (error || !data) && <ErrorState />}
        {!loading && !error && data && (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatCompact(v)}
              />
              <Tooltip
                formatter={(v) => formatCompact(v)}
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
              <Bar dataKey="demand" name="Total Demand" fill="hsl(174 72% 36%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
