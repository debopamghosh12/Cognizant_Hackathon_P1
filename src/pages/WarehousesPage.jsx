import { FiltersBar } from "@/components/layout/FiltersBar";
import { WarehouseOverview } from "@/components/dashboard/WarehouseOverview";
import { WarehouseDistributionChart } from "@/components/charts/WarehouseDistributionChart";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { warehouses } from "@/data/mockData";
import { formatNumber } from "@/lib/utils";

export function WarehousesPage({ filters, setFilters }) {
  return (
    <div className="space-y-5">
      <FiltersBar filters={filters} setFilters={setFilters} />
      <WarehouseOverview />
      <WarehouseDistributionChart />

      <Card>
        <CardHeader>
          <CardTitle>Warehouse Master Data</CardTitle>
          <CardDescription>Reference details for all active distribution centers</CardDescription>
        </CardHeader>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-y border-border bg-muted/50 text-left text-xs font-semibold text-muted-foreground">
                <th className="px-5 py-2.5">Distribution Center</th>
                <th className="px-5 py-2.5">Region</th>
                <th className="px-5 py-2.5">City</th>
                <th className="px-5 py-2.5 text-right">SKUs Stocked</th>
                <th className="px-5 py-2.5 text-right">Capacity (Units)</th>
                <th className="px-5 py-2.5 text-right">Current Stock</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((w) => (
                <tr key={w.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-5 py-3 font-semibold text-foreground">{w.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{w.region}</td>
                  <td className="px-5 py-3 text-muted-foreground">{w.city}</td>
                  <td className="px-5 py-3 text-right font-mono-num text-foreground">{w.skuCount}</td>
                  <td className="px-5 py-3 text-right font-mono-num text-foreground">
                    {formatNumber(w.capacityUnits)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono-num font-semibold text-primary">
                    {formatNumber(w.stockUnits)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
