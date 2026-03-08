import { useState } from "react";
import {
    Receipt, Search, Filter, Plus,
    MoreHorizontal, Mail, Download,
    Trash2, Send, Clock, CheckCircle2,
    DollarSign, Sparkles, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DynamicFormDialog, FieldConfig } from "@/components/modules/DynamicFormDialog";
import { toast } from "sonner";

export default function Invoices() {
    const [searchTerm, setSearchTerm] = useState("");
    const [invoices, setInvoices] = useState([
        { id: "INV-2024-001", customer: "Digital Wave", amount: 12500, date: "2024-03-08", due: "2024-03-22", status: "Paid" },
        { id: "INV-2024-002", customer: "John Smith", amount: 4500, date: "2024-03-07", due: "2024-03-21", status: "Sent" },
        { id: "INV-2024-003", customer: "Green Earth Ltd", amount: 52000, date: "2024-03-01", due: "2024-03-15", status: "Overdue" },
    ]);

    const [isAddOpen, setIsAddOpen] = useState(false);

    const invFields: FieldConfig[] = [
        { key: "customer", label: "Customer", required: true },
        { key: "amount", label: "Invoice Amount", type: "number", required: true },
        { key: "due", label: "Due Date", type: "text", ph: "YYYY-MM-DD", required: true },
        {
            key: "status", label: "Status", type: "select", options: [
                { label: "Draft", value: "Draft" },
                { label: "Sent", value: "Sent" },
                { label: "Paid", value: "Paid" }
            ], required: true
        }
    ];

    const handleCreateInvoice = async (data: any) => {
        const newInv = {
            id: `INV-2024-00${invoices.length + 4}`,
            date: new Date().toISOString().split('T')[0],
            ...data,
            amount: Number(data.amount)
        };
        setInvoices([newInv, ...invoices]);
        toast.success("Invoice generated successfully");
    };

    const handlePayment = (id: string) => {
        setInvoices(invoices.map(i => i.id === id ? { ...i, status: 'Paid' } : i));
        toast.success(`Payment recorded for ${id}`);
    };

    const filteredInvoices = invoices.filter(i =>
        i.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Receipt className="w-6 h-6 text-amber-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Billing Lifecycle</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic">Invoices</h1>
                    <p className="text-sm font-medium text-slate-500">Consolidated list of all client billings and payment statuses.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center bg-slate-100 rounded-2xl px-4 h-12 border border-slate-200">
                        <Search className="w-4 h-4 text-slate-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Find invoices..."
                            className="bg-transparent border-0 focus:ring-0 text-sm w-48 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => setIsAddOpen(true)}
                        className="h-12 px-8 rounded-2xl bg-amber-600 hover:bg-black text-white font-bold shadow-xl shadow-amber-600/20 transition-all gap-3 border-0"
                    >
                        <Plus className="w-5 h-5" /> Create Invoice
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left font-sans">
                    <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/50">
                            <th className="py-6 pl-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Invoice Matrix</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Relationship</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Valuation</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Lifecycle</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 pr-10 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredInvoices.map((inv) => (
                            <tr key={inv.id} className="group hover:bg-slate-50/50 transition-all">
                                <td className="py-8 pl-10">
                                    <p className="text-sm font-black text-slate-900 italic leading-none mb-1">{inv.id}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Due: {inv.due}</p>
                                </td>
                                <td className="py-8">
                                    <p className="text-sm font-bold text-slate-700">{inv.customer}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Billed on {inv.date}</p>
                                </td>
                                <td className="py-8">
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                                        <span className="text-sm font-black text-slate-900">{fmt(inv.amount)}</span>
                                    </div>
                                </td>
                                <td className="py-8">
                                    <span className={cn(
                                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
                                        inv.status === 'Paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                            inv.status === 'Sent' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                "bg-rose-50 text-rose-600 border-rose-100"
                                    )}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="py-8 pr-10 text-right">
                                    <div className="flex justify-end gap-2">
                                        {inv.status !== 'Paid' && (
                                            <Button
                                                onClick={() => handlePayment(inv.id)}
                                                variant="ghost"
                                                className="h-9 px-4 rounded-xl text-amber-600 hover:bg-amber-50 text-[10px] font-black uppercase tracking-widest gap-2"
                                            >
                                                <CreditCard className="w-3.5 h-3.5" /> Pay
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"><Send className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"><Download className="w-4 h-4" /></Button>
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
                title="Generate New Invoice"
                fields={invFields}
                onSubmit={handleCreateInvoice}
            />
        </div>
    );
}
