import { useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import {
    Globe, Layout, MousePointer2, TrendingUp,
    Plus, Search, Filter, ArrowUpRight,
    ChevronRight, Monitor, Smartphone, Tablet,
    Eye, Settings, Copy, Share2, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPageDashboard() {
    const { activeCompany } = useTenant();

    const stats = {
        activePages: 12,
        totalViews: "45.2K",
        avgConversion: "8.4%",
        newLeadsToday: 24
    };

    const recentPages = [
        { id: "LPG-001", title: "Summer Sale Special", visitor: "12,400", conversion: "12%", status: "Published", date: "2h ago" },
        { id: "LPG-002", title: "CRM Launch Campaign", visitor: "5,600", conversion: "6%", status: "A/B Testing", date: "5h ago" },
        { id: "LPG-003", title: "Product Demo Leads", visitor: "900", conversion: "4%", status: "Draft", date: "1d ago" },
        { id: "LPG-004", title: "Webinar Registration", visitor: "2,100", conversion: "15%", status: "Published", date: "2d ago" },
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-teal-600" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Marketing Conversion Engine</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Page Builder</h1>
                    <p className="text-slate-500 text-sm font-medium">Domain: {activeCompany?.subdomain}.smartseyali.com</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200">
                        <Settings className="w-4 h-4 mr-2" /> Global SEO
                    </Button>
                    <Button className="h-10 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg shadow-teal-500/20 border-0 transition-all">
                        <Plus className="w-4 h-4 mr-2" /> Create Landing Page
                    </Button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Active Pages", value: stats.activePages, sub: "Live production", icon: Layout, color: "bg-teal-600" },
                    { label: "Total Traffic", value: stats.totalViews, sub: "Unique visitors (30d)", icon: Monitor, color: "bg-slate-900" },
                    { label: "Conversion rate", value: stats.avgConversion, sub: "Across all funnels", icon: MousePointer2, color: "bg-emerald-600" },
                    { label: "Capture Leads", value: `+${stats.newLeadsToday}`, sub: "Synced to CRM", icon: Zap, color: "bg-amber-500" },
                ].map(k => (
                    <div key={k.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-2.5 rounded-xl text-white transition-transform group-hover:scale-110 shadow-sm shadow-black/10", k.color)}>
                                <k.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{k.label}</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900 mb-1 leading-none">{k.value}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-2 truncate font-outfit">{k.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Pages List */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Marketing Assets</h2>
                        <div className="flex items-center gap-2">
                            <button className="p-1 px-3 text-[10px] font-black uppercase bg-slate-900 text-white rounded-md tracking-tighter">Live</button>
                            <button className="p-1 px-3 text-[10px] font-black uppercase bg-white text-slate-400 rounded-md tracking-tighter border">Draft</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recentPages.map(page => (
                            <div key={page.id} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:border-teal-500/30 transition-all group cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-teal-500 transition-all opacity-0 group-hover:opacity-100" />
                                <div className="flex items-start justify-between mb-6">
                                    <div className="p-3 rounded-xl bg-slate-50 text-slate-600 border border-slate-100 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                                        page.status === 'Published' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                            page.status === 'A/B Testing' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                "bg-slate-50 text-slate-400 border-slate-100"
                                    )}>
                                        {page.status}
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase italic leading-tight mb-2 group-hover:text-teal-600 transition-colors font-outfit">{page.title}</h3>
                                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight mb-6">
                                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {page.visitor}</span>
                                    <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> {page.conversion} Conv</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button className="flex-1 bg-slate-900 hover:bg-black text-[9px] font-black uppercase h-9 rounded-lg tracking-widest font-outfit">Open Editor</Button>
                                    <button className="w-9 h-9 border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50"><Share2 className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Automation & Template Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Zap className="w-32 h-32 rotate-12 text-teal-400" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400 mb-6 border-b border-white/5 pb-4 leading-none font-outfit">Lead Capture</h3>
                        <div className="space-y-6 relative z-10">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-teal-500/30 transition-all group/card">
                                <p className="text-[11px] font-bold text-white mb-2 italic">A/B Intelligence</p>
                                <p className="text-[9px] text-white/40 leading-relaxed font-medium">Your 'Summer Sale' variant B is outperforming variant A by 42%. We recommend switching traffic to B.</p>
                            </div>
                            <Button className="w-full h-11 bg-white/5 hover:bg-white/10 border-white/10 text-white font-black uppercase tracking-widest text-[9px] rounded-xl transition-all font-outfit shadow-xl">
                                Content Optimizer
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-8 border-b border-slate-50 pb-4 leading-none font-outfit">UI Elements</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Templates', icon: Layout },
                                { label: 'Typography', icon: Globe },
                                { label: 'Forms', icon: Zap },
                                { label: 'Assets', icon: Copy },
                            ].map(item => (
                                <button key={item.label} className="p-5 rounded-xl border border-slate-100 flex flex-col items-center gap-3 hover:bg-teal-50 hover:border-teal-200 transition-all bg-white hover:shadow-md group">
                                    <item.icon className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition-colors" />
                                    <span className="text-[9px] font-bold uppercase text-slate-500 tracking-tighter leading-none">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
