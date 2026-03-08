import { useState } from "react";
import {
    MessageSquare, Search, Filter, Plus,
    MoreHorizontal, CheckCircle2, Clock,
    MessageCircle, Settings, Share2,
    Smartphone, Zap, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Templates() {
    const templates = [
        { id: "TMPL-901", name: "order_confirmation", category: "Transactional", status: "Approved", quality: "High" },
        { id: "TMPL-902", name: "welcome_greeting", category: "Marketing", status: "Pending", quality: "-" },
        { id: "TMPL-903", name: "payment_failed_alert", category: "Transactional", status: "Approved", quality: "Medium" },
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <MessageCircle className="w-6 h-6 text-emerald-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Meta Business API</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic">Message Templates</h1>
                    <p className="text-sm font-medium text-slate-500">Manage pre-approved WhatsApp message structures for campaigns and alerts.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200">
                        <HelpCircle className="w-5 h-5 mr-2" /> Policy Guide
                    </Button>
                    <Button className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-black text-white font-bold shadow-xl shadow-emerald-600/20 transition-all gap-3 border-0">
                        <Plus className="w-5 h-5" /> New Template
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {templates.map((tpl) => (
                    <div key={tpl.id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all group flex flex-col">
                        <div className="p-10 flex-1">
                            <div className="flex items-start justify-between mb-8">
                                <div className="p-4 rounded-[20px] bg-slate-900 text-emerald-500 transition-transform group-hover:rotate-12">
                                    <Smartphone className="w-8 h-8" />
                                </div>
                                <span className={cn(
                                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                    tpl.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                        "bg-amber-50 text-amber-600 border-amber-100"
                                )}>
                                    {tpl.status}
                                </span>
                            </div>

                            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase italic leading-tight">{tpl.name}</h3>
                            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-8">
                                <Zap className="w-4 h-4" /> Category: {tpl.category}
                            </div>

                            <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 italic text-[11px] font-medium text-slate-500 leading-relaxed relative">
                                <span className="absolute -top-3 left-6 px-3 bg-white border border-slate-100 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-400">Preview Structure</span>
                                "Hi {"{1}"}, your order {"{2}"} has been successfully processed and is out for delivery. Tracking ID: {"{3}"}."
                            </div>
                        </div>

                        <div className="p-10 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 leading-none">Quality Score</p>
                                <p className={cn(
                                    "text-sm font-black italic",
                                    tpl.quality === 'High' ? "text-emerald-600" : "text-amber-600"
                                )}>{tpl.quality}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Share2 className="w-5 h-5" /></Button>
                                <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Settings className="w-5 h-5" /></Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
