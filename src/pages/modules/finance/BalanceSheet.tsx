import { useState } from "react";
import { Download, CheckCircle, AlertCircle } from "lucide-react";

const BSSection = ({ title, rows, bg = "bg-white" }: any) => (
    <div>
        <div className="bg-slate-100 px-5 py-2 font-extrabold text-xs text-slate-700 uppercase tracking-widest">{title}</div>
        {rows.map((r: any, i: number) => (
            <div key={r.label} className={`flex justify-between items-center px-5 py-2.5 border-b border-slate-50 ${r.bold ? "bg-slate-50 font-extrabold" : i % 2 === 1 ? "bg-slate-50/40" : bg} hover:bg-blue-50/30 transition-colors`}>
                <span className={`text-xs ${r.bold ? "font-extrabold text-slate-900 uppercase tracking-wide" : "font-medium text-slate-700"} ${r.indent ? "pl-4" : ""}`}>{r.label}</span>
                <span className={`font-extrabold font-mono text-xs ${r.bold ? "text-slate-900" : "text-slate-700"}`}>
                    ₹{r.val.toLocaleString()}
                </span>
            </div>
        ))}
    </div>
);

export default function BalanceSheet() {
    const [asOfDate, setAsOfDate] = useState("2024-03-31");

    // Assets
    const currentAssets = [
        { label: "Cash & Cash Equivalents", val: 982300, indent: true },
        { label: "Accounts Receivable", val: 360000, indent: true },
        { label: "Inventory / Stock", val: 540000, indent: true },
        { label: "Prepaid Expenses", val: 45000, indent: true },
        { label: "Total Current Assets", val: 1927300, bold: true },
    ];
    const nonCurrentAssets = [
        { label: "Fixed Assets (Gross)", val: 1200000, indent: true },
        { label: "Less: Accumulated Depreciation", val: 48000, indent: true },
        { label: "Net Fixed Assets", val: 1152000, indent: true },
        { label: "Intangible Assets", val: 80000, indent: true },
        { label: "Total Non-Current Assets", val: 1232000, bold: true },
    ];
    const totalAssets = 1927300 + 1232000;

    // Liabilities
    const currentLiabilities = [
        { label: "Accounts Payable", val: 240000, indent: true },
        { label: "GST / Tax Payable", val: 148500, indent: true },
        { label: "Short-term Loans", val: 200000, indent: true },
        { label: "Accrued Expenses", val: 55000, indent: true },
        { label: "Total Current Liabilities", val: 643500, bold: true },
    ];
    const nonCurrentLiabilities = [
        { label: "Long-term Loans", val: 300000, indent: true },
        { label: "Deferred Tax Liability", val: 45000, indent: true },
        { label: "Total Non-Current Liabilities", val: 345000, bold: true },
    ];
    const totalLiabilities = 643500 + 345000;

    // Equity
    const equity = [
        { label: "Share Capital", val: 1000000, indent: true },
        { label: "Retained Earnings (Opening)", val: 714500, indent: true },
        { label: "Current Year Net Profit", val: 456300, indent: true },
        { label: "Total Equity", val: 2170800, bold: true },
    ];
    const totalLiabilitiesAndEquity = totalLiabilities + 2170800;

    const isBalanced = totalAssets === totalLiabilitiesAndEquity;

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Balance Sheet</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Financial position at a point in time</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">As of Date</label>
                        <input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)}
                            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors self-end">
                        <Download className="w-3.5 h-3.5" /> Export
                    </button>
                </div>
            </div>

            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-bold ${isBalanced ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                {isBalanced ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                Assets (₹{totalAssets.toLocaleString()}) = Liabilities + Equity (₹{totalLiabilitiesAndEquity.toLocaleString()})
                {isBalanced ? " — BALANCED" : " — OUT OF BALANCE"}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {/* Assets Side */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-blue-700 text-white px-5 py-3">
                        <span className="font-extrabold text-xs uppercase tracking-widest">ASSETS</span>
                    </div>
                    <BSSection title="Current Assets" rows={currentAssets} />
                    <BSSection title="Non-Current Assets" rows={nonCurrentAssets} />
                    <div className="flex justify-between items-center px-5 py-4 bg-blue-700">
                        <span className="text-sm font-extrabold text-white uppercase tracking-widest">TOTAL ASSETS</span>
                        <span className="font-extrabold font-mono text-lg text-white">₹{totalAssets.toLocaleString()}</span>
                    </div>
                </div>

                {/* Liabilities + Equity Side */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-800 text-white px-5 py-3">
                        <span className="font-extrabold text-xs uppercase tracking-widest">LIABILITIES & EQUITY</span>
                    </div>
                    <BSSection title="Current Liabilities" rows={currentLiabilities} />
                    <BSSection title="Non-Current Liabilities" rows={nonCurrentLiabilities} />
                    <BSSection title="Shareholders' Equity" rows={equity} />
                    <div className="flex justify-between items-center px-5 py-4 bg-slate-800">
                        <span className="text-sm font-extrabold text-white uppercase tracking-widest">TOTAL L + E</span>
                        <span className="font-extrabold font-mono text-lg text-white">₹{totalLiabilitiesAndEquity.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
