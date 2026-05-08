import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  LifeBuoy, Star, ChevronRight, Send, Clock,
  CheckCircle2, AlertCircle, XCircle, Inbox, MessageSquare,
  ThumbsUp, Trash2, Building2, RefreshCw,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface Ticket {
  id: string;
  subject: string;
  category: string;
  description: string;
  status: string;
  priority: string;
  company_id: string | null;
  company_name: string | null;
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

interface PendingReview {
  id: string;
  author_name: string;
  author_role: string | null;
  company: string | null;
  quote: string;
  rating: number;
  created_at: string;
}

/* ── Helpers ────────────────────────────────────────────────────────────────── */

const STATUS_STYLE: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open:        { label: "Open",        color: "bg-blue-50 text-blue-700 border-blue-200",    icon: Inbox },
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

/* ── Component ──────────────────────────────────────────────────────────────── */

export default function PlatformSupport() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"tickets" | "reviews">("tickets");

  /* ── Tickets state ── */
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  /* ── Reviews state ── */
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  /* ── Load tickets ── */
  useEffect(() => { loadTickets(); }, [statusFilter]);

  const loadTickets = async () => {
    setLoadingTickets(true);
    let q = supabase
      .from("support_tickets")
      .select("id, subject, category, description, status, priority, company_id, company_name, created_at, resolved_at")
      .order("created_at", { ascending: false });
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    const { data } = await q;
    setTickets(data ?? []);
    setLoadingTickets(false);
  };

  /* ── Load messages ── */
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

  /* ── Send reply ── */
  const handleSendReply = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    setSendingMsg(true);
    const { error } = await supabase.from("support_messages").insert({
      ticket_id:       selectedTicket.id,
      message:         newMessage.trim(),
      is_from_support: true,
      sender_name:     "Support Team",
      created_by:      user?.id,
    });
    if (!error) {
      setNewMessage("");
      loadMessages(selectedTicket.id);
      // Auto-move to in_progress when support replies
      if (selectedTicket.status === "open") {
        await supabase.from("support_tickets").update({ status: "in_progress" }).eq("id", selectedTicket.id);
        setSelectedTicket({ ...selectedTicket, status: "in_progress" });
        loadTickets();
      }
    }
    setSendingMsg(false);
  };

  /* ── Update ticket status ── */
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicket) return;
    setUpdatingStatus(true);
    const updates: Record<string, string | null> = { status: newStatus };
    if (newStatus === "resolved") updates.resolved_at = new Date().toISOString();
    const { error } = await supabase.from("support_tickets").update(updates).eq("id", selectedTicket.id);
    if (error) { toast.error("Failed to update status"); }
    else {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
      loadTickets();
      toast.success("Status updated");
    }
    setUpdatingStatus(false);
  };

  /* ── Load pending reviews ── */
  useEffect(() => {
    if (tab === "reviews") loadReviews();
  }, [tab]);

  const loadReviews = async () => {
    setLoadingReviews(true);
    const { data } = await supabase
      .from("platform_testimonials")
      .select("id, author_name, author_role, company, quote, rating, created_at")
      .eq("is_approved", false)
      .order("created_at", { ascending: false });
    setReviews(data ?? []);
    setLoadingReviews(false);
  };

  /* ── Approve review ── */
  const handleApproveReview = async (id: string) => {
    const { error } = await supabase
      .from("platform_testimonials")
      .update({ is_approved: true, is_published: true })
      .eq("id", id);
    if (error) { toast.error("Failed to approve review"); return; }
    toast.success("Review approved and published");
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  /* ── Reject review ── */
  const handleRejectReview = async (id: string) => {
    const { error } = await supabase.from("platform_testimonials").delete().eq("id", id);
    if (error) { toast.error("Failed to reject review"); return; }
    toast.success("Review rejected and removed");
    setReviews((prev) => prev.filter((r) => r.id !== id));
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
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                <Building2 className="w-3 h-3" />
                {selectedTicket.company_name ?? "Unknown Tenant"}
                <span>·</span>{fmtDate(selectedTicket.created_at)}
                <span>·</span>{selectedTicket.category}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={selectedTicket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", st.color)}>
                <StatusIcon className="w-3 h-3" />{st.label}
              </span>
            </div>
          </div>
          <div className="p-5 bg-gray-50 border-b border-gray-100">
            <p className="text-sm text-gray-600">{selectedTicket.description}</p>
          </div>
          <div className="p-5 space-y-4 max-h-80 overflow-y-auto">
            {messages.length === 0 && (
              <p className="text-xs text-center text-gray-400 py-4">No messages yet.</p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={cn("flex gap-3", m.is_from_support ? "justify-start" : "justify-end")}>
                <div className={cn("max-w-[80%] px-4 py-2.5 rounded-xl text-sm", m.is_from_support ? "bg-primary/10 text-gray-800 rounded-tl-none" : "bg-gray-800 text-white rounded-tr-none")}>
                  {m.is_from_support && <p className="text-[10px] font-semibold text-primary mb-1">Support Team</p>}
                  {!m.is_from_support && <p className="text-[10px] font-semibold text-gray-300 mb-1">{m.sender_name ?? "Tenant"}</p>}
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
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                placeholder="Reply as support team…"
                rows={2}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                onClick={handleSendReply}
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
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-primary" /> Support Center
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage tenant support tickets and review approvals</p>
        </div>
        <button onClick={tab === "tickets" ? loadTickets : loadReviews}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {([["tickets", "Support Tickets", MessageSquare], ["reviews", "Pending Reviews", Star]] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn("flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all",
              tab === id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Icon className="w-3.5 h-3.5" />{label}
            {id === "reviews" && reviews.length > 0 && tab !== "reviews" && (
              <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{reviews.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Support Tickets ── */}
      {tab === "tickets" && (
        <>
          {/* Status filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {["all", "open", "in_progress", "resolved", "closed"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={cn("px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize",
                  statusFilter === s ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-primary/40"
                )}>
                {s === "all" ? "All" : s.replace("_", " ")}
              </button>
            ))}
          </div>

          {loadingTickets ? (
            <div className="text-center py-12 text-gray-400 text-sm">Loading tickets…</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16">
              <LifeBuoy className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No tickets</p>
            </div>
          ) : (
            <div className="space-y-2">
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
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />{ticket.company_name ?? "—"}
                        <span>·</span>{ticket.category}
                        <span>·</span>{fmtDate(ticket.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn("text-xs font-medium capitalize", PRIORITY_STYLE[ticket.priority])}>{ticket.priority}</span>
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border", st.color)}>
                        {st.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Pending Reviews ── */}
      {tab === "reviews" && (
        <>
          {loadingReviews ? (
            <div className="text-center py-12 text-gray-400 text-sm">Loading reviews…</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16">
              <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No pending reviews</p>
              <p className="text-sm text-gray-400 mt-1">All tenant reviews have been processed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={cn("w-4 h-4", r.rating >= s ? "fill-yellow-400 text-yellow-400" : "text-gray-200")} />
                          ))}
                        </div>
                        {r.company && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />{r.company}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 italic mb-3">"{r.quote}"</p>
                      <p className="text-xs font-semibold text-gray-800">{r.author_name}
                        {r.author_role && <span className="font-normal text-gray-400"> · {r.author_role}</span>}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{fmtDate(r.created_at)}</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={() => handleApproveReview(r.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors">
                        <ThumbsUp className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button onClick={() => handleRejectReview(r.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
