import { FileText, Download, FileBarChart } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { reports } from "@/data/mockData";

const typeColor = {
  Replenishment: "default",
  Expiry: "warning",
  Forecast: "teal",
  Warehouse: "secondary",
  Inventory: "destructive",
};

export function ReportsPage() {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="h-4 w-4 text-primary" />
            Generated Reports
          </CardTitle>
          <CardDescription>Download planning, forecast, and audit reports</CardDescription>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 px-5 pb-5 sm:grid-cols-2 xl:grid-cols-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className="flex flex-col rounded-lg border border-border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <Badge variant={typeColor[r.type] || "secondary"}>{r.type}</Badge>
              </div>
              <p className="mt-3 text-sm font-semibold leading-snug text-foreground">{r.name}</p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>{r.generated}</span>
                <span>&middot;</span>
                <span>{r.format}</span>
                <span>&middot;</span>
                <span>{r.size}</span>
              </div>
              <Button variant="outline" size="sm" className="mt-4">
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
