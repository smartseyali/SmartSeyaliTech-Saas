import { useState } from "react";
import {
    Users, Search, Filter, Plus,
    MoreHorizontal, Heart, Activity,
    Clipboard, Thermometer, ShieldCheck,
    Stethoscope, Clock, Phone, Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Patients() {
    const [patients] = useState([
        { id: "PAT-001", name: "John Doe", age: 45, blood: "O+", gender: "Male", status: "In-Patient", dept: "Cardiology" },
        { id: "PAT-002", name: "Jane Smith", age: 32, blood: "A-", gender: "Female", status: "Out-Patient", dept: "General" },
        { id: "PAT-003", name: "Michael Roe", age: 28, blood: "B+", gender: "Male", status: "Emergency", dept: "Orthopedic" },
    ]);

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-rose-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Electronic Health Records (EHR)</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic">Patient Directory</h1>
                    <p className="text-sm font-medium text-slate-500">Master database of all registered patients and medical history summaries.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200">
                        <Clipboard className="w-5 h-5 mr-2" /> Vitals Sync
                    </Button>
                    <Button className="h-12 px-8 rounded-2xl bg-rose-600 hover:bg-black text-white font-bold shadow-xl shadow-rose-600/20 transition-all gap-3 border-0">
                        <Plus className="w-5 h-5" /> Register Patient
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden font-sans">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/50">
                            <th className="py-6 pl-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Medical ID</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Biological Details</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Department</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Current Lifecycle</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 pr-10 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {patients.map((pat) => (
                            <tr key={pat.id} className="group hover:bg-slate-50/50 transition-all">
                                <td className="py-8 pl-10">
                                    <p className="text-sm font-black text-slate-900 uppercase italic mb-1 leading-none">{pat.id}</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">{pat.blood}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pat.gender}</span>
                                    </div>
                                </td>
                                <td className="py-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors">
                                            {pat.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700 leading-none mb-1">{pat.name}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{pat.age} Years Old</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-8 font-black text-slate-900 text-sm uppercase italic">{pat.dept}</td>
                                <td className="py-8">
                                    <span className={cn(
                                        "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                        pat.status === 'Emergency' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                            pat.status === 'In-Patient' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                "bg-emerald-50 text-emerald-600 border-emerald-100"
                                    )}>
                                        {pat.status}
                                    </span>
                                </td>
                                <td className="py-8 pr-10 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"><Stethoscope className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"><Activity className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"><MoreHorizontal className="w-4 h-4" /></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
