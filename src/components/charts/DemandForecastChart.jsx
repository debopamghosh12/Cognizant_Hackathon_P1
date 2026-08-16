import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { demandForecast } from "@/data/mockData";

export function DemandForecastChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Demand Forecast</CardTitle>
        <CardDescription>Statistical forecast vs. AI-sensed demand — 14 day horizon</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={demandForecast} margin={{ top: 5, right: 10, left: -12, bottom: 0 }}>
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
            <Line
              type="monotone"
              dataKey="sensed"
              name="Sensed Demand"
              stroke="hsl(174 72% 36%)"
              strokeWidth={2.5}
              strokeDasharray="5 3"
              dot={{ r: 2.5 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="hsl(32 95% 48%)"
              strokeWidth={2}
              dot={{ r: 2.5 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
