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
        <div className="min-h-screen bg-slate-50/20 font-sans p-4 lg:p-6 space-y-6 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-indigo-600 pl-4 uppercase">CRM Intelligence</h1>
                    <div className="flex items-center gap-2 pl-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase leading-none">Sales Pipeline & Lead Management • {activeCompany?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setLoading(true)} className="h-8 w-8 text-slate-400 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 bg-white">
                        <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                    </Button>
                    <Button size="sm" className="h-8 px-4 bg-slate-900 hover:bg-black text-white text-[10px] font-black shadow-lg shadow-slate-900/10 uppercase tracking-widest rounded-lg">
                        <Plus className="w-3.5 h-3.5 mr-2" /> New Lead
                    </Button>
                </div>
            </div>

            {/* KPI Cards - Sales Pipeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Pipeline Value", value: fmt(stats.pipelineValue), sub: "Projected Revenue", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "New Leads", value: `+${stats.newLeads}`, sub: "Growth Trajectory", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Win Yield", value: `${stats.winRate}%`, sub: "Conversion Efficiency", icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Active Deals", value: stats.activeDeals, sub: "Negotiation Phase", icon: Briefcase, color: "text-slate-600", bg: "bg-slate-100" },
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
                {/* Activity Feed */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-3.5 bg-slate-400 rounded-full" />
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Activity Stream</h2>
                        </div>
                        <Button variant="ghost" size="sm" className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50">Historical Log</Button>
                    </div>
                    <div className="p-4 space-y-3">
                        {activities.map(act => (
                            <div key={act.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-slate-50/50 transition-all group cursor-pointer shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center border font-black text-[10px] shadow-sm transition-all",
                                        act.type === 'lead' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                        act.type === 'deal' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                        "bg-amber-50 text-amber-600 border-amber-100"
                                    )}>
                                        {act.type === 'lead' ? <Users className="w-4 h-4" /> : act.type === 'deal' ? <Briefcase className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-slate-900 uppercase leading-none mb-1 group-hover:text-indigo-600">{act.title}</p>
                                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            <span>{act.person}</span>
                                            <span>•</span>
                                            <span className="text-indigo-600">{act.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{act.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Performance Dark Card */}
                    <div className="bg-slate-900 rounded-xl p-5 text-white shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-[9px] font-black tracking-widest text-indigo-400 mb-5 uppercase leading-none">Sales Yield Metrics</h3>
                            <div className="space-y-4">
                                {[
                                    { label: "Avg Res Time", value: "12m", progress: 85, color: "bg-indigo-500" },
                                    { label: "Meeting Ratio", value: "94%", progress: 94, color: "bg-blue-500" },
                                    { label: "Close Speed", value: "4.2d", progress: 42, color: "bg-emerald-500" },
                                ].map(metric => (
                                    <div key={metric.label} className="space-y-2">
                                        <div className="flex justify-between items-end px-1">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{metric.label}</span>
                                            <span className="text-[11px] font-black text-white tracking-tight">{metric.value}</span>
                                        </div>
                                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div className={cn("h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(99,102,241,0.5)]", metric.color)} style={{ width: `${metric.progress}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-all pointer-events-none" />
                    </div>

                    {/* Quick CRM Hub */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <h3 className="text-[9px] font-black tracking-widest text-slate-400 mb-4 border-b border-slate-50 pb-2 uppercase leading-none">Sales Catalyst Nodes</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: "Schedule", icon: Calendar, color: "text-blue-500" },
                                { label: "Audit Log", icon: Clock, color: "text-slate-500" },
                                { label: "Messenger", icon: Mail, color: "text-amber-500" },
                                { label: "Contracts", icon: ShieldCheck, color: "text-emerald-500" },
                            ].map(btn => (
                                <button key={btn.label} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex flex-col items-center gap-2 hover:bg-white hover:border-indigo-200 transition-all group shadow-sm">
                                    <btn.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", btn.color)} />
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none text-center">{btn.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
