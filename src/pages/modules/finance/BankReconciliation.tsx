import { useState } from "react";
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const mockBankStatement = [
    { id: 1, date: "2024-03-20", desc: "NEFT Credit - Customer Payment", amount: 82500, type: "credit", matched: true },
    { id: 2, date: "2024-03-19", desc: "Cheque Debit - Rent Payment", amount: -45000, type: "debit", matched: true },
    { id: 3, date: "2024-03-18", desc: "RTGS Debit - Supplier ABC", amount: -120000, type: "debit", matched: false },
    { id: 4, date: "2024-03-17", desc: "Interest Credit", amount: 3200, type: "credit", matched: true },
    { id: 5, date: "2024-03-16", desc: "Cash Withdrawal", amount: -25000, type: "debit", matched: false },
    { id: 6, date: "2024-03-15", desc: "NEFT Credit - Online Sale", amount: 55000, type: "credit", matched: true },
    { id: 7, date: "2024-03-14", desc: "Bank Charges", amount: -750, type: "debit", matched: false },
];

export default function BankReconciliation() {
    const [transactions, setTransactions] = useState(mockBankStatement);
    const [selectedAccount, setSelectedAccount] = useState("HDFC Current Account");
    const [period, setPeriod] = useState("2024-03");

    const totalCredits = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalDebits = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    const unmatchedCount = transactions.filter(t => !t.matched).length;
    const matchedCount = transactions.filter(t => t.matched).length;

    const toggleMatch = (id: number) => {
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, matched: !t.matched } : t));
        toast.success("Transaction status updated");
    };

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Bank Reconciliation</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Match bank statement with book entries</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>HDFC Current Account</option>
                        <option>SBI Savings Account</option>
                        <option>ICICI Current Account</option>
                    </select>
                    <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" /> Sync
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Credits", val: `₹${totalCredits.toLocaleString()}`, clr: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
                    { label: "Total Debits", val: `₹${totalDebits.toLocaleString()}`, clr: "text-red-600", bg: "bg-red-50 border-red-200" },
                    { label: "Matched", val: `${matchedCount} entries`, clr: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
                    { label: "Unmatched", val: `${unmatchedCount} entries`, clr: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
                ].map((k) => (
                    <div key={k.label} className={`rounded-xl border p-4 ${k.bg}`}>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{k.label}</div>
                        <div className={`text-xl font-extrabold mt-1 ${k.clr}`}>{k.val}</div>
                    </div>
                ))}
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-800 text-white px-5 py-3 flex items-center justify-between">
                    <span className="font-extrabold text-xs uppercase tracking-widest">Bank Statement — {selectedAccount}</span>
                    <span className="text-xs text-slate-400">Click row to toggle match status</span>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-xs font-extrabold text-slate-600 uppercase tracking-widest">
                        <tr>
                            <th className="px-4 py-2.5 text-left">Date</th>
                            <th className="px-4 py-2.5 text-left">Description</th>
                            <th className="px-4 py-2.5 text-right">Amount</th>
                            <th className="px-4 py-2.5 text-center">Status</th>
                            <th className="px-4 py-2.5 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx, i) => (
                            <tr key={tx.id} className={`border-b border-slate-100 hover:bg-blue-50/30 transition-colors cursor-pointer ${i % 2 === 1 ? "bg-slate-50/40" : ""} ${!tx.matched ? "border-l-4 border-l-amber-400" : ""}`}
                                onClick={() => toggleMatch(tx.id)}>
                                <td className="px-4 py-2.5 text-xs font-medium text-slate-600">{tx.date}</td>
                                <td className="px-4 py-2.5 text-xs text-slate-700">{tx.desc}</td>
                                <td className={`px-4 py-2.5 text-right font-mono text-xs font-extrabold ${tx.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                    {tx.amount >= 0 ? "+" : ""}₹{Math.abs(tx.amount).toLocaleString()}
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${tx.matched ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                                        {tx.matched ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                        {tx.matched ? "Matched" : "Unmatched"}
                                    </span>
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleMatch(tx.id); }}
                                        className={`text-xs font-bold px-2 py-0.5 rounded ${tx.matched ? "text-amber-600 hover:bg-amber-50" : "text-blue-600 hover:bg-blue-50"}`}
                                    >
                                        {tx.matched ? "Unmatch" : "Mark Matched"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
