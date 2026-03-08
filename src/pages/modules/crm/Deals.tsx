import { ShoppingBag, Search, Filter, Plus, Mail, Phone, MoreHorizontal, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Deals() {
    const [deals] = useState([
        { id: 1, name: "Enterprise Plan Upgrade", company: "TechFlow Corp", amount: 50000, stage: "Negotiation", probability: 75, close_date: "2026-04-15" },
        { id: 2, name: "Mobile App Development", company: "Retail Inc.", amount: 85000, stage: "Proposal", probability: 40, close_date: "2026-05-20" },
        { id: 3, name: "SaaS Infrastructure Setup", company: "Green Energy Ltd", amount: 120000, stage: "Closing", probability: 95, close_date: "2026-03-30" },
    ]);

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-6 h-6 text-violet-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Sales Intelligence Matrix</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic">Active Deals</h1>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        Pipeline Status: <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full text-[9px] font-bold border border-violet-100">OPTIMIZING</span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Button className="h-12 px-8 rounded-2xl bg-violet-600 hover:bg-black text-white font-bold shadow-xl shadow-violet-600/20 transition-all gap-3 border-0">
                        <Plus className="w-5 h-5" /> Initialize Deal
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-12">
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500">
                        <div className="p-10">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-50">
                                            <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 pl-4">Deal Entity</th>
                                            <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Corporate Body</th>
                                            <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Yield</th>
                                            <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Matrix Stage</th>
                                            <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Probability</th>
                                            <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Closing Date</th>
                                            <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right pr-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {deals.map((deal) => (
                                            <tr key={deal.id} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="py-6 pl-4">
                                                    <p className="font-bold text-slate-900 uppercase italic leading-none">{deal.name}</p>
                                                </td>
                                                <td className="py-6">
                                                    <p className="text-sm font-black text-slate-500">{deal.company}</p>
                                                </td>
                                                <td className="py-6 text-right font-black text-slate-900 tracking-tighter">
                                                    {fmt(deal.amount)}
                                                </td>
                                                <td className="py-6">
                                                    <span className="inline-flex items-center px-4 py-1.5 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest leading-none">
                                                        {deal.stage}
                                                    </span>
                                                </td>
                                                <td className="py-6">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black text-blue-600 tracking-tighter w-8 text-center">{deal.probability}%</span>
                                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                                            <div className="h-full bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" style={{ width: `${deal.probability}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 font-bold text-slate-400 text-sm">
                                                    {deal.close_date}
                                                </td>
                                                <td className="py-6 text-right pr-4">
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-2xl border border-transparent hover:border-slate-100 text-slate-400 hover:text-slate-900 transition-all"><MoreHorizontal className="w-5 h-5" /></Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
