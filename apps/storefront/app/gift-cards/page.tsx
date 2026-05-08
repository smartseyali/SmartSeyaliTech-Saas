"use client";

import { useState } from "react";
import { Gift, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTenant } from "@/lib/tenant";
import { cn } from "@/lib/utils";

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

export default function GiftCardsPage() {
  const tenant = getTenant();

  const [amount, setAmount] = useState<number | "">(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [giftCode, setGiftCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const finalAmount = useCustom ? Number(customAmount) : Number(amount);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!recipientName.trim() || !recipientEmail.trim() || !senderName.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (finalAmount < 100 || finalAmount > 50000) {
      setError("Gift card amount must be between ₹100 and ₹50,000.");
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey || !tenant.companyId) {
      setError("Gift cards are not available for this store yet.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/gift-card`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${anonKey}` },
        body: JSON.stringify({
          action: "issue",
          company_id: tenant.companyId,
          initial_value: finalAmount,
          sent_to_name: recipientName.trim(),
          sent_to_email: recipientEmail.trim().toLowerCase(),
          purchased_by_email: senderEmail.trim().toLowerCase() || undefined,
          message: message.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to issue gift card");
      setGiftCode(json.code);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="container-tight py-20 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-brand-900 mb-2">Gift Card Sent!</h1>
        <p className="text-muted-foreground mb-6">
          A gift card worth <strong>₹{finalAmount.toLocaleString("en-IN")}</strong> has been sent to{" "}
          <strong>{recipientEmail}</strong>.
        </p>
        <div className="bg-brand-50 border border-border rounded-2xl p-6 mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Gift Card Code</p>
          <p className="font-mono text-xl font-bold text-brand tracking-widest">{giftCode}</p>
          <p className="text-xs text-muted-foreground mt-2">This code has also been emailed to the recipient.</p>
        </div>
        <Button onClick={() => { setSuccess(false); setRecipientName(""); setRecipientEmail(""); setSenderName(""); setSenderEmail(""); setMessage(""); setGiftCode(""); }}>
          Send Another
        </Button>
      </div>
    );
  }

  return (
    <div className="container-tight py-12 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
          <Gift className="w-7 h-7 text-brand" />
        </div>
        <h1 className="text-3xl font-bold text-brand-900 mb-2">Gift Cards</h1>
        <p className="text-muted-foreground">Give the gift of choice. Perfect for every occasion.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount picker */}
        <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-brand-900">Choose Amount</h2>
          <div className="grid grid-cols-4 gap-3">
            {PRESET_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => { setAmount(a); setUseCustom(false); }}
                className={cn(
                  "py-3 rounded-xl border-2 text-sm font-bold transition-all",
                  !useCustom && amount === a
                    ? "border-brand bg-brand-50 text-brand"
                    : "border-border text-foreground hover:border-brand/40"
                )}
              >
                ₹{a.toLocaleString("en-IN")}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setUseCustom(!useCustom)}
              className={cn(
                "text-sm font-semibold transition-colors",
                useCustom ? "text-brand" : "text-muted-foreground hover:text-brand"
              )}
            >
              Custom amount
            </button>
            {useCustom && (
              <div className="relative flex-1 max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                <input
                  type="number"
                  min="100"
                  max="50000"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-7 pr-3 h-10 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>
            )}
          </div>
        </div>

        {/* Recipient */}
        <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-brand-900">Recipient Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-brand-900 block mb-1.5">Recipient Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Priya Sharma"
                className="w-full h-10 px-3 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-brand-900 block mb-1.5">Recipient Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="priya@example.com"
                className="w-full h-10 px-3 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-brand-900 block mb-1.5">Personal Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Happy Birthday! Hope you enjoy this gift."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
            />
          </div>
        </div>

        {/* Sender */}
        <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-brand-900">Your Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-brand-900 block mb-1.5">Your Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Rahul Kumar"
                className="w-full h-10 px-3 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-brand-900 block mb-1.5">Your Email (optional)</label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="rahul@example.com"
                className="w-full h-10 px-3 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {submitting ? "Sending Gift Card…" : `Send Gift Card — ₹${finalAmount ? finalAmount.toLocaleString("en-IN") : "—"}`}
        </Button>
      </form>
    </div>
  );
}
