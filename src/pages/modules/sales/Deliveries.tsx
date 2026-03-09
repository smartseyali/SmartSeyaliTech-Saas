import { useState, useEffect } from "react";
import {
    Truck, Search, Plus,
    MoreHorizontal, Mail, Download,
    Trash2, Clock, CheckCircle2,
    Filter, ArrowRight, Eye, Edit,
    Package, Boxes
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Deliveries() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingDelivery, setEditingDelivery] = useState<any>(null);

    useEffect(() => {
        loadDeliveries();
    }, []);

    const loadDeliveries = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('sales_deliveries')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) setDeliveries(data);
        setLoading(false);
    };

    const deliveryHeaderFields = [
        { key: "customer_name", label: "Recipient Entity", required: true, ph: "Customer name..." },
        { key: "reference_no", label: "Delivery Note Ref", required: true, ph: "DN-2026-001" },
        { key: "date", label: "Shipment Date", type: "date" as const },
        { key: "tracking_no", label: "Logistics Tracking", ph: "Enter tracking ID..." },
        {
            key: "status", label: "Shipment Status", type: "select" as const,
            options: [
                { label: "Draft Note", value: "draft" },
                { label: "Dispatch Ready", value: "ready" },
                { label: "In Transit", value: "in-transit" },
                { label: "Successfully Delivered", value: "delivered" }
            ]
        }
    ];

    const handleSaveDelivery = async (header: any, items: any[]) => {
        try {
            const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

            const payload = {
                ...header,
                total_qty: totalQty
            };

            const { data: savedHeader, error: hError } = await supabase
                .from('sales_deliveries')
                .upsert([payload])
                .select()
                .single();

            if (hError) throw hError;

            if (header.id) {
                await supabase.from('sales_delivery_items').delete().eq('delivery_id', header.id);
            }

            const lineItems = items.map(item => ({
                delivery_id: savedHeader.id,
                description: item.description,
                quantity: item.quantity
            }));

            const { error: iError } = await supabase.from('sales_delivery_items').insert(lineItems);
            if (iError) throw iError;

            toast.success("Delivery Protocol Synchronized");
            setView("list");
            loadDeliveries();
        } catch (err: any) {
            toast.error(`Logistics Sync Failure: ${err.message}`);
        }
    };

    const filteredDeliveries = deliveries.filter(d =>
        d.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.reference_no?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-left-10 duration-500">
                <ERPEntryForm
                    title={editingDelivery ? "Modify Delivery Note" : "Initialize Dispatch"}
                    subtitle="Enterprise Inventory Logistics Protocol"
                    headerFields={deliveryHeaderFields}
                    onAbort={() => { setView("list"); setEditingDelivery(null); }}
                    onSave={handleSaveDelivery}
                    initialData={editingDelivery}
                    initialItems={editingDelivery ? [] : undefined}
                />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                            <Truck className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Inventory Distribution</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">Delivery <span className="text-indigo-600">Notes</span></h1>
                    <p className="text-sm font-medium text-slate-500 italic leading-none">Manage logistics dispatch and track real-time inventory movement.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center bg-white rounded-2xl px-6 h-14 border border-slate-200 shadow-sm focus-within:ring-4 focus-within:ring-indigo-600/10 transition-all">
                        <Search className="w-4 h-4 text-slate-400 mr-3" />
                        <input
                            type="text"
                            placeholder="Find dispatch ref..."
                            className="bg-transparent border-0 focus:ring-0 text-sm w-48 font-bold placeholder:text-slate-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => { setEditingDelivery(null); setView("form"); }}
                        className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-600/30 transition-all gap-3 border-0 active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> New Dispatch
                    </Button>
                </div>
            </div>

            {/* List View */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/50">
                            <th className="py-6 pl-10 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Dispatch Ref</th>
                            <th className="py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Destination Core</th>
                            <th className="py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Load Factor</th>
                            <th className="py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 text-center">Logistics State</th>
                            <th className="py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 pr-10 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan={5} className="py-20 text-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                        ) : filteredDeliveries.map((d) => (
                            <tr key={d.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="py-8 pl-10 font-black text-slate-900 uppercase italic tracking-tighter">{d.reference_no}</td>
                                <td className="py-8">
                                    <p className="text-sm font-black text-slate-900 uppercase italic">{d.customer_name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">TRACKING: {d.tracking_no || 'PENDING'}</p>
                                </td>
                                <td className="py-8">
                                    <p className="font-black text-slate-600 text-lg tracking-tighter">{d.total_qty} Units</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">VOLUMETRIC DATA</p>
                                </td>
                                <td className="py-8 text-center">
                                    <span className={cn(
                                        "px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                        d.status === 'delivered' ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-md shadow-emerald-500/10" :
                                            d.status === 'in-transit' ? "bg-blue-50 text-blue-600 border-blue-100 animate-pulse" :
                                                "bg-slate-50 text-slate-400 border-slate-100"
                                    )}>
                                        {d.status}
                                    </span>
                                </td>
                                <td className="py-8 pr-10 text-right">
                                    <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                        <Button
                                            onClick={() => toast.success("Retrieving Tracking Data...")}
                                            variant="ghost" size="icon" className="h-11 w-11 text-slate-400 hover:text-indigo-600 hover:bg-white shadow-sm border-0 rounded-2xl"
                                        >
                                            <Boxes className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            onClick={() => { setEditingDelivery(d); setView("form"); }}
                                            variant="ghost" size="icon" className="h-11 w-11 text-slate-400 hover:text-indigo-600 hover:bg-white shadow-sm border-0 rounded-2xl"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
