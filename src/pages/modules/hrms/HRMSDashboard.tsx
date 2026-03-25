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
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100 relative">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs font-bold  tracking-widest text-slate-500">People Operations Hub</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Employee Experience</h1>
                    <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[13px] font-bold border border-emerald-100">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            OPTIMAL
                        </div>
                        <span className="text-slate-300 text-xs">•</span>
                        <span className="text-slate-500 font-medium text-xs">{activeCompany?.name}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 transition-all shadow-sm">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <Button className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all gap-2 border-0">
                        <Plus className="w-4 h-4" /> Add Employee
                    </Button>
                </div>
            </div>

            {/* Premium KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Total Workforce", value: stats.totalEmployees, sub: "Full-time entities", icon: Users, color: "bg-emerald-600" },
                    { label: "Active Today", value: stats.presentToday, sub: "Check-ins via portal", icon: UserCheck, color: "bg-slate-900" },
                    { label: "Leave Requests", value: stats.onLeave, sub: "Pending approvals", icon: Calendar, color: "bg-emerald-600" },
                    { label: "Open Positions", value: stats.openPositions, sub: "Talent acquisition", icon: Briefcase, color: "bg-slate-900" },
                ].map(k => (
                    <div key={k.label} className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl hover:border-emerald-100 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                            <k.icon className="w-20 h-20 -rotate-12 translate-x-4 translate-y-2" />
                        </div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className={cn("p-3 rounded-xl shadow-md text-white transition-transform group-hover:scale-105", k.color)}>
                                <k.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold  tracking-[0.1em] text-slate-500">{k.label}</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-3xl font-bold tracking-tight text-slate-900 mb-1.5 truncate">{k.value}</p>
                            <p className="text-xs font-semibold text-slate-500  tracking-wide leading-none">{k.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Departmental Analysis */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300">
                    <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white relative">
                        <div className="absolute top-0 left-0 w-16 h-1 bg-emerald-600 rounded-full ml-8" />
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Organizational DNA</h2>
                                <p className="text-xs font-bold text-slate-500  tracking-[0.1em] mt-1.5">Departmental distribution</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="h-9 px-4 rounded-lg text-xs font-bold  tracking-widest text-emerald-600 hover:bg-emerald-50">View Org Chart <ArrowUpRight className="w-3 h-3 ml-2" /></Button>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {departmentStats.map(dept => (
                                <div key={dept.name} className="space-y-4 group">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs font-bold text-slate-300  tracking-widest mb-1">Entity Group</p>
                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors  ">{dept.name}</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-slate-900 tracking-tighter leading-none">{dept.count}</p>
                                            <p className="text-xs font-bold text-slate-300  tracking-widest leading-none mt-1">Personnel</p>
                                        </div>
                                    </div>
                                    <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5 relative">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-1000 relative z-10", dept.color)}
                                            style={{ width: `${dept.progress}%` }}
                                        >
                                            <div className="absolute top-0 right-0 w-2 h-2 bg-white/20 rounded-full translate-x-1" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cultural Timeline & Events */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-2xl p-8 shadow-xl relative overflow-hidden group">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl group-hover:bg-emerald-600/20 transition-all" />
                        <h2 className="text-lg font-bold text-white  tracking-wider mb-8 border-b border-white/5 pb-5">Cultural Vibe</h2>
                        <div className="space-y-4 relative z-10">
                            {upcomingEvents.map(event => (
                                <div key={event.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("p-2 rounded-lg border border-transparent transition-transform group-hover:scale-105", event.color)}>
                                            <event.icon className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-slate-500  tracking-widest leading-none mb-1">{event.type}</p>
                                            <p className="text-[13px] font-semibold text-white">{event.person}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-400  tracking-tighter">{event.date}</span>
                                </div>
                            ))}
                        </div>
                        <Button className="w-full mt-8 h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs  tracking-[0.1em] transition-all border-0">
                            View Team Calendar
                        </Button>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                        <h2 className="text-lg font-bold tracking-tight text-slate-900 mb-8 border-b border-slate-50 pb-4  tracking-wide">HR Commands</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Policy Doc", icon: GraduationCap, color: "text-blue-600 bg-blue-50" },
                                { label: "Attendance", icon: Clock, color: "text-emerald-600 bg-emerald-50" },
                                { label: "Payroll", icon: CreditCard, color: "text-amber-600 bg-amber-50" },
                                { label: "Hiring", icon: Briefcase, color: "text-violet-600 bg-violet-50" },
                            ].map(btn => (
                                <button key={btn.label} className="p-5 rounded-xl border border-slate-50 hover:bg-slate-50/50 transition-all flex flex-col items-center gap-3 bg-white hover:shadow-md group">
                                    <div className={cn("p-2.5 rounded-lg transition-transform group-hover:scale-105", btn.color)}>
                                        <btn.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold  tracking-wider text-slate-500 group-hover:text-slate-900 transition-colors">{btn.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
