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
          "flex h-9 w-full rounded-md border px-3 py-1.5 text-sm transition-colors",
          "bg-[var(--form-input-bg)] text-[var(--form-input-color)] border-[var(--form-input-border)]",
          "placeholder:text-[var(--form-input-placeholder)]",
          "hover:border-[var(--form-input-border-hover)]",
          "focus-visible:outline-none focus-visible:border-[var(--form-input-border-focus)] focus-visible:ring-2 focus-visible:ring-[var(--form-input-focus-ring)]",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
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
