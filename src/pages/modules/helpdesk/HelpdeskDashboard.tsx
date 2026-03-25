import { useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import {
    Headphones, MessageSquare, Clock, CheckCircle2,
    AlertCircle, Plus, Search, Filter,
    ArrowUpRight, ChevronRight, Users,
    BarChart3, LifeBuoy, Zap, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HelpdeskDashboard() {
    const { activeCompany } = useTenant();

    const stats = {
        openTickets: 24,
        avgResponseTime: "14m",
        resolvedToday: 42,
        csatScore: 4.8
    };

    const recentTickets = [
        { id: "TKT-890", subject: "Product Variant Error", user: "Sarah Jenkins", priority: "High", status: "Open", time: "10m ago" },
        { id: "TKT-891", subject: "Upgrade Plan Request", user: "TechFlow Corp", priority: "Medium", status: "In-Progress", time: "1h ago" },
        { id: "TKT-892", subject: "Payment Failed", user: "Michael Chen", priority: "Critical", status: "Open", time: "2h ago" },
        { id: "TKT-893", subject: "Bulk Import Help", user: "Apex Global", priority: "Low", status: "Resolved", time: "4h ago" },
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Headphones className="w-5 h-5 text-cyan-600" />
                        <span className="text-[10px] font-bold  tracking-widest text-slate-500">Customer Support Operations</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Helpdesk Console</h1>
                    <p className="text-slate-500 text-sm font-medium">Service Level Agreement (SLA) Tracking</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200">
                        <BarChart3 className="w-4 h-4 mr-2" /> CSAT Analytics
                    </Button>
                    <Button className="h-10 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold shadow-lg shadow-cyan-500/20 border-0 transition-all">
                        <Plus className="w-4 h-4 mr-2" /> New Ticket
                    </Button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Active Tickets", value: stats.openTickets, sub: "Currently assigned", icon: MessageSquare, color: "bg-cyan-600" },
                    { label: "Avg Response", value: stats.avgResponseTime, sub: "SLA compliance: 98%", icon: Clock, color: "bg-slate-900" },
                    { label: "Resolved Today", value: stats.resolvedToday, sub: "+15% vs yesterday", icon: CheckCircle2, color: "bg-emerald-600" },
                    { label: "CSAT Score", value: stats.csatScore, sub: "Out of 5.0", icon: Star, color: "bg-amber-500" },
                ].map(k => (
                    <div key={k.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-cyan-100 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-2.5 rounded-xl text-white transition-transform group-hover:scale-110 shadow-sm", k.color)}>
                                <k.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold  tracking-widest text-slate-400">{k.label}</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 mb-1 leading-none">{k.value}</p>
                        <p className="text-[10px] font-bold text-slate-400  tracking-tighter mt-2 truncate">{k.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Tickets Table */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-fit">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white relative">
                        <div className="absolute top-0 left-0 w-16 h-1 bg-cyan-600 rounded-full ml-8" />
                        <h2 className="text-[11px] font-bold  tracking-widest text-slate-400">Response Pipeline</h2>
                        <Button variant="ghost" className="text-cyan-600 text-[10px] font-bold  tracking-widest h-8">All Tickets <ChevronRight className="w-3 h-3 ml-1" /></Button>
                    </div>
                    <table className="w-full">
                        <thead className="bg-slate-50/20">
                            <tr className="text-[8px]  font-bold tracking-widest text-slate-400 border-b border-slate-50">
                                <th className="px-8 py-4 text-left">Ticket ID</th>
                                <th className="px-8 py-4 text-left">Subject / User</th>
                                <th className="px-8 py-4 text-left">Priority</th>
                                <th className="px-8 py-4 text-left">State</th>
                                <th className="px-8 py-4 text-right">Age</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentTickets.map(tkt => (
                                <tr key={tkt.id} className="group hover:bg-slate-50/30 transition-all">
                                    <td className="px-8 py-5 text-[11px] font-bold text-slate-900">{tkt.id}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-slate-700 group-hover:text-cyan-600 transition-colors  ">{tkt.subject}</span>
                                            <span className="text-[9px] font-medium text-slate-400   tracking-widest">{tkt.user}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[8px] font-bold  tracking-tighter",
                                            tkt.priority === 'Critical' ? "text-rose-600 bg-rose-50" :
                                                tkt.priority === 'High' ? "text-amber-600 bg-amber-50" :
                                                    "text-slate-500 bg-slate-50"
                                        )}>
                                            {tkt.priority}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={cn(
                                            "flex items-center gap-1.5 text-[9px] font-bold  tracking-widest",
                                            tkt.status === 'Open' ? "text-cyan-600" :
                                                tkt.status === 'In-Progress' ? "text-amber-500" :
                                                    "text-emerald-500"
                                        )}>
                                            <span className={cn("w-1.5 h-1.5 rounded-full",
                                                tkt.status === 'Open' ? "bg-cyan-500 animate-pulse" :
                                                    tkt.status === 'In-Progress' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
                                                        "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                            )} />
                                            {tkt.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right text-[10px] font-bold text-slate-400  tracking-tighter">{tkt.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Agent Status & Automations */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Zap className="w-32 h-32 rotate-12 text-cyan-500" />
                        </div>
                        <h3 className="text-[10px] font-bold  tracking-widest text-cyan-500 mb-6 border-b border-white/5 pb-4 leading-none ">SLA Shield</h3>
                        <div className="space-y-6 relative z-10">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 group-hover:border-cyan-500/30 transition-all">
                                <p className="text-[11px] font-bold text-white mb-2 ">Critical Escalation</p>
                                <p className="text-[9px] text-white/40 leading-relaxed font-medium">Automatic manager alert triggered if Critical priority tickets are not responded to within 30 minutes.</p>
                            </div>
                            <Button className="w-full h-11 bg-white/5 hover:bg-white/10 border-white/10 text-white font-bold  tracking-widest text-[9px] rounded-xl transition-all  shadow-xl">
                                Response Policy
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                        <h3 className="text-sm font-bold  tracking-widest text-slate-400 mb-8 border-b border-slate-50 pb-4 leading-none ">Workbench</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Knowledge', icon: LifeBuoy },
                                { label: 'Automations', icon: Zap },
                                { label: 'Agents', icon: Users },
                                { label: 'Feedback', icon: Star },
                            ].map(item => (
                                <button key={item.label} className="p-5 rounded-xl border border-slate-50 flex flex-col items-center gap-3 hover:bg-cyan-50 hover:border-cyan-200 transition-all bg-white hover:shadow-md group">
                                    <item.icon className="w-4 h-4 text-slate-300 group-hover:text-cyan-600 transition-colors" />
                                    <span className="text-[9px] font-bold  text-slate-500 tracking-tighter leading-none">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
