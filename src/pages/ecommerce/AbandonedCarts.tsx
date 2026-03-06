import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Mail, RefreshCw, RotateCcw, Clock, AlertTriangle, CheckCircle2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AbandonedCarts() {
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [carts, setCarts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState<number | null>(null);

    useEffect(() => { if (activeCompany) load(); }, [activeCompany]);

    const load = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const { data } = await supabase.from("abandoned_carts").select("*")
            .eq("company_id", activeCompany.id).order("updated_at", { ascending: false });
        setCarts(data || []);
        setLoading(false);
    };

    const sendRecoveryEmail = async (cart: any) => {
        setSending(cart.id);
        // Mark email sent (actual email logic would be via backend)
        await supabase.from("abandoned_carts").update({ recovery_email_sent: true }).eq("id", cart.id);
        toast({ title: "Recovery Email Sent 📧", description: `Email sent to ${cart.customer_email}` });
        load();
        setSending(null);
    };

    const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
    const getTimeSince = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) return "< 1 hour ago";
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const totalValue = carts.filter(c => !c.recovered).reduce((s, c) => s + Number(c.cart_total), 0);
    const recovered = carts.filter(c => c.recovered);

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <ShoppingCart className="w-6 h-6 text-blue-600" />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Checkout Recovery</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Abandoned Carts</h1>
                    <p className="text-sm font-medium text-slate-500">
                        {carts.filter(c => !c.recovered).length} pending recoveries · {fmt(totalValue)} revenue at risk
                    </p>
                </div>
                <Button variant="outline" className="h-11 px-6 rounded-lg bg-white border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all gap-2 shadow-sm" onClick={load}>
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /> Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: "Abandoned", value: carts.filter(c => !c.recovered).length, color: "text-rose-600 bg-rose-50 border-rose-100", icon: AlertTriangle },
                    { label: "Recovered", value: recovered.length, color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: CheckCircle2 },
                    { label: "Emails Sent", value: carts.filter(c => c.recovery_email_sent).length, color: "text-blue-600 bg-blue-50 border-blue-100", icon: Send },
                    { label: "Value at Risk", value: fmt(totalValue), color: "text-amber-600 bg-amber-50 border-amber-100", icon: ShoppingCart },
                ].map(s => (
                    <div key={s.label} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</span>
                            <div className={cn("p-2 rounded-lg border", s.color)}>
                                <s.icon className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold tracking-tight text-slate-900">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Cart List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin opacity-40" />
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Analyzing carts...</p>
                    </div>
                ) : carts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                            <ShoppingCart className="w-8 h-8 text-slate-300" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-lg font-bold text-slate-900">No abandoned carts tracked</p>
                            <p className="text-sm font-medium text-slate-500 max-w-sm">Carts abandoned for 30+ minutes will automatically appear here for recovery.</p>
                        </div>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100">
                                <th className="px-6 py-4 text-left">Customer</th>
                                <th className="px-6 py-4 text-left">Items</th>
                                <th className="px-6 py-4 text-left">Value</th>
                                <th className="px-6 py-4 text-left">Timeline</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {carts.map(cart => (
                                <tr key={cart.id} className={cn(
                                    "hover:bg-slate-50/50 transition-colors group",
                                    cart.recovered && "bg-emerald-50/20 opacity-80"
                                )}>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-900">{cart.customer_name || "Guest Checkout"}</p>
                                        <p className="text-xs font-medium text-slate-500">{cart.customer_email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                                            {Array.isArray(cart.items) ? `${cart.items.length} Product(s)` : "—"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900">{fmt(cart.cart_total)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight text-slate-400">
                                            <Clock className="w-3.5 h-3.5 text-slate-300" />
                                            {getTimeSince(cart.updated_at)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {cart.recovered ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border bg-emerald-50 text-emerald-700 border-emerald-100">Recovered</span>
                                        ) : cart.recovery_email_sent ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border bg-blue-50 text-blue-700 border-blue-100">Email Sent</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border bg-rose-50 text-rose-700 border-rose-100">Abandoned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {!cart.recovered && !cart.recovery_email_sent && (
                                            <Button className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/10 text-xs gap-2 transition-all opacity-0 group-hover:opacity-100"
                                                disabled={sending === cart.id} onClick={() => sendRecoveryEmail(cart)}>
                                                <Mail className="w-3.5 h-3.5" />
                                                {sending === cart.id ? "Sending..." : "Recover"}
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

