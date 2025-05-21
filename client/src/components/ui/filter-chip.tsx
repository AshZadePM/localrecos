import * as React from "react";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const filterChipVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gray-light text-dark hover:bg-gray-200",
        outline: "bg-white border border-gray-300 text-dark hover:bg-gray-light",
        selected: "bg-primary text-white hover:bg-primary/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface FilterChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof filterChipVariants> {
  active?: boolean;
}

const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  ({ className, variant, active, ...props }, ref) => {
    const actualVariant = active ? "selected" : variant;
    
    return (
      <button
        className={cn(filterChipVariants({ variant: actualVariant }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

FilterChip.displayName = "FilterChip";

export { FilterChip, filterChipVariants };
