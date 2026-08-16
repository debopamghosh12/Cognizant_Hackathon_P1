import {
  LayoutDashboard,
  TrendingUp,
  Package,
  AlertTriangle,
  Warehouse,
  ClipboardList,
  Bell,
  FileBarChart,
  Pill,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { alerts } from "@/data/mockData";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "forecast", label: "Demand Forecast", icon: TrendingUp },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "expiry", label: "Expiry Risk", icon: AlertTriangle },
  { id: "warehouses", label: "Warehouses", icon: Warehouse },
  { id: "replenishment", label: "Replenishment Planner", icon: ClipboardList },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "reports", label: "Reports", icon: FileBarChart },
];

export function Sidebar({ activePage, setActivePage, mobileOpen, setMobileOpen }) {
  const criticalAlertCount = alerts.filter((a) => a.severity === "critical").length;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-300 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-teal shadow-sm">
              <Pill className="h-[18px] w-[18px] text-white" strokeWidth={2.25} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-foreground">MedCare Pharma</p>
              <p className="text-[10.5px] font-medium text-muted-foreground">Planning Suite</p>
            </div>
          </div>
          <button
            className="rounded-md p-1 text-muted-foreground hover:bg-muted lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-2.5 pb-2 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setMobileOpen(false);
                }}
                className={cn(
                  "group flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                    strokeWidth={2}
                  />
                  {item.label}
                </span>
                {item.id === "alerts" && criticalAlertCount > 0 && (
                  <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                    {criticalAlertCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer mini */}
        <div className="border-t border-border p-4">
          <div className="rounded-lg bg-gradient-to-br from-accent to-card p-3">
            <p className="text-xs font-semibold text-foreground">System Status</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              <p className="text-[11px] text-muted-foreground">All sensing feeds online</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
