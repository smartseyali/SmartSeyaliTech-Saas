import { ModuleListPage } from "@/components/modules/ModuleListPage";
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function Analytics() {
    const stats = [
        { label: "Total Revenue", value: "₹ 12.4L", trend: "+12.5%", positive: true, icon: DollarSign },
        { label: "Conversion Rate", value: "3.2%", trend: "-0.4%", positive: false, icon: TrendingUp },
        { label: "Avg. Order Value", value: "₹ 2,450", trend: "+5.1%", positive: true, icon: ShoppingBag },
        { label: "New Customers", value: "450", trend: "+18%", positive: true, icon: Users },
    ];

    return (
        <div className="p-8 space-y-8">
            <div className="space-y-1">
                <h1 className="text-3xl font-black italic tracking-tighter uppercase">Intelligence Dashboard</h1>
                <p className="text-muted-foreground font-medium">Deep-dive performance metrics and behavioral analytics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 group hover:border-primary/20 transition-all">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                <s.icon className="w-6 h-6" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-black ${s.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {s.positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                {s.trend}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#14532d]/40 mb-1">{s.label}</p>
                            <h3 className="text-2xl font-black text-[#14532d]">{s.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm h-96 flex items-center justify-center italic text-slate-300">
                    Growth Velocity Visualization
                </div>
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm h-96 flex items-center justify-center italic text-slate-300">
                    Conversion Funnel Analytics
                </div>
            </div>
        </div>
    );
}
