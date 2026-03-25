import { useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { useDictionary } from "@/hooks/useDictionary";
import { Link } from "react-router-dom";
import {
    Users, Target, TrendingUp, Briefcase, Calendar,
    Clock, CheckCircle2, XCircle, ArrowUpRight,
    RefreshCw, Filter, Plus, Search, Mail, Phone,
    MoreHorizontal, Zap, ZapOff, BarChart3,
    ShieldCheck, Activity, Globe, Layout,
    Laptop, Smartphone, Binary, Database,
    Network, Power, Boxes, Layers, UserCheck,
    FileText, ListTree, Settings, MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CRMStats {
    totalLeads: number;
    newLeads: number;
    activeDeals: number;
    pipelineValue: number;
    winRate: number;
    closedDeals: number;
}

interface RecentActivity {
    id: string;
    type: 'lead' | 'deal' | 'task' | 'meeting';
    title: string;
    person: string;
    status: string;
    time: string;
}

export default function CRMDashboard() {
    const { activeCompany } = useTenant();
    const { t } = useDictionary();
    const [loading, setLoading] = useState(false);

    const [stats] = useState<CRMStats>({
        totalLeads: 1248,
        newLeads: 42,
        activeDeals: 156,
        pipelineValue: 450000,
        winRate: 64,
        closedDeals: 89
    });

    const [activities] = useState<RecentActivity[]>([
        { id: "1", type: 'lead', title: 'New High Priority Lead', person: 'Sarah Jenkins', status: 'New', time: '10m ago' },
        { id: "2", type: 'deal', title: 'Enterprise Plan Upgrade', person: 'TechFlow Corp', status: 'Negotiation', time: '1h ago' },
        { id: "3", type: 'meeting', title: 'Product Demo', person: 'Michael Chen', status: 'Scheduled', time: '2h ago' },
        { id: "4", type: 'task', title: 'Follow up on Quote', person: 'Apex Global', status: 'Pending', time: '4h ago' },
    ]);

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

    if (!activeCompany) return null;

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase tracking-wider">CRM Analytics</h1>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                        <p className="text-xs font-bold tracking-widest text-slate-500 uppercase leading-none">Sales Intelligence Hub • {activeCompany?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex items-center bg-slate-100 rounded-xl px-4 h-10 border border-slate-200 shadow-inner">
                        <Search className="w-4 h-4 text-slate-500 mr-2" />
                        <input type="text" placeholder="Search Master..." className="bg-transparent border-0 focus:ring-0 text-xs w-40 font-bold uppercase tracking-widest text-slate-500 placeholder:text-slate-300" />
                    </div>
                    <Button className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs tracking-widest uppercase transition-all shadow-xl shadow-indigo-600/20 gap-2 border-0">
                        <Plus className="w-4 h-4" /> New Lead
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Active Revenue", value: fmt(stats.pipelineValue), sub: "Pipeline Valuation", icon: TrendingUp, color: "bg-indigo-600" },
                    { label: "Lead Inflow", value: `+${stats.newLeads}`, sub: "Growth trajectory", icon: Users, color: "bg-slate-900" },
                    { label: "Win Rate", value: `${stats.winRate}%`, sub: "Conversion health", icon: Target, color: "bg-indigo-600" },
                    { label: "Open Deals", value: stats.activeDeals, sub: "Negotiation matrix", icon: Briefcase, color: "bg-slate-900" },
                ].map(k => (
                    <div key={k.label} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all h-64">
                        <div className="flex items-center justify-between mb-8">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white", k.color)}>
                                <k.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold tracking-[0.1em] text-slate-500 uppercase leading-none">{k.label}</span>
                        </div>
                        <div>
                            <p className="text-4xl font-bold tracking-tight text-slate-900 mb-2 truncate">{k.value}</p>
                            <p className="text-xs font-bold text-slate-500 tracking-widest uppercase leading-none">{k.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-10 py-8 border-b border-slate-50 bg-white flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase tracking-wider leading-none">Activity Stream</h2>
                        <Button variant="ghost" className="h-9 px-4 rounded-lg text-xs font-bold tracking-widest text-indigo-600 uppercase hover:bg-indigo-50 transition-all">Historical Feed</Button>
                    </div>

                    <div className="p-10 space-y-6">
                        {activities.map(act => (
                            <div key={act.id} className="flex items-center justify-between p-6 rounded-[2rem] border border-slate-50 hover:border-indigo-100 hover:bg-slate-50/50 transition-all group">
                                <div className="flex items-center gap-5">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300",
                                        act.type === 'lead' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                            act.type === 'deal' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                "bg-amber-50 text-amber-600 border-amber-100"
                                    )}>
                                        {act.type === 'lead' ? <Users className="w-5 h-5" /> : act.type === 'deal' ? <Briefcase className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase text-[12px] tracking-tight leading-none">{act.title}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            <span>{act.person}</span>
                                            <span className="text-slate-200">•</span>
                                            <span className="text-indigo-600">{act.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-slate-300 uppercase leading-none">{act.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Binary className="w-32 h-32 text-indigo-500 -rotate-12 translate-x-12" />
                        </div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-8 border-b border-white/5 pb-6">Performance</h2>
                        <div className="space-y-6 relative z-10 p-2">
                            {[
                                { label: "Lead Res Time", value: "14m", progress: 85, color: "bg-indigo-500" },
                                { label: "Meeting Rate", value: "92%", progress: 92, color: "bg-emerald-500" },
                                { label: "Win Yield", value: "48%", progress: 48, color: "bg-rose-500" },
                            ].map(metric => (
                                <div key={metric.label} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{metric.label}</span>
                                        <span className="text-xl font-bold text-white leading-none tracking-tighter">{metric.value}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-1000", metric.color)}
                                            style={{ width: `${metric.progress}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm flex flex-col">
                        <h2 className="text-xl font-bold text-slate-900 mb-8 uppercase tracking-wider border-b border-slate-50 pb-6 w-full text-center">Sales Force</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Sched Demo", icon: Calendar, color: "text-blue-600 bg-blue-50" },
                                { label: "Sales Log", icon: Clock, color: "text-slate-600 bg-slate-50" },
                                { label: "Email Node", icon: Mail, color: "text-amber-600 bg-amber-50" },
                                { label: "SLA Matrix", icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50" },
                            ].map(cmd => (
                                <button key={cmd.label} className="flex flex-col items-center justify-center p-6 rounded-3xl border border-slate-50 hover:bg-slate-50 transition-all gap-4 bg-white group/cmd shadow-sm">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border transition-all group-hover/cmd:scale-105", cmd.color)}>
                                        <cmd.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[13px] font-bold tracking-widest text-slate-500 uppercase group-hover/cmd:text-indigo-600 transition-colors text-center">{cmd.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
