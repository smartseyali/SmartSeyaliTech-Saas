import { useState } from "react";
import {
    Book, Search, Filter, Plus,
    MoreHorizontal, ArrowLeftRight,
    Calendar, FileCode, CheckCircle2,
    Lock, Share2, Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Journals() {
    const journals = [
        { id: "JRN-0042", reference: "Opening Balance", total: 5000000, date: "2024-03-01", status: "Posted", type: "Manual" },
        { id: "JRN-0043", reference: "Depreciation MAR", total: 12500, date: "2024-03-08", status: "Draft", type: "System" },
        { id: "JRN-0044", reference: "Revenue Accrual", total: 850000, date: "2024-03-08", status: "Posted", type: "Calculated" },
    ];

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Book className="w-6 h-6 text-emerald-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Ledger Compliance</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic">General Journals</h1>
                    <p className="text-sm font-medium text-slate-500">Record adjusting and non-transactional accounting entries.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200">
                        <Printer className="w-5 h-5 mr-2" /> Export
                    </Button>
                    <Button className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-black text-white font-bold shadow-xl shadow-emerald-600/20 transition-all gap-3 border-0">
                        <Plus className="w-5 h-5" /> Create Journal
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/50">
                            <th className="py-6 pl-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Entry Matrix</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Reference Source</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Aggregate Valuation</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Lifecycle</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 pr-10 text-right">Protection</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {journals.map((j) => (
                            <tr key={j.id} className="group hover:bg-slate-50/50 transition-all">
                                <td className="py-8 pl-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                            <ArrowLeftRight className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 italic leading-none mb-1">{j.id}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{j.date}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-8">
                                    <p className="text-sm font-bold text-slate-700">{j.reference}</p>
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter border-b border-slate-100">{j.type}</span>
                                </td>
                                <td className="py-8 font-black text-slate-900">{fmt(j.total)}</td>
                                <td className="py-8">
                                    <span className={cn(
                                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                        j.status === 'Posted' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                            "bg-slate-50 text-slate-400 border-slate-100"
                                    )}>
                                        {j.status}
                                    </span>
                                </td>
                                <td className="py-8 pr-10 text-right">
                                    <div className="flex items-center justify-end gap-2 outline-none">
                                        {j.status === 'Posted' ? <Lock className="w-4 h-4 text-slate-300" /> : <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Share2 className="w-4 h-4" /></Button>}
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><MoreHorizontal className="w-4 h-4" /></Button>
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
