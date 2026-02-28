import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Star, Check, X, Search, ThumbsUp, ThumbsDown, Filter } from "lucide-react";
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Product Reviews</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {reviews.filter(r => r.status === "pending").length} awaiting approval
                    </p>
                </div>
            </div>

            {/* Rating Summary */}
            {reviews.filter(r => r.status === "approved").length > 0 && (
                <div className="bg-card rounded-2xl border border-border/50 p-5 shadow-sm">
                    <div className="flex gap-8 items-center">
                        <div className="text-center shrink-0">
                            <p className="text-5xl font-black">{avgRating.toFixed(1)}</p>
                            <StarRating rating={Math.round(avgRating)} />
                            <p className="text-xs text-muted-foreground mt-1">{reviews.filter(r => r.status === "approved").length} reviews</p>
                        </div>
                        <div className="flex-1 space-y-1.5">
                            {[5, 4, 3, 2, 1].map(star => {
                                const count = ratingDist[star] || 0;
                                const total = reviews.filter(r => r.status === "approved").length;
                                const pct = total ? (count / total) * 100 : 0;
                                return (
                                    <div key={star} className="flex items-center gap-3 text-xs">
                                        <span className="w-4 text-right text-muted-foreground">{star}</span>
                                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                                        <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                                            <div className="bg-amber-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="w-5 text-muted-foreground">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Filter + Search */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-2">
                    {["pending", "approved", "rejected", "all"].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize ${filter === f ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card"
                                }`}>
                            {f} ({f === "all" ? reviews.length : reviews.filter(r => r.status === f).length})
                        </button>
                    ))}
                </div>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by customer name or title..."
                        className="w-full h-9 pl-9 pr-3 rounded-xl border border-input bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
            </div>

            {/* Review Cards */}
            {loading ? (
                <div className="text-center py-16 text-muted-foreground">Loading reviews...</div>
            ) : filtered.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border/50 text-center py-14">
                    <Star className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
                    <p className="text-sm text-muted-foreground">No reviews in this category</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(r => (
                        <div key={r.id} className={`bg-card rounded-2xl border shadow-sm p-5 transition-all ${r.status === "pending" ? "border-yellow-200 dark:border-yellow-800/50" :
                                r.status === "approved" ? "border-green-200 dark:border-green-800/50" :
                                    "border-border/50 opacity-70"
                            }`}>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                                    {r.customer_name?.charAt(0) || "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-semibold text-sm">{r.customer_name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <StarRating rating={r.rating} />
                                                {r.is_verified_purchase && (
                                                    <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-semibold flex items-center gap-0.5">
                                                        <Check className="w-2.5 h-2.5" /> Verified Purchase
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${r.status === "pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                    : r.status === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                        : "bg-secondary text-muted-foreground"
                                                }`}>{r.status}</span>
                                            {r.status === "pending" && (
                                                <div className="flex gap-1.5">
                                                    <button onClick={() => updateStatus(r.id, "approved")}
                                                        className="p-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors">
                                                        <ThumbsUp className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => updateStatus(r.id, "rejected")}
                                                        className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors">
                                                        <ThumbsDown className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {r.title && <p className="font-semibold text-sm mt-2">{r.title}</p>}
                                    {r.body && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{r.body}</p>}
                                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                                        {r.product_id && (
                                            <Link to={`/masters/products`} className="hover:text-primary hover:underline">View Product</Link>
                                        )}
                                        <span>{new Date(r.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
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

