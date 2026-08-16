import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { formatCompact } from "@/lib/utils";

const BANDS = [
  { name: "Critical (<15 days)", max: 15, color: "#dc2626" },
  { name: "High (15-30 days)", max: 30, color: "#f97316" },
  { name: "Medium (30-60 days)", max: 60, color: "#eab308" },
  { name: "Low (60-90 days)", max: 90, color: "#0d9488" },
];

function bucketBatches(batches) {
  const bands = BANDS.map((b) => ({ ...b, value: 0 }));
  for (const batch of batches) {
    const band = bands.find((b) => batch.expiry_days <= b.max);
    if (band) band.value += batch.value;
  }
  return bands.map((b) => ({ name: b.name, value: Math.round(b.value), color: b.color }));
}

export function ExpiryRiskDonutChart() {
  const { data: batches, loading, error } = useApi(() => api.batches());
  const bands = batches ? bucketBatches(batches) : null;
  const total = bands ? bands.reduce((s, b) => s + b.value, 0) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expiry Risk Breakdown</CardTitle>
        <CardDescription>Inventory value at risk by expiry band</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <LoadingState label="Loading expiry data..." />}
        {!loading && (error || !bands) && <ErrorState />}
        {!loading && !error && bands && (
          <div className="relative">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={bands}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={100}
                  paddingAngle={2}
                  stroke="none"
                >
                  {bands.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
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
              <p className="text-[10px] text-muted-foreground">Value at Risk</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
