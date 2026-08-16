import { Bell, PackageX, CalendarClock, Warehouse, TrendingUp, ClipboardList } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { alerts } from "@/data/mockData";
import { cn } from "@/lib/utils";

const typeIcon = {
  stockout: PackageX,
  expiry: CalendarClock,
  capacity: Warehouse,
  demand: TrendingUp,
  replenishment: ClipboardList,
};

const severityMeta = {
  critical: { cls: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive", iconBg: "bg-destructive/10", iconColor: "text-destructive" },
  high: { cls: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500", iconBg: "bg-orange-50", iconColor: "text-orange-600" },
  medium: { cls: "bg-warning/10 text-warning border-warning/20", dot: "bg-warning", iconBg: "bg-warning/10", iconColor: "text-warning" },
  low: { cls: "bg-teal/10 text-teal border-teal/20", dot: "bg-teal", iconBg: "bg-teal/10", iconColor: "text-teal" },
};

export function AlertsPanel({ limit }) {
  const items = limit ? alerts.slice(0, limit) : alerts;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Live Alerts
          </CardTitle>
          <CardDescription>Signals requiring attention across the network</CardDescription>
        </div>
        <Badge>{items.length} active</Badge>
      </CardHeader>
      <div className="scrollbar-thin max-h-[520px] space-y-2.5 overflow-y-auto px-5 pb-5">
        {items.map((a) => {
          const Icon = typeIcon[a.type] || Bell;
          const sev = severityMeta[a.severity];
          return (
            <div
              key={a.id}
              className="flex gap-3 rounded-lg border border-border p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg", sev.iconBg)}>
                <Icon className={cn("h-[18px] w-[18px]", sev.iconColor)} strokeWidth={2} />
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
                <p className="mt-1.5 text-[10.5px] text-muted-foreground/70">{a.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
