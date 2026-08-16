import { FiltersBar } from "@/components/layout/FiltersBar";
import { ExpiryRiskDonutChart } from "@/components/charts/ExpiryRiskDonutChart";
import { ExpiryRiskSection } from "@/components/dashboard/ExpiryRiskSection";
import { Card } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { AlertTriangle, DollarSign, Package } from "lucide-react";

export function ExpiryPage({ filters, setFilters }) {
  const { data, loading, error } = useApi(() =>
    Promise.all([api.expiryExposure(15), api.expiryExposure(90)])
  );
  const [critical, overall] = data || [null, null];

  return (
    <div className="space-y-5">
      <FiltersBar filters={filters} setFilters={setFilters} />

      {loading && <LoadingState label="Loading expiry exposure..." />}
      {!loading && (error || !critical || !overall) && <ErrorState />}
      {!loading && !error && critical && overall && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Critical Batches (&lt;15 days)</p>
              <p className="text-xl font-bold text-foreground font-mono-num">{critical.total_batches_at_risk}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-warning/10">
              <DollarSign className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Estimated Loss (90d)</p>
              <p className="text-xl font-bold text-foreground font-mono-num">
                {formatCurrency(overall.total_value_at_risk)}
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Units at Risk (90d)</p>
              <p className="text-xl font-bold text-foreground font-mono-num">
                {formatNumber(overall.total_quantity_at_risk)}
              </p>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ExpiryRiskSection limit={30} />
        </div>
        <ExpiryRiskDonutChart />
      </div>
    </div>
  );
}
