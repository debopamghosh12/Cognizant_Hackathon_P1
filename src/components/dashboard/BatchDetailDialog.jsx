import { Package2, Network, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { cn, formatNumber, formatCurrency } from "@/lib/utils";

function riskTier(days) {
  if (days <= 15) return { label: "Critical", cls: "bg-red-50 text-red-700 border-red-200" };
  if (days <= 30) return { label: "High", cls: "bg-orange-50 text-orange-700 border-orange-200" };
  if (days <= 60) return { label: "Medium", cls: "bg-amber-50 text-amber-700 border-amber-200" };
  return { label: "Low", cls: "bg-teal-50 text-teal-700 border-teal-200" };
}

function DetailContent({ batch }) {
  const { data, loading, error } = useApi(
    (signal) => Promise.all([api.batches(batch.sku_id, undefined, signal), api.allocate(batch.sku_id, signal)]),
    [batch.sku_id]
  );

  if (loading) return <LoadingState label="Loading network batch and allocation data..." />;
  if (error || !data) return <ErrorState />;

  const [networkBatches, alloc] = data;
  const sortedBatches = [...networkBatches].sort((a, b) => a.expiry_days - b.expiry_days);
  const topDc = alloc.allocation_plan[0];
  const currentRank = alloc.allocation_plan.find((p) => p.region === batch.region);
  const isNotTopPriority = currentRank && topDc && currentRank.region !== topDc.region;

  return (
    <div className="space-y-6 p-5">
      {isNotTopPriority && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-foreground">
          This batch sits at <span className="font-semibold">{batch.region_name}</span> (rank{" "}
          {currentRank.rank} of {alloc.allocation_plan.length}), but{" "}
          <span className="font-semibold">{topDc.region_name}</span> is the top-priority DC for{" "}
          {batch.sku_name}. This stock might be better moved to {topDc.region_name} before it expires
          unsold here.
        </div>
      )}

      <section>
        <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Package2 className="h-3.5 w-3.5" />
          All batches of {batch.sku_name} network-wide ({sortedBatches.length})
        </h4>
        <div className="scrollbar-thin overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold text-muted-foreground">
                <th className="px-3 py-2">Batch ID</th>
                <th className="px-3 py-2">Warehouse</th>
                <th className="px-3 py-2 text-right">Quantity</th>
                <th className="px-3 py-2 text-right">Expiry Date</th>
                <th className="px-3 py-2 text-right">Days Left</th>
              </tr>
            </thead>
            <tbody>
              {sortedBatches.map((b) => {
                const tier = riskTier(b.expiry_days);
                return (
                  <tr
                    key={b.batch_id}
                    className={cn(
                      "border-b border-border last:border-0",
                      b.batch_id === batch.batch_id && "bg-primary/10"
                    )}
                  >
                    <td className="px-3 py-2 font-mono-num text-foreground">
                      {b.batch_id}
                      {b.batch_id === batch.batch_id && (
                        <span className="ml-1.5 text-[10.5px] text-primary">(this batch)</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-foreground">{b.region_name}</td>
                    <td className="px-3 py-2 text-right font-mono-num text-foreground">
                      {formatNumber(b.quantity)}
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{b.expiry_date}</td>
                    <td className="px-3 py-2 text-right">
                      <Badge className={cn("border", tier.cls)}>
                        {b.expiry_days}d ({tier.label})
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Network className="h-3.5 w-3.5" />
          Allocation recommendation — {batch.sku_name}
        </h4>
        <div className="scrollbar-thin overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold text-muted-foreground">
                <th className="px-3 py-2">Rank</th>
                <th className="px-3 py-2">Region</th>
                <th className="px-3 py-2 text-right">Current Stock</th>
                <th className="px-3 py-2 text-right">Forecast Demand</th>
                <th className="px-3 py-2 text-right">Days of Cover</th>
              </tr>
            </thead>
            <tbody>
              {alloc.allocation_plan.map((p) => (
                <tr
                  key={p.region}
                  className={cn(
                    "border-b border-border last:border-0",
                    p.region === batch.region && "bg-primary/10"
                  )}
                >
                  <td className="px-3 py-2 font-mono-num font-semibold text-foreground">
                    #{p.rank}
                    {p.rank === 1 && (
                      <Badge variant="success" className="ml-2">
                        Top Priority
                      </Badge>
                    )}
                  </td>
                  <td className="px-3 py-2 text-foreground">
                    {p.region_name}
                    {p.region === batch.region && (
                      <span className="ml-1.5 text-[10.5px] text-primary">(this batch's DC)</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-mono-num text-foreground">
                    {formatNumber(Math.round(p.current_stock))}
                    {p.is_stockout && (
                      <Badge variant="destructive" className="ml-2">
                        Stockout
                      </Badge>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-mono-num text-muted-foreground">
                    {formatNumber(Math.round(p.forecast_demand))}
                  </td>
                  <td className="px-3 py-2 text-right font-mono-num text-muted-foreground">
                    {p.days_of_cover}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Network total: {formatNumber(Math.round(alloc.total_network_stock))} units (
          {formatCurrency(alloc.total_network_value)})
        </p>
      </section>
    </div>
  );
}

// `batch` is the row object already rendered on the Expiry Risk card (has
// sku_id, sku_name, region/region_name, batch_id, quantity, expiry_date,
// expiry_days, value) — repeated here so the dialog opens instantly with
// this batch's own detail while the network batch list / allocation plan
// (keyed on sku_id) load underneath.
export function BatchDetailDialog({ batch, onClose }) {
  return (
    <Dialog open={!!batch} onOpenChange={(open) => !open && onClose()}>
      {batch && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {batch.sku_name} <span className="font-mono-num text-muted-foreground">({batch.sku_id})</span>
            </DialogTitle>
            <DialogDescription className="flex items-center gap-1">
              {batch.region_name} <ArrowRight className="h-3 w-3" /> Batch {batch.batch_id}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 border-b border-border p-5 text-xs sm:grid-cols-4">
            <div>
              <p className="text-muted-foreground">Quantity</p>
              <p className="font-mono-num font-semibold text-foreground">{formatNumber(batch.quantity)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Expiry Date</p>
              <p className="font-mono-num font-semibold text-foreground">{batch.expiry_date}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Days Left</p>
              <p className="font-mono-num font-semibold text-foreground">{batch.expiry_days}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Est. Loss</p>
              <p className="font-mono-num font-semibold text-destructive">{formatCurrency(batch.value)}</p>
            </div>
          </div>

          <DetailContent batch={batch} />
        </DialogContent>
      )}
    </Dialog>
  );
}
