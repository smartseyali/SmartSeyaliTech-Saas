import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useDictionary } from "@/hooks/useDictionary";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Eye, Package, RotateCcw, Download, XCircle, ArrowRight } from "lucide-react";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import { cn } from "@/lib/utils";

const STATUSES = [
    { key: "all", label: "All", color: "bg-secondary text-foreground" },
    { key: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
    { key: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-700" },
    { key: "packed", label: "Packed", color: "bg-indigo-100 text-indigo-700" },
    { key: "shipped", label: "Shipped", color: "bg-purple-100 text-purple-700" },
    { key: "out_for_delivery", label: "Out for Delivery", color: "bg-orange-100 text-orange-700" },
    { key: "delivered", label: "Delivered", color: "bg-emerald-100 text-emerald-700" },
    { key: "cancelled", label: "Cancelled", color: "bg-rose-100 text-rose-700" },
];

const NEXT_STATUS: Record<string, string> = {
    pending: "confirmed", confirmed: "packed", packed: "shipped",
    shipped: "out_for_delivery", out_for_delivery: "delivered",
};

export default function EcomOrders() {
    const { activeCompany } = useTenant();
    const navigate = useNavigate();
    const { t } = useDictionary();
    const { toast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeStatus, setActiveStatus] = useState(searchParams.get("status") || "all");
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    useEffect(() => { if (activeCompany) load(); }, [activeCompany]);

    const load = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const { data } = await supabase.from("ecom_orders").select("*")
            .eq("company_id", activeCompany.id).order("created_at", { ascending: false });
        setOrders(data || []);
        setLoading(false);
    };

    const advanceStatus = async (e: React.MouseEvent, order: any) => {
        e.stopPropagation();
        const next = NEXT_STATUS[order.status];
        if (!next) return;
        setUpdatingId(order.id);
        try {
            await supabase.from("ecom_orders").update({ status: next, updated_at: new Date().toISOString() }).eq("id", order.id);
            await supabase.from("ecom_order_timeline").insert([{
                order_id: order.id, status: next, note: `Status updated to ${next}`, created_by: "admin"
            }]);
            toast({ title: `Order ${order.order_number} advanced to ${next}` });
            load();
        } finally { setUpdatingId(null); }
    };

    const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

    const orderColumns = [
        { 
            key: "order_number", 
            label: "Transaction ID",
            render: (row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-blue-600 uppercase tracking-widest text-[11px] font-mono group-hover:underline">#{row.order_number}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Order Sequence</span>
                </div>
            )
        },
        { 
            key: "customer_name", 
            label: "Identification",
            render: (row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 uppercase italic tracking-tight">{row.customer_name}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{row.customer_phone || "LEDGER UNKNOWN"}</span>
                </div>
            )
        },
        { 
            key: "grand_total", 
            label: "Fiscal impact",
            render: (row: any) => (
                <div className="flex flex-col items-start">
                    <span className="font-black text-slate-900 tracking-tight">{fmt(row.grand_total)}</span>
                    <div className={cn(
                        "mt-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                        row.payment_status === "paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                    )}>
                        {row.payment_status}
                    </div>
                </div>
            )
        },
        { 
            key: "status", 
            label: "Vector",
            render: (row: any) => <StatusBadge status={row.status} />
        },
        { 
            key: "actions", 
            label: "Ledger Actions",
            render: (row: any) => (
                <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                    {NEXT_STATUS[row.status] && (
                        <button 
                            onClick={(e) => advanceStatus(e, row)}
                            className="h-7 px-3 rounded-lg bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-1.5"
                        >
                            <ArrowRight className="w-3 h-3" /> Advance
                        </button>
                    )}
                    <button className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                        <Eye className="w-3.5 h-3.5" />
                    </button>
                </div>
            ),
            className: "text-right"
        }
    ];

    const filteredOrders = orders.filter(o => {
        const matchStatus = activeStatus === "all" || o.status === activeStatus;
        const matchSearch = (o.order_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (o.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchStatus && matchSearch;
    });

    return (
        <ERPListView
            title="Procurement Ledger"
            data={filteredOrders}
            columns={orderColumns}
            onNew={() => navigate("/apps/ecommerce/orders/new")}
            onRefresh={load}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            onRowClick={(row) => navigate(`/apps/ecommerce/orders/${row.id}`)}
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-all flex items-center gap-2 shadow-sm">
                        <Download className="w-3.5 h-3.5" /> Registry Export
                    </button>
                </div>
            }
            tabs={
                STATUSES.map(s => (
                    <button
                        key={s.key}
                        onClick={() => setActiveStatus(s.key)}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2",
                            activeStatus === s.key 
                                ? "bg-slate-900 text-white shadow-lg" 
                                : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                        )}
                    >
                        {s.label}
                        <span className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-mono",
                            activeStatus === s.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                        )}>
                            {s.key === "all" ? orders.length : orders.filter(o => o.status === s.key).length}
                        </span>
                    </button>
                ))
            }
        />
    );
}

