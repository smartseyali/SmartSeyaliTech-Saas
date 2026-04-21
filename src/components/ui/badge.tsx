import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * ERPNext v16 indicator pill — small, 4px radius, colored tint background.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium leading-none transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-primary-100 text-primary-700 border border-primary-100",
        secondary:
          "bg-gray-100 text-gray-700 border border-gray-100",
        destructive:
          "bg-destructive-100 text-destructive-700 border border-destructive-100",
        success:
          "bg-success-100 text-success-700 border border-success-100",
        warning:
          "bg-warning-100 text-warning-700 border border-warning-100",
        outline:
          "bg-transparent text-gray-700 border border-gray-200",
        solid:
          "bg-primary text-primary-foreground border border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
