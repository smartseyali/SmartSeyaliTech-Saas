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

    if (!activeCompany) return null;

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase tracking-wider">POS Terminal Hub</h1>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                        <p className="text-xs font-bold tracking-widest text-slate-500 uppercase leading-none">Retail Operations Control • {activeCompany?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-all shadow-sm">
                        <Printer className="w-4 h-4" />
                    </button>
                    <Button
                        onClick={() => navigate('/apps/pos/terminal')}
                        className="h-11 px-8 rounded-2xl bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs tracking-widest uppercase transition-all shadow-xl shadow-indigo-600/20 gap-3 border-0"
                    >
                        <Zap className="w-4 h-4" /> Start Session
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Today's Revenue", value: fmt(stats.todaySales), sub: "Gross sales (24h)", icon: TrendingUp, color: "bg-indigo-600" },
                    { label: "Transactions", value: stats.transactions, sub: "Unique bills generated", icon: ShoppingBag, color: "bg-slate-900" },
                    { label: "Active Nodes", value: stats.activeTerminals, sub: "Connected devices", icon: Monitor, color: "bg-indigo-600" },
                    { label: "Average Ticket", value: fmt(stats.avgTicket), sub: "Basket yield", icon: BarChart3, color: "bg-slate-900" },
                ].map(k => (
                    <div key={k.label} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all h-64">
                        <div className="flex items-center justify-between mb-8">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white", k.color)}>
                                <k.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold tracking-[0.1em] text-slate-500 uppercase leading-none">{k.label}</span>
                        </div>
                        <div>
                            <p className="text-4xl font-bold tracking-tight text-slate-900 mb-2 truncate leading-none">{k.value}</p>
                            <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mt-4 leading-none">{k.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-white relative">
                         <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase tracking-wider leading-none">Terminal Feed</h2>
                        <Button variant="ghost" className="h-9 px-4 rounded-lg text-xs font-bold tracking-widest text-indigo-600 uppercase hover:bg-indigo-50 transition-all">Audit History</Button>
                    </div>

                    <div className="p-10 space-y-6">
                        {recentSells.map(sell => (
                            <div key={sell.id} className="flex items-center justify-between p-7 rounded-[2.5rem] border border-slate-50 hover:border-indigo-100 hover:bg-slate-50/50 transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase tracking-widest shadow-lg">
                                        {sell.type.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase text-[12px] tracking-tight leading-none">{sell.id}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            <span>{sell.items} Items</span>
                                            <span className="text-slate-200">•</span>
                                            <span className="text-emerald-600">{sell.type}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-slate-900 tracking-tighter leading-none mb-1">{fmt(sell.amount)}</p>
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest leading-none">{sell.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Zap className="w-32 h-32 text-indigo-500 -rotate-12 translate-x-12" />
                        </div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-8 border-b border-white/5 pb-6">Settlements</h2>
                        <div className="space-y-6 relative z-10 p-2">
                            {[
                                { label: "Cash Control", value: "₹12,450", color: "text-emerald-400" },
                                { label: "Card Matrix", value: "₹28,600", color: "text-indigo-400" },
                                { label: "Digital UPI", value: "₹4,230", color: "text-amber-400" },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between items-center py-5 border-b border-white/5 last:border-0">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">{item.label}</span>
                                    <span className={cn("text-xl font-bold tracking-tighter leading-none", item.color)}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                        <Button className="w-full mt-10 h-12 rounded-2xl bg-white text-slate-900 hover:bg-slate-200 font-bold text-xs tracking-widest uppercase transition-all shadow-xl shadow-white/5 border-0">
                            Day-End Report
                        </Button>
                    </div>

                    <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm flex flex-col">
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-8 border-b border-slate-50 pb-4 tracking-wider uppercase w-full text-center underline decoration-indigo-600 decoration-2 underline-offset-8 leading-none">Efficiency</h2>
                        <div className="space-y-6 w-full">
                            {[
                                { name: "John Doe", sales: "₹15,400", level: 85 },
                                { name: "Sarah Smith", sales: "₹12,200", level: 64 },
                            ].map(staff => (
                                <div key={staff.name} className="space-y-3">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                        <span className="text-slate-900">{staff.name}</span>
                                        <span className="text-indigo-600 font-mono tracking-tighter">{staff.sales}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                                        <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(79,70,229,0.3)]" style={{ width: `${staff.level}%` }} />
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
