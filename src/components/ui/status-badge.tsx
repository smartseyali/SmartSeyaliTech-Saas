import { cn } from "@/lib/utils";
import { getStatusColor } from "@/constants/status";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) return <span className="text-slate-300">—</span>;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border whitespace-nowrap",
        getStatusColor(status),
        className
      )}
    >
      {status.replace(/-/g, " ")}
    </span>
  );
}
