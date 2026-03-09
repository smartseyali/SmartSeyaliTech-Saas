import { useState, useEffect } from "react";
import {
    CreditCard, Search, Plus,
    MoreHorizontal, Mail, Download,
    Trash2, Clock, CheckCircle2,
    Filter, ArrowRight, Eye, Edit,
    DollarSign, FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function PurchaseBills() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [bills, setBills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingBill, setEditingBill] = useState<any>(null);

    useEffect(() => {
        loadBills();
    }, []);

    const loadBills = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('purchase_bills')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) setBills(data);
        setLoading(false);
    };

    const billHeaderFields = [
        { key: "vendor_name", label: "Supplier Entity", required: true, ph: "Vendor name..." },
        { key: "bill_no", label: "Vendor Invoice No", required: true, ph: "VND-INV-12345" },
        { key: "reference_no", label: "Internal Settlement ID", required: true, ph: "BILL-2026-001" },
        { key: "date", label: "Recording Date", type: "date" as const },
        { key: "due_date", label: "Settlement Threshold", type: "date" as const },
        {
            key: "status", label: "Liability Status", type: "select" as const,
            options: [
                { label: "Draft Liability", value: "draft" },
                { label: "Unpaid Obligation", value: "unpaid" },
                { label: "Settled Account", value: "paid" },
                { label: "Overdue Risk", value: "overdue" }
            ]
        }
    ];

    const handleSaveBill = async (header: any, items: any[]) => {
        try {
            const subtotal = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
            const taxAmount = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice * i.taxRate / 100), 0);
            const grandTotal = subtotal + taxAmount;

            const payload = {
                ...header,
                subtotal: subtotal,
                tax_amount: taxAmount,
                grand_total: grandTotal
            };

            const { data: savedHeader, error: hError } = await supabase
                .from('purchase_bills')
                .upsert([payload])
                .select()
                .single();

            if (hError) throw hError;

            if (header.id) {
                await supabase.from('purchase_bill_items').delete().eq('bill_id', header.id);
            }

            const lineItems = items.map(item => ({
                bill_id: savedHeader.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                tax_percentage: item.taxRate,
                amount: item.amount
            }));

            const { error: iError } = await supabase.from('purchase_bill_items').insert(lineItems);
            if (iError) throw iError;

            toast.success("Accounts Payable Asset Synchronized");
            setView("list");
            loadBills();
        } catch (err: any) {
            toast.error(`Liability Sync Failure: ${err.message}`);
        }
    };

    const filteredBills = bills.filter(b =>
        b.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.reference_no?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-right-10 duration-500">
                <ERPEntryForm
                    title={editingBill ? "Modify Liability Record" : "Generate Vendor Settlement"}
                    subtitle="Accounts Payable Optimization Protocol"
                    headerFields={billHeaderFields}
                    onAbort={() => { setView("list"); setEditingBill(null); }}
                    onSave={handleSaveBill}
                    initialData={editingBill}
                    initialItems={editingBill ? [] : undefined}
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
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Financial Liability</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">Accounts <span className="text-indigo-600">Payable</span></h1>
                    <p className="text-sm font-medium text-slate-500 italic leading-none">Optimize vendor payments and audit financial obligations in real-time.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center bg-white rounded-2xl px-6 h-14 border border-slate-200 shadow-sm focus-within:ring-4 focus-within:ring-indigo-600/10 transition-all">
                        <Search className="w-4 h-4 text-slate-400 mr-3" />
                        <input
                            type="text"
                            placeholder="Find liability ref..."
                            className="bg-transparent border-0 focus:ring-0 text-sm w-48 font-bold placeholder:text-slate-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => { setEditingBill(null); setView("form"); }}
                        className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-600/30 transition-all gap-3 border-0 active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> Ingest Vendor Bill
                    </Button>
                </div>
            </div>

            {/* List View */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/50">
                            <th className="py-6 pl-10 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Liability Ref</th>
                            <th className="py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Supplier Engine</th>
                            <th className="py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Total Obligation</th>
                            <th className="py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 text-center">Payment Status</th>
                            <th className="py-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 pr-10 text-right">Settlement Hub</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan={5} className="py-20 text-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                        ) : filteredBills.map((b) => (
                            <tr key={b.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="py-8 pl-10 font-black text-slate-900 uppercase italic tracking-tighter">{b.reference_no}</td>
                                <td className="py-8">
                                    <p className="text-sm font-black text-slate-900 uppercase italic">{b.vendor_name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">DUE: {b.due_date || 'N/A'}</p>
                                </td>
                                <td className="py-8">
                                    <p className="font-black text-indigo-600 text-lg tracking-tighter">{fmt(b.grand_total)}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">VENDOR REF: {b.bill_no}</p>
                                </td>
                                <td className="py-8 text-center">
                                    <span className={cn(
                                        "px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                        b.status === 'paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-md shadow-emerald-500/10" :
                                            b.status === 'unpaid' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                "bg-slate-50 text-slate-400 border-slate-100"
                                    )}>
                                        {b.status}
                                    </span>
                                </td>
                                <td className="py-8 pr-10 text-right">
                                    <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                        <Button
                                            onClick={() => toast.success("Initializing Outbound Payment Engine...")}
                                            variant="ghost" className="h-11 px-6 bg-slate-50 hover:bg-black hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest gap-2 shadow-sm border-0"
                                        >
                                            <DollarSign className="w-4 h-4" /> Pay Vendor
                                        </Button>
                                        <Button
                                            onClick={() => { setEditingBill(b); setView("form"); }}
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
