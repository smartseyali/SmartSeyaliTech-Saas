import { useState } from "react";
import { TrendingUp, TrendingDown, Download } from "lucide-react";

const Section = ({ title, rows, isBold }: { title: string; rows: any[]; isBold?: boolean }) => (
    <div>
        <div className="bg-slate-100 px-5 py-2 font-extrabold text-xs text-slate-700 uppercase tracking-widest">{title}</div>
        {rows.map((r, i) => (
            <div key={r.label} className={`flex justify-between items-center px-5 py-2.5 border-b border-slate-50 ${i % 2 === 1 ? "bg-slate-50/40" : "bg-white"} hover:bg-blue-50/30 transition-colors`}>
                <span className={`text-xs ${isBold || r.bold ? "font-extrabold text-slate-900" : "font-medium text-slate-700"}`}>{r.label}</span>
                <span className={`font-extrabold font-mono text-xs ${r.val >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                    {r.val < 0 ? "(" : ""}₹{Math.abs(r.val).toLocaleString()}{r.val < 0 ? ")" : ""}
                </span>
            </div>
        ))}
    </div>
);

export default function ProfitLoss() {
    const [period, setPeriod] = useState("2024-03");
    const [compareMode, setCompareMode] = useState(false);

    const revenue = [
        { label: "Product Sales", val: 1640000 },
        { label: "Service Revenue", val: 202500 },
        { label: "Other Income", val: 33500 },
        { label: "Total Revenue", val: 1876000, bold: true },
    ];

    const cogs = [
        { label: "Raw Materials / Inventory", val: -680000 },
        { label: "Direct Labour", val: -120000 },
        { label: "Manufacturing Overhead", val: -20000 },
        { label: "Total COGS", val: -820000, bold: true },
    ];

    const grossProfit = 1876000 - 820000;

    const opex = [
        { label: "Salaries & Wages", val: -380000 },
        { label: "Rent & Utilities", val: -214000 },
        { label: "Marketing & Advertising", val: -85000 },
        { label: "Depreciation & Amortisation", val: -48000 },
        { label: "Administrative Expenses", val: -81000 },
        { label: "Total Operating Expenses", val: -808000, bold: true },
    ];

    const operatingProfit = grossProfit - 808000;

    const other = [
        { label: "Interest Income", val: 33500 },
        { label: "Interest Expense", val: -48000 },
        { label: "Net Other Income/(Expense)", val: -14500, bold: true },
    ];

    const netProfitBeforeTax = operatingProfit - 14500;
    const tax = -netProfitBeforeTax * 0.25;
    const netProfit = netProfitBeforeTax + tax;

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Profit & Loss Statement</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Income statement for the selected period</p>
                </div>
                <div className="flex items-center gap-3">
                    <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                        <Download className="w-3.5 h-3.5" /> Export PDF
                    </button>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Revenue", val: `₹${(1876000).toLocaleString()}`, icon: TrendingUp, clr: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Gross Profit", val: `₹${grossProfit.toLocaleString()}`, icon: TrendingUp, clr: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Operating Profit", val: `₹${operatingProfit.toLocaleString()}`, icon: TrendingUp, clr: "text-violet-600", bg: "bg-violet-50" },
                    { label: "Net Profit", val: `₹${Math.round(netProfit).toLocaleString()}`, icon: netProfit >= 0 ? TrendingUp : TrendingDown, clr: netProfit >= 0 ? "text-emerald-700" : "text-red-600", bg: netProfit >= 0 ? "bg-emerald-50" : "bg-red-50" },
                ].map((k) => (
                    <div key={k.label} className={`${k.bg} rounded-xl border border-slate-200 p-4 flex items-center gap-3`}>
                        <k.icon className={`w-8 h-8 ${k.clr}`} />
                        <div>
                            <div className="text-xs font-bold text-slate-500">{k.label}</div>
                            <div className={`text-lg font-extrabold ${k.clr}`}>{k.val}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* P&L Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-800 text-white px-5 py-3 flex justify-between items-center">
                    <span className="font-extrabold text-xs uppercase tracking-widest">Profit & Loss — {period}</span>
                    <span className="text-xs text-slate-400">Amounts in ₹</span>
                </div>

                <Section title="A. Revenue" rows={revenue} />

                <Section title="B. Cost of Goods Sold" rows={cogs} />

                <div className="flex justify-between items-center px-5 py-3 bg-blue-50 border-b-2 border-blue-200">
                    <span className="text-sm font-extrabold text-blue-900 uppercase tracking-wide">GROSS PROFIT (A - B)</span>
                    <span className="font-extrabold font-mono text-sm text-blue-700">₹{grossProfit.toLocaleString()}</span>
                </div>

                <Section title="C. Operating Expenses" rows={opex} />

                <div className="flex justify-between items-center px-5 py-3 bg-violet-50 border-b-2 border-violet-200">
                    <span className="text-sm font-extrabold text-violet-900 uppercase tracking-wide">OPERATING PROFIT</span>
                    <span className={`font-extrabold font-mono text-sm ${operatingProfit >= 0 ? "text-violet-700" : "text-red-600"}`}>
                        ₹{Math.abs(operatingProfit).toLocaleString()}
                    </span>
                </div>

                <Section title="D. Other Income / (Expense)" rows={other} />

                <div className="flex justify-between items-center px-5 py-3 bg-slate-100 border-b border-slate-200">
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">Profit Before Tax</span>
                    <span className="font-extrabold font-mono text-xs text-slate-800">₹{netProfitBeforeTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center px-5 py-2.5 bg-white border-b border-slate-100">
                    <span className="text-xs font-medium text-slate-600">Income Tax (25%)</span>
                    <span className="font-extrabold font-mono text-xs text-red-500">(₹{Math.abs(Math.round(tax)).toLocaleString()})</span>
                </div>

                <div className={`flex justify-between items-center px-5 py-4 ${netProfit >= 0 ? "bg-emerald-600" : "bg-red-600"}`}>
                    <span className="text-sm font-extrabold text-white uppercase tracking-widest">NET PROFIT / (LOSS)</span>
                    <span className="font-extrabold font-mono text-lg text-white">₹{Math.round(netProfit).toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}
