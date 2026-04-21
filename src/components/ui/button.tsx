import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * ERPNext v16 (Frappe Desk) button
 * - 32px default height, 28px sm, 36px lg
 * - Flat fills, 1px borders, subtle hover, 6px radius
 * - No scale-on-active (Frappe uses opacity + bg shift)
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium leading-none ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-600 active:bg-primary-700",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive-700",
        outline:
          "border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-300 dark:bg-card dark:text-foreground dark:border-border dark:hover:bg-accent",
        secondary:
          "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-transparent dark:bg-accent dark:text-foreground dark:hover:bg-accent/80",
        ghost:
          "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-foreground dark:hover:bg-accent",
        subtle:
          "bg-primary-50 text-primary-700 hover:bg-primary-100 border border-transparent",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto",
        success:
          "bg-success text-success-foreground hover:bg-success-700",
      },
      size: {
        default: "h-9 px-3.5 text-sm",
        sm: "h-8 px-3 text-xs rounded",
        xs: "h-7 px-2.5 text-xs rounded",
        lg: "h-10 px-4 text-sm rounded-md",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
