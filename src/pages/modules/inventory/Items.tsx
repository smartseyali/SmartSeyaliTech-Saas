import { Boxes, Search, Filter, Plus, Mail, Phone, MoreHorizontal, Package, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Items() {
    const [items] = useState([
        { id: 1, name: "Premium Cotton T-Shirt", sku: "TS-1001", category: "Apparel", stock: 154, price: 999, status: "In Stock" },
        { id: 2, name: "Wireless Bluetooth Buds", sku: "EB-2002", category: "Electronics", stock: 42, price: 2499, status: "Low Stock" },
        { id: 3, name: "Leather Messenger Bag", sku: "BG-3003", category: "Accessories", stock: 12, price: 4500, status: "Low Stock" },
        { id: 4, name: "Canvas High Tops", sku: "SH-4004", category: "Footwear", stock: 0, price: 3200, status: "Out of Stock" },
    ]);

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Boxes className="w-6 h-6 text-amber-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Inventory Distribution Matrix</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic leading-none">Stock Items</h1>
                    <p className="text-sm font-medium text-slate-500">Global resource catalog and stock status registry.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center bg-slate-100 rounded-2xl px-4 h-12 border border-slate-200 shadow-inner">
                        <Search className="w-4 h-4 text-slate-400 mr-2" />
                        <input type="text" placeholder="Search items or SKUs..." className="bg-transparent border-0 focus:ring-0 text-sm w-48 font-medium" />
                    </div>
                    <Button className="h-12 px-8 rounded-2xl bg-amber-600 hover:bg-black text-white font-bold shadow-xl shadow-amber-600/20 transition-all gap-3 border-0">
                        <Plus className="w-5 h-5" /> Resource Registry
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500">
                <div className="p-10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 pl-4">Item Entity</th>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">SKU/ID</th>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Category</th>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Yield Price</th>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Stock Node</th>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Status</th>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right pr-4">Matrix</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {items.map((item) => (
                                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-6 pl-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner transition-transform group-hover:scale-110">
                                                    <Package className="w-6 h-6" />
                                                </div>
                                                <p className="font-bold text-slate-900 uppercase italic leading-none">{item.name}</p>
                                            </div>
                                        </td>
                                        <td className="py-6">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.sku}</p>
                                        </td>
                                        <td className="py-6">
                                            <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Tag className="w-3.5 h-3.5 text-slate-300" /> {item.category}</p>
                                        </td>
                                        <td className="py-6 font-black text-slate-900 tracking-tighter">
                                            {fmt(item.price)}
                                        </td>
                                        <td className="py-6">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[11px] font-black text-slate-900">{item.stock}</span>
                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                                    <div className={cn("h-full rounded-full transition-all duration-1000", item.stock > 100 ? "bg-emerald-500" : item.stock > 0 ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${Math.min(100, (item.stock / 200) * 100)}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6">
                                            <span className={cn(
                                                "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                item.status === 'In Stock' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    item.status === 'Low Stock' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                        "bg-rose-50 text-rose-600 border-rose-100"
                                            )}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="py-6 text-right pr-4">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 transition-all hover:text-slate-900 hover:border-slate-100"><MoreHorizontal className="w-4 h-4" /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
