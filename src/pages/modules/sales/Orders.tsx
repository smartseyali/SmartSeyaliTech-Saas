import { useState } from "react";
import {
    ShoppingBag, Search, Filter, Plus,
    MoreHorizontal, Truck, CheckCircle2,
    XCircle, Clock, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Orders() {
    const [orders] = useState([
        { id: "SO-1002", customer: "Digital Wave", amount: 156000, date: "2024-03-08", delivery: "Today", status: "Processing" },
        { id: "SO-1001", customer: "Green Earth Ltd", amount: 25000, date: "2024-03-07", delivery: "Completed", status: "Delivered" },
        { id: "SO-1000", customer: "Innovate AI", amount: 520000, date: "2024-03-06", delivery: "Delayed", status: "Hold" },
    ]);

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-6 h-6 text-indigo-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Order Fulfillment</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic">Sales Orders</h1>
                    <p className="text-sm font-medium text-slate-500">Track and manage active customer orders.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-black text-white font-bold shadow-xl shadow-indigo-600/20 transition-all gap-3 border-0">
                        <Plus className="w-5 h-5" /> New Order
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {orders.map((o) => (
                    <div key={o.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <div className="w-16 h-16 rounded-[20px] bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Package className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 mb-1 leading-none uppercase italic">{o.id} <span className="text-slate-300 ml-2">/</span> <span className="text-slate-400 ml-2">{o.customer}</span></h3>
                                <div className="flex items-center gap-4 mt-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Booked {o.date}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> ETA: {o.delivery}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-12">
                            <div className="text-right">
                                <p className="text-2xl font-black text-indigo-600 leading-none mb-1">{fmt(o.amount)}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Valuation</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                                    o.status === 'Delivered' ? "bg-emerald-500 text-white" :
                                        o.status === 'Processing' ? "bg-indigo-600 text-white" :
                                            "bg-amber-500 text-white"
                                )}>
                                    {o.status === 'Delivered' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                    {o.status === 'Processing' && <Clock className="w-3.5 h-3.5 animate-spin-slow" />}
                                    {o.status}
                                </span>
                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-slate-400 hover:bg-slate-50"><MoreHorizontal className="w-5 h-5" /></Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
