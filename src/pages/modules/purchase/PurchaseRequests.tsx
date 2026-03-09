import { useState, useEffect } from "react";
import {
    ClipboardList, Search, Plus,
    MoreHorizontal, Mail, Download,
    Trash2, Clock, CheckCircle2,
    Filter, ArrowRight, Eye, Edit,
    Zap, Clipboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function PurchaseRequests() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRequest, setEditingRequest] = useState<any>(null);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('purchase_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) setRequests(data);
        setLoading(false);
    };

    const requestHeaderFields = [
        { key: "reference_no", label: "Request Identifier", required: true, ph: "PREQ-2026-001" },
        { key: "date", label: "Request Date", type: "date" as const },
        { key: "required_by", label: "Critical Deadline", type: "date" as const },
        {
            key: "status", label: "Logic Approval", type: "select" as const,
            options: [
                { label: "Draft Request", value: "draft" },
                { label: "Pending Engine Approval", value: "pending-approval" },
                { label: "Logic Approved", value: "approved" },
                { label: "Ordered Payload", value: "ordered" }
            ]
        }
    ];

    const handleSaveRequest = async (header: any, items: any[]) => {
        try {
            const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

            const payload = {
                ...header,
                total_qty: totalQty
            };

            const { data: savedHeader, error: hError } = await supabase
                .from('purchase_requests')
                .upsert([payload])
                .select()
                .single();

            if (hError) throw hError;

            if (header.id) {
                await supabase.from('purchase_request_items').delete().eq('request_id', header.id);
            }

            const lineItems = items.map(item => ({
                request_id: savedHeader.id,
                description: item.description,
                quantity: item.quantity
            }));

            const { error: iError } = await supabase.from('purchase_request_items').insert(lineItems);
            if (iError) throw iError;

            toast.success("Purchase Request Blueprint Committed");
            setView("list");
            loadRequests();
        } catch (err: any) {
            toast.error(`Sync Failure: ${err.message}`);
        }
    };

    const filteredRequests = requests.filter(r =>
        r.reference_no?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-top-10 duration-500">
                <ERPEntryForm
                    title={editingRequest ? "Modify Request" : "Initialize Procurement Demand"}
                    subtitle="Internal Supply Chain Requirement Logic"
                    headerFields={requestHeaderFields}
                    onAbort={() => { setView("list"); setEditingRequest(null); }}
                    onSave={handleSaveRequest}
                    initialData={editingRequest}
                    initialItems={editingRequest ? [] : undefined}
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
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Demand Forecasting</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">Purchase <span className="text-indigo-600">Requests</span></h1>
                    <p className="text-sm font-medium text-slate-500 italic leading-none">Internal requisition system for managing enterprise supply demands.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center bg-white rounded-2xl px-6 h-14 border border-slate-200 shadow-sm focus-within:ring-4 focus-within:ring-indigo-600/10 transition-all">
                        <Search className="w-4 h-4 text-slate-400 mr-3" />
                        <input
                            type="text"
                            placeholder="Find logic request..."
                            className="bg-transparent border-0 focus:ring-0 text-sm w-48 font-bold placeholder:text-slate-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => { setEditingRequest(null); setView("form"); }}
                        className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-600/30 transition-all gap-3 border-0 active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> Initialize New
                    </Button>
                </div>
            </div>

            {/* List View */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/50">
                            <th className="py-6 pl-10 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Request ID</th>
                            <th className="py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Demand Deadline</th>
                            <th className="py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Volume</th>
                            <th className="py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 text-center">Approval State</th>
                            <th className="py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 pr-10 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan={5} className="py-20 text-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                        ) : filteredRequests.map((r) => (
                            <tr key={r.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="py-8 pl-10 font-black text-slate-900 uppercase italic tracking-tighter">{r.reference_no}</td>
                                <td className="py-8">
                                    <p className="text-sm font-black text-slate-900 uppercase italic">{r.date}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">REQUIRED BY: {r.required_by || 'ASAP'}</p>
                                </td>
                                <td className="py-8">
                                    <p className="font-black text-slate-600 text-lg tracking-tighter">{r.total_qty} Units</p>
                                </td>
                                <td className="py-8 text-center">
                                    <span className={cn(
                                        "px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                        r.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-md shadow-emerald-500/10" :
                                            r.status === 'pending-approval' ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse" :
                                                "bg-slate-50 text-slate-400 border-slate-100"
                                    )}>
                                        {r.status}
                                    </span>
                                </td>
                                <td className="py-8 pr-10 text-right">
                                    <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                        <Button
                                            onClick={() => toast.success("Generating Purchase Order from Demand...")}
                                            variant="ghost" className="h-11 px-6 bg-slate-50 hover:bg-black hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest gap-2 shadow-sm border-0"
                                        >
                                            <Zap className="w-4 h-4" /> Order Now
                                        </Button>
                                        <Button
                                            onClick={() => { setEditingRequest(r); setView("form"); }}
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
