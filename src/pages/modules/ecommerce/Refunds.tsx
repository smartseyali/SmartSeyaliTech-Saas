import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RotateCcw, CheckCircle2, XCircle, Clock, Search, Link as LinkIcon, RefreshCw, Undo2, AlertCircle, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { logPaymentTransaction } from "@/lib/services/paymentService";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-100", icon: Clock },
    approved: { label: "Approved", color: "bg-blue-50 text-blue-700 border-blue-100", icon: CheckCircle2 },
    processing: { label: "Processing", color: "bg-purple-50 text-purple-700 border-purple-100", icon: RotateCcw },
    completed: { label: "Refunded", color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: CheckCircle2 },
    rejected: { label: "Rejected", color: "bg-rose-50 text-rose-700 border-rose-100", icon: XCircle },
};

export default function Refunds() {
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [refunds, setRefunds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => { if (activeCompany) load(); }, [activeCompany]);

    const load = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const { data } = await supabase.from("refunds").select("*")
            .eq("company_id", activeCompany.id).order("created_at", { ascending: false });
        setRefunds(data || []);
        setLoading(false);
    };

    const updateStatus = async (id: string, status: string) => {
        if (!activeCompany) return;
        setProcessing(id);
        const updates: any = { status };
        if (status === "completed") updates.processed_at = new Date().toISOString();
        await supabase.from("refunds").update(updates).eq("id", id);

        // If completed, update order payment status + log transaction
        if (status === "completed") {
            const { data: refund } = await supabase.from("refunds").select("order_id, amount, payment_method").eq("id", id).maybeSingle();
            if (refund?.order_id) {
                await supabase.from("ecom_orders").update({ payment_status: "refunded" }).eq("id", refund.order_id);
                await logPaymentTransaction(
                    activeCompany.id, refund.order_id,
                    refund.payment_method || "manual", Number(refund.amount),
                    "refunded", undefined, { refund_id: id }
                );
            }
        }

        toast({ title: `Refund status → ${status}` });
        load();
        setProcessing(null);
    };

    const filtered = refunds.filter(r => {
        const matchFilter = filter === "all" || r.status === filter;
        const matchSearch = !search ||
            r.order_number?.toLowerCase().includes(search.toLowerCase()) ||
            r.customer_name?.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const totalPending = refunds.filter(r => r.status === "pending").reduce((s, r) => s + Number(r.amount), 0);
    const totalRefunded = refunds.filter(r => r.status === "completed").reduce((s, r) => s + Number(r.amount), 0);
    const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Undo2 className="w-6 h-6 text-blue-600" />
                        <span className="text-xs font-bold tracking-widest text-slate-500">Post-Purchase Operations</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Refund Requests</h1>
                    <p className="text-sm font-medium text-slate-500">
                        {refunds.filter(r => r.status === "pending").length} requests need your attention
                    </p>
                </div>
                <Button variant="outline" className="h-11 px-6 rounded-lg bg-white border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all gap-2 shadow-sm" onClick={load}>
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /> Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: "Pending Amount", value: fmt(totalPending), color: "text-amber-600 bg-amber-50 border-amber-100", icon: Clock },
                    { label: "Total Refunded", value: fmt(totalRefunded), color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: CheckCircle2 },
                    { label: "Pending Count", value: refunds.filter(r => r.status === "pending").length, color: "text-blue-600 bg-blue-50 border-blue-100", icon: AlertCircle },
                    { label: "Rejected Total", value: refunds.filter(r => r.status === "rejected").length, color: "text-rose-600 bg-rose-50 border-rose-100", icon: Ban },
                ].map(s => (
                    <div key={s.label} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold tracking-widest text-slate-500">{s.label}</span>
                            <div className={cn("p-2 rounded-lg border", s.color)}>
                                <s.icon className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold tracking-tight text-slate-900">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter + Search */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto shrink-0">
                    {["all", ...Object.keys(STATUS_CONFIG)].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={cn(
                                "px-5 py-2 rounded-lg text-xs font-bold tracking-widest whitespace-nowrap transition-all",
                                filter === f ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-slate-500 hover:text-slate-600 hover:bg-slate-50"
                            )}>
                            {f === "all" ? `All (${refunds.length})` : `${STATUS_CONFIG[f]?.label} (${refunds.filter(r => r.status === f).length})`}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by order #, customer name..."
                        className="w-full h-12 pl-12 pr-6 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all shadow-sm" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin opacity-40" />
                        <p className="text-xs font-bold tracking-widest text-slate-500">Loading refunds...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                            <Undo2 className="w-8 h-8 text-slate-300" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-lg font-bold text-slate-900">No refunds found</p>
                            <p className="text-sm font-medium text-slate-500 max-w-sm">No refund requests match your current filter.</p>
                        </div>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 text-xs font-bold tracking-widest text-slate-500 border-b border-slate-100">
                                <th className="px-6 py-4 text-left">Order</th>
                                <th className="px-6 py-4 text-left">Customer</th>
                                <th className="px-6 py-4 text-left">Amount</th>
                                <th className="px-6 py-4 text-left">Type</th>
                                <th className="px-6 py-4 text-left">Reason</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-left">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map(r => {
                                const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                                return (
                                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            {r.order_id ? (
                                                <Link to={`/apps/ecommerce/orders/${r.order_id}`}
                                                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700">
                                                    {r.order_number || "View"} <LinkIcon className="w-3.5 h-3.5" />
                                                </Link>
                                            ) : <span className="text-slate-500">—</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900">{r.customer_name || "—"}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded inline-block">-{fmt(r.amount)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn("text-xs font-bold px-2 py-1 rounded-lg border",
                                                r.refund_type === "partial" ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-slate-50 text-slate-700 border-slate-100"
                                            )}>
                                                {r.refund_type || "full"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-medium text-slate-500 max-w-[200px] line-clamp-2" title={r.reason || r.notes}>
                                                {r.reason || r.notes || "No reason provided"}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-tight border", sc.color)}>
                                                {sc.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-500">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(r.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {r.status === "pending" && (
                                                    <>
                                                        <Button className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1 shadow-md shadow-emerald-600/10 transition-all opacity-0 group-hover:opacity-100"
                                                            disabled={processing === r.id} onClick={() => updateStatus(r.id, "approved")}>
                                                            <CheckCircle2 className="w-3 h-3" /> Approve
                                                        </Button>
                                                        <Button className="h-8 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1 shadow-md shadow-rose-600/10 transition-all opacity-0 group-hover:opacity-100"
                                                            disabled={processing === r.id} onClick={() => updateStatus(r.id, "rejected")}>
                                                            <XCircle className="w-3 h-3" /> Reject
                                                        </Button>
                                                    </>
                                                )}
                                                {r.status === "approved" && (
                                                    <Button className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-2 shadow-md shadow-blue-600/10"
                                                        disabled={processing === r.id} onClick={() => updateStatus(r.id, "completed")}>
                                                        <RotateCcw className="w-3.5 h-3.5" /> Process Refund
                                                    </Button>
                                                )}
                                                {r.status === "completed" && (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Refunded {r.processed_at ? new Date(r.processed_at).toLocaleDateString("en-IN") : ""}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
