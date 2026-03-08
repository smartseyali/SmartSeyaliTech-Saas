import { useState } from "react";
import {
    Home, Search, Filter, Plus,
    MoreHorizontal, MapPin, Box,
    Layers, Truck, History, Settings,
    BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Warehouses() {
    const warehouses = [
        { id: "WH-001", name: "Main Fulfillment Center", location: "Bangalore, KA", capacity: 85, items: 12400, type: "Central" },
        { id: "WH-002", name: "West Regional Hub", location: "Mumbai, MH", capacity: 42, items: 5600, type: "Regional" },
        { id: "WH-003", name: "Spares Mini-Depot", location: "Chennai, TN", capacity: 15, items: 850, type: "Satellite" },
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Home className="w-6 h-6 text-amber-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Inventory Distribution</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic">Warehouse Registry</h1>
                    <p className="text-sm font-medium text-slate-500">Manage multi-location stock storage and distribution points.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200">
                        <BarChart3 className="w-5 h-5 mr-2" /> Stock Map
                    </Button>
                    <Button className="h-12 px-8 rounded-2xl bg-amber-600 hover:bg-black text-white font-bold shadow-xl shadow-amber-600/20 transition-all gap-3 border-0">
                        <Plus className="w-5 h-5" /> Add Location
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {warehouses.map((wh) => (
                    <div key={wh.id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all group">
                        <div className="p-10">
                            <div className="flex items-start justify-between mb-8">
                                <div className="w-16 h-16 rounded-[24px] bg-slate-900 text-amber-500 flex items-center justify-center transition-transform group-hover:scale-110">
                                    <Box className="w-8 h-8" />
                                </div>
                                <span className="px-4 py-1.5 bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-full border border-slate-200">{wh.type}</span>
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase italic leading-tight">{wh.name}</h3>
                            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-8">
                                <MapPin className="w-4 h-4" /> {wh.location}
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Utilization</p>
                                        <p className="text-sm font-black text-slate-900 italic">{wh.capacity}%</p>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={cn(
                                            "h-full transition-all duration-1000",
                                            wh.capacity > 80 ? "bg-rose-500" : "bg-amber-500"
                                        )} style={{ width: `${wh.capacity}%` }} />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 leading-none">Total Stock Units</p>
                                        <p className="text-xl font-black text-slate-900 leading-none italic">{wh.items.toLocaleString()}</p>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-300 hover:text-slate-900 rounded-xl">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
