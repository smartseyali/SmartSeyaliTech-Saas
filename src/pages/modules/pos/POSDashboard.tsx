import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTenant } from "@/contexts/TenantContext";
import {
    CreditCard, ShoppingBag, Zap, Clock,
    CheckCircle2, Plus, RefreshCw, BarChart3,
    Monitor, Printer, Receipt, Users, ArrowRight,
    TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function POSDashboard() {
    const { activeCompany } = useTenant();
    const navigate = useNavigate();
    const [loading] = useState(false);

    const stats = {
        todaySales: 45280,
        transactions: 124,
        activeTerminals: 3,
        avgTicket: 365
    };

    const recentSells = [
        { id: "TX-9041", time: "2m ago", amount: 1250, items: 4, type: "Card" },
        { id: "TX-9040", time: "15m ago", amount: 840, items: 2, type: "Cash" },
        { id: "TX-9039", time: "28m ago", amount: 2100, items: 12, type: "UPI" },
        { id: "TX-9038", time: "45m ago", amount: 450, items: 1, type: "Card" },
    ];

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100 relative">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Monitor className="w-6 h-6 text-indigo-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Retail Operations Control</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase">POS Terminal Hub</h1>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        Online Status: <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-bold border border-emerald-100"><span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> SYNCED</span> • <span className="text-indigo-600 font-bold">{activeCompany?.name}</span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                        <Printer className="w-5 h-5" />
                    </button>
                    <Button
                        onClick={() => navigate('/apps/pos/terminal')}
                        className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-black text-white font-bold shadow-xl shadow-indigo-600/20 transition-all gap-3 border-0"
                    >
                        <Zap className="w-5 h-5" /> Start New Session
                    </Button>
                </div>
            </div>

            {/* Premium KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Today's Revenue", value: fmt(stats.todaySales), sub: "Gross sales (24h)", icon: TrendingUp, color: "bg-indigo-600" },
                    { label: "Transaction Count", value: stats.transactions, sub: "Unique bills generated", icon: ShoppingBag, color: "bg-slate-900" },
                    { label: "Active Terminals", value: stats.activeTerminals, sub: "Connected devices", icon: Monitor, color: "bg-indigo-600" },
                    { label: "Average Ticket", value: fmt(stats.avgTicket), sub: "Per customer spend", icon: BarChart3, color: "bg-slate-900" },
                ].map(k => (
                    <div key={k.label} className="group bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-2xl hover:border-indigo-200 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <k.icon className="w-24 h-24 -rotate-12 translate-x-8 translate-y-4" />
                        </div>
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div className={cn("p-4 rounded-2xl shadow-lg shadow-indigo-600/5 text-white transition-transform group-hover:scale-110", k.color)}>
                                <k.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">{k.label}</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-4xl font-bold tracking-tight text-slate-900 mb-2 truncate">{k.value}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{k.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Transaction Ledger */}
                <div className="lg:col-span-8 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500">
                    <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                                <Receipt className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-none">Live Terminal Feed</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Real-time checkout stream</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="h-11 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 transition-all">Audit History <ArrowRight className="w-4 h-4 ml-2" /></Button>
                    </div>

                    <div className="p-10">
                        <div className="space-y-6">
                            {recentSells.map(sell => (
                                <div key={sell.id} className="flex items-center justify-between p-6 rounded-3xl border border-slate-50 hover:border-indigo-100 hover:bg-slate-50/50 transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                                            {sell.type.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{sell.id}</p>
                                            <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <span>{sell.items} items</span>
                                                <span>•</span>
                                                <span className="text-emerald-600">{sell.type} payment</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-slate-900 tracking-tight">{fmt(sell.amount)}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sell.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Counter Stats & Quick Actions */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Zap className="w-24 h-24 text-indigo-500" />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-8 italic">Terminal Summary</h2>
                        <div className="space-y-6">
                            {[
                                { label: "Cash on Hand", value: "₹12,450", color: "text-emerald-400" },
                                { label: "Card Settlements", value: "₹28,600", color: "text-indigo-400" },
                                { label: "Digital UPI", value: "₹4,230", color: "text-amber-400" },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                                    <span className={cn("text-lg font-bold tracking-tight", item.color)}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                        <Button className="w-full mt-10 h-14 rounded-2xl bg-white text-slate-900 hover:bg-slate-200 font-bold text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-white/5 border-0">
                            Generate Day-End Report
                        </Button>
                    </div>

                    <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm hover:shadow-2xl transition-all duration-500">
                        <h2 className="text-lg font-bold tracking-tight text-slate-900 mb-8 underline decoration-amber-500 decoration-2 underline-offset-4 uppercase italic">Staff Vitals</h2>
                        <div className="space-y-6">
                            {[
                                { name: "John Doe", sales: "₹15,400", level: 85 },
                                { name: "Sarah Smith", sales: "₹12,200", level: 64 },
                            ].map(staff => (
                                <div key={staff.name} className="space-y-3">
                                    <div className="flex justify-between text-[11px] font-bold">
                                        <span className="text-slate-900 uppercase tracking-widest">{staff.name}</span>
                                        <span className="text-indigo-600 font-mono tracking-tighter">{staff.sales}</span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${staff.level}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
