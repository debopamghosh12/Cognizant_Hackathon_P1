import { Bell, PackageX } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { cn, formatNumber } from "@/lib/utils";

const severityMeta = {
  high: { cls: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500", iconBg: "bg-orange-50", iconColor: "text-orange-600" },
  medium: { cls: "bg-warning/10 text-warning border-warning/20", dot: "bg-warning", iconBg: "bg-warning/10", iconColor: "text-warning" },
};

function toAlertView(a) {
  const severity = a.severity.toLowerCase();
  return {
    id: `${a.sku_id}-${a.region}`,
    severity,
    title: `${a.sku_name} — predicted stockout risk`,
    message: `${a.region_name}: ${a.days_of_cover} days of cover left, reorder ${formatNumber(a.suggested_order_qty)} units`,
    cadence: a.recommended_review_cadence,
  };
}

export function AlertsPanel({ limit }) {
  const { data, loading, error } = useApi((signal) => api.alerts(signal));
  const items = (data || []).map(toAlertView).slice(0, limit || undefined);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Live Alerts
          </CardTitle>
          <CardDescription>Stockout-risk signals requiring attention across the network</CardDescription>
        </div>
        {data && <Badge>{items.length} active</Badge>}
      </CardHeader>
      {loading && <LoadingState label="Loading alerts..." />}
      {!loading && (error || !data) && <ErrorState />}
      {!loading && !error && data && (
        <div className="scrollbar-thin max-h-[520px] space-y-2.5 overflow-y-auto px-5 pb-5">
          {items.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">No active alerts.</p>
          )}
          {items.map((a) => {
            const sev = severityMeta[a.severity] || severityMeta.medium;
            return (
              <div
                key={a.id}
                className="flex gap-3 rounded-lg border border-border p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg", sev.iconBg)}>
                  <PackageX className={cn("h-[18px] w-[18px]", sev.iconColor)} strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{a.title}</p>
                    <Badge className={cn("border shrink-0", sev.cls)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", sev.dot)} />
                      {a.severity}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.message}</p>
                  <p className="mt-1.5 text-[10.5px] text-muted-foreground/70">{a.cadence}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
