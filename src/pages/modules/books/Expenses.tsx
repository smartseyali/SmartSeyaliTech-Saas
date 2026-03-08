import { useState } from "react";
import {
    Receipt, Search, Filter, Plus,
    MoreHorizontal, Wallet, Banknote,
    Calendar, Tag, ArrowUpRight,
    CheckCircle2, AlertCircle, FileText,
    TrendingDown, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DynamicFormDialog, FieldConfig } from "@/components/modules/DynamicFormDialog";
import { toast } from "sonner";

export default function Expenses() {
    const [searchTerm, setSearchTerm] = useState("");
    const [expenses, setExpenses] = useState([
        { id: "EXP-001", description: "AWS Hosting Bill", category: "Infrastructure", amount: 25400, date: "2024-03-08", status: "Paid", payment: "HDFC Credit" },
        { id: "EXP-002", description: "Office Supplies", category: "Admin", amount: 1200, date: "2024-03-07", status: "Rejected", payment: "Petty Cash" },
        { id: "EXP-003", description: "Team Lunch", category: "Welfare", amount: 4500, date: "2024-03-06", status: "Pending", payment: "Reimbursement" },
        { id: "EXP-004", description: "Petrol Allowance", category: "Travel", amount: 2000, date: "2024-03-05", status: "Paid", payment: "Cash" },
    ]);

    const [isAddOpen, setIsAddOpen] = useState(false);

    const expenseFields: FieldConfig[] = [
        { key: "description", label: "Description", required: true, ph: "e.g. AWS Invoice #202" },
        {
            key: "category", label: "Category", type: "select", options: [
                { label: "Infrastructure", value: "Infrastructure" },
                { label: "Admin", value: "Admin" },
                { label: "Welfare", value: "Welfare" },
                { label: "Travel", value: "Travel" }
            ], required: true
        },
        { key: "amount", label: "Amount", type: "number", required: true },
        { key: "payment", label: "Payment Mode", type: "text", ph: "e.g. Credit Card", required: true }
    ];

    const handleRecordExpense = async (data: any) => {
        const newExp = {
            id: `EXP-00${expenses.length + 5}`,
            date: new Date().toISOString().split('T')[0],
            status: "Pending",
            ...data,
            amount: Number(data.amount)
        };
        setExpenses([newExp, ...expenses]);
        toast.success("Expense logged into books");
    };

    const handleSettle = (id: string) => {
        setExpenses(expenses.map(e => e.id === id ? { ...e, status: 'Paid' } : e));
        toast.success(`Expense ${id} settled successfully`);
    };

    const filteredExpenses = expenses.filter(e =>
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Banknote className="w-6 h-6 text-emerald-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Cash Outflow</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic">Expense Log</h1>
                    <p className="text-sm font-medium text-slate-500">Track company spendings and reimbursement claims.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center bg-slate-100 rounded-2xl px-4 h-12 border border-slate-200">
                        <Search className="w-4 h-4 text-slate-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Filter spendings..."
                            className="bg-transparent border-0 focus:ring-0 text-sm w-48 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => setIsAddOpen(true)}
                        className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-black text-white font-bold shadow-xl shadow-emerald-600/20 transition-all gap-3 border-0"
                    >
                        <Plus className="w-5 h-5" /> Record Expense
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Billed This Month", value: fmt(32000), icon: Receipt, color: "text-emerald-600" },
                    { label: "Awaiting Appr.", value: 12, icon: AlertCircle, color: "text-amber-500" },
                    { label: "Largest Category", value: "Cloud", icon: Tag, color: "text-indigo-600" },
                    { label: "Settled", value: fmt(28000), icon: CheckCircle2, color: "text-slate-900" },
                ].map(k => (
                    <div key={k.label} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <k.icon className={cn("w-5 h-5", k.color)} />
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{k.label}</span>
                        </div>
                        <p className="text-xl font-black text-slate-900 leading-none">{k.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden mt-8">
                <table className="w-full text-left font-sans">
                    <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/50">
                            <th className="py-6 pl-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Identity</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Categorization</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Valuation</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Lifecycle</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 pr-10 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredExpenses.map((exp) => (
                            <tr key={exp.id} className="group hover:bg-slate-50/50 transition-all">
                                <td className="py-8 pl-10">
                                    <p className="text-sm font-black text-slate-900 uppercase italic mb-1 leading-none">{exp.description}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{exp.id} <span className="mx-2">/</span> {exp.date}</p>
                                </td>
                                <td className="py-8">
                                    <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                        {exp.category}
                                    </span>
                                </td>
                                <td className="py-8 font-black text-rose-600 italic">{fmt(exp.amount)}</td>
                                <td className="py-8">
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            exp.status === 'Paid' ? "bg-emerald-500 shadow-[0_0_8px_theme(colors.emerald.400)]" :
                                                exp.status === 'Pending' ? "bg-amber-500" :
                                                    "bg-rose-500"
                                        )} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{exp.status}</span>
                                    </div>
                                </td>
                                <td className="py-8 pr-10 text-right">
                                    <div className="flex justify-end gap-2">
                                        {exp.status === 'Pending' && (
                                            <Button
                                                onClick={() => handleSettle(exp.id)}
                                                variant="ghost"
                                                className="h-9 px-4 rounded-xl text-emerald-600 hover:bg-emerald-50 text-[10px] font-black uppercase tracking-widest gap-2"
                                            >
                                                <Check className="w-3.5 h-3.5" /> Settle
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><FileText className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><MoreHorizontal className="w-4 h-4" /></Button>
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
                title="Log Business Expense"
                fields={expenseFields}
                onSubmit={handleRecordExpense}
            />
        </div>
    );
}
