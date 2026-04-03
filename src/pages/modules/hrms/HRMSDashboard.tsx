import { useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import {
    Users, UserCheck, Calendar, Clock,
    CheckCircle2, Plus, RefreshCw, BarChart3,
    Briefcase, Award, GraduationCap, Heart,
    ArrowUpRight, MapPin, Building2, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HRMSDashboard() {
    const { activeCompany } = useTenant();

    const stats = {
        totalEmployees: 142,
        presentToday: 128,
        onLeave: 6,
        openPositions: 4
    };

    const upcomingEvents = [
        { id: "1", type: 'birthday', person: 'Sarah Smith', date: 'Tomorrow', icon: Heart, color: 'text-rose-600 bg-rose-50' },
        { id: "2", type: 'anniversary', person: 'John Doe', date: '15 Mar', icon: Award, color: 'text-amber-600 bg-amber-50' },
        { id: "3", type: 'holiday', person: 'Holi Break', date: '25 Mar', icon: Calendar, color: 'text-emerald-600 bg-emerald-50' },
    ];

    const departmentStats = [
        { name: "Engineering", count: 42, color: "bg-blue-500", progress: 85 },
        { name: "Sales & Mktg", count: 28, color: "bg-emerald-500", progress: 65 },
        { name: "Customer Ops", count: 35, color: "bg-violet-500", progress: 75 },
        { name: "Product Design", count: 12, color: "bg-amber-500", progress: 45 },
    ];

    return (
        <div className="min-h-screen bg-slate-50/20 font-sans p-4 lg:p-6 space-y-6 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-600 pl-4 uppercase">People Intelligence</h1>
                    <div className="flex items-center gap-2 pl-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase leading-none">Employee Experience & Talent Hub • {activeCompany?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 text-slate-400 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200 bg-white">
                        <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" className="h-8 px-4 bg-slate-900 hover:bg-black text-white text-[10px] font-black shadow-lg shadow-slate-900/10 uppercase tracking-widest rounded-lg">
                        <Plus className="w-3.5 h-3.5 mr-2" /> Add Employee
                    </Button>
                </div>
            </div>

            {/* KPI Grid - High Density */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Workforce", value: stats.totalEmployees, sub: "Full-time Entities", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Attendance Live", value: stats.presentToday, sub: "Check-ins Today", icon: UserCheck, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Leave Pipeline", value: stats.onLeave, sub: "Pending Approvals", icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Open Roles", value: stats.openPositions, sub: "Talent Acquisition", icon: Briefcase, color: "text-slate-600", bg: "bg-slate-100" },
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
                {/* Organizational DNA List */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-3.5 bg-slate-400 rounded-full" />
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Organizational DNA</h2>
                        </div>
                        <Button variant="ghost" size="sm" className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50">Org Directory</Button>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {departmentStats.map(dept => (
                            <div key={dept.name} className="p-3 rounded-lg border border-slate-100 hover:border-emerald-200 hover:bg-slate-50/50 transition-all group cursor-pointer shadow-sm">
                                <div className="flex justify-between items-end mb-3">
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Group Entity</p>
                                        <h3 className="text-[11px] font-black text-slate-900 uppercase group-hover:text-emerald-600 transition-colors">{dept.name}</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-slate-900 leading-none">{dept.count}</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Staff</p>
                                    </div>
                                </div>
                                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className={cn("h-full rounded-full transition-all duration-1000", dept.color)} style={{ width: `${dept.progress}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Cultural Card */}
                    <div className="bg-slate-900 rounded-xl p-5 text-white shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-[9px] font-black tracking-widest text-emerald-400 mb-5 uppercase leading-none">Internal Cultural Pulse</h3>
                            <div className="space-y-3">
                                {upcomingEvents.map(event => (
                                    <div key={event.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50 border border-white/5 group hover:bg-slate-800 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-1.5 rounded-md", event.color.replace('bg-', 'bg-opacity-20 bg-'))}>
                                                <event.icon className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{event.type}</p>
                                                <p className="text-[10px] font-black text-white">{event.person}</p>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">{event.date}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-600/10 rounded-full blur-3xl group-hover:bg-emerald-600/20 transition-all pointer-events-none" />
                    </div>

                    {/* HR Command Hub */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <h3 className="text-[9px] font-black tracking-widest text-slate-400 mb-4 border-b border-slate-50 pb-2 uppercase leading-none">HR Operation Hub</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: "Policy Hub", icon: GraduationCap, color: "text-blue-500" },
                                { label: "Attendance", icon: Clock, color: "text-emerald-500" },
                                { label: "Payroll Node", icon: CreditCard, color: "text-amber-500" },
                                { label: "Hiring Pipeline", icon: Briefcase, color: "text-slate-500" },
                            ].map(btn => (
                                <button key={btn.label} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex flex-col items-center gap-2 hover:bg-white hover:border-emerald-200 transition-all group shadow-sm">
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
