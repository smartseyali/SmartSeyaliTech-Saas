import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function Analytics() {
    const stats = [
        { label: "Total Revenue", value: "₹ 12.4L", trend: "+12.5%", positive: true, icon: DollarSign },
        { label: "Conversion Rate", value: "3.2%", trend: "-0.4%", positive: false, icon: TrendingUp },
        { label: "Avg. Order Value", value: "₹ 2,450", trend: "+5.1%", positive: true, icon: ShoppingBag },
        { label: "New Customers", value: "450", trend: "+18%", positive: true, icon: Users },
    ];

    return (
        <div className="p-8 pb-20 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Performance</p>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics</h1>
                    <p className="text-sm text-slate-500 mt-1">Deep-dive performance metrics and behavioral analytics.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-5">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <s.icon className="w-5 h-5" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${s.positive ? 'text-emerald-600' : 'text-rose-500'}`}>
                                {s.positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                {s.trend}
                            </div>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
                        <h3 className="text-2xl font-bold text-slate-900">{s.value}</h3>
                    </div>
                ))}
            </div>

            {/* Chart placeholders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-80 flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-bold text-slate-700">Revenue Over Time</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center text-slate-300 text-sm font-medium">
                        Chart coming soon
                    </div>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-80 flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-bold text-slate-700">Conversion Funnel</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center text-slate-300 text-sm font-medium">
                        Chart coming soon
                    </div>
                </div>
            </div>
        </div>
    );
}
