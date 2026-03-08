import { useState } from "react";
import {
    MessageSquare, Search, Filter, Plus,
    MoreHorizontal, Clock, AlertCircle,
    CheckCircle2, User, Headphones,
    LifeBuoy, Zap, Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Tickets() {
    const [tickets] = useState([
        { id: "TKT-102", subject: "Payment Gateway Integration Error", user: "Sarah Jenkins", priority: "High", status: "Open", assignee: "Alex" },
        { id: "TKT-103", subject: "Bulk Import Timeout", user: "Michael Chen", priority: "Critical", status: "In-Progress", assignee: "David" },
        { id: "TKT-104", subject: "Custom Domain Config", user: "Innovate AI", priority: "Low", status: "Closed", assignee: "Unassigned" },
    ]);

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Headphones className="w-6 h-6 text-cyan-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Support Operations</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic">Support Tickets</h1>
                    <p className="text-sm font-medium text-slate-500">Manage customer inquiries and technical support requests.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200">
                        <LifeBuoy className="w-5 h-5 mr-2" /> Help Docs
                    </Button>
                    <Button className="h-12 px-8 rounded-2xl bg-cyan-600 hover:bg-black text-white font-bold shadow-xl shadow-cyan-600/20 transition-all gap-3 border-0">
                        <Plus className="w-5 h-5" /> New Ticket
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {tickets.map((t) => (
                    <div key={t.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex items-start gap-8">
                        <div className={cn(
                            "w-16 h-16 rounded-[24px] flex items-center justify-center transition-transform group-hover:scale-110 shrink-0",
                            t.status === 'Open' ? "bg-cyan-50 text-cyan-600" :
                                t.status === 'In-Progress' ? "bg-amber-50 text-amber-500" :
                                    "bg-slate-50 text-slate-400"
                        )}>
                            <Tag className="w-8 h-8 rotate-12" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-4 mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-r pr-4 border-slate-100">{t.id}</span>
                                <span className={cn(
                                    "px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                    t.priority === 'Critical' ? "bg-rose-50 text-rose-600" :
                                        t.priority === 'High' ? "bg-amber-50 text-amber-600" :
                                            "bg-slate-50 text-slate-500"
                                )}>
                                    {t.priority} Priority
                                </span>
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase italic leading-tight mb-4 truncate group-hover:text-cyan-600 transition-colors">{t.subject}</h3>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    <User className="w-3.5 h-3.5" /> {t.user}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    <Zap className="w-3.5 h-3.5" /> Assigned to: {t.assignee}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-4 shrink-0">
                            <span className={cn(
                                "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                                t.status === 'Open' ? "text-cyan-600" :
                                    t.status === 'In-Progress' ? "text-amber-500" :
                                        "text-emerald-500"
                            )}>
                                <span className={cn("w-1.5 h-1.5 rounded-full",
                                    t.status === 'Open' ? "bg-cyan-500 animate-pulse" :
                                        t.status === 'In-Progress' ? "bg-amber-500" :
                                            "bg-emerald-500"
                                )} />
                                {t.status}
                            </span>
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-slate-400 hover:bg-slate-50"><MoreHorizontal className="w-5 h-5" /></Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
