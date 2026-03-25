import { Zap, Search, Plus, Mail, Phone, MoreHorizontal, ShoppingCart, CreditCard, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Terminal() {
    const [cart] = useState([
        { id: 1, name: "Premium Cotton T-Shirt", price: 999, qty: 2 },
        { id: 2, name: "Wireless Bluetooth Buds", price: 2499, qty: 1 },
    ]);

    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

    return (
        <div className="h-full flex flex-col md:flex-row p-8 gap-8 animate-in fade-in duration-500 overflow-hidden pb-20">
            {/* Products Selection */}
            <div className="flex-1 space-y-8 overflow-y-auto pr-4 scrollbar-hide">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Zap className="w-6 h-6 text-violet-600" />
                            <span className="text-xs font-bold  tracking-widest text-slate-500">Terminal Node Alpha</span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900   leading-none">POS Terminal</h1>
                        <p className="text-sm font-medium text-slate-500">Retail transaction engine and billing matrix.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center bg-slate-100 rounded-3xl px-6 h-14 border border-slate-200 shadow-inner group">
                            <Search className="w-5 h-5 text-slate-500 mr-3 group-focus-within:text-violet-600 transition-colors" />
                            <input type="text" placeholder="Barcode or Resource SKU..." className="bg-transparent border-0 focus:ring-0 text-sm w-64 font-medium" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="group bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-violet-200 transition-all duration-500 cursor-pointer flex flex-col items-center text-center gap-4 relative overflow-hidden">
                            <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 transition-transform group-hover:scale-110 shadow-inner group-hover:bg-violet-50 group-hover:text-violet-300">
                                <Zap className="w-10 h-10" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-slate-900   truncate max-w-full leading-tight">Product Node {i}</h3>
                                <p className="text-xs font-bold text-blue-600 tracking-tighter  leading-none">{fmt(999 + i)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cart & Billing Matrix */}
            <div className="w-full md:w-[450px] bg-slate-900 rounded-[48px] p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl group-hover:bg-violet-600/20 transition-all" />

                <div className="relative z-10 flex flex-col h-full space-y-10">
                    <div className="flex items-center justify-between border-b border-white/5 pb-8">
                        <h2 className="text-2xl font-bold tracking-tight text-white   leading-none">Order Stack</h2>
                        <span className="text-xs font-bold text-slate-500  tracking-widest">Matrix Billing</span>
                    </div>

                    <div className="flex-1 space-y-6 overflow-y-auto pr-2 scrollbar-hide">
                        {cart.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-6 rounded-[28px] bg-white/5 border border-white/5 group/item hover:bg-white/10 transition-all">
                                <div className="space-y-1">
                                    <p className="font-bold text-white text-sm   leading-tight">{item.name}</p>
                                    <p className="text-xs font-bold text-slate-500  tracking-widest">{item.qty} UNIT(S) • {fmt(item.price)}</p>
                                </div>
                                <span className="text-lg font-bold text-white tracking-tighter ">{fmt(item.price * item.qty)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6 border-t border-white/10 pt-10">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-bold text-slate-500  tracking-widest leading-none">Matrix Total Yield</span>
                            <span className="text-4xl font-bold text-white tracking-tighter  leading-none">{fmt(total)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button className="h-16 rounded-[24px] bg-white text-slate-900 hover:bg-blue-500 hover:text-white font-bold  text-xs tracking-widest transition-all gap-3 border-0 transition-all flex flex-col items-center justify-center py-0">
                                <CreditCard className="w-5 h-5" />
                                <span>Digital Link</span>
                            </Button>
                            <Button className="h-16 rounded-[24px] bg-white/5 border border-white/10 text-white hover:bg-emerald-600 font-bold  text-xs tracking-widest transition-all gap-3 flex flex-col items-center justify-center py-0">
                                <Banknote className="w-5 h-5" />
                                <span>Physical Asset</span>
                            </Button>
                        </div>

                        <Button className="w-full h-18 rounded-[24px] bg-violet-600 text-white hover:bg-violet-700 font-bold  text-xs tracking-widest shadow-2xl shadow-violet-900 transition-all mt-4 border-0">
                            Finalize Transaction
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
