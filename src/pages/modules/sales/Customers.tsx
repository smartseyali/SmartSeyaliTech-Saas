import { useState } from "react";
import {
    Users, Search, Filter, Plus,
    MoreHorizontal, Building2, MapPin,
    Phone, Mail, TrendingUp, History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Customers() {
    const [customers] = useState([
        { id: "CUS-001", name: "Acme Corp", contact: "John Walker", location: "New York, US", revenue: 850000, status: "Key Account" },
        { id: "CUS-002", name: "Globex Inc", contact: "Sarah Miller", location: "London, UK", revenue: 420000, status: "Active" },
        { id: "CUS-003", name: "Eco Power", contact: "David Sun", location: "Singapore", revenue: 120000, status: "Prospect" },
    ]);

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-indigo-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Relationship Management</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic">Customer Directory</h1>
                    <p className="text-sm font-medium text-slate-500">Consolidated database of all business customers.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-black text-white font-bold shadow-xl shadow-indigo-600/20 transition-all gap-3 border-0">
                        <Plus className="w-5 h-5" /> Add Customer
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.map((c) => (
                    <div key={c.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            <Building2 className="w-24 h-24" />
                        </div>
                        <div className="flex items-start justify-between mb-8 relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl italic uppercase">
                                {c.name.charAt(0)}
                            </div>
                            <span className={cn(
                                "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                c.status === 'Key Account' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                    c.status === 'Active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                        "bg-slate-50 text-slate-400 border-slate-100"
                            )}>
                                {c.status}
                            </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2 uppercase italic tracking-tight">{c.name}</h3>
                        <div className="space-y-3 mb-8">
                            <div className="flex items-center gap-3 text-slate-500 text-[11px] font-bold">
                                <MapPin className="w-3.5 h-3.5" /> {c.location}
                            </div>
                            <div className="flex items-center gap-3 text-slate-500 text-[11px] font-bold">
                                <Building2 className="w-3.5 h-3.5" /> POC: {c.contact}
                            </div>
                        </div>
                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 leading-none">Lifetime Value</p>
                                <p className="text-lg font-black text-slate-900 leading-none">{fmt(c.revenue)}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-indigo-50 hover:text-indigo-600"><Phone className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-indigo-50 hover:text-indigo-600"><History className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
