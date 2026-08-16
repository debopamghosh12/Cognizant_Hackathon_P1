import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { useRegionSummary } from "@/lib/useRegionSummary";
import { formatCompact } from "@/lib/utils";

const barColors = ["hsl(212 92% 43%)", "hsl(174 72% 36%)", "hsl(212 92% 65%)", "hsl(174 60% 55%)", "hsl(212 70% 75%)", "hsl(174 50% 65%)"];

export function WarehouseDistributionChart() {
  const { data, loading, error } = useRegionSummary();
  const chartData = data?.map((w) => ({ name: w.name, stock: w.stockUnits, capacity: w.capacityUnits }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Warehouse Stock Distribution</CardTitle>
        <CardDescription>Current stock vs total capacity by distribution center</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <LoadingState label="Loading warehouse data..." />}
        {!loading && (error || !chartData) && <ErrorState />}
        {!loading && !error && chartData && (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -12, bottom: 0 }} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
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
              <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
              <Bar dataKey="capacity" name="Total Capacity" fill="hsl(210 30% 92%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="stock" name="Current Stock" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={barColors[i % barColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
