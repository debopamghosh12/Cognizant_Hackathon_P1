import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { historicalVsSensed } from "@/data/mockData";
import { formatCompact } from "@/lib/utils";

export function HistoricalVsSensedChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historical vs Sensed Demand</CardTitle>
        <CardDescription>Monthly comparison highlighting demand-sensing uplift</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={historicalVsSensed} margin={{ top: 5, right: 10, left: -12, bottom: 0 }}>
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
            <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
            <Bar dataKey="historical" name="Historical Demand" fill="hsl(212 60% 82%)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="sensed" name="Sensed Demand" fill="hsl(174 72% 36%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
