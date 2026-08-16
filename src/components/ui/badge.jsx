import { cn } from "@/lib/utils";

const variants = {
  default: "bg-primary/10 text-primary border-primary/20",
  secondary: "bg-secondary text-secondary-foreground border-border",
  teal: "bg-teal/10 text-teal border-teal/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  outline: "bg-transparent text-foreground border-border",
  muted: "bg-muted text-muted-foreground border-transparent",
};

export function Badge({ className, variant = "default", children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// Priority-specific badge with dot indicator
const priorityStyles = {
  Critical: "bg-red-50 text-red-700 border-red-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-teal-50 text-teal-700 border-teal-200",
};

const priorityDot = {
  Critical: "bg-red-600",
  High: "bg-orange-500",
  Medium: "bg-amber-500",
  Low: "bg-teal-600",
};

export function PriorityBadge({ priority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        priorityStyles[priority] || priorityStyles.Medium
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", priorityDot[priority] || priorityDot.Medium)} />
      {priority}
    </span>
  );
}
