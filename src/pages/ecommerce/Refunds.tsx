import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RotateCcw, CheckCircle2, XCircle, Clock, Search, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
    approved: { label: "Approved", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: CheckCircle2 },
    processing: { label: "Processing", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: RotateCcw },
    completed: { label: "Refunded", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
};

export default function Refunds() {
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [refunds, setRefunds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [processing, setProcessing] = useState<number | null>(null);

    useEffect(() => { if (activeCompany) load(); }, [activeCompany]);

    const load = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const { data } = await supabase.from("refunds").select("*")
            .eq("company_id", activeCompany.id).order("created_at", { ascending: false });
        setRefunds(data || []);
        setLoading(false);
    };

    const updateStatus = async (id: number, status: string) => {
        setProcessing(id);
        const updates: any = { status };
        if (status === "completed") updates.processed_at = new Date().toISOString();
        await supabase.from("refunds").update(updates).eq("id", id);

        // If completed, also update the order payment status
        if (status === "completed") {
            const { data: refund } = await supabase.from("refunds").select("order_id, amount").eq("id", id).maybeSingle();
            if (refund?.order_id) {
                await supabase.from("ecom_orders").update({ payment_status: "refunded" }).eq("id", refund.order_id);
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Refunds</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{refunds.filter(r => r.status === "pending").length} pending approval</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Pending Amount", value: fmt(totalPending), color: "text-yellow-600 bg-yellow-500/10" },
                    { label: "Total Refunded", value: fmt(totalRefunded), color: "text-green-600 bg-green-500/10" },
                    { label: "Pending Count", value: refunds.filter(r => r.status === "pending").length, color: "text-orange-600 bg-orange-500/10" },
                    { label: "Completed", value: refunds.filter(r => r.status === "completed").length, color: "text-blue-600 bg-blue-500/10" },
                ].map(s => (
                    <div key={s.label} className="bg-card rounded-xl border border-border/50 p-4 shadow-sm">
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${s.color.split(" ")[0]}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {["all", ...Object.keys(STATUS_CONFIG)].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize ${filter === f ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card"
                            }`}>
                        {f === "all" ? `All (${refunds.length})` : `${STATUS_CONFIG[f]?.label} (${refunds.filter(r => r.status === f).length})`}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by order #, customer name..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            {/* Table */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="text-center py-16 text-muted-foreground">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-14">
                        <RotateCcw className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
                        <p className="text-sm text-muted-foreground">No refunds found</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
                            <tr>
                                <th className="px-5 py-3 text-left">Order</th>
                                <th className="px-5 py-3 text-left">Customer</th>
                                <th className="px-5 py-3 text-left">Amount</th>
                                <th className="px-5 py-3 text-left">Reason</th>
                                <th className="px-5 py-3 text-left">Status</th>
                                <th className="px-5 py-3 text-left">Date</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(r => {
                                const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                                return (
                                    <tr key={r.id} className="border-t border-border/40 hover:bg-secondary/20 transition-colors">
                                        <td className="px-5 py-3.5">
                                            {r.order_id ? (
                                                <Link to={`/ecommerce/orders/${r.order_id}`}
                                                    className="text-primary font-medium hover:underline flex items-center gap-1">
                                                    {r.order_number} <LinkIcon className="w-3 h-3" />
                                                </Link>
                                            ) : <span className="text-muted-foreground">—</span>}
                                        </td>
                                        <td className="px-5 py-3.5 font-medium">{r.customer_name}</td>
                                        <td className="px-5 py-3.5 font-bold text-red-600">{fmt(r.amount)}</td>
                                        <td className="px-5 py-3.5 text-muted-foreground text-xs max-w-[160px] truncate">{r.reason || r.description}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${sc.color}`}>
                                                {sc.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-muted-foreground">
                                            {new Date(r.created_at).toLocaleDateString("en-IN")}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex justify-end gap-2">
                                                {r.status === "pending" && (
                                                    <>
                                                        <Button size="sm" variant="outline" className="rounded-lg h-7 px-3 text-xs gap-1 border-green-200 text-green-700 hover:bg-green-50"
                                                            disabled={processing === r.id} onClick={() => updateStatus(r.id, "approved")}>
                                                            <CheckCircle2 className="w-3 h-3" /> Approve
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="rounded-lg h-7 px-3 text-xs gap-1 border-red-200 text-red-700 hover:bg-red-50"
                                                            disabled={processing === r.id} onClick={() => updateStatus(r.id, "rejected")}>
                                                            <XCircle className="w-3 h-3" /> Reject
                                                        </Button>
                                                    </>
                                                )}
                                                {r.status === "approved" && (
                                                    <Button size="sm" className="rounded-lg h-7 px-3 text-xs gap-1"
                                                        disabled={processing === r.id} onClick={() => updateStatus(r.id, "completed")}>
                                                        <RotateCcw className="w-3 h-3" /> Process Refund
                                                    </Button>
                                                )}
                                                {r.status === "completed" && (
                                                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
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

