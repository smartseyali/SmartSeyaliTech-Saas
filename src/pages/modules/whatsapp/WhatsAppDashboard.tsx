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
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs font-bold  tracking-widest text-slate-500">Official Business API (WABA)</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">WhatsApp Integration</h1>
                    <p className="text-slate-500 text-sm font-medium">Synced with {activeCompany?.name} Marketing</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200">
                        <Settings className="w-4 h-4 mr-2" /> API Setup
                    </Button>
                    <Button className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20 border-0 transition-all">
                        <Plus className="w-4 h-4 mr-2" /> New Campaign
                    </Button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Sent Today", value: stats.sentToday, sub: "Bulk & Transactional", icon: Send, color: "bg-emerald-600" },
                    { label: "Delivery Success", value: stats.delivered, sub: "Provider: Meta", icon: CheckCircle2, color: "bg-slate-900" },
                    { label: "Read Rate", value: stats.readRate, sub: "Engagement level", icon: MessageCircle, color: "bg-emerald-600" },
                    { label: "Webhooks", value: stats.activeWebhooks, sub: "Live status events", icon: Zap, color: "bg-slate-900" },
                ].map(k => (
                    <div key={k.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-100 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-2.5 rounded-xl text-white transition-transform group-hover:scale-110 shadow-sm shadow-black/10", k.color)}>
                                <k.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold  tracking-widest text-slate-500">{k.label}</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 mb-1 leading-none">{k.value}</p>
                        <p className="text-xs font-bold text-slate-500  tracking-widest mt-2 truncate">{k.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Campaigns List */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-fit">
                    <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white relative">
                        <div className="absolute top-0 left-0 w-16 h-1 bg-emerald-600 rounded-full ml-8" />
                        <h2 className="text-[13px] font-bold  tracking-widest text-slate-500">Message Streams</h2>
                        <Button variant="ghost" className="text-emerald-600 text-xs font-bold  tracking-widest h-8">Template Manager <ChevronRight className="w-3 h-3 ml-1" /></Button>
                    </div>
                    <table className="w-full">
                        <thead className="bg-slate-50/20">
                            <tr className="text-[8px]  font-bold tracking-widest text-slate-500 border-b border-slate-50">
                                <th className="px-8 py-4 text-left">Internal ID</th>
                                <th className="px-8 py-4 text-left">Campaign / Type</th>
                                <th className="px-8 py-4 text-left">Reach (Sent)</th>
                                <th className="px-8 py-4 text-left">Status</th>
                                <th className="px-8 py-4 text-right">Read %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentCampaigns.map(camp => (
                                <tr key={camp.id} className="group hover:bg-emerald-50/20 transition-all">
                                    <td className="px-8 py-5 text-[13px] font-bold text-slate-900">{camp.id}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-bold text-slate-700 group-hover:text-emerald-600 transition-colors  leading-none mb-1">{camp.name}</span>
                                            <span className="text-[13px] font-bold text-slate-500  tracking-widest leading-none">{camp.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-[13px] font-bold text-slate-900">{camp.sent.toLocaleString()} Units</td>
                                    <td className="px-8 py-5">
                                        <span className={cn(
                                            "flex items-center gap-1.5 text-[13px] font-bold  tracking-widest",
                                            camp.status === 'Active' ? "text-emerald-600" :
                                                camp.status === 'Completed' ? "text-slate-500" :
                                                    "text-rose-500"
                                        )}>
                                            <span className={cn("w-1.5 h-1.5 rounded-full",
                                                camp.status === 'Active' ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                                                    "bg-slate-300"
                                            )} />
                                            {camp.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right text-xs font-bold text-emerald-600  tracking-tighter">{camp.read}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* API & Bot Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Shield className="w-32 h-32 rotate-12 text-emerald-500" />
                        </div>
                        <h3 className="text-xs font-bold  tracking-widest text-emerald-500 mb-6 border-b border-white/5 pb-4 leading-none">Meta Verification</h3>
                        <div className="space-y-6 relative z-10">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 group-hover:border-emerald-500/30 transition-all font-sans">
                                <p className="text-[13px] font-bold text-white mb-2 tracking-tight">Quality Rating: High</p>
                                <p className="text-[13px] text-white/40 leading-relaxed font-medium  tracking-wide">Your WABA score is optimal. You can send up to 100,000 messages per 24 hours.</p>
                            </div>
                            <Button className="w-full h-11 bg-white/5 hover:bg-white/10 border-white/10 text-white font-bold  tracking-widest text-[13px] rounded-xl transition-all shadow-xl">
                                Manage Templates
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                        <h3 className="text-sm font-bold  tracking-widest text-slate-500 mb-8 border-b border-slate-50 pb-4 leading-none">Bot Workbench</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Webhooks', icon: Zap },
                                { label: 'Automations', icon: MessageSquare },
                                { label: 'Contacts', icon: Users },
                                { label: 'Analytics', icon: BarChart3 },
                            ].map(item => (
                                <button key={item.label} className="p-5 rounded-xl border border-slate-50 flex flex-col items-center gap-3 hover:bg-emerald-50 hover:border-emerald-200 transition-all bg-white hover:shadow-md group">
                                    <item.icon className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                                    <span className="text-[13px] font-bold  text-slate-500 tracking-tighter leading-none">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
