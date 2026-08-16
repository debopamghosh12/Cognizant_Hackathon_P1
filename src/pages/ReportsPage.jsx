import { FileBarChart, TrendingUp, Target } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { formatCompact } from "@/lib/utils";

export function ReportsPage() {
  const { data, loading, error } = useApi(() =>
    Promise.all([api.demandTrend(), api.categoryBreakdown(), api.accuracy(7)])
  );
  const [demandTrend, categoryBreakdown, accuracy] = data || [null, null, null];

  if (loading) return <LoadingState label="Loading reports..." />;
  if (error || !data) return <ErrorState />;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Monthly Demand Trend
          </CardTitle>
          <CardDescription>Total sensed demand by month, network-wide</CardDescription>
        </CardHeader>
        <div className="scrollbar-thin overflow-x-auto px-5 pb-5">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-y border-border bg-muted/50 text-left text-xs font-semibold text-muted-foreground">
                <th className="px-3 py-2.5">Month</th>
                <th className="px-3 py-2.5 text-right">Total Demand</th>
              </tr>
            </thead>
            <tbody>
              {demandTrend.map((row) => (
                <tr key={row.month} className="border-b border-border last:border-0">
                  <td className="px-3 py-2.5 text-foreground">{row.month}</td>
                  <td className="px-3 py-2.5 text-right font-mono-num text-foreground">{formatCompact(row.demand)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="h-4 w-4 text-primary" />
            Category Breakdown
          </CardTitle>
          <CardDescription>Total sensed demand by therapeutic category</CardDescription>
        </CardHeader>
        <div className="scrollbar-thin overflow-x-auto px-5 pb-5">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-y border-border bg-muted/50 text-left text-xs font-semibold text-muted-foreground">
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5 text-right">Total Demand</th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdown.map((row) => (
                <tr key={row.category} className="border-b border-border last:border-0">
                  <td className="px-3 py-2.5 text-foreground">{row.category}</td>
                  <td className="px-3 py-2.5 text-right font-mono-num text-foreground">{formatCompact(row.demand)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Forecast Accuracy — 7-Day Backtest
          </CardTitle>
          <CardDescription>
            Overall MAPE: {accuracy.mape != null ? `${accuracy.mape}%` : "—"} across {accuracy.sample_size} samples
          </CardDescription>
        </CardHeader>
        <div className="scrollbar-thin overflow-x-auto px-5 pb-5">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-y border-border bg-muted/50 text-left text-xs font-semibold text-muted-foreground">
                <th className="px-3 py-2.5">SKU</th>
                <th className="px-3 py-2.5 text-right">MAPE</th>
              </tr>
            </thead>
            <tbody>
              {accuracy.by_sku.map((row) => (
                <tr key={row.sku_id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2.5 text-foreground">
                    {row.sku_id} <span className="text-xs text-muted-foreground">{row.sku_name}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono-num text-foreground">{row.mape}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
