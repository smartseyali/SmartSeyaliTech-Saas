import { useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import {
    Activity, Heart, Users, Calendar,
    Plus, Search, Filter, ArrowUpRight,
    ChevronRight, Pill, Clipboard, Stethoscope,
    Thermometer, Clock, CreditCard, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HospitalDashboard() {
    const { activeCompany } = useTenant();

    const stats = {
        activePatients: 856,
        appointments: 42,
        availableDoctors: 12,
        revenueToday: 125000
    };

    const recentPatients = [
        { id: "PAT-001", name: "John Doe", dept: "Cardiology", doctor: "Dr. Smith", status: "In-Patient", time: "10m ago" },
        { id: "PAT-002", name: "Jane Smith", dept: "Neurology", doctor: "Dr. Adams", status: "Emergency", time: "1h ago" },
        { id: "PAT-003", name: "Michael Roe", dept: "General", doctor: "Dr. Wilson", status: "Discharged", time: "3h ago" },
        { id: "PAT-004", name: "Sarah Lee", dept: "Orthopedic", doctor: "Dr. Taylor", status: "Out-Patient", time: "5h ago" },
    ];

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Stethoscope className="w-5 h-5 text-rose-600" />
                        <span className="text-[10px] font-bold  tracking-widest text-slate-500">Healthcare Management System</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Hospital Console</h1>
                    <p className="text-slate-500 text-sm font-medium">Care Facility: {activeCompany?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200">
                        <Clipboard className="w-4 h-4 mr-2" /> Medical Records
                    </Button>
                    <Button className="h-10 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-500/20 border-0 transition-all">
                        <Plus className="w-4 h-4 mr-2" /> New Admission
                    </Button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "IPD Patients", value: stats.activePatients, sub: "Beds occupied", icon: Heart, color: "bg-rose-600" },
                    { label: "Appts Remaining", value: stats.appointments, sub: "For today", icon: Calendar, color: "bg-slate-900" },
                    { label: "Active Doctors", value: stats.availableDoctors, sub: "On duty now", icon: Stethoscope, color: "bg-emerald-600" },
                    { label: "OPD Revenue", value: fmt(stats.revenueToday), sub: "Daily realization", icon: CreditCard, color: "bg-amber-500" },
                ].map(k => (
                    <div key={k.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-rose-100 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-2.5 rounded-xl text-white transition-transform group-hover:scale-110 shadow-sm shadow-black/10", k.color)}>
                                <k.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold  tracking-widest text-slate-400">{k.label}</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 mb-1 leading-none">{k.value}</p>
                        <p className="text-[10px] font-bold text-slate-400  tracking-tighter mt-2 truncate ">{k.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Patient List */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-fit">
                    <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white relative">
                        <div className="absolute top-0 left-0 w-16 h-1 bg-rose-600 rounded-full ml-8" />
                        <h2 className="text-[11px] font-bold  tracking-widest text-slate-400">Treatment Pipeline</h2>
                        <Button variant="ghost" className="text-rose-600 text-[10px] font-bold  tracking-widest h-8">All Records <ChevronRight className="w-3 h-3 ml-1" /></Button>
                    </div>
                    <table className="w-full">
                        <thead className="bg-slate-50/20">
                            <tr className="text-[8px]  font-bold tracking-widest text-slate-400 border-b border-slate-50">
                                <th className="px-8 py-4 text-left">Internal ID</th>
                                <th className="px-8 py-4 text-left">Patient / Department</th>
                                <th className="px-8 py-4 text-left">Consultant</th>
                                <th className="px-8 py-4 text-left">Status</th>
                                <th className="px-8 py-4 text-right">Age</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentPatients.map(pat => (
                                <tr key={pat.id} className="group hover:bg-slate-50/30 transition-all">
                                    <td className="px-8 py-5 text-[11px] font-bold text-slate-900">{pat.id}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-slate-700 group-hover:text-rose-600 transition-colors   leading-none mb-1">{pat.name}</span>
                                            <span className="text-[9px] font-bold text-slate-400   tracking-widest leading-none">{pat.dept}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-[11px] font-medium text-slate-500">{pat.doctor}</td>
                                    <td className="px-8 py-5">
                                        <span className={cn(
                                            "flex items-center gap-1.5 text-[9px] font-bold  tracking-widest",
                                            pat.status === 'Emergency' ? "text-rose-600" :
                                                pat.status === 'In-Patient' ? "text-amber-500" :
                                                    "text-emerald-500"
                                        )}>
                                            <span className={cn("w-1.5 h-1.5 rounded-full",
                                                pat.status === 'Emergency' ? "bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]" :
                                                    pat.status === 'In-Patient' ? "bg-amber-500" :
                                                        "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                            )} />
                                            {pat.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right text-[10px] font-bold text-slate-400  tracking-tighter">{pat.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Medical System Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Shield className="w-32 h-32 rotate-12 text-rose-500" />
                        </div>
                        <h3 className="text-[10px] font-bold  tracking-widest text-rose-500 mb-6 border-b border-white/5 pb-4 leading-none ">Critical Alert</h3>
                        <div className="space-y-6 relative z-10">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 group-hover:border-rose-500/30 transition-all font-sans">
                                <p className="text-[11px] font-bold text-white mb-2  tracking-tight">O2 Supply Status</p>
                                <p className="text-[9px] text-white/40 leading-relaxed font-medium  tracking-wide">Central oxygen levels at 84%. Backup tanks are optimized for 48 hours of emergency supply.</p>
                            </div>
                            <Button className="w-full h-11 bg-white/5 hover:bg-white/10 border-white/10 text-white font-bold  tracking-widest text-[9px] rounded-xl transition-all  shadow-xl">
                                System Health Check
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                        <h3 className="text-sm font-bold  tracking-widest text-slate-400 mb-8 border-b border-slate-50 pb-4 leading-none ">Medical Console</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Pharmacy', icon: Pill },
                                { label: 'Vitals', icon: Activity },
                                { label: 'Doctors', icon: Users },
                                { label: 'Billing', icon: CreditCard },
                            ].map(item => (
                                <button key={item.label} className="p-5 rounded-xl border border-slate-50 flex flex-col items-center gap-3 hover:bg-rose-50 hover:border-rose-200 transition-all bg-white hover:shadow-md group">
                                    <item.icon className="w-4 h-4 text-slate-300 group-hover:text-rose-600 transition-colors" />
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
