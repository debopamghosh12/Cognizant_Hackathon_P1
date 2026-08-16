import { Pill } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-8 border-t border-border px-4 py-5 lg:px-6">
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Pill className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold text-foreground">MedCare Pharma</span>
          Planning Dashboard – Frontend Prototype
        </div>
        <p className="text-[11px] text-muted-foreground">
          Built for demo purposes · All data synthetic · &copy; 2026 MedCare Pharma
        </p>
      </div>
    </footer>
  );
}
