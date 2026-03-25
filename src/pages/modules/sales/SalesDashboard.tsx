import { useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import {
    LayoutDashboard, Users, FileText, ShoppingBag,
    TrendingUp, ArrowUpRight, Plus, Search,
    Filter, Clock, CheckCircle2, ChevronRight,
    BarChart3, Target, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SalesDashboard() {
    const { activeCompany } = useTenant();

    const stats = {
        monthlyRevenue: 1245000,
        pendingQuotes: 24,
        confirmedOrders: 156,
        avgDealSize: 15400
    };

    const recentOrders = [
        { id: "SO-2024-001", customer: "TechFlow Solutions", amount: 45000, status: "Confirmed", date: "2h ago" },
        { id: "SO-2024-002", customer: "Sarah Jenkins", amount: 12000, status: "Draft", date: "4h ago" },
        { id: "SO-2024-003", customer: "Apex Global", amount: 89000, status: "Shipped", date: "6h ago" },
        { id: "SO-2024-004", customer: "Michael Chen", amount: 5500, status: "Paid", date: "1d ago" },
    ];

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-5 h-5 text-indigo-600" />
                        <span className="text-xs font-bold  tracking-widest text-slate-500">Sales & Distribution</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sales Overview</h1>
                    <p className="text-slate-500 text-sm font-medium">{activeCompany?.name} Headquarters</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200">
                        <BarChart3 className="w-4 h-4 mr-2" /> Reports
                    </Button>
                    <Button className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20">
                        <Plus className="w-4 h-4 mr-2" /> New Quotation
                    </Button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Sales This Month", value: fmt(stats.monthlyRevenue), sub: "+12.5% vs last month", icon: TrendingUp, color: "bg-indigo-600" },
                    { label: "Open Quotations", value: stats.pendingQuotes, sub: "Value: ₹4.2L", icon: FileText, color: "bg-slate-900" },
                    { label: "Average Deal", value: fmt(stats.avgDealSize), sub: "Optimized Pricing", icon: Target, color: "bg-indigo-600" },
                    { label: "Total Orders", value: stats.confirmedOrders, sub: "15% conversion rate", icon: ShoppingBag, color: "bg-slate-900" },
                ].map(k => (
                    <div key={k.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-2.5 rounded-xl text-white", k.color)}>
                                <k.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold  tracking-widest text-slate-500">{k.label}</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 mb-1">{k.value}</p>
                        <p className="text-xs font-bold text-slate-500  tracking-tight">{k.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent activity */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <h2 className="text-sm font-bold  tracking-widest text-slate-500">Recent Sales Orders</h2>
                        <Button variant="link" className="text-indigo-600 text-xs font-bold  tracking-widest px-0">All Orders <ChevronRight className="w-3 h-3" /></Button>
                    </div>
                    <div className="p-0">
                        <table className="w-full">
                            <thead>
                                <tr className="text-[13px]  font-bold tracking-widest text-slate-500 border-b border-slate-50">
                                    <th className="px-6 py-4 text-left">Order ID</th>
                                    <th className="px-6 py-4 text-left">Customer</th>
                                    <th className="px-6 py-4 text-left">Amount</th>
                                    <th className="px-6 py-4 text-left">Status</th>
                                    <th className="px-6 py-4 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentOrders.map(order => (
                                    <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-[13px] font-bold text-slate-900">{order.id}</td>
                                        <td className="px-6 py-4 text-[13px] font-medium text-slate-600">{order.customer}</td>
                                        <td className="px-6 py-4 text-[13px] font-bold text-slate-900">{fmt(order.amount)}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[13px] font-bold  tracking-tight",
                                                order.status === 'Confirmed' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                                    order.status === 'Paid' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                        order.status === 'Shipped' ? "bg-indigo-50 text-indigo-600 border border-indigo-100" :
                                                            "bg-slate-50 text-slate-500 border border-slate-100"
                                            )}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-xs font-bold text-slate-500  tracking-tighter">{order.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sales Pipeline Summary */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12">
                            <Target className="w-24 h-24" />
                        </div>
                        <h3 className="text-xs font-bold  tracking-widest text-indigo-400 mb-6">Performance Target</h3>
                        <div className="space-y-6 relative z-10">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs font-bold text-white/40  tracking-widest leading-none">Monthly Realization</span>
                                    <span className="text-2xl font-bold">84%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[84%] shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                                </div>
                                <p className="text-[13px] font-bold text-white/30  mt-3 tracking-widest leading-none">Target: ₹15,00,000</p>
                            </div>

                            <Button className="w-full bg-white/10 hover:bg-white/20 border-white/5 text-white font-bold  tracking-widest text-[13px] h-11 rounded-xl transition-all">
                                Adjust Sales Goals
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                        <h3 className="text-sm font-bold  tracking-widest text-slate-500 mb-6 border-b border-slate-50 pb-4 leading-none">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'New Customer', icon: Users },
                                { label: 'Price List', icon: Search },
                                { label: 'Discount Policy', icon: Filter },
                                { label: 'Pro-forma', icon: FileText },
                            ].map(item => (
                                <button key={item.label} className="p-4 rounded-xl border border-slate-50 flex flex-col items-center gap-3 hover:bg-slate-50 transition-all border shadow-sm group">
                                    <item.icon className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />
                                    <span className="text-[13px] font-bold  text-slate-500 tracking-tighter leading-none">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
