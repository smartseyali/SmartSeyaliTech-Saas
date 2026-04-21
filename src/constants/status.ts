// Status color mappings — ERPNext v16 "indicator" colors
// Each state gets a dot color + matching pill tint.

type Tone = "green" | "gray" | "blue" | "orange" | "red" | "purple";

const TONE_MAP: Record<Tone, { dot: string; pillBg: string; pillText: string; pillBorder: string }> = {
  green:  { dot: "bg-success-500",  pillBg: "bg-success-100",  pillText: "text-success-700",  pillBorder: "border-success-100"  },
  gray:   { dot: "bg-gray-400",     pillBg: "bg-gray-100",     pillText: "text-gray-600",     pillBorder: "border-gray-200"     },
  blue:   { dot: "bg-primary-500",  pillBg: "bg-primary-100",  pillText: "text-primary-700",  pillBorder: "border-primary-100"  },
  orange: { dot: "bg-warning-500",  pillBg: "bg-warning-100",  pillText: "text-warning-700",  pillBorder: "border-warning-100"  },
  red:    { dot: "bg-destructive-500", pillBg: "bg-destructive-100", pillText: "text-destructive-700", pillBorder: "border-destructive-100" },
  purple: { dot: "bg-purple-500",   pillBg: "bg-purple-100",   pillText: "text-purple-700",   pillBorder: "border-purple-200"   },
};

// Status → tone
const STATUS_TONE: Record<string, Tone> = {
  // success
  paid: "green",
  confirmed: "green",
  completed: "green",
  delivered: "green",
  active: "green",
  posted: "green",
  approved: "green",
  received: "green",
  published: "green",

  // neutral
  draft: "gray",
  inactive: "gray",
  closed: "gray",
  archived: "gray",

  // info
  open: "blue",
  pending: "blue",
  processing: "blue",
  submitted: "blue",
  "in-progress": "blue",
  new: "blue",

  // warning
  unpaid: "orange",
  "on-hold": "orange",
  partial: "orange",
  "to-deliver": "orange",
  "to-invoice": "orange",
  shipped: "orange",

  // danger
  overdue: "red",
  cancelled: "red",
  rejected: "red",
  failed: "red",
  expired: "red",
  suspended: "red",
};

export function getStatusTone(status: string): Tone {
  return STATUS_TONE[status?.toLowerCase()?.trim() || ""] || "gray";
}

export function getStatusIndicator(status: string) {
  return TONE_MAP[getStatusTone(status)];
}

// Legacy helper for existing callers — returns the bg/text/border pill classes
export function getStatusColor(status: string): string {
  const t = getStatusIndicator(status);
  return `${t.pillBg} ${t.pillText} ${t.pillBorder}`;
}

// Legacy constant for existing consumers
export const STATUS_COLORS: Record<string, string> = Object.fromEntries(
  Object.keys(STATUS_TONE).map((k) => [k, getStatusColor(k)]),
);

export const STATUS_GROUPS = {
  success: ["paid", "confirmed", "completed", "delivered", "active", "posted", "approved", "received", "published"],
  neutral: ["draft", "inactive", "closed", "archived"],
  info:    ["open", "pending", "processing", "submitted", "in-progress", "new"],
  warning: ["unpaid", "on-hold", "partial", "to-deliver", "to-invoice", "shipped"],
  danger:  ["overdue", "cancelled", "rejected", "failed", "expired", "suspended"],
} as const;
