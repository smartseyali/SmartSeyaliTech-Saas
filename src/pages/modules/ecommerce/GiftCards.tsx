import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { toast } from "sonner";
import { Gift, Plus, Copy, RefreshCw, Send, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GiftCard = {
    id: string;
    code: string;
    initial_value: number;
    remaining_value: number;
    sent_to_email: string | null;
    sent_to_name: string | null;
    purchased_by_email: string | null;
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
    message: string | null;
};

const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

export default function GiftCards() {
    const { activeCompany } = useTenant();
    const [cards, setCards] = useState<GiftCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [issuing, setIssuing] = useState(false);

    const [form, setForm] = useState({
        initial_value: "",
        sent_to_email: "",
        sent_to_name: "",
        message: "",
        purchased_by_email: "",
        expires_at: "",
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    useEffect(() => { if (activeCompany) load(); }, [activeCompany?.id]);

    const load = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const { data } = await supabase
            .from("ecom_gift_cards")
            .select("*")
            .eq("company_id", activeCompany.id)
            .order("created_at", { ascending: false });
        setCards(data || []);
        setLoading(false);
    };

    const handleIssue = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeCompany || !form.initial_value) return;
        setIssuing(true);
        try {
            const res = await fetch(`${supabaseUrl}/functions/v1/gift-card`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${anonKey}`,
                },
                body: JSON.stringify({
                    action: "issue",
                    company_id: activeCompany.id,
                    initial_value: Number(form.initial_value),
                    sent_to_email: form.sent_to_email || null,
                    sent_to_name: form.sent_to_name || null,
                    message: form.message || null,
                    purchased_by_email: form.purchased_by_email || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to issue gift card");
            toast.success(`Gift card issued! Code: ${data.code}`);
            setShowForm(false);
            setForm({ initial_value: "", sent_to_email: "", sent_to_name: "", message: "", purchased_by_email: "", expires_at: "" });
            load();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIssuing(false);
        }
    };

    const toggleActive = async (card: GiftCard) => {
        await supabase.from("ecom_gift_cards").update({ is_active: !card.is_active }).eq("id", card.id);
        load();
    };

    const inputCls = "w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 outline-none transition-all";

    return (
        <div className="p-8 pb-20 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
                <div>
                    <p className="text-xs font-bold tracking-widest text-slate-500 mb-1">Marketing</p>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gift Cards</h1>
                    <p className="text-sm text-slate-500 mt-1">Issue and manage store gift cards.</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md gap-2">
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? "Cancel" : "Issue Gift Card"}
                </Button>
            </div>

            {/* Issue form */}
            {showForm && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-sm font-bold text-slate-800 mb-5">Issue New Gift Card</h2>
                    <form onSubmit={handleIssue} className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-500 tracking-widest block mb-1.5">VALUE (₹) *</label>
                            <input required type="number" min="1" value={form.initial_value} onChange={e => setForm(f => ({ ...f, initial_value: e.target.value }))} className={inputCls} placeholder="500" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 tracking-widest block mb-1.5">RECIPIENT EMAIL</label>
                            <input type="email" value={form.sent_to_email} onChange={e => setForm(f => ({ ...f, sent_to_email: e.target.value }))} className={inputCls} placeholder="friend@email.com" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 tracking-widest block mb-1.5">RECIPIENT NAME</label>
                            <input type="text" value={form.sent_to_name} onChange={e => setForm(f => ({ ...f, sent_to_name: e.target.value }))} className={inputCls} placeholder="Recipient name" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 tracking-widest block mb-1.5">PURCHASED BY (EMAIL)</label>
                            <input type="email" value={form.purchased_by_email} onChange={e => setForm(f => ({ ...f, purchased_by_email: e.target.value }))} className={inputCls} placeholder="buyer@email.com" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-xs font-semibold text-slate-500 tracking-widest block mb-1.5">PERSONAL MESSAGE</label>
                            <input type="text" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className={inputCls} placeholder="Happy birthday! 🎉" />
                        </div>
                        <div className="sm:col-span-2 flex justify-end">
                            <Button type="submit" disabled={issuing} className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2">
                                {issuing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {issuing ? "Issuing…" : "Issue & Send"}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Cards grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20 gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-500 opacity-30" />
                    <p className="text-xs font-bold tracking-widest text-slate-500">Loading gift cards...</p>
                </div>
            ) : cards.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 text-center py-20">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <Gift className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">No gift cards yet</h3>
                    <p className="text-sm text-slate-500 mb-6">Issue gift cards to reward customers and drive gifting.</p>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" onClick={() => setShowForm(true)}>
                        <Plus className="w-4 h-4" /> Issue First Gift Card
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {cards.map(card => {
                        const usedPct = Math.round(((card.initial_value - card.remaining_value) / card.initial_value) * 100);
                        const isExpired = card.expires_at && new Date(card.expires_at) < new Date();
                        return (
                            <div key={card.id} className={cn(
                                "bg-white rounded-2xl border shadow-sm p-6 transition-all hover:shadow-md space-y-4",
                                !card.is_active || isExpired ? "opacity-60 border-slate-100" : "border-slate-200"
                            )}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                            <Gift className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <code className="text-sm font-bold tracking-widest text-slate-900">{card.code}</code>
                                            {isExpired && <span className="ml-2 text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">EXPIRED</span>}
                                        </div>
                                    </div>
                                    <button onClick={() => toggleActive(card)}
                                        className={cn("relative w-10 h-5 rounded-full transition-colors duration-300", card.is_active ? "bg-emerald-500" : "bg-slate-200")}>
                                        <div className={cn("absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300", card.is_active ? "translate-x-5" : "")} />
                                    </button>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-bold text-slate-500">BALANCE</span>
                                        <span className="font-bold text-slate-900">{fmt(card.remaining_value)} / {fmt(card.initial_value)}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${100 - usedPct}%` }} />
                                    </div>
                                </div>

                                {card.sent_to_name && (
                                    <p className="text-xs text-slate-500">To: <span className="text-slate-800 font-semibold">{card.sent_to_name}</span>{card.sent_to_email ? ` (${card.sent_to_email})` : ""}</p>
                                )}

                                <div className="flex items-center gap-2 pt-1">
                                    <button onClick={() => { navigator.clipboard.writeText(card.code); toast.success("Copied!"); }}
                                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 transition-colors">
                                        <Copy className="w-3 h-3" /> Copy Code
                                    </button>
                                    <span className="text-slate-200">·</span>
                                    <span className="text-xs text-slate-400">{new Date(card.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
