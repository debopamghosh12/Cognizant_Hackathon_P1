import { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown, Menu, Calendar, LogOut, Settings, UserCircle, Sun, Moon } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { useTheme } from "@/lib/useTheme";

const pageTitles = {
  dashboard: { title: "Dashboard", subtitle: "Overview of demand, inventory, and replenishment health" },
  forecast: { title: "Demand Forecast", subtitle: "AI-sensed demand vs. statistical forecast" },
  inventory: { title: "Inventory", subtitle: "SKU-level stock across all distribution centers" },
  expiry: { title: "Expiry Risk", subtitle: "Batches approaching expiry and estimated write-off value" },
  warehouses: { title: "Warehouses", subtitle: "Distribution center capacity and fill rate" },
  replenishment: { title: "Replenishment Planner", subtitle: "System-generated reorder recommendations" },
  alerts: { title: "Alerts", subtitle: "Real-time signals requiring attention" },
  reports: { title: "Reports", subtitle: "Generated planning and audit reports" },
};

const dateRanges = ["Today", "Last 7 days", "Last 14 days", "Last 30 days", "This Quarter"];

export function Topbar({ activePage, setMobileOpen }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [dateRange, setDateRange] = useState("Last 14 days");
  const [dateOpen, setDateOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const dateRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (dateRef.current && !dateRef.current.contains(e.target)) setDateOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const meta = pageTitles[activePage] || pageTitles.dashboard;
  const { data: alerts } = useApi((signal) => api.alerts(signal));
  const recentAlerts = (alerts || []).slice(0, 5).map((a) => ({
    id: `${a.sku_id}-${a.region}`,
    title: `${a.sku_name} — predicted stockout risk`,
    message: `${a.region_name}: ${a.days_of_cover} days of cover left, reorder ${formatNumber(a.suggested_order_qty)} units`,
    time: a.recommended_review_cadence,
    severity: a.severity.toLowerCase(),
  }));

  const severityColor = {
    high: "bg-orange-500",
    medium: "bg-amber-500",
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
      {/* Top row */}
      <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
        <button
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden lg:block">
          <h1 className="text-base font-bold text-foreground">{meta.title}</h1>
          <p className="text-xs text-muted-foreground">{meta.subtitle}</p>
        </div>

        {/* Search */}
        <div className="ml-auto flex max-w-md flex-1 items-center lg:ml-6">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search SKU, batch, warehouse..."
              className="h-9 w-full rounded-lg border border-border bg-muted/60 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          {/* Date selector */}
          <div className="relative hidden sm:block" ref={dateRef}>
            <button
              onClick={() => setDateOpen((v) => !v)}
              className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground shadow-sm hover:bg-muted"
            >
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {dateRange}
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
            {dateOpen && (
              <div className="absolute right-0 z-40 mt-1.5 w-40 rounded-lg border border-border bg-card p-1 shadow-card-hover animate-fade-in">
                {dateRanges.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setDateRange(r);
                      setDateOpen(false);
                    }}
                    className={cn(
                      "block w-full rounded-md px-2.5 py-1.5 text-left text-xs font-medium hover:bg-muted",
                      r === dateRange ? "text-primary" : "text-foreground"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white ring-2 ring-card">
                {recentAlerts.length}
              </span>
            </button>
            {notifOpen && (
              <div className="absolute right-0 z-40 mt-1.5 w-80 rounded-xl border border-border bg-card shadow-card-hover animate-fade-in">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">Notifications</p>
                  <Badge>{recentAlerts.length} new</Badge>
                </div>
                <div className="scrollbar-thin max-h-80 overflow-y-auto">
                  {recentAlerts.map((a) => (
                    <div key={a.id} className="flex gap-2.5 border-b border-border px-4 py-3 last:border-0 hover:bg-muted/60">
                      <span className={cn("mt-1 h-2 w-2 flex-shrink-0 rounded-full", severityColor[a.severity])} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground">{a.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-[11.5px] text-muted-foreground">{a.message}</p>
                        <p className="mt-1 text-[10.5px] text-muted-foreground/70">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5">
                  <button className="w-full text-center text-xs font-semibold text-primary hover:underline">
                    View all alerts
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg border border-border bg-card py-1 pl-1 pr-2 shadow-sm hover:bg-muted"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-teal text-xs font-bold text-white">
                RS
              </div>
              <div className="hidden text-left leading-tight sm:block">
                <p className="text-xs font-semibold text-foreground">Riya Sharma</p>
                <p className="text-[10px] text-muted-foreground">Supply Planner</p>
              </div>
              <ChevronDown className="hidden h-3 w-3 text-muted-foreground sm:block" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 z-40 mt-1.5 w-52 rounded-lg border border-border bg-card p-1 shadow-card-hover animate-fade-in">
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-foreground">Riya Sharma</p>
                  <p className="text-[10.5px] text-muted-foreground">riya.sharma@medcarepharma.com</p>
                </div>
                <div className="my-1 h-px bg-border" />
                <button className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs font-medium text-foreground hover:bg-muted">
                  <UserCircle className="h-3.5 w-3.5" /> My Profile
                </button>
                <button className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs font-medium text-foreground hover:bg-muted">
                  <Settings className="h-3.5 w-3.5" /> Settings
                </button>
                <div className="my-1 h-px bg-border" />
                <button className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs font-medium text-destructive hover:bg-red-50">
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile title row */}
      <div className="px-4 pb-3 lg:hidden">
        <h1 className="text-base font-bold text-foreground">{meta.title}</h1>
        <p className="text-xs text-muted-foreground">{meta.subtitle}</p>
      </div>
    </header>
  );
}

function Badge({ children }) {
  return (
    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10.5px] font-semibold text-primary">
      {children}
    </span>
  );
}
