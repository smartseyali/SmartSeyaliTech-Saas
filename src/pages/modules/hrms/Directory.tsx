import { Users, Search, Plus, Mail, Phone, MoreHorizontal, UserCheck, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Directory() {
    const [employees] = useState([
        { id: 1, name: "Sarah Smith", role: "Frontend Lead", dept: "Engineering", email: "sarah@smartseyali.com", status: "Active", location: "Global Office" },
        { id: 2, name: "John Doe", role: "Product Manager", dept: "Product", email: "john@smartseyali.com", status: "On Leave", location: "Remote Node" },
        { id: 3, name: "Michael Chen", role: "Backend Architect", dept: "Engineering", email: "michael@smartseyali.com", status: "Active", location: "Global Office" },
        { id: 4, name: "Emma Wilson", role: "UI Designer", dept: "Design", email: "emma@smartseyali.com", status: "Active", location: "Creative Hub" },
    ]);

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-emerald-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">People Intelligence Matrix</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic leading-none">Employee Directory</h1>
                    <p className="text-sm font-medium text-slate-500">Corporate resource registry of active personnel.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center bg-slate-100 rounded-2xl px-4 h-12 border border-slate-200 shadow-inner">
                        <Search className="w-4 h-4 text-slate-400 mr-2" />
                        <input type="text" placeholder="Filter personnel..." className="bg-transparent border-0 focus:ring-0 text-sm w-48 font-medium" />
                    </div>
                    <Button className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-black text-white font-bold shadow-xl shadow-emerald-600/20 transition-all gap-3 border-0">
                        <Plus className="w-5 h-5" /> Resource Entry
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {employees.map((emp) => (
                    <div key={emp.id} className="group bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-emerald-200 transition-all duration-500 relative flex flex-col justify-between overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <UserCheck className="w-24 h-24 -rotate-12 translate-x-8 translate-y-4" />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div className="p-5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-inner transition-transform group-hover:scale-110">
                                    <span className="text-xl font-black">{emp.name.split(' ').map(n => n[0]).join('')}</span>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${emp.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                    {emp.status}
                                </span>
                            </div>
                            <div className="space-y-6 relative z-10">
                                <div>
                                    <h3 className="text-2xl font-bold tracking-tighter text-slate-900 group-hover:text-emerald-600 transition-colors uppercase italic leading-none">{emp.name}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{emp.role}</p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Building2 className="w-4 h-4" />
                                        <span className="text-[11px] font-bold uppercase tracking-widest leading-none">{emp.dept}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-[11px] font-bold uppercase tracking-widest leading-none">{emp.location}</span>
                                    </div>
                                </div>
                                <div className="w-12 h-1 bg-emerald-600/10 rounded-full" />
                            </div>
                        </div>
                        <div className="pt-10 flex gap-3 relative z-10">
                            <Button className="flex-1 h-14 rounded-2xl bg-slate-900 text-white hover:bg-black font-black uppercase text-[10px] tracking-[0.2em] shadow-lg border-0">Connect</Button>
                            <Button variant="outline" className="flex-1 h-14 rounded-2xl border border-slate-100 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 hover:text-slate-900 hover:bg-slate-50">Profile</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
