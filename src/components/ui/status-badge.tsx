import { cn } from "@/lib/utils";
import { getStatusIndicator } from "@/constants/status";

interface StatusBadgeProps {
  status: string;
  className?: string;
  /** When true, shows pill with tinted bg; otherwise Frappe "dot + label" indicator style. */
  pill?: boolean;
}

/**
 * ERPNext v16 indicator: colored dot + label (default) or tinted pill.
 */
export function StatusBadge({ status, className, pill = false }: StatusBadgeProps) {
  if (!status) return <span className="text-gray-300">—</span>;

  const { dot, pillBg, pillText } = getStatusIndicator(status);
  const label = status.replace(/[-_]/g, " ");

  if (pill) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium leading-none whitespace-nowrap",
          pillBg,
          pillText,
          className,
        )}
      >
        <span className={cn("inline-block w-1.5 h-1.5 rounded-full", dot)} />
        <span className="capitalize">{label}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 whitespace-nowrap dark:text-foreground",
        className,
      )}
    >
      <span className={cn("inline-block w-1.5 h-1.5 rounded-full", dot)} />
      <span className="capitalize">{label}</span>
    </span>
  );
}
