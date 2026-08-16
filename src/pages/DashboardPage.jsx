import { KpiCards } from "@/components/dashboard/KpiCards";
import { DemandForecastChart } from "@/components/charts/DemandForecastChart";
import { HistoricalVsSensedChart } from "@/components/charts/HistoricalVsSensedChart";
import { InventoryTrendChart } from "@/components/charts/InventoryTrendChart";
import { WarehouseDistributionChart } from "@/components/charts/WarehouseDistributionChart";
import { ExpiryRiskDonutChart } from "@/components/charts/ExpiryRiskDonutChart";
import { ReplenishmentTable } from "@/components/dashboard/ReplenishmentTable";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { WarehouseOverview } from "@/components/dashboard/WarehouseOverview";
import { FiltersBar } from "@/components/layout/FiltersBar";

export function DashboardPage({ filters, setFilters }) {
  return (
    <div className="space-y-5">
      <FiltersBar filters={filters} setFilters={setFilters} />
      <KpiCards />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <DemandForecastChart />
        <HistoricalVsSensedChart />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <InventoryTrendChart />
        </div>
        <ExpiryRiskDonutChart />
      </div>

      <WarehouseDistributionChart />

      <WarehouseOverview />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ReplenishmentTable limit={6} />
        </div>
        <AlertsPanel limit={6} />
      </div>
    </div>
  );
}
