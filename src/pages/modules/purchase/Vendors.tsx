import { Users, Search, Plus, Mail, Phone, MoreHorizontal, Building2, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Vendors() {
    const [vendors] = useState([
        { id: 1, name: "Global Logistics Ltd", category: "Shipping", rating: 4.8, status: "Verified", contact: "Mark Stevens", email: "mark@global.com" },
        { id: 2, name: "TechParts Supply", category: "Hardware", rating: 4.5, status: "Preferred", contact: "Anna Wong", email: "anna@techparts.com" },
        { id: 3, name: "Nexus Materials", category: "Raw Goods", rating: 4.2, status: "Active", contact: "David Miller", email: "david@nexus.com" },
        { id: 4, name: "Prime Packaging", category: "Packing", rating: 4.9, status: "Verified", contact: "Sarah Gray", email: "sarah@prime.com" },
    ]);

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-rose-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Procurement Matrix Hub</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic leading-none">Vendor Registry</h1>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        Supply Origin Status: <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full text-[9px] font-bold border border-rose-100">STABLE</span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center bg-slate-100 rounded-2xl px-4 h-12 border border-slate-200 shadow-inner">
                        <Search className="w-4 h-4 text-slate-400 mr-2" />
                        <input type="text" placeholder="Search suppliers..." className="bg-transparent border-0 focus:ring-0 text-sm w-48 font-medium" />
                    </div>
                    <Button className="h-12 px-8 rounded-2xl bg-rose-600 hover:bg-black text-white font-bold shadow-xl shadow-rose-600/20 transition-all gap-3 border-0">
                        <Plus className="w-5 h-5" /> Enlist Supplier
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {vendors.map((vendor) => (
                    <div key={vendor.id} className="group bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-rose-200 transition-all duration-500 relative flex flex-col justify-between overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <ShieldCheck className="w-24 h-24 -rotate-12 translate-x-8 translate-y-4" />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div className="p-5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shadow-inner transition-transform group-hover:scale-110">
                                    <Building2 className="w-7 h-7" />
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${vendor.status === 'Verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                    {vendor.status}
                                </span>
                            </div>
                            <div className="space-y-6 relative z-10">
                                <div>
                                    <h3 className="text-2xl font-bold tracking-tighter text-slate-900 group-hover:text-rose-600 transition-colors uppercase italic leading-none">{vendor.name}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{vendor.category}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} className={`w-3 h-3 ${s <= Math.floor(vendor.rating) ? 'fill-rose-500 text-rose-500' : 'text-slate-100'}`} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-900">{vendor.rating}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                        <Users className="w-3.5 h-3.5 text-slate-300" /> {vendor.contact}
                                    </p>
                                    <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-slate-300" /> {vendor.email}
                                    </p>
                                </div>
                                <div className="w-12 h-1 bg-rose-600/10 rounded-full" />
                            </div>
                        </div>
                        <div className="pt-10 flex gap-3 relative z-10">
                            <Button className="flex-1 h-14 rounded-2xl bg-slate-900 text-white hover:bg-black font-black uppercase text-[10px] tracking-[0.2em] shadow-lg border-0">Purchase</Button>
                            <Button variant="outline" className="flex-1 h-14 rounded-2xl border border-slate-100 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 hover:text-slate-900 hover:bg-slate-50">Profile</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
