import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { expiryRiskBands } from "@/data/mockData";
import { formatCompact } from "@/lib/utils";

export function ExpiryRiskDonutChart() {
  const total = expiryRiskBands.reduce((s, b) => s + b.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expiry Risk Breakdown</CardTitle>
        <CardDescription>Inventory units by expiry risk band</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={expiryRiskBands}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={100}
                paddingAngle={2}
                stroke="none"
              >
                {expiryRiskBands.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => `${formatCompact(v)} units`}
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
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: 11.5, lineHeight: "20px" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute left-[26%] top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-lg font-bold text-foreground font-mono-num">{formatCompact(total)}</p>
            <p className="text-[10px] text-muted-foreground">Total Units</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
