import { AlertTriangle, Package2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

function riskTier(days) {
  if (days <= 15) return { label: "Critical", cls: "bg-red-50 text-red-700 border-red-200", bar: "bg-red-500" };
  if (days <= 30) return { label: "High", cls: "bg-orange-50 text-orange-700 border-orange-200", bar: "bg-orange-500" };
  if (days <= 60) return { label: "Medium", cls: "bg-amber-50 text-amber-700 border-amber-200", bar: "bg-amber-500" };
  return { label: "Low", cls: "bg-teal-50 text-teal-700 border-teal-200", bar: "bg-teal-500" };
}

export function ExpiryRiskSection({ limit }) {
  const { data, loading, error } = useApi(() => Promise.all([api.batches(), api.skus()]));
  const [batches, skus] = data || [null, null];
  const unitBySku = skus ? Object.fromEntries(skus.map((s) => [s.sku_id, s.unit])) : {};
  const items = batches ? batches.slice(0, limit || undefined) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          Medicines Nearing Expiry
        </CardTitle>
        <CardDescription>Batch-level expiry exposure and estimated write-off value</CardDescription>
      </CardHeader>
      {loading && <LoadingState label="Loading batch data..." />}
      {!loading && (error || !items) && <ErrorState />}
      {!loading && !error && items && (
        <div className="grid grid-cols-1 gap-4 px-5 pb-5 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => {
            const tier = riskTier(item.expiry_days);
            return (
              <div
                key={item.batch_id}
                className="group rounded-lg border border-border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      <Package2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight text-foreground">{item.sku_name}</p>
                      <p className="text-[11px] text-muted-foreground">{item.sku_id}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Batch ID</span>
                    <span className="font-mono-num font-medium text-foreground">{item.batch_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Warehouse</span>
                    <span className="font-medium text-foreground">{item.region_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-mono-num font-medium text-foreground">
                      {formatNumber(item.quantity)} {unitBySku[item.sku_id]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Loss</span>
                    <span className="font-mono-num font-semibold text-destructive">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                </div>

                <div className="mt-3.5 flex items-center justify-between border-t border-border pt-3">
                  <Badge className={cn("border", tier.cls)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", tier.bar)} />
                    {item.expiry_days} days left
                  </Badge>
                  <span className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {tier.label}
                  </span>
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
              No batches at risk.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
