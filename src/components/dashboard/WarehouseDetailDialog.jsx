import { MapPin, ListTree } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { cn, formatNumber, formatCurrency } from "@/lib/utils";

const criticalityCls = {
  Critical: "bg-red-50 text-red-700 border-red-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-teal-50 text-teal-700 border-teal-200",
};

// Stockouts and Critical-criticality SKUs surface first — that's the most
// actionable view for a planner who just opened this DC's detail.
function sortSkus(skus) {
  return [...skus].sort((a, b) => {
    const aFlag = a.current_stock <= 0 || a.criticality === "Critical" ? 0 : 1;
    const bFlag = b.current_stock <= 0 || b.criticality === "Critical" ? 0 : 1;
    if (aFlag !== bFlag) return aFlag - bFlag;
    return a.current_stock - b.current_stock;
  });
}

function DetailContent({ regionId }) {
  const { data, loading, error } = useApi((signal) => api.warehouseDetail(regionId, signal), [regionId]);

  if (loading) return <LoadingState label="Loading DC detail..." />;
  if (error || !data) return <ErrorState />;

  const skus = sortSkus(data.skus || []);

  return (
    <div className="space-y-5 p-5">
      <section>
        <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <ListTree className="h-3.5 w-3.5" />
          SKUs at this DC ({skus.length})
        </h4>
        <div className="scrollbar-thin overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold text-muted-foreground">
                <th className="px-3 py-2">SKU</th>
                <th className="px-3 py-2 text-right">Current Stock</th>
                <th className="px-3 py-2 text-right">Warehouse Capacity</th>
                <th className="px-3 py-2 text-right">Nearest Batch Expiry</th>
                <th className="px-3 py-2 text-right">Criticality</th>
              </tr>
            </thead>
            <tbody>
              {skus.map((s) => (
                <tr key={s.sku_id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 text-foreground">
                    <span className="font-mono-num text-muted-foreground">{s.sku_id}</span> {s.sku_name}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2 text-right font-mono-num font-semibold",
                      s.current_stock <= 0 ? "text-destructive" : "text-foreground"
                    )}
                  >
                    {formatNumber(Math.round(s.current_stock))}
                    {s.current_stock <= 0 && (
                      <Badge variant="destructive" className="ml-2">
                        Stockout
                      </Badge>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-mono-num text-muted-foreground">
                    {formatNumber(Math.round(s.warehouse_capacity))}
                  </td>
                  <td className="px-3 py-2 text-right text-muted-foreground">
                    {s.nearest_batch_expiry_days != null ? `${s.nearest_batch_expiry_days}d` : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Badge className={cn("border", criticalityCls[s.criticality] || criticalityCls.Medium)}>
                      {s.criticality}
                    </Badge>
                  </td>
                </tr>
              ))}
              {skus.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No SKUs on record at this DC.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// `warehouse` carries the summary fields already rendered on the card
// (name, city, capacityPct, stockUnits, stockoutCount, criticalStockoutCount,
// expiryExposureValue) so the dialog can repeat them at the top instantly,
// without waiting on the /warehouses/{region_id} fetch below.
export function WarehouseDetailDialog({ warehouse, onClose }) {
  return (
    <Dialog open={!!warehouse} onOpenChange={(open) => !open && onClose()}>
      {warehouse && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{warehouse.name}</DialogTitle>
            <DialogDescription className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {warehouse.city}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 border-b border-border p-5 text-xs sm:grid-cols-4">
            <div>
              <p className="text-muted-foreground">Capacity</p>
              <p className="font-mono-num font-semibold text-foreground">{warehouse.capacityPct}%</p>
              <Progress value={warehouse.capacityPct} className="mt-1" />
            </div>
            <div>
              <p className="text-muted-foreground">Stock Level</p>
              <p className="font-mono-num font-semibold text-foreground">{formatNumber(warehouse.stockUnits)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Stockouts</p>
              <p
                className={cn(
                  "font-mono-num font-semibold",
                  warehouse.criticalStockoutCount > 0 ? "text-destructive" : "text-foreground"
                )}
              >
                {warehouse.stockoutCount} SKUs ({warehouse.criticalStockoutCount} critical)
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Expiry Exposure (30d)</p>
              <p className="font-mono-num font-semibold text-warning">
                {formatCurrency(warehouse.expiryExposureValue)}
              </p>
            </div>
          </div>

          <DetailContent regionId={warehouse.id} />
        </DialogContent>
      )}
    </Dialog>
  );
}
