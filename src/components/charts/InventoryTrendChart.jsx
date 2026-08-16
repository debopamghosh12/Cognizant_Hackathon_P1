import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { inventoryTrend } from "@/data/mockData";
import { formatCompact } from "@/lib/utils";

export function InventoryTrendChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Trend</CardTitle>
        <CardDescription>
          6-week rolling stock composition across the network (demo data — backend has no historical
          stock-status time series yet)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={inventoryTrend} margin={{ top: 5, right: 10, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="healthyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(212 92% 43%)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="hsl(212 92% 43%)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="lowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(32 95% 48%)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="hsl(32 95% 48%)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="expiringGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0 72% 51%)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="hsl(0 72% 51%)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
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
            <Area type="monotone" dataKey="healthy" name="Healthy Stock" stroke="hsl(212 92% 43%)" fill="url(#healthyGrad)" strokeWidth={2} stackId="1" />
            <Area type="monotone" dataKey="lowStock" name="Low Stock" stroke="hsl(32 95% 48%)" fill="url(#lowGrad)" strokeWidth={2} stackId="1" />
            <Area type="monotone" dataKey="expiring" name="Expiring" stroke="hsl(0 72% 51%)" fill="url(#expiringGrad)" strokeWidth={2} stackId="1" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
