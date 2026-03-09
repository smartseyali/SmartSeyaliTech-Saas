import { useState, useEffect } from "react";
import {
    FileText, Search, Plus,
    MoreHorizontal, Mail, Download,
    Trash2, Clock, CheckCircle2,
    Filter, ArrowRight, Eye, Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Quotations() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [quotes, setQuotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingQuote, setEditingQuote] = useState<any>(null);

    useEffect(() => {
        loadQuotations();
    }, []);

    const loadQuotations = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('sales_quotations')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) setQuotes(data);
        setLoading(false);
    };

    const quoteHeaderFields = [
        { key: "customer_name", label: "Customer Representation", required: true, ph: "Enter client entity name..." },
        { key: "reference_no", label: "Reference Sequence", required: true, ph: "e.g. QUO-2026-001" },
        { key: "date", label: "Issuance Date", type: "date" as const },
        { key: "valid_until", label: "Validity Threshold", type: "date" as const },
        {
            key: "status", label: "Lifecycle Status", type: "select" as const,
            options: [
                { label: "Draft Proposal", value: "draft" },
                { label: "Awaiting Client", value: "sent" },
                { label: "Approved Engine", value: "accepted" }
            ]
        }
    ];

    const handleSaveQuote = async (header: any, items: any[]) => {
        try {
            // 1. Save Header
            const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
            const subtotal = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
            const taxAmount = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice * i.taxRate / 100), 0);
            const grandTotal = subtotal + taxAmount;

            const payload = {
                ...header,
                total_qty: totalQty,
                subtotal: subtotal,
                tax_amount: taxAmount,
                grand_total: grandTotal
            };

            const { data: savedHeader, error: hError } = await supabase
                .from('sales_quotations')
                .upsert([payload])
                .select()
                .single();

            if (hError) throw hError;

            // 2. Save Child Items (Lines)
            // First delete old items if editing
            if (header.id) {
                await supabase.from('sales_quotation_items').delete().eq('quotation_id', header.id);
            }

            const lineItems = items.map(item => ({
                quotation_id: savedHeader.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                tax_rate: item.taxRate,
                amount: item.amount
            }));

            const { error: iError } = await supabase.from('sales_quotation_items').insert(lineItems);
            if (iError) throw iError;

            toast.success("Quotation Blueprint Committed Successfully");
            setView("list");
            loadQuotations();
        } catch (err: any) {
            toast.error(`Sync Failure: ${err.message}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Terminate this quotation record?")) return;
        const { error } = await supabase.from('sales_quotations').delete().eq('id', id);
        if (error) toast.error("Delete Failed");
        else loadQuotations();
    };

    const filteredQuotes = quotes.filter(q =>
        q.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.reference_no?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in zoom-in-95 duration-500">
                <ERPEntryForm
                    title={editingQuote ? "Modify Quotation" : "Initialize Quotation"}
                    subtitle="Advanced Sales Lifecycle Management"
                    headerFields={quoteHeaderFields}
                    onAbort={() => { setView("list"); setEditingQuote(null); }}
                    onSave={handleSaveQuote}
                    initialData={editingQuote}
                    initialItems={editingQuote ? [] : undefined} // Logic to load items if editing would go here
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
                            <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Pipeline & Distribution</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">Quotation <span className="text-indigo-600">Registry</span></h1>
                    <p className="text-sm font-medium text-slate-500 italic leading-none">Draft professional proposals with real-time tax & margin calculations.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center bg-white rounded-2xl px-6 h-14 border border-slate-200 shadow-sm focus-within:ring-4 focus-within:ring-indigo-600/10 transition-all">
                        <Search className="w-4 h-4 text-slate-400 mr-3" />
                        <input
                            type="text"
                            placeholder="Find blueprint..."
                            className="bg-transparent border-0 focus:ring-0 text-sm w-48 font-bold placeholder:text-slate-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => { setEditingQuote(null); setView("form"); }}
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
                            <th className="py-6 pl-10 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Reference No</th>
                            <th className="py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Client Engine</th>
                            <th className="py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Total Valuation</th>
                            <th className="py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 text-center">Lifecycle</th>
                            <th className="py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 pr-10 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan={5} className="py-20 text-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                        ) : filteredQuotes.map((q) => (
                            <tr key={q.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="py-8 pl-10 font-black text-slate-900 uppercase italic tracking-tighter">{q.reference_no}</td>
                                <td className="py-8">
                                    <p className="text-sm font-black text-slate-900 uppercase italic">{q.customer_name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">ISSUED: {q.date}</p>
                                </td>
                                <td className="py-8">
                                    <p className="font-black text-indigo-600 text-lg tracking-tighter">{fmt(q.grand_total)}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">QTY: {q.total_qty}</p>
                                </td>
                                <td className="py-8 text-center">
                                    <span className={cn(
                                        "px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                        q.status === 'accepted' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                            q.status === 'sent' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                "bg-slate-50 text-slate-400 border-slate-100"
                                    )}>
                                        {q.status}
                                    </span>
                                </td>
                                <td className="py-8 pr-10 text-right">
                                    <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                        <Button
                                            onClick={() => { setEditingQuote(q); setView("form"); }}
                                            variant="ghost" size="icon" className="h-11 w-11 text-slate-400 hover:text-indigo-600 hover:bg-white shadow-sm border-0 rounded-2xl"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-11 w-11 text-slate-400 hover:text-indigo-600 hover:bg-white shadow-sm border-0 rounded-2xl"><Mail className="w-4 h-4" /></Button>
                                        <Button
                                            onClick={() => handleDelete(q.id)}
                                            variant="ghost" size="icon" className="h-11 w-11 text-slate-400 hover:text-rose-600 hover:bg-white shadow-sm border-0 rounded-2xl"
                                        >
                                            <Trash2 className="w-4 h-4" />
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
