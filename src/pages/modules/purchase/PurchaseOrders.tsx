import { useState } from "react";
import {
    FileStack, Search, Filter, Plus,
    MoreHorizontal, ShoppingCart, Truck,
    CheckCircle2, Clock, Package,
    FileText, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PurchaseOrders() {
    const orders = [
        { id: "PO-5002", vendor: "Wholesale Corp", amount: 245000, date: "2024-03-08", delivery: "Pending", status: "Issued" },
        { id: "PO-5001", vendor: "Tech Components", amount: 85000, date: "2024-03-05", delivery: "Completed", status: "Received" },
        { id: "PO-5000", vendor: "Apex Logistics", amount: 12000, date: "2024-03-02", delivery: "Today", status: "Closed" },
    ];

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <FileStack className="w-6 h-6 text-pink-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Procurement Operations</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic">Purchase Orders</h1>
                    <p className="text-sm font-medium text-slate-500">Monitor supply chain orders and vendor fulfillment status.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button className="h-12 px-8 rounded-2xl bg-pink-600 hover:bg-black text-white font-bold shadow-xl shadow-pink-600/20 transition-all gap-3 border-0">
                        <Plus className="w-5 h-5" /> New Purchase Order
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {orders.map((o) => (
                    <div key={o.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <div className="w-16 h-16 rounded-[20px] bg-pink-50 flex items-center justify-center text-pink-600">
                                <ShoppingCart className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 mb-1 leading-none uppercase italic">{o.id} <span className="text-slate-300 mx-2">/</span> <span className="text-slate-400 capitalize">{o.vendor}</span></h3>
                                <div className="flex items-center gap-4 mt-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Placed {o.date}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Delivery: {o.delivery}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-12">
                            <div className="text-right">
                                <p className="text-2xl font-black text-pink-600 leading-none mb-1">{fmt(o.amount)}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Cost</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                                    o.status === 'Received' ? "bg-emerald-500 text-white" :
                                        o.status === 'Issued' ? "bg-sky-500 text-white" :
                                            "bg-slate-900 text-white"
                                )}>
                                    {o.status === 'Received' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                    {o.status === 'Issued' && <Clock className="w-3.5 h-3.5 animate-spin-slow" />}
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
