import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

const dateRanges = ["Last 7 days", "Last 14 days", "Last 30 days", "Last Quarter", "Year to Date"];

export function FiltersBar({ filters, setFilters }) {
  const { data: regions } = useApi((signal) => api.regions(signal));
  const { data: skus } = useApi((signal) => api.skus(signal));
  const categories = skus ? [...new Set(skus.map((s) => s.category))].sort() : [];

  function update(key, value) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  function reset() {
    setFilters({ warehouse: "All", category: "All", region: "All", dateRange: "Last 14 days" });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3.5 shadow-card sm:flex-row sm:items-center">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filters
      </div>
      <div className="grid flex-1 grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Select value={filters.warehouse} onChange={(e) => update("warehouse", e.target.value)}>
          <option value="All">All Warehouses</option>
          {(regions || []).map((r) => (
            <option key={r.region_id} value={r.name}>
              {r.name}
            </option>
          ))}
        </Select>
        <Select value={filters.category} onChange={(e) => update("category", e.target.value)}>
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select value={filters.region} onChange={(e) => update("region", e.target.value)}>
          <option value="All">All Regions</option>
          {(regions || []).map((r) => (
            <option key={r.region_id} value={r.name}>
              {r.name}
            </option>
          ))}
        </Select>
        <Select value={filters.dateRange} onChange={(e) => update("dateRange", e.target.value)}>
          {dateRanges.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
      </div>
      <Button variant="ghost" size="sm" onClick={reset} className="shrink-0">
        <RotateCcw className="h-3.5 w-3.5" />
        Reset
      </Button>
    </div>
  );
}
