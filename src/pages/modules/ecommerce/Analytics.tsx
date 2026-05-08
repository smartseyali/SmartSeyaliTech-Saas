import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import {
    BarChart3, TrendingUp, DollarSign, ShoppingBag, Users,
    ArrowUpRight, ArrowDownRight, RefreshCw, Calendar,
} from "lucide-react";

type DailyRow = {
    order_date: string;
    orders_count: number;
    revenue: number;
    avg_order_value: number;
    unique_customers: number;
    cod_orders: number;
    online_orders: number;
    cancelled_orders: number;
};

type Totals = {
    revenue: number;
    orders: number;
    avgOrderValue: number;
    uniqueCustomers: number;
};

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function Analytics() {
    const { activeCompany } = useTenant();
    const [rows, setRows] = useState<DailyRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<7 | 30 | 90>(30);

    useEffect(() => { if (activeCompany) load(); }, [activeCompany?.id, period]);

    const load = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const since = new Date(Date.now() - period * 24 * 3600 * 1000).toISOString().split("T")[0];
        const { data } = await supabase
            .from("v_ecom_analytics")
            .select("*")
            .eq("company_id", activeCompany.id)
            .gte("order_date", since)
            .order("order_date", { ascending: true });
        setRows(data || []);
        setLoading(false);
    };

    const totals: Totals = rows.reduce<Totals>((acc, r) => ({
        revenue: acc.revenue + Number(r.revenue),
        orders: acc.orders + Number(r.orders_count),
        avgOrderValue: 0,
        uniqueCustomers: acc.uniqueCustomers + Number(r.unique_customers),
    }), { revenue: 0, orders: 0, avgOrderValue: 0, uniqueCustomers: 0 });
    totals.avgOrderValue = totals.orders > 0 ? totals.revenue / totals.orders : 0;

    // Prev period comparison (simple: first half vs second half)
    const mid = Math.floor(rows.length / 2);
    const firstHalf = rows.slice(0, mid).reduce((s, r) => s + Number(r.revenue), 0);
    const secondHalf = rows.slice(mid).reduce((s, r) => s + Number(r.revenue), 0);
    const revTrend = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;

    // Simple inline bar chart using CSS
    const maxRev = Math.max(...rows.map((r) => Number(r.revenue)), 1);

    const stats = [
        {
            label: "Total Revenue",
            value: fmt(totals.revenue),
            trend: `${revTrend >= 0 ? "+" : ""}${revTrend.toFixed(1)}%`,
            positive: revTrend >= 0,
            icon: DollarSign,
        },
        {
            label: "Total Orders",
            value: totals.orders.toString(),
            trend: `${period}d`,
            positive: true,
            icon: ShoppingBag,
        },
        {
            label: "Avg. Order Value",
            value: fmt(totals.avgOrderValue),
            trend: "",
            positive: true,
            icon: TrendingUp,
        },
        {
            label: "Customers",
            value: totals.uniqueCustomers.toString(),
            trend: "",
            positive: true,
            icon: Users,
        },
    ];

    return (
        <div className="p-8 pb-20 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
                <div>
                    <p className="text-xs font-bold tracking-widest text-slate-500 mb-1">Performance</p>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics</h1>
                    <p className="text-sm text-slate-500 mt-1">Real-time store performance metrics.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {([7, 30, 90] as const).map((p) => (
                        <button key={p} onClick={() => setPeriod(p)}
                            className={`h-8 px-4 rounded-lg text-xs font-bold transition-all ${period === p ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                            {p}d
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20 gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-500 opacity-30" />
                    <p className="text-xs font-bold tracking-widest text-slate-500">Loading analytics...</p>
                </div>
            ) : (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {stats.map((s, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-5">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <s.icon className="w-5 h-5" />
                                    </div>
                                    {s.trend && (
                                        <div className={`flex items-center gap-1 text-xs font-bold ${s.positive ? "text-emerald-600" : "text-rose-500"}`}>
                                            {s.positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                            {s.trend}
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs font-bold tracking-widest text-slate-500 mb-1">{s.label}</p>
                                <h3 className="text-2xl font-bold text-slate-900">{s.value}</h3>
                            </div>
                        ))}
                    </div>

                    {/* Revenue chart */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-bold text-slate-700">Daily Revenue — Last {period} Days</span>
                        </div>
                        {rows.length === 0 ? (
                            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No data for this period</div>
                        ) : (
                            <div className="flex items-end gap-1 h-40 overflow-x-auto pb-2">
                                {rows.map((r) => {
                                    const height = Math.max((Number(r.revenue) / maxRev) * 100, 2);
                                    return (
                                        <div key={r.order_date} className="group flex-1 min-w-[8px] flex flex-col items-center gap-1 relative">
                                            <div
                                                className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                                                style={{ height: `${height}%` }}
                                                title={`${r.order_date}: ${fmt(Number(r.revenue))} (${r.orders_count} orders)`}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Daily breakdown table */}
                    {rows.length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-bold text-slate-700">Daily Breakdown</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 font-bold tracking-widest">
                                            <th className="px-4 py-3 text-left">DATE</th>
                                            <th className="px-4 py-3 text-right">ORDERS</th>
                                            <th className="px-4 py-3 text-right">REVENUE</th>
                                            <th className="px-4 py-3 text-right">AOV</th>
                                            <th className="px-4 py-3 text-right">CUSTOMERS</th>
                                            <th className="px-4 py-3 text-right">COD</th>
                                            <th className="px-4 py-3 text-right">ONLINE</th>
                                            <th className="px-4 py-3 text-right">CANCELLED</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {[...rows].reverse().map((r) => (
                                            <tr key={r.order_date} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 font-semibold text-slate-700">{new Date(r.order_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</td>
                                                <td className="px-4 py-3 text-right font-bold text-slate-900">{r.orders_count}</td>
                                                <td className="px-4 py-3 text-right font-bold text-blue-600">{fmt(Number(r.revenue))}</td>
                                                <td className="px-4 py-3 text-right text-slate-600">{fmt(Number(r.avg_order_value))}</td>
                                                <td className="px-4 py-3 text-right text-slate-600">{r.unique_customers}</td>
                                                <td className="px-4 py-3 text-right text-amber-600">{r.cod_orders}</td>
                                                <td className="px-4 py-3 text-right text-emerald-600">{r.online_orders}</td>
                                                <td className="px-4 py-3 text-right text-rose-500">{r.cancelled_orders}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
