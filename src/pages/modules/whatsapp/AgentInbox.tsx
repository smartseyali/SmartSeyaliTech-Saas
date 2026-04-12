import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  sendTextMessage,
  getActiveAccount,
  isWithinSessionWindow,
} from "@/lib/services/whatsappService";
import {
  MessageSquare, Send, User, Clock, Search,
  CheckCheck, Check, AlertCircle, Bot, UserCircle,
  Phone, MoreVertical, ArrowLeft, Paperclip, Smile,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Conversation {
  id: number;
  contact_id: number;
  status: string;
  assigned_to: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number;
  session_expires_at: string | null;
  whatsapp_contacts: { name: string; phone: string } | null;
}

interface Message {
  id: number;
  direction: string;
  message_type: string;
  body: string | null;
  status: string;
  created_at: string;
  sent_by: string | null;
  wa_message_id?: string;
}

const STATUS_COLORS: Record<string, string> = {
  bot: "bg-purple-100 text-purple-700",
  waiting: "bg-amber-100 text-amber-700",
  open: "bg-emerald-100 text-emerald-700",
  resolved: "bg-slate-100 text-slate-500",
  expired: "bg-red-100 text-red-600",
};

export default function AgentInbox() {
  const { activeCompany } = useTenant();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "mine" | "waiting" | "bot">("all");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    if (activeCompany) loadConversations();
  }, [activeCompany, filter]);

  // Load messages when conversation changes
  useEffect(() => {
    if (activeConv) loadMessages(activeConv.id);
  }, [activeConv?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!activeConv) return;
    const channel = supabase
      .channel(`wa-messages-${activeConv.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "whatsapp_messages",
          filter: `conversation_id=eq.${activeConv.id}`,
        },
        (payload) => {
          const incoming = payload.new as Message;
          setMessages((prev) => {
            // Update existing message (status change) or append new one
            const exists = prev.some((m) => m.id === incoming.id);
            if (exists) {
              return prev.map((m) => m.id === incoming.id ? incoming : m);
            }
            return [...prev, incoming];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConv?.id]);

  const loadConversations = async () => {
    if (!activeCompany) return;
    setLoading(true);

    let query = supabase
      .from("whatsapp_conversations")
      .select("*, whatsapp_contacts(name, phone)")
      .eq("company_id", activeCompany.id)
      .order("last_message_at", { ascending: false });

    if (filter === "mine" && user) query = query.eq("assigned_to", user.id);
    else if (filter === "waiting") query = query.eq("status", "waiting");
    else if (filter === "bot") query = query.eq("status", "bot");

    const { data } = await query;
    setConversations(data || []);
    setLoading(false);
  };

  const loadMessages = async (conversationId: number) => {
    const { data } = await supabase
      .from("whatsapp_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    setMessages(data || []);

    // Mark as read
    await supabase
      .from("whatsapp_conversations")
      .update({ unread_count: 0 })
      .eq("id", conversationId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConv || !activeCompany || !user) return;

    const msgBody = newMessage.trim();
    const now = new Date().toISOString();
    const convId = activeConv.id;
    const contactId = activeConv.contact_id;
    const contactPhone = activeConv.whatsapp_contacts?.phone;

    // Clear input immediately
    setNewMessage("");
    setSending(true);

    // 1. Show message in chat INSTANTLY (before any API call)
    const tempId = Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        direction: "outbound",
        message_type: "text",
        body: msgBody,
        status: "sending",
        created_at: now,
        sent_by: user.id,
      },
    ]);

    try {
      const account = await getActiveAccount(activeCompany.id);
      if (!account) {
        setMessages((prev) => prev.map((m) => m.id === tempId ? { ...m, status: "failed" } : m));
        alert("No verified WhatsApp account configured");
        return;
      }

      if (!contactPhone) {
        setMessages((prev) => prev.map((m) => m.id === tempId ? { ...m, status: "failed" } : m));
        return;
      }

      if (!isWithinSessionWindow(activeConv.session_expires_at)) {
        setMessages((prev) => prev.map((m) => m.id === tempId ? { ...m, status: "failed" } : m));
        alert("Session expired. Use a template message to re-engage this contact.");
        return;
      }

      // 2. Send via API (mock in test mode)
      const result = await sendTextMessage(account, contactPhone, msgBody);

      if (!result.success) {
        setMessages((prev) => prev.map((m) => m.id === tempId ? { ...m, status: "failed" } : m));
        alert(`Failed to send: ${result.error}`);
        return;
      }

      // 3. Update temp message status to "sent"
      setMessages((prev) => prev.map((m) => m.id === tempId ? { ...m, status: "sent" } : m));

      // 4. Persist to DB in background (don't block UI)
      supabase.from("whatsapp_messages").insert({
        company_id: activeCompany.id,
        conversation_id: convId,
        contact_id: contactId,
        direction: "outbound",
        message_type: "text",
        body: msgBody,
        wa_message_id: result.wa_message_id,
        status: "sent",
        sent_by: user.id,
        sent_at: now,
      }).then(({ error }) => {
        if (error) console.error("[AgentInbox] DB insert error:", error.message);
      });

      // 5. Update conversation in background
      supabase.from("whatsapp_conversations").update({
        last_message_at: now,
        last_message_preview: msgBody.substring(0, 100),
        status: "open",
        assigned_to: user.id,
      }).eq("id", convId).then(() => {
        loadConversations();
      });

    } finally {
      setSending(false);
    }
  };

  const handleAssignToMe = async () => {
    if (!activeConv || !user) return;
    await supabase
      .from("whatsapp_conversations")
      .update({ assigned_to: user.id, status: "open" })
      .eq("id", activeConv.id);
    setActiveConv({ ...activeConv, assigned_to: user.id, status: "open" });
    loadConversations();
  };

  const handleResolve = async () => {
    if (!activeConv) return;
    await supabase
      .from("whatsapp_conversations")
      .update({ status: "resolved" })
      .eq("id", activeConv.id);
    setActiveConv(null);
    loadConversations();
  };

  const filteredConvs = conversations.filter((c) => {
    if (!search) return true;
    const name = c.whatsapp_contacts?.name?.toLowerCase() || "";
    const phone = c.whatsapp_contacts?.phone || "";
    return name.includes(search.toLowerCase()) || phone.includes(search);
  });

  const formatTime = (ts: string | null) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  };

  const statusIcon = (status: string) => {
    if (status === "read") return <CheckCheck className="w-3 h-3 text-blue-500" />;
    if (status === "delivered") return <CheckCheck className="w-3 h-3 text-slate-400" />;
    if (status === "sent") return <Check className="w-3 h-3 text-slate-400" />;
    if (status === "failed") return <AlertCircle className="w-3 h-3 text-red-500" />;
    return <Clock className="w-3 h-3 text-slate-300" />;
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-white">
      {/* Conversation List */}
      <div className={cn(
        "w-full md:w-96 border-r border-slate-200 flex flex-col bg-white",
        activeConv ? "hidden md:flex" : "flex"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-black uppercase tracking-widest text-slate-900">Agent Inbox</h1>
            <Button variant="ghost" size="sm" onClick={loadConversations} className="h-7 w-7 p-0">
              <MessageSquare className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
              placeholder="Search contacts..."
            />
          </div>
          <div className="flex gap-1">
            {(["all", "mine", "waiting", "bot"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                  filter === f
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-xs text-slate-400">Loading...</div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-xs text-slate-400 gap-2">
              <MessageSquare className="w-8 h-8 text-slate-200" />
              <span>No conversations</span>
            </div>
          ) : (
            filteredConvs.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50/50 transition-all flex items-start gap-3",
                  activeConv?.id === conv.id && "bg-emerald-50/50 border-l-2 border-l-emerald-500"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  {conv.status === "bot" ? (
                    <Bot className="w-4 h-4 text-purple-500" />
                  ) : (
                    <UserCircle className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {conv.whatsapp_contacts?.name || "Unknown"}
                    </span>
                    <span className="text-[9px] text-slate-400 flex-shrink-0 ml-2">
                      {formatTime(conv.last_message_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-500 truncate pr-2">
                      {conv.last_message_preview || "No messages yet"}
                    </p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {conv.unread_count > 0 && (
                        <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[8px] font-bold flex items-center justify-center">
                          {conv.unread_count}
                        </span>
                      )}
                      <span className={cn("px-1.5 py-0.5 rounded text-[7px] font-black uppercase", STATUS_COLORS[conv.status] || "bg-slate-100 text-slate-500")}>
                        {conv.status}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col",
        !activeConv ? "hidden md:flex" : "flex"
      )}>
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4">
            <MessageSquare className="w-16 h-16" />
            <p className="text-sm font-bold">Select a conversation</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  className="md:hidden mr-1"
                  onClick={() => setActiveConv(null)}
                >
                  <ArrowLeft className="w-5 h-5 text-slate-500" />
                </button>
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {activeConv.whatsapp_contacts?.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-2.5 h-2.5 text-slate-400" />
                    <span className="text-[10px] text-slate-400 font-mono">
                      {activeConv.whatsapp_contacts?.phone}
                    </span>
                    {activeConv.session_expires_at && isWithinSessionWindow(activeConv.session_expires_at) && (
                      <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">SESSION ACTIVE</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeConv.status === "waiting" && (
                  <Button size="sm" className="h-7 text-[9px] font-bold bg-emerald-600 hover:bg-emerald-700" onClick={handleAssignToMe}>
                    Assign to Me
                  </Button>
                )}
                {activeConv.status === "open" && (
                  <Button size="sm" variant="outline" className="h-7 text-[9px] font-bold" onClick={handleResolve}>
                    Resolve
                  </Button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.direction === "outbound" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
                      msg.direction === "outbound"
                        ? "bg-emerald-600 text-white rounded-br-md"
                        : "bg-white text-slate-800 border border-slate-100 rounded-bl-md"
                    )}
                  >
                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">
                      {msg.body || `[${msg.message_type}]`}
                    </p>
                    <div className={cn(
                      "flex items-center gap-1 mt-1",
                      msg.direction === "outbound" ? "justify-end" : "justify-start"
                    )}>
                      <span className={cn(
                        "text-[9px]",
                        msg.direction === "outbound" ? "text-emerald-200" : "text-slate-400"
                      )}>
                        {new Date(msg.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {msg.direction === "outbound" && statusIcon(msg.status)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="px-4 py-3 border-t border-slate-200 bg-white">
              {activeConv.status === "resolved" || activeConv.status === "expired" ? (
                <div className="text-center py-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Conversation {activeConv.status}. Reopen by sending a template message.
                  </p>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      rows={1}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 max-h-32"
                      placeholder="Type a message..."
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="h-10 w-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 p-0"
                  >
                    <Send className={cn("w-4 h-4", sending && "animate-pulse")} />
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
