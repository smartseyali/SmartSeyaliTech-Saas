import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * ERPNext v16 input — 32px height, 6px radius, thin 1px border,
 * light blue ring on focus, no large shadow.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900",
          "placeholder:text-gray-400",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "hover:border-gray-300",
          "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
          "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
          "dark:bg-card dark:text-foreground dark:border-border dark:hover:border-gray-300/40",
          "transition-colors",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
