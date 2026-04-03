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
        <div className="min-h-screen bg-slate-50/20 font-sans p-4 lg:p-6 space-y-6 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-indigo-600 pl-4 uppercase">POS Operating Hub</h1>
                    <div className="flex items-center gap-2 pl-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase leading-none">Retail Operations & Terminal Control • {activeCompany?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 text-slate-400 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 bg-white">
                        <Printer className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                        size="sm" 
                        onClick={() => navigate('/apps/pos/terminal')}
                        className="h-8 px-4 bg-slate-900 hover:bg-black text-white text-[10px] font-black shadow-lg shadow-slate-900/10 uppercase tracking-widest rounded-lg"
                    >
                        <Zap className="w-3.5 h-3.5 mr-2" /> Start Session
                    </Button>
                </div>
            </div>

            {/* KPI Cards - Terminal Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Daily Revenue", value: fmt(stats.todaySales), sub: "Gross sales (24h)", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Transactions", value: stats.transactions, sub: "Billed generated", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Active Nodes", value: stats.activeTerminals, sub: "Connected devices", icon: Monitor, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Average Ticket", value: fmt(stats.avgTicket), sub: "Basket yield", icon: BarChart3, color: "text-slate-600", bg: "bg-slate-100" },
                ].map(k => (
                    <div key={k.label} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-3">
                            <div className={cn("p-2 rounded-lg", k.bg, k.color)}>
                                <k.icon className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{k.label}</span>
                        </div>
                        <div>
                            <p className="text-xl font-black text-slate-900 tracking-tight leading-none">{k.value}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-none">{k.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Terminal Activity Feed */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-3.5 bg-slate-400 rounded-full" />
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Terminal Feed</h2>
                        </div>
                        <Button variant="ghost" size="sm" className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50">Audit History</Button>
                    </div>
                    <div className="p-4 space-y-3">
                        {recentSells.map(sell => (
                            <div key={sell.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-slate-50/50 transition-all group cursor-pointer shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-[10px] uppercase tracking-widest shadow-sm">
                                        {sell.type.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-slate-900 uppercase leading-none mb-1 group-hover:text-indigo-600">{sell.id}</p>
                                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            <span>{sell.items} Items</span>
                                            <span>•</span>
                                            <span className="text-emerald-600 font-black">{sell.type}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">{fmt(sell.amount)}</p>
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{sell.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Settlement Dark Card */}
                    <div className="bg-slate-900 rounded-xl p-5 text-white shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-[9px] font-black tracking-widest text-indigo-400 mb-5 uppercase leading-none">Fiscal Settlements</h3>
                            <div className="space-y-4">
                                {[
                                    { label: "Cash Reserve", value: "₹12,450", color: "text-emerald-400" },
                                    { label: "Bank Matrix", value: "₹28,600", color: "text-indigo-400" },
                                    { label: "Digital UPI", value: "₹4,230", color: "text-amber-400" },
                                ].map(item => (
                                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                                        <span className={cn("text-sm font-black tracking-tight", item.color)}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                            <Button className="w-full mt-6 h-9 rounded-lg bg-white/10 hover:bg-white text-white hover:text-slate-900 text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 group-hover:border-white/20">
                                Day-End Hub
                            </Button>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-all pointer-events-none" />
                    </div>

                    {/* Performance Hub */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <h3 className="text-[9px] font-black tracking-widest text-slate-400 mb-4 border-b border-slate-50 pb-2 uppercase leading-none">Staff Node Efficiency</h3>
                        <div className="space-y-4">
                            {[
                                { name: "John Doe", sales: "₹15,400", level: 85 },
                                { name: "Sarah Smith", sales: "₹12,200", level: 64 },
                            ].map(staff => (
                                <div key={staff.name} className="space-y-2">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                        <span className="text-slate-900">{staff.name}</span>
                                        <span className="text-indigo-600">{staff.sales}</span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.3)] transition-all duration-1000" style={{ width: `${staff.level}%` }} />
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
