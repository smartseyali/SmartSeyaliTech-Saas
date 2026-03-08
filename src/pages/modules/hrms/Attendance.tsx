import { useState } from "react";
import {
    Clock, Search, Filter, Plus,
    MoreHorizontal, CheckCircle2, XCircle,
    Calendar, UserCheck, AlertCircle,
    Fingerprint, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Attendance() {
    const attendance = [
        { id: 1, name: "Sarah Jenkins", timeIn: "09:02 AM", timeOut: "06:15 PM", status: "On-Time", location: "Remote" },
        { id: 2, name: "Michael Chen", timeIn: "09:45 AM", timeOut: "-", status: "Late", location: "Office HQ" },
        { id: 3, name: "John Doe", timeIn: "08:55 AM", timeOut: "05:30 PM", status: "On-Time", location: "Office HQ" },
        { id: 4, name: "Jessica Roe", timeIn: "-", timeOut: "-", status: "Absent", location: "-" },
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Fingerprint className="w-6 h-6 text-emerald-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Personnel Operations</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic">Attendance Logs</h1>
                    <p className="text-sm font-medium text-slate-500">Real-time tracking of employee presence and clocking data.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200">
                        <Calendar className="w-5 h-5 mr-2" /> Shift Roster
                    </Button>
                    <Button className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-black text-white font-bold shadow-xl shadow-emerald-600/20 transition-all gap-3 border-0">
                        <Plus className="w-5 h-5" /> Manual Entry
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Present Today", value: "142", sub: "92% Attendance", icon: UserCheck, color: "text-emerald-600" },
                    { label: "Late Check-ins", value: "08", sub: "Requires attention", icon: Clock, color: "text-amber-500" },
                    { label: "On Leave", value: "12", sub: "Approved requests", icon: Calendar, color: "text-indigo-600" },
                    { label: "Avg Work Hours", value: "8.4h", sub: "Internal benchmark", icon: AlertCircle, color: "text-slate-900" },
                ].map(k => (
                    <div key={k.label} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm group hover:border-emerald-100 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                <k.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{k.label}</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900 leading-none mb-1">{k.value}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{k.sub}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden mt-8">
                <table className="w-full text-left font-sans">
                    <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/50">
                            <th className="py-6 pl-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Employee Identity</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Punctuality Matrix</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Check-In</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Check-Out</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right pr-10">Verification</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {attendance.map((log) => (
                            <tr key={log.id} className="group hover:bg-slate-50/50 transition-all">
                                <td className="py-8 pl-10">
                                    <p className="text-sm font-black text-slate-900 uppercase italic mb-1 leading-none">{log.name}</p>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <MapPin className="w-3.5 h-3.5" /> {log.location}
                                    </div>
                                </td>
                                <td className="py-8">
                                    <span className={cn(
                                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                        log.status === 'On-Time' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                            log.status === 'Late' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                "bg-rose-50 text-rose-600 border-rose-100"
                                    )}>
                                        {log.status}
                                    </span>
                                </td>
                                <td className="py-8 font-black text-slate-700 italic">{log.timeIn}</td>
                                <td className="py-8 font-black text-slate-700 italic">{log.timeOut}</td>
                                <td className="py-8 pr-10 text-right">
                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
