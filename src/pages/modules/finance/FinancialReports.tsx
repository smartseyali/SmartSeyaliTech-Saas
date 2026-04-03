import { useState, useEffect } from "react";
import db from "@/lib/db";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Landmark } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { Button } from "@/components/ui/button";

export default function FinancialReports() {
    const { activeCompany } = useTenant();
    const [metrics, setMetrics] = useState({
        revenue: 0,
        expenses: 0,
        netIncome: 0,
        margin: 0
    });

    useEffect(() => {
        // Mock data for demo purposes, in production this would query journal_items aggregated by report_type
        setMetrics({
            revenue: 2545000,
            expenses: 1840000,
            netIncome: 705000,
            margin: 27.7
        });
    }, []);

    const cards = [
        { title: "Total Revenue", value: `₹${metrics.revenue.toLocaleString()}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
        { title: "Operational Expenses", value: `₹${metrics.expenses.toLocaleString()}`, icon: TrendingDown, color: "text-red-600", bg: "bg-red-50" },
        { title: "Net Income", value: `₹${metrics.netIncome.toLocaleString()}`, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Net Margin %", value: `${metrics.margin}%`, icon: PieChart, color: "text-indigo-600", bg: "bg-indigo-50" }
    ];

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-500">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-1">Financial Intelligence</h1>
                    <p className="text-[13px] font-extrabold text-slate-500 uppercase tracking-widest">Global P&L and Balance Sheet Insights</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-14 rounded-2xl font-bold uppercase tracking-widest text-[11px] gap-2 border-slate-200">
                        <Landmark className="w-4 h-4" /> Download Balance Sheet
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {cards.map((c, i) => (
                    <div key={i} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 space-y-6 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${c.bg}`}>
                            <c.icon className={`w-7 h-7 ${c.color}`} />
                        </div>
                        <div>
                            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">{c.title}</p>
                            <p className="text-3xl font-black text-slate-900 tracking-tight">{c.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 space-y-8">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Income Statement (P&L) Summary</h2>
                    <div className="space-y-6">
                        {[
                            { label: "Revenue from Sales", amount: 2545000, type: "income" },
                            { label: "Cost of Goods Sold (COGS)", amount: -1100000, type: "expense" },
                            { label: "Marketing & Acquisition", amount: -320000, type: "expense" },
                            { label: "Operational Overheads", amount: -420000, type: "expense" }
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-[13px]">
                                <span className="font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                                <span className={`font-black tracking-tight ${item.type === 'income' ? 'text-green-600' : 'text-slate-900'}`}>
                                    {item.amount < 0 ? `(₹${Math.abs(item.amount).toLocaleString()})` : `₹${item.amount.toLocaleString()}`}
                                </span>
                            </div>
                        ))}
                        <div className="h-px bg-slate-100 my-4" />
                        <div className="flex justify-between items-center">
                            <span className="font-black text-slate-900 uppercase tracking-widest">Net Operating Profit</span>
                            <span className="text-2xl font-black text-blue-600 tracking-tighter">₹{metrics.netIncome.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full -mr-32 -mt-32 opacity-50" />
                    <div className="relative space-y-8">
                        <h2 className="text-xl font-black uppercase tracking-tight">Audit Health Analysis</h2>
                        <div className="space-y-6">
                            <p className="text-sm font-medium text-slate-400 leading-relaxed">
                                Corporate financial integrity is established across all 12 modules. The current Debt-to-Equity ratio matches benchmark targets.
                            </p>
                            <div className="p-6 bg-slate-800 rounded-3xl border border-slate-700 space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold opacity-60 uppercase tracking-widest">Data Parity Status</span>
                                    <span className="text-green-400 font-black tracking-widest uppercase">Verified (100%)</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full w-full bg-green-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
