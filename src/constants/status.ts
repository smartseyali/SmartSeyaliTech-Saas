// Status color mappings - single source of truth
export const STATUS_COLORS: Record<string, string> = {
  // Success states
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  posted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  received: "bg-emerald-50 text-emerald-700 border-emerald-200",

  // Draft/neutral states
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  inactive: "bg-slate-100 text-slate-600 border-slate-200",
  closed: "bg-slate-100 text-slate-600 border-slate-200",

  // Info/pending states
  open: "bg-blue-50 text-blue-700 border-blue-200",
  pending: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  "in-progress": "bg-blue-50 text-blue-700 border-blue-200",

  // Warning states
  unpaid: "bg-amber-50 text-amber-700 border-amber-200",
  "on-hold": "bg-amber-50 text-amber-700 border-amber-200",
  partial: "bg-amber-50 text-amber-700 border-amber-200",
  "to-deliver": "bg-amber-50 text-amber-700 border-amber-200",
  "to-invoice": "bg-amber-50 text-amber-700 border-amber-200",
  shipped: "bg-amber-50 text-amber-700 border-amber-200",

  // Error/critical states
  overdue: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  expired: "bg-red-50 text-red-700 border-red-200",
};

export function getStatusColor(status: string): string {
  const s = status?.toLowerCase()?.trim() || "";
  return STATUS_COLORS[s] || "bg-slate-100 text-slate-600 border-slate-200";
}

// Semantic status groups for filtering
export const STATUS_GROUPS = {
  success: ["paid", "confirmed", "completed", "delivered", "active", "posted", "approved", "received"],
  neutral: ["draft", "inactive", "closed"],
  info: ["open", "pending", "processing", "submitted", "in-progress"],
  warning: ["unpaid", "on-hold", "partial", "to-deliver", "to-invoice", "shipped"],
  danger: ["overdue", "cancelled", "rejected", "failed", "expired"],
} as const;
