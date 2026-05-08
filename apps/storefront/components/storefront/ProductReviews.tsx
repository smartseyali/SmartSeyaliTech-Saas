"use client";

import { useState } from "react";
import { Star, ThumbsUp, CheckCircle2, AlertCircle, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTenant } from "@/lib/tenant";
import { supabase } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

export type Review = {
  id: string;
  author_name: string;
  rating: number;
  title?: string;
  body: string;
  created_at: string;
  helpful_count?: number;
  admin_reply?: string;
  verified_purchase?: boolean;
};

type Props = {
  productId: string;
  productSlug: string;
  reviews: Review[];
  avgRating?: number;
  totalCount?: number;
};

const STARS = [5, 4, 3, 2, 1];

export function ProductReviews({ productId, productSlug, reviews: initialReviews, avgRating = 0, totalCount = 0 }: Props) {
  const tenant = getTenant();

  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [ratingInput, setRatingInput] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [titleInput, setTitleInput] = useState("");
  const [bodyInput, setBodyInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");

  // Distribution bar widths
  const distribution = STARS.map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
  }));
  const maxDist = Math.max(...distribution.map((d) => d.count), 1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim() || !bodyInput.trim()) {
      setFormError("Name and review text are required");
      return;
    }
    if (bodyInput.trim().length < 20) {
      setFormError("Review must be at least 20 characters");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const row: Record<string, unknown> = {
        product_id: productId,
        product_slug: productSlug,
        author_name: nameInput.trim(),
        author_email: emailInput.trim().toLowerCase() || null,
        rating: ratingInput,
        title: titleInput.trim() || null,
        body: bodyInput.trim(),
        status: "pending",
      };
      if (tenant.companyId) row.company_id = tenant.companyId;

      if (supabase) {
        const { error } = await supabase.from("ecom_product_reviews").insert(row);
        if (error) throw new Error(error.message);
      }
      setSubmitted(true);
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function markHelpful(reviewId: string) {
    if (!supabase) return;
    await supabase.rpc("increment_review_helpful", { p_review_id: reviewId }).then(() => {}, () => {});
    setReviews((prev) =>
      prev.map((r) => r.id === reviewId ? { ...r, helpful_count: (r.helpful_count ?? 0) + 1 } : r)
    );
  }

  return (
    <section className="container-tight py-14">
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Summary column */}
        <div>
          <h2 className="text-xl font-bold text-brand-900 mb-6">Customer Reviews</h2>

          {totalCount > 0 ? (
            <div className="space-y-4">
              <div className="flex items-end gap-3">
                <span className="text-5xl font-bold text-brand-900">{avgRating.toFixed(1)}</span>
                <div className="pb-1">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn("w-4 h-4", i < Math.round(avgRating) ? "fill-accent-500 text-accent-500" : "text-gray-200")} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{totalCount} reviews</p>
                </div>
              </div>

              <div className="space-y-1.5">
                {distribution.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-4 text-right text-muted-foreground">{star}</span>
                    <Star className="w-3 h-3 fill-accent-500 text-accent-500 shrink-0" />
                    <div className="flex-1 h-2 bg-brand-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-400 rounded-full transition-all"
                        style={{ width: `${(count / maxDist) * 100}%` }}
                      />
                    </div>
                    <span className="w-4 text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
          )}

          <div className="mt-6">
            {submitted ? (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-xl">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Thank you! Your review is pending approval.
              </div>
            ) : (
              <Button
                variant={showForm ? "outline" : "default"}
                className="w-full"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? "Cancel" : "Write a Review"}
              </Button>
            )}
          </div>
        </div>

        {/* Reviews list + form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Write review form */}
          {showForm && !submitted && (
            <form onSubmit={handleSubmit} className="bg-brand-50/40 border border-border rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-brand-900">Your Review</h3>

              {/* Star picker */}
              <div>
                <p className="text-sm font-medium text-brand-900 mb-2">Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRatingInput(s)}
                    >
                      <Star className={cn(
                        "w-6 h-6 transition-colors",
                        s <= (hoverRating || ratingInput) ? "fill-accent-500 text-accent-500" : "text-gray-300"
                      )} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-brand-900 block mb-1.5">Your Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Ravi Kumar"
                    className="w-full h-10 px-3 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-brand-900 block mb-1.5">Email (optional)</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Not shown publicly"
                    className="w-full h-10 px-3 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-brand-900 block mb-1.5">Title (optional)</label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="e.g. Great quality, will buy again"
                  className="w-full h-10 px-3 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-brand-900 block mb-1.5">Review <span className="text-red-500">*</span></label>
                <textarea
                  required
                  value={bodyInput}
                  onChange={(e) => setBodyInput(e.target.value)}
                  placeholder="Share your experience with this product (min. 20 characters)"
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
                />
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />{formError}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {submitting ? "Submitting…" : "Submit Review"}
              </Button>
            </form>
          )}

          {/* Review list */}
          {reviews.length === 0 && !showForm && (
            <p className="text-muted-foreground text-sm py-8 text-center">No reviews yet.</p>
          )}

          {reviews.map((review) => (
            <div key={review.id} className="bg-white border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("w-3.5 h-3.5", i < review.rating ? "fill-accent-500 text-accent-500" : "text-gray-200")} />
                      ))}
                    </div>
                    {review.verified_purchase && (
                      <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">Verified</span>
                    )}
                  </div>
                  {review.title && <p className="font-semibold text-brand-900 text-sm">{review.title}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-brand-900">{review.author_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{review.body}</p>

              {review.admin_reply && (
                <div className="bg-brand-50 rounded-lg p-3 text-xs text-brand-900 border-l-2 border-brand">
                  <p className="font-bold mb-1">Response from store</p>
                  <p className="text-muted-foreground">{review.admin_reply}</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => markHelpful(review.id)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand transition-colors"
              >
                <ThumbsUp className="w-3 h-3" />
                Helpful{review.helpful_count ? ` (${review.helpful_count})` : ""}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
