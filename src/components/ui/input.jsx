import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "h-9 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary/50",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
