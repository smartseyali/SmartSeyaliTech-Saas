import { Users, Search, Filter, Plus, Mail, Phone, MoreHorizontal, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Contacts() {
    const [contacts] = useState([
        { id: 1, name: "Sarah Jenkins", role: "Sales Director", company: "Jenkins Solutions", email: "sarah@jenkins.com", phone: "+1 234 567 890", location: "New York" },
        { id: 2, name: "Michael Chen", role: "CTO", company: "Chen Tech", email: "michael@chen.com", phone: "+1 234 567 891", location: "San Francisco" },
        { id: 3, name: "John Doe", role: "Founder", company: "Doe Corp", email: "john@doe.com", phone: "+1 234 567 892", location: "London" },
        { id: 4, name: "Laura Palmer", role: "Marketing Head", company: "Retail Inc.", email: "laura@retail.com", phone: "+1 234 567 893", location: "Seattle" },
    ]);

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-violet-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Relationship Intelligence Matrix</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic">Corporate Contacts</h1>
                    <p className="text-sm font-medium text-slate-500">Global directory of verified decision makers.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center bg-slate-100 rounded-2xl px-4 h-12 border border-slate-200 shadow-inner">
                        <Search className="w-4 h-4 text-slate-400 mr-2" />
                        <input type="text" placeholder="Search contacts..." className="bg-transparent border-0 focus:ring-0 text-sm w-48 font-medium" />
                    </div>
                    <Button className="h-12 px-8 rounded-2xl bg-violet-600 hover:bg-black text-white font-bold shadow-xl shadow-violet-600/20 transition-all gap-3 border-0">
                        <Plus className="w-5 h-5" /> Resource Registry
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {contacts.map((contact) => (
                    <div key={contact.id} className="group bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-violet-200 transition-all duration-500 relative flex flex-col justify-between overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <Users className="w-24 h-24 -rotate-12 translate-x-8 translate-y-4" />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <div className="p-4 rounded-2xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center shadow-inner transition-transform group-hover:scale-110">
                                    <span className="text-lg font-black uppercase tracking-tighter">{contact.name.charAt(0)}</span>
                                </div>
                                <button className="p-2 border border-slate-50 rounded-xl text-slate-300 hover:text-slate-900 hover:border-slate-100 transition-all"><MoreHorizontal className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-4 relative z-10">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-none group-hover:text-violet-600 transition-colors uppercase italic">{contact.name}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{contact.role}</p>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Building2 className="w-3.5 h-3.5" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{contact.company}</span>
                                </div>
                                <div className="w-10 h-1 bg-violet-600/10 rounded-full" />
                            </div>
                        </div>
                        <div className="pt-8 flex gap-3 relative z-10">
                            <Button className="flex-1 h-12 rounded-xl bg-slate-900 text-white hover:bg-black font-black uppercase text-[9px] tracking-[0.2em] shadow-lg border-0">Email</Button>
                            <Button variant="outline" className="flex-1 h-12 rounded-xl border border-slate-100 font-black uppercase text-[9px] tracking-[0.2em] text-slate-400 hover:text-slate-900 hover:bg-slate-50">Dial</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
