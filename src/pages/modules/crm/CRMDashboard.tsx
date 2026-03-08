import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useDictionary } from "@/hooks/useDictionary";
import { Link } from "react-router-dom";
import {
    Users, Target, TrendingUp, Briefcase, Calendar,
    Clock, CheckCircle2, XCircle, ArrowUpRight,
    RefreshCw, Filter, Plus, Search, Mail, Phone,
    MoreHorizontal
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

const DEAL_STATUS: Record<string, { label: string; color: string }> = {
    qualification: { label: "Qualification", color: "bg-blue-100 text-blue-700" },
    negotiation: { label: "Negotiation", color: "bg-amber-100 text-amber-700" },
    closed_won: { label: "Closed Won", color: "bg-emerald-100 text-emerald-700" },
    closed_lost: { label: "Closed Lost", color: "bg-rose-100 text-rose-700" },
};

export default function CRMDashboard() {
    const { activeCompany } = useTenant();
    const { t } = useDictionary();
    const [loading, setLoading] = useState(false);

    // Mock data for initial premium feel
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

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100 relative">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-violet-600" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Sales Intelligence Hub</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">CRM Analytics</h1>
                    <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-bold border border-emerald-100">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            OPTIMAL
                        </div>
                        <span className="text-slate-300 text-xs">•</span>
                        <span className="text-slate-500 font-medium text-xs">{activeCompany?.name}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex items-center bg-slate-100 rounded-xl px-4 h-10 border border-slate-200">
                        <Search className="w-4 h-4 text-slate-400 mr-2" />
                        <input type="text" placeholder="Search leads..." className="bg-transparent border-0 focus:ring-0 text-xs w-40 font-medium" />
                    </div>
                    <button className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-violet-600 hover:border-violet-200 transition-all shadow-sm">
                        <Filter className="w-4 h-4" />
                    </button>
                    <Button className="h-10 px-6 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm shadow-lg shadow-violet-500/20 transition-all gap-2 border-0">
                        <Plus className="w-4 h-4" /> New Lead
                    </Button>
                </div>
            </div>

            {/* Premium KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Active Revenue", value: fmt(stats.pipelineValue), sub: "Total Pipeline Value", icon: TrendingUp, color: "bg-violet-600" },
                    { label: "Lead Inflow", value: `+${stats.newLeads}`, sub: "New leads this week", icon: Users, color: "bg-slate-900" },
                    { label: "Conversion Rate", value: `${stats.winRate}%`, sub: "Win rate efficiency", icon: Target, color: "bg-violet-600" },
                    { label: "Open Deals", value: stats.activeDeals, sub: "Currently in pipeline", icon: Briefcase, color: "bg-slate-900" },
                ].map(k => (
                    <div key={k.label} className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl hover:border-violet-100 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                            <k.icon className="w-20 h-20 -rotate-12 translate-x-4 translate-y-2" />
                        </div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className={cn("p-3 rounded-xl shadow-md text-white transition-transform group-hover:scale-105", k.color)}>
                                <k.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">{k.label}</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-3xl font-bold tracking-tight text-slate-900 mb-1.5 truncate">{k.value}</p>
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide leading-none">{k.sub}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Sales Activity Stream */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300">
                    <div className="px-8 py-6 border-b border-slate-50 bg-white flex items-center justify-between relative">
                        <div className="absolute top-0 left-0 w-16 h-1 bg-violet-600 rounded-full ml-8" />
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-violet-50 text-violet-600 border border-violet-100">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Deal Momentum</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-1.5">Live activity stream</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="h-9 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest text-violet-600 hover:bg-violet-50">View Pipeline <ArrowUpRight className="w-3 h-3 ml-2" /></Button>
                    </div>

                    <div className="p-8">
                        <div className="space-y-4">
                            {activities.map(act => (
                                <div key={act.id} className="flex items-center justify-between p-5 rounded-xl border border-slate-50 hover:border-violet-100 hover:bg-slate-50/50 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center border",
                                            act.type === 'lead' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                act.type === 'deal' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    "bg-amber-50 text-amber-600 border-amber-100"
                                        )}>
                                            {act.type === 'lead' ? <Users className="w-4 h-4" /> : act.type === 'deal' ? <Briefcase className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">{act.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[11px] font-medium text-slate-500">{act.person}</span>
                                                <span className="text-[10px] text-slate-300">•</span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{act.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sales Pipeline Distribution */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="bg-slate-900 rounded-2xl p-8 shadow-xl relative overflow-hidden group min-h-[350px]">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl group-hover:bg-violet-600/20 transition-all" />

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <h2 className="text-lg font-bold tracking-tight text-white mb-2 border-b border-white/5 pb-4 uppercase tracking-wide">Engagement Metrics</h2>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-6 mb-8">Performance Funnel</p>

                                <div className="space-y-6">
                                    {[
                                        { label: "Lead Response Time", value: "14m", trend: "up", progress: 85 },
                                        { label: "Meeting Show Rate", value: "92%", trend: "up", progress: 92 },
                                        { label: "Proposal Win Rate", value: "48%", trend: "down", progress: 48 },
                                    ].map(metric => (
                                        <div key={metric.label} className="space-y-2.5">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{metric.label}</span>
                                                <span className="text-lg font-black text-white">{metric.value}</span>
                                            </div>
                                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-violet-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.3)] transition-all duration-1000"
                                                    style={{ width: `${metric.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-8">
                                <Button className="w-full h-11 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-[0.1em] border border-white/10 transition-all">
                                    Export Performance Report
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Actions */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                        <h2 className="text-lg font-bold tracking-tight text-slate-900 mb-8 border-b border-slate-50 pb-4 uppercase tracking-wide">Sales Commands</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Schedule Demo", icon: Calendar, color: "text-blue-600 bg-blue-50" },
                                { label: "Create Quote", icon: Briefcase, color: "text-emerald-600 bg-emerald-50" },
                                { label: "Email Blast", icon: Mail, color: "text-amber-600 bg-amber-50" },
                                { label: "Sales Log", icon: Clock, color: "text-slate-600 bg-slate-50" },
                            ].map(cmd => (
                                <button key={cmd.label} className="flex flex-col items-center justify-center p-5 rounded-xl border border-slate-50 hover:bg-slate-50/50 transition-all gap-3 bg-white hover:shadow-md group">
                                    <div className={cn("p-2.5 rounded-lg border transition-transform group-hover:scale-105", cmd.color)}>
                                        <cmd.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-900 transition-colors text-center">{cmd.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
