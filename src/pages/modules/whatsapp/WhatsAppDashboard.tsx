import { useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import {
    MessageSquare, Send, CheckCircle2, Clock,
    Plus, Search, Filter, ArrowUpRight,
    ChevronRight, Zap, Phone, Users,
    BarChart3, Settings, Shield, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function WhatsAppDashboard() {
    const { activeCompany } = useTenant();

    const stats = {
        sentToday: 1240,
        delivered: "98%",
        readRate: "76%",
        activeWebhooks: 4
    };

    const recentCampaigns = [
        { id: "WAP-001", name: "Order Confirmation", type: "Template", status: "Active", sent: 1240, read: "92%" },
        { id: "WAP-012", name: "Friday Flash Sale", type: "Broadcast", status: "Completed", sent: 8500, read: "45%" },
        { id: "WAP-023", name: "Support Welcome", type: "Auto-Reply", status: "Active", sent: 156, read: "100%" },
        { id: "WAP-044", name: "Abandoned Cart", type: "Marketing", status: "Paused", sent: 42, read: "12%" },
    ];

    return (
        <div className="min-h-screen bg-slate-50/20 font-sans p-4 lg:p-6 space-y-6 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-600 pl-4 uppercase">Messaging Intelligence</h1>
                    <div className="flex items-center gap-2 pl-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase leading-none">Official Business API (WABA) Control • {activeCompany?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 text-slate-400 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200 bg-white">
                        <Settings className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black shadow-lg shadow-emerald-500/20 uppercase tracking-widest rounded-lg">
                        <Plus className="w-3.5 h-3.5 mr-2" /> New Campaign
                    </Button>
                </div>
            </div>

            {/* KPI Cards - Delivery Performance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Sent Today", value: stats.sentToday.toLocaleString(), sub: "Bulk & Transactional", icon: Send, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Delivery Speed", value: stats.delivered, sub: "Verified via Meta", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Engagement Rate", value: stats.readRate, sub: "Customer Read Rate", icon: MessageCircle, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Active Nodes", value: stats.activeWebhooks, sub: "Live Status Events", icon: Zap, color: "text-slate-600", bg: "bg-slate-100" },
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
                {/* Campaigns Table */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-3.5 bg-slate-400 rounded-full" />
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Campaign Stream</h2>
                        </div>
                        <Button variant="ghost" size="sm" className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50">Manage Hub</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    <th className="px-6 py-3">Source ID</th>
                                    <th className="px-6 py-3">Campaign Entity</th>
                                    <th className="px-6 py-3">Reach</th>
                                    <th className="px-6 py-3 text-right">Yield %</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentCampaigns.map(camp => (
                                    <tr key={camp.id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                                        <td className="px-6 py-3 text-[10px] font-black text-slate-400 family-mono">{camp.id}</td>
                                        <td className="px-6 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-slate-900 uppercase leading-none mb-1 group-hover:text-emerald-600 transition-colors">{camp.name}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{camp.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-black text-slate-900">{camp.sent.toLocaleString()}</span>
                                                <span className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    camp.status === 'Active' ? "bg-emerald-500 animate-pulse bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300"
                                                )} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-right text-[11px] font-black text-emerald-600 tracking-tight">{camp.read}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Meta Status Dark Card */}
                    <div className="bg-slate-900 rounded-xl p-5 text-white shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-[9px] font-black tracking-widest text-emerald-400 mb-5 uppercase leading-none">Provider Integrity</h3>
                            <div className="p-3 rounded-lg bg-white/5 border border-white/5 mb-4 group-hover:bg-white/10 transition-all">
                                <p className="text-[10px] font-black text-white mb-2 uppercase tracking-wide">Quality Rank: High</p>
                                <p className="text-[9px] text-slate-400 leading-relaxed font-bold uppercase tracking-widest">Optimal WABA integration protocol. Capacity: 100K messages / cycle.</p>
                            </div>
                            <Button className="w-full h-9 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 border-0">
                                Verify Node
                            </Button>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-600/10 rounded-full blur-3xl group-hover:bg-emerald-600/20 transition-all pointer-events-none" />
                    </div>

                    {/* Bot Grid */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <h3 className="text-[9px] font-black tracking-widest text-slate-400 mb-4 border-b border-slate-50 pb-2 uppercase leading-none">Automated Workbench</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: 'Webhooks', icon: Zap, color: 'text-indigo-500' },
                                { label: 'Engines', icon: MessageSquare, color: 'text-emerald-500' },
                                { label: 'Segments', icon: Users, color: 'text-blue-500' },
                                { label: 'Yield Log', icon: BarChart3, color: 'text-amber-500' },
                            ].map(item => (
                                <button key={item.label} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex flex-col items-center gap-2 hover:bg-white hover:border-emerald-200 transition-all group shadow-sm">
                                    <item.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", item.color)} />
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none text-center">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
