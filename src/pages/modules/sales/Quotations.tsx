import { useState } from "react";
import {
    FileText, Search, Filter, Plus,
    MoreHorizontal, Mail, Download,
    Trash2, Send, Clock, CheckCircle2,
    ShoppingCart, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DynamicFormDialog, FieldConfig } from "@/components/modules/DynamicFormDialog";
import { toast } from "sonner";

export default function Quotations() {
    const [searchTerm, setSearchTerm] = useState("");
    const [quotes, setQuotes] = useState([
        { id: "QT-8021", customer: "TechFlow Solutions", amount: 45000, date: "2024-03-05", expiry: "2024-03-12", status: "Sent" },
        { id: "QT-8022", customer: "Sarah Jenkins", amount: 12500, date: "2024-03-06", expiry: "2024-03-13", status: "Draft" },
        { id: "QT-8023", customer: "Apex Global", amount: 89000, date: "2024-03-07", expiry: "2024-03-14", status: "Accepted" },
        { id: "QT-8024", customer: "Michael Chen", amount: 5500, date: "2024-03-08", expiry: "2024-03-15", status: "Expired" },
    ]);

    const [isAddOpen, setIsAddOpen] = useState(false);

    const quoteFields: FieldConfig[] = [
        { key: "customer", label: "Customer Name", required: true, ph: "Select or enter customer..." },
        { key: "amount", label: "Quotation Amount", type: "number", required: true },
        { key: "expiry", label: "Expiry Date", type: "text", ph: "YYYY-MM-DD" },
        {
            key: "status", label: "Initial Status", type: "select", options: [
                { label: "Draft", value: "Draft" },
                { label: "Sent", value: "Sent" }
            ], required: true
        }
    ];

    const handleAddQuote = async (data: any) => {
        const newQuote = {
            id: `QT-${8025 + quotes.length}`,
            date: new Date().toISOString().split('T')[0],
            ...data,
            amount: Number(data.amount)
        };
        setQuotes([newQuote, ...quotes]);
        toast.success("Quotation created successfully");
    };

    const filteredQuotes = quotes.filter(q =>
        q.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-indigo-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Sales & Distribution</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic">Quotations</h1>
                    <p className="text-sm font-medium text-slate-500">Draft and send professional quotes to your clients.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center bg-slate-100 rounded-2xl px-4 h-12 border border-slate-200">
                        <Search className="w-4 h-4 text-slate-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Filter quotes..."
                            className="bg-transparent border-0 focus:ring-0 text-sm w-48 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => setIsAddOpen(true)}
                        className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-black text-white font-bold shadow-xl shadow-indigo-600/20 transition-all gap-3 border-0"
                    >
                        <Plus className="w-5 h-5" /> New Quotation
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/50">
                            <th className="py-6 pl-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Quote ID</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Client Representation</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Valuation</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Lifecycle</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 pr-10 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredQuotes.map((q) => (
                            <tr key={q.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="py-8 pl-10 font-black text-slate-900">{q.id}</td>
                                <td className="py-8">
                                    <p className="text-sm font-bold text-slate-900">{q.customer}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Exp: {q.expiry}</p>
                                </td>
                                <td className="py-8 font-black text-indigo-600">{fmt(q.amount)}</td>
                                <td className="py-8">
                                    <span className={cn(
                                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                        q.status === 'Accepted' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                            q.status === 'Sent' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                q.status === 'Draft' ? "bg-slate-50 text-slate-500 border-slate-100" :
                                                    "bg-rose-50 text-rose-600 border-rose-100"
                                    )}>
                                        {q.status}
                                    </span>
                                </td>
                                <td className="py-8 pr-10 text-right">
                                    <div className="flex justify-end gap-2">
                                        {q.status === 'Accepted' && (
                                            <Button
                                                onClick={() => toast.success(`Generating Sales Order for ${q.id}...`)}
                                                variant="ghost"
                                                className="h-9 px-4 rounded-xl text-emerald-600 hover:bg-emerald-50 text-[10px] font-black uppercase tracking-widest gap-2"
                                            >
                                                <ShoppingCart className="w-3.5 h-3.5" /> Create Order
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all rounded-xl"><Mail className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all rounded-xl"><Download className="w-4 h-4" /></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <DynamicFormDialog
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                title="Create New Quotation"
                fields={quoteFields}
                onSubmit={handleAddQuote}
            />
        </div>
    );
}
