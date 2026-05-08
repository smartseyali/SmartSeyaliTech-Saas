import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Plus, LifeBuoy, Star, ChevronRight, X, Send, Clock,
  CheckCircle2, AlertCircle, XCircle, Inbox, MessageSquare,
} from "lucide-react";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface Ticket {
  id: string;
  subject: string;
  category: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  resolved_at: string | null;
}

interface TicketMessage {
  id: string;
  message: string;
  is_from_support: boolean;
  sender_name: string | null;
  created_at: string;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

const STATUS_STYLE: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open:        { label: "Open",        color: "bg-blue-50 text-blue-700 border-blue-200",   icon: Inbox },
  in_progress: { label: "In Progress", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  resolved:    { label: "Resolved",    color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
  closed:      { label: "Closed",      color: "bg-gray-50 text-gray-500 border-gray-200",    icon: XCircle },
};

const PRIORITY_STYLE: Record<string, string> = {
  low:    "text-gray-500",
  normal: "text-blue-600",
  high:   "text-orange-600",
  urgent: "text-red-600 font-bold",
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ── Component ────────────────────────────────────────────────────────────── */

export default function SupportPage() {
  const { user } = useAuth();
  const { activeCompany } = useTenant();
  const [tab, setTab] = useState<"tickets" | "review">("tickets");

  // ── Tickets state ──
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "general", description: "", priority: "normal" });
  const [submitting, setSubmitting] = useState(false);

  // ── Review state ──
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState({ quote: "", author_name: "", author_role: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  const companyId = activeCompany?.id;

  /* ── Load tickets ── */
  useEffect(() => {
    if (!companyId) return;
    loadTickets();
  }, [companyId]);

  const loadTickets = async () => {
    setLoadingTickets(true);
    const { data } = await supabase
      .from("support_tickets")
      .select("id, subject, category, description, status, priority, created_at, resolved_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    setTickets(data ?? []);
    setLoadingTickets(false);
  };

  /* ── Load messages for selected ticket ── */
  useEffect(() => {
    if (!selectedTicket) return;
    loadMessages(selectedTicket.id);
  }, [selectedTicket?.id]);

  const loadMessages = async (ticketId: string) => {
    const { data } = await supabase
      .from("support_messages")
      .select("id, message, is_from_support, sender_name, created_at")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });
    setMessages(data ?? []);
  };

  /* ── Create ticket ── */
  const handleCreateTicket = async () => {
    if (!form.subject.trim() || !form.description.trim()) {
      toast.error("Subject and description are required");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("support_tickets").insert({
      company_id:   companyId,
      company_name: activeCompany?.name,
      subject:      form.subject.trim(),
      category:     form.category,
      description:  form.description.trim(),
      priority:     form.priority,
      created_by:   user?.id,
    });
    if (error) { toast.error("Failed to submit ticket"); }
    else {
      toast.success("Support ticket submitted");
      setForm({ subject: "", category: "general", description: "", priority: "normal" });
      setShowNewForm(false);
      loadTickets();
    }
    setSubmitting(false);
  };

  /* ── Send message ── */
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    setSendingMsg(true);
    const { error } = await supabase.from("support_messages").insert({
      ticket_id:      selectedTicket.id,
      message:        newMessage.trim(),
      is_from_support: false,
      sender_name:    activeCompany?.name ?? user?.email,
      created_by:     user?.id,
    });
    if (!error) {
      setNewMessage("");
      loadMessages(selectedTicket.id);
    }
    setSendingMsg(false);
  };

  /* ── Submit review ── */
  const handleSubmitReview = async () => {
    if (!review.quote.trim() || !review.author_name.trim()) {
      toast.error("Review text and your name are required");
      return;
    }
    setSubmittingReview(true);
    const { error } = await supabase.from("platform_testimonials").insert({
      company_id:   companyId,
      company:      activeCompany?.name,
      submitted_by: user?.id,
      quote:        review.quote.trim(),
      author_name:  review.author_name.trim(),
      author_role:  review.author_role.trim() || null,
      rating,
      is_published: false,
      is_approved:  false,
      sort_order:   0,
    });
    if (error) { toast.error("Failed to submit review"); }
    else { setReviewDone(true); }
    setSubmittingReview(false);
  };

  /* ── Ticket detail view ── */
  if (selectedTicket) {
    const st = STATUS_STYLE[selectedTicket.status] || STATUS_STYLE.open;
    const StatusIcon = st.icon;
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to tickets
        </button>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">{selectedTicket.subject}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{fmtDate(selectedTicket.created_at)} · {selectedTicket.category}</p>
            </div>
            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0", st.color)}>
              <StatusIcon className="w-3 h-3" />{st.label}
            </span>
          </div>
          <div className="p-5 bg-gray-50 border-b border-gray-100">
            <p className="text-sm text-gray-600">{selectedTicket.description}</p>
          </div>
          <div className="p-5 space-y-4 max-h-80 overflow-y-auto">
            {messages.length === 0 && (
              <p className="text-xs text-center text-gray-400 py-4">No replies yet. Our team will respond shortly.</p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={cn("flex gap-3", m.is_from_support ? "justify-start" : "justify-end")}>
                <div className={cn("max-w-[80%] px-4 py-2.5 rounded-xl text-sm", m.is_from_support ? "bg-primary-50 text-gray-800 rounded-tl-none" : "bg-gray-800 text-white rounded-tr-none")}>
                  {m.is_from_support && <p className="text-[10px] font-semibold text-primary-600 mb-1">Support Team</p>}
                  <p className="leading-relaxed">{m.message}</p>
                  <p className={cn("text-[10px] mt-1.5", m.is_from_support ? "text-gray-400" : "text-gray-300")}>
                    {new Date(m.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {selectedTicket.status !== "closed" && (
            <div className="p-4 border-t border-gray-100 flex gap-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your reply…"
                rows={2}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                onClick={handleSendMessage}
                disabled={sendingMsg || !newMessage.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-primary" /> Support & Help
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Get help from our team or share your experience</p>
        </div>
        {tab === "tickets" && !showNewForm && (
          <button
            onClick={() => setShowNewForm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Ticket
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {([["tickets", "Support Tickets", MessageSquare], ["review", "Write a Review", Star]] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn("flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all",
              tab === id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* ── Support Tickets Tab ── */}
      {tab === "tickets" && (
        <>
          {showNewForm && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">New Support Ticket</h2>
                <button onClick={() => setShowNewForm(false)} className="text-gray-400 hover:text-gray-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Subject <span className="text-red-500">*</span></label>
                  <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Describe your issue briefly"
                    className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white">
                      <option value="general">General</option>
                      <option value="billing">Billing</option>
                      <option value="technical">Technical</option>
                      <option value="feature-request">Feature Request</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Priority</label>
                    <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white">
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Description <span className="text-red-500">*</span></label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Explain the issue in detail…" rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowNewForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
                  <button onClick={handleCreateTicket} disabled={submitting}
                    className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                    {submitting ? "Submitting…" : "Submit Ticket"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {loadingTickets ? (
            <div className="text-center py-12 text-gray-400 text-sm">Loading tickets…</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16">
              <LifeBuoy className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No support tickets yet</p>
              <p className="text-sm text-gray-400 mt-1">Click "New Ticket" to get help from our team</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => {
                const st = STATUS_STYLE[ticket.status] || STATUS_STYLE.open;
                const StatusIcon = st.icon;
                return (
                  <button key={ticket.id} onClick={() => setSelectedTicket(ticket)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 text-left hover:border-primary/30 hover:shadow-sm transition-all">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border", st.color)}>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{ticket.subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{ticket.category} · {fmtDate(ticket.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn("text-xs font-medium capitalize", PRIORITY_STYLE[ticket.priority])}>{ticket.priority}</span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Write a Review Tab ── */}
      {tab === "review" && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-xl">
          {reviewDone ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 mb-1">Thank you for your review!</h3>
              <p className="text-sm text-gray-500">Your review will be published on our website after approval.</p>
            </div>
          ) : (
            <>
              <h2 className="text-sm font-semibold text-gray-900 mb-1">Share Your Experience</h2>
              <p className="text-xs text-gray-500 mb-5">Your review will appear on our marketing site after approval.</p>
              <div className="space-y-4">
                {/* Star Rating */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Rating <span className="text-red-500">*</span></label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} type="button"
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(s)}>
                        <Star className={cn("w-7 h-7 transition-colors", (hoverRating || rating) >= s ? "fill-yellow-400 text-yellow-400" : "text-gray-200")} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Your Review <span className="text-red-500">*</span></label>
                  <textarea value={review.quote} onChange={(e) => setReview({ ...review, quote: e.target.value })}
                    placeholder="Tell us how SmartSeyali has helped your business…" rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Your Name <span className="text-red-500">*</span></label>
                    <input value={review.author_name} onChange={(e) => setReview({ ...review, author_name: e.target.value })}
                      placeholder="e.g. Rajan K."
                      className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Role / Designation</label>
                    <input value={review.author_role} onChange={(e) => setReview({ ...review, author_role: e.target.value })}
                      placeholder="e.g. Managing Director"
                      className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                </div>
                <button onClick={handleSubmitReview} disabled={submittingReview}
                  className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {submittingReview ? "Submitting…" : "Submit Review"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
