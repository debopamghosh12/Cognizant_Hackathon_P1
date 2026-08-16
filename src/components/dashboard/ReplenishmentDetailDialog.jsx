import { Package2, Layers, Network } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

function riskTier(days) {
  if (days <= 15) return { label: "Critical", cls: "bg-red-50 text-red-700 border-red-200" };
  if (days <= 30) return { label: "High", cls: "bg-orange-50 text-orange-700 border-orange-200" };
  if (days <= 60) return { label: "Medium", cls: "bg-amber-50 text-amber-700 border-amber-200" };
  return { label: "Low", cls: "bg-teal-50 text-teal-700 border-teal-200" };
}

function DetailContent({ skuId, region }) {
  const { data, loading, error } = useApi(
    (signal) =>
      Promise.all([
        api.replenish(skuId, region, signal),
        api.batches(skuId, region, signal),
        api.allocate(skuId, signal),
      ]),
    [skuId, region]
  );

  if (loading) return <LoadingState label="Loading replenishment detail..." />;
  if (error || !data) return <ErrorState />;

  const [rep, batches, alloc] = data;
  const leadTimeDemand = rep.forecast_daily_demand * rep.lead_time_days;
  const myRank = alloc.allocation_plan.find((p) => p.region === region);

  return (
    <div className="space-y-6 p-5">
      {/* 1. Reorder math breakdown */}
      <section>
        <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Layers className="h-3.5 w-3.5" />
          How the reorder quantity was calculated
        </h4>
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
          <div className="space-y-2 font-mono-num">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Lead-time demand: {formatNumber(rep.forecast_daily_demand)}/day &times; {rep.lead_time_days} days
              </span>
              <span className="font-semibold text-foreground">{formatNumber(Math.round(leadTimeDemand))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">+ Safety stock (demand-volatility buffer)</span>
              <span className="font-semibold text-foreground">{formatNumber(rep.safety_stock)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="font-medium text-foreground">= Reorder point</span>
              <span className="font-bold text-primary">{formatNumber(rep.reorder_point)}</span>
            </div>
          </div>

          <div className="my-3 h-px bg-border" />

          <div className="space-y-2 font-mono-num">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Current stock</span>
              <span className={cn("font-semibold", rep.current_stock <= 0 ? "text-destructive" : "text-foreground")}>
                {formatNumber(Math.round(rep.current_stock))}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Reorder point + lead-time demand − current stock</span>
              <span className="font-semibold text-foreground">
                {formatNumber(rep.reorder_point)} + {formatNumber(Math.round(leadTimeDemand))} −{" "}
                {formatNumber(Math.round(rep.current_stock))}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="font-medium text-foreground">= Suggested order quantity</span>
              <span className="font-bold text-primary">{formatNumber(rep.suggested_order_qty)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Batch / expiry detail */}
      <section>
        <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Package2 className="h-3.5 w-3.5" />
          Batches at this DC ({batches.length})
        </h4>
        {batches.length === 0 ? (
          <p className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            No batches on record here — this DC currently holds none of this SKU's stock.
          </p>
        ) : (
          <div className="scrollbar-thin overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold text-muted-foreground">
                  <th className="px-3 py-2">Batch ID</th>
                  <th className="px-3 py-2 text-right">Quantity</th>
                  <th className="px-3 py-2 text-right">Expiry Date</th>
                  <th className="px-3 py-2 text-right">Days Left</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => {
                  const tier = riskTier(b.expiry_days);
                  return (
                    <tr key={b.batch_id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 font-mono-num text-foreground">{b.batch_id}</td>
                      <td className="px-3 py-2 text-right font-mono-num text-foreground">{formatNumber(b.quantity)}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{b.expiry_date}</td>
                      <td className="px-3 py-2 text-right">
                        <Badge className={cn("border", tier.cls)}>{b.expiry_days}d ({tier.label})</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 3. Cross-DC allocation context */}
      <section>
        <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Network className="h-3.5 w-3.5" />
          Cross-DC allocation priority
        </h4>
        {myRank && (
          <p className="mb-3 text-sm text-foreground">
            This DC ranks{" "}
            <span className="font-bold text-primary">
              #{myRank.rank} of {alloc.allocation_plan.length}
            </span>{" "}
            for incoming allocation priority on {rep.sku_name}
            {myRank.is_stockout && (
              <Badge variant="destructive" className="ml-2">
                Stockout
              </Badge>
            )}
          </p>
        )}
        <div className="scrollbar-thin overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold text-muted-foreground">
                <th className="px-3 py-2">Rank</th>
                <th className="px-3 py-2">Region</th>
                <th className="px-3 py-2 text-right">Stock</th>
                <th className="px-3 py-2 text-right">Days of Cover</th>
                <th className="px-3 py-2 text-right">Nearest Expiry</th>
              </tr>
            </thead>
            <tbody>
              {alloc.allocation_plan.map((p) => (
                <tr
                  key={p.region}
                  className={cn(
                    "border-b border-border last:border-0",
                    p.region === region && "bg-primary/10"
                  )}
                >
                  <td className="px-3 py-2 font-mono-num font-semibold text-foreground">#{p.rank}</td>
                  <td className="px-3 py-2 text-foreground">
                    {p.region_name}
                    {p.region === region && <span className="ml-1.5 text-[10.5px] text-primary">(this DC)</span>}
                  </td>
                  <td className="px-3 py-2 text-right font-mono-num text-foreground">
                    {formatNumber(Math.round(p.current_stock))}
                  </td>
                  <td className="px-3 py-2 text-right font-mono-num text-muted-foreground">{p.days_of_cover}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">{p.nearest_batch_expiry_days}d</td>
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

export function ReplenishmentDetailDialog({ item, onClose }) {
  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      {item && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {item.sku_id} — {item.sku_name}
            </DialogTitle>
            <DialogDescription>{item.region_name}</DialogDescription>
          </DialogHeader>
          <DetailContent skuId={item.sku_id} region={item.region} />
        </DialogContent>
      )}
    </Dialog>
  );
}
