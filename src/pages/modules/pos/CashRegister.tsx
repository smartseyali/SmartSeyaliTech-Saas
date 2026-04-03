import { useState, useEffect } from "react";
import db from "@/lib/db";
import { CreditCard, Wallet, ArrowRight, Printer, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CashRegister() {
    const [shiftStatus, setShiftStatus] = useState("opened"); // opened, closed
    const [registerData, setRegisterData] = useState({
        openingBalance: 5000,
        cashSales: 15420,
        cardSales: 28500,
        totalSales: 43920
    });

    const handleCloseShift = () => {
        toast.success("Register shift closed successfully. Shift Summary printed.");
        setShiftStatus("closed");
    };

    return (
        <div className="p-8 space-y-10 animate-in zoom-in-95 duration-500">
            <header className="flex items-center justify-between bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
                        <Wallet className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Cash Register Terminal</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Status: Currently Operational</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="h-14 rounded-2xl font-bold uppercase tracking-widest text-[11px] gap-2 border-slate-200 shadow-sm">
                        <Printer className="w-4 h-4" /> Print X-Report
                    </Button>
                    <Button 
                        onClick={handleCloseShift}
                        className="h-14 px-8 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-[11px] gap-2 shadow-xl shadow-red-100"
                    >
                        <AlertTriangle className="w-4 h-4" /> Close Shift
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sales Breakdown */}
                <div className="bg-white rounded-[3rem] border border-slate-200 p-10 space-y-10 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                        Sales Distribution
                    </h2>
                    
                    <div className="space-y-6">
                        <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                    <Wallet className="w-5 h-5 text-green-600" />
                                </div>
                                <p className="font-extrabold text-slate-500 uppercase tracking-widest text-xs">Cash In-Hand</p>
                            </div>
                            <p className="text-2xl font-black text-slate-900">₹{registerData.cashSales.toLocaleString()}</p>
                        </div>

                        <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                    <CreditCard className="w-5 h-5 text-indigo-600" />
                                </div>
                                <p className="font-extrabold text-slate-500 uppercase tracking-widest text-xs">Card / Digital</p>
                            </div>
                            <p className="text-2xl font-black text-slate-900">₹{registerData.cardSales.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Aggregate Shift Revenue</p>
                        <p className="text-4xl font-black text-blue-600 tracking-tighter">₹{registerData.totalSales.toLocaleString()}</p>
                    </div>
                </div>

                {/* Opening & Cash Audit */}
                <div className="bg-slate-950 rounded-[3rem] p-10 text-white space-y-10 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-slate-900 rounded-full -mr-40 -mt-40 opacity-50 blur-3xl" />
                    
                    <div className="relative">
                        <h2 className="text-xl font-black uppercase tracking-tight mb-10 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                            Security & Audit
                        </h2>

                        <div className="space-y-8">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-500 uppercase tracking-widest">Opening Balance</span>
                                <span className="font-black">₹{registerData.openingBalance.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-500 uppercase tracking-widest">Expected Cash Balance</span>
                                <span className="font-black text-green-400">₹{(registerData.openingBalance + registerData.cashSales).toLocaleString()}</span>
                            </div>
                            
                            <div className="h-px bg-slate-800 my-8" />

                            <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-red-500">Security Alert</h3>
                                <p className="text-sm font-medium text-slate-400 leading-relaxed">
                                    Cash balance exceeds the configured ₹20,000 threshold. Suggesting immediate "Cash Drop" to safety vault.
                                </p>
                                <Button className="w-full h-14 rounded-2xl bg-white text-slate-950 font-black uppercase tracking-widest text-[11px] hover:bg-slate-100 transition-all gap-2">
                                    Process Cash Drop <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
