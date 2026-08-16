import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Footer } from "@/components/layout/Footer";
import { DashboardPage } from "@/pages/DashboardPage";
import { ForecastPage } from "@/pages/ForecastPage";
import { InventoryPage } from "@/pages/InventoryPage";
import { ExpiryPage } from "@/pages/ExpiryPage";
import { WarehousesPage } from "@/pages/WarehousesPage";
import { ReplenishmentPage } from "@/pages/ReplenishmentPage";
import { AlertsPage } from "@/pages/AlertsPage";
import { ReportsPage } from "@/pages/ReportsPage";

const pageMap = {
  dashboard: DashboardPage,
  forecast: ForecastPage,
  inventory: InventoryPage,
  expiry: ExpiryPage,
  warehouses: WarehousesPage,
  replenishment: ReplenishmentPage,
  alerts: AlertsPage,
  reports: ReportsPage,
};

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filters, setFilters] = useState({
    warehouse: "All",
    category: "All",
    region: "All",
    dateRange: "Last 14 days",
  });

  const ActivePageComponent = pageMap[activePage] || DashboardPage;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <Topbar activePage={activePage} setMobileOpen={setMobileOpen} />

        <main className="flex-1 px-4 py-5 lg:px-6 lg:py-6">
          <ActivePageComponent filters={filters} setFilters={setFilters} setActivePage={setActivePage} />
        </main>

        <Footer />
      </div>
    </div>
  );
}
