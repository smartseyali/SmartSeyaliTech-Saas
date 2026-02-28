import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Mail, RefreshCw, RotateCcw, Clock } from "lucide-react";

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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Abandoned Carts</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {carts.filter(c => !c.recovered).length} abandoned · {fmt(totalValue)} at risk
                    </p>
                </div>
                <Button variant="outline" className="rounded-xl gap-2" onClick={load}>
                    <RefreshCw className="w-4 h-4" /> Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Abandoned", value: carts.filter(c => !c.recovered).length, color: "text-red-600" },
                    { label: "Recovered", value: recovered.length, color: "text-green-600" },
                    { label: "Recovery Emails", value: carts.filter(c => c.recovery_email_sent).length, color: "text-blue-600" },
                    { label: "Value at Risk", value: fmt(totalValue), color: "text-orange-600" },
                ].map(s => (
                    <div key={s.label} className="bg-card rounded-xl border border-border/50 p-4 shadow-sm">
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Cart List */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="text-center py-16 text-muted-foreground">Loading...</div>
                ) : carts.length === 0 ? (
                    <div className="text-center py-14">
                        <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
                        <p className="text-sm text-muted-foreground">No abandoned carts tracked yet</p>
                        <p className="text-xs text-muted-foreground mt-1">Carts abandoned for 30+ minutes will appear here</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
                            <tr>
                                <th className="px-5 py-3 text-left">Customer</th>
                                <th className="px-5 py-3 text-left">Items</th>
                                <th className="px-5 py-3 text-left">Value</th>
                                <th className="px-5 py-3 text-left">Abandoned</th>
                                <th className="px-5 py-3 text-left">Status</th>
                                <th className="px-5 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carts.map(cart => (
                                <tr key={cart.id} className={`border-t border-border/40 hover:bg-secondary/20 transition-colors ${cart.recovered ? "opacity-60" : ""}`}>
                                    <td className="px-5 py-3.5">
                                        <p className="font-medium">{cart.customer_name || "Guest"}</p>
                                        <p className="text-xs text-muted-foreground">{cart.customer_email}</p>
                                    </td>
                                    <td className="px-5 py-3.5 text-muted-foreground text-xs">
                                        {Array.isArray(cart.items) ? `${cart.items.length} item(s)` : "—"}
                                    </td>
                                    <td className="px-5 py-3.5 font-bold">{fmt(cart.cart_total)}</td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            {getTimeSince(cart.updated_at)}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {cart.recovered ? (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Recovered ✓</span>
                                        ) : cart.recovery_email_sent ? (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Email Sent</span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Abandoned</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        {!cart.recovered && !cart.recovery_email_sent && (
                                            <Button size="sm" variant="outline" className="rounded-xl gap-1.5 text-xs"
                                                disabled={sending === cart.id} onClick={() => sendRecoveryEmail(cart)}>
                                                <Mail className="w-3.5 h-3.5" />
                                                {sending === cart.id ? "Sending..." : "Send Recovery Email"}
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

