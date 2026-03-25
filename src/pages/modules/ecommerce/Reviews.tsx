import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Star, Check, X, Search, ThumbsUp, ThumbsDown, Filter, RefreshCw, MessageSquare, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? "text-amber-400 fill-amber-400" : "text-border"}`} />
            ))}
        </div>
    );
}

export default function Reviews() {
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("pending");
    const [search, setSearch] = useState("");

    useEffect(() => { if (activeCompany) load(); }, [activeCompany]);

    const load = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const { data } = await supabase.from("product_reviews").select("*")
            .eq("company_id", activeCompany.id).order("created_at", { ascending: false });
        setReviews(data || []);
        setLoading(false);
    };

    const updateStatus = async (id: number, status: "approved" | "rejected") => {
        await supabase.from("product_reviews").update({ status }).eq("id", id);
        toast({ title: status === "approved" ? "Review approved ✅" : "Review rejected" });
        load();
    };

    const filtered = reviews.filter(r => {
        const matchFilter = filter === "all" || r.status === filter;
        const matchSearch = !search || r.customer_name?.toLowerCase().includes(search.toLowerCase()) || r.title?.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const avgRating = reviews.filter(r => r.status === "approved").reduce((s, r, _, a) => s + r.rating / a.length, 0);
    const ratingDist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.filter(r => r.status === "approved").forEach(r => { ratingDist[r.rating] = (ratingDist[r.rating] || 0) + 1; });

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                        <span className="text-xs font-bold  tracking-widest text-slate-500">Customer Feedback</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Product Reviews</h1>
                    <p className="text-sm font-medium text-slate-500">
                        {reviews.filter(r => r.status === "pending").length} reviews awaiting your approval
                    </p>
                </div>
                <Button variant="outline" className="h-11 px-6 rounded-lg bg-white border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all gap-2 shadow-sm" onClick={load}>
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /> Refresh
                </Button>
            </div>

            {/* Rating Summary */}
            {reviews.filter(r => r.status === "approved").length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="text-center shrink-0 p-8 rounded-2xl bg-slate-50 border border-slate-100 min-w-[180px]">
                            <p className="text-6xl font-bold tracking-tight text-slate-900 mb-2">{avgRating.toFixed(1)}</p>
                            <div className="flex justify-center mb-3">
                                <StarRating rating={Math.round(avgRating)} />
                            </div>
                            <p className="text-xs font-bold  tracking-widest text-slate-500">{reviews.filter(r => r.status === "approved").length} verified reviews</p>
                        </div>
                        <div className="flex-1 w-full space-y-3">
                            {[5, 4, 3, 2, 1].map(star => {
                                const count = ratingDist[star] || 0;
                                const total = reviews.filter(r => r.status === "approved").length;
                                const pct = total ? (count / total) * 100 : 0;
                                return (
                                    <div key={star} className="flex items-center gap-4 text-xs">
                                        <div className="flex items-center gap-1.5 w-12 shrink-0">
                                            <span className="font-bold text-slate-900">{star}</span>
                                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                        </div>
                                        <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-50">
                                            <div className="bg-amber-400 h-2.5 rounded-full transition-all shadow-sm" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="w-10 text-right font-bold text-slate-500">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Filter + Search */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm shrink-0">
                    {["pending", "approved", "rejected", "all"].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={cn(
                                "px-5 py-2 rounded-lg text-xs font-bold  tracking-widest transition-all",
                                filter === f ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-slate-500 hover:text-slate-600 hover:bg-slate-50"
                            )}>
                            {f} ({f === "all" ? reviews.length : reviews.filter(r => r.status === f).length})
                        </button>
                    ))}
                </div>
                <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by customer name, review title or content..."
                        className="w-full h-12 pl-12 pr-6 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all shadow-sm" />
                </div>
            </div>

            {/* Review Cards */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin opacity-40" />
                    <p className="text-xs font-bold  tracking-widest text-slate-500">Moderating reviews...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 border-dashed text-center py-20 max-w-2xl mx-auto shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Star className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No reviews found</h3>
                    <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">Either you have no reviews yet or no feedbacks match your current filter selection.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filtered.map(r => (
                        <div key={r.id} className={cn(
                            "bg-white rounded-2xl border p-8 transition-all hover:shadow-lg group",
                            r.status === "pending" ? "border-amber-200 bg-amber-50/10" :
                                r.status === "approved" ? "border-slate-200" :
                                    "border-slate-100 opacity-60"
                        )}>
                            <div className="flex flex-col md:flex-row items-start gap-8">
                                <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold shrink-0 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    {r.customer_name?.charAt(0) || "?"}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <p className="text-base font-bold text-slate-900">{r.customer_name}</p>
                                            <div className="flex items-center gap-3">
                                                <StarRating rating={r.rating} />
                                                {r.is_verified_purchase && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold  tracking-tight gap-1">
                                                        <Check className="w-3 h-3" /> Verified Buyer
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-xs font-bold  tracking-widest border shadow-sm",
                                                r.status === "pending" ? "bg-amber-100 text-amber-700 border-amber-200"
                                                    : r.status === "approved" ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                        : "bg-slate-100 text-slate-500 border-slate-200"
                                            )}>{r.status}</span>
                                            {r.status === "pending" && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => updateStatus(r.id, "approved")}
                                                        className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-100 transition-all flex items-center justify-center shadow-sm">
                                                        <ThumbsUp className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => updateStatus(r.id, "rejected")}
                                                        className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-100 transition-all flex items-center justify-center shadow-sm">
                                                        <ThumbsDown className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {r.title && <h4 className="text-lg font-bold text-slate-900 leading-tight">{r.title}</h4>}
                                        {r.body && <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-4xl">{r.body}</p>}
                                    </div>
                                    <div className="pt-4 border-t border-slate-50 flex items-center gap-6">
                                        {r.product_id && (
                                            <Link to={`/masters/products`} className="text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4 decoration-2">View Associated Product</Link>
                                        )}
                                        <div className="flex items-center gap-2 text-xs font-bold  tracking-widest text-slate-500">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(r.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

