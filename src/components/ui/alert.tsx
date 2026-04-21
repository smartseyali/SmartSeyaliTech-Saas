import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * ERPNext v16 alert — tinted left-border banner, text-first.
 */
const alertVariants = cva(
  "relative w-full rounded-md border-l-2 pl-3 pr-4 py-2.5 text-sm [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-2px] [&>svg]:absolute [&>svg]:left-3 [&>svg]:top-3 [&>svg]:h-4 [&>svg]:w-4",
  {
    variants: {
      variant: {
        default:     "bg-primary-50 border-primary-500 text-primary-700 [&>svg]:text-primary-500",
        info:        "bg-primary-50 border-primary-500 text-primary-700 [&>svg]:text-primary-500",
        success:     "bg-success-100 border-success-500 text-success-700 [&>svg]:text-success-500",
        warning:     "bg-warning-100 border-warning-500 text-warning-700 [&>svg]:text-warning-500",
        destructive: "bg-destructive-100 border-destructive-500 text-destructive-700 [&>svg]:text-destructive-500",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
  ),
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("mb-0.5 text-sm font-semibold leading-tight", className)} {...props} />
  ),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-xs leading-relaxed [&_p]:leading-relaxed", className)} {...props} />
  ),
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
