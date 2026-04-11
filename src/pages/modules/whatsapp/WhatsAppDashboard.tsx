import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { Link } from "react-router-dom";
import {
  MessageSquare, Send, CheckCircle2, Clock, Plus, Zap,
  Users, BarChart3, Settings, MessageCircle, Bot,
  UserCircle, Megaphone, FileText, RefreshCw,
  Phone, ArrowUpRight, Eye, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Stats {
  sentToday: number;
  deliveryRate: number;
  readRate: number;
  activeConversations: number;
  totalContacts: number;
  activeCampaigns: number;
  botRulesActive: number;
  waitingQueue: number;
}

interface RecentCampaign {
  id: number;
  name: string;
  status: string;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  campaign_type: string;
  created_at: string;
}

interface RecentConversation {
  id: number;
  status: string;
  last_message_preview: string | null;
  last_message_at: string | null;
  unread_count: number;
  whatsapp_contacts: { name: string; phone: string } | null;
}

export default function WhatsAppDashboard() {
  const { activeCompany } = useTenant();
  const [stats, setStats] = useState<Stats | null>(null);
  const [campaigns, setCampaigns] = useState<RecentCampaign[]>([]);
  const [conversations, setConversations] = useState<RecentConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeCompany) load();
  }, [activeCompany]);

  const load = async () => {
    if (!activeCompany) return;
    setLoading(true);
    const cid = activeCompany.id;
    const today = new Date().toISOString().split("T")[0];

    try {
      const [
        { data: todayMsgs },
        { data: allOutbound },
        { data: convs },
        { data: contacts },
        { data: campsData },
        { data: botRules },
        { data: recentConvs },
      ] = await Promise.all([
        supabase.from("whatsapp_messages").select("status").eq("company_id", cid).eq("direction", "outbound").gte("created_at", today),
        supabase.from("whatsapp_messages").select("status").eq("company_id", cid).eq("direction", "outbound"),
        supabase.from("whatsapp_conversations").select("status").eq("company_id", cid),
        supabase.from("whatsapp_contacts").select("id").eq("company_id", cid),
        supabase.from("whatsapp_campaigns").select("*").eq("company_id", cid).order("created_at", { ascending: false }).limit(5),
        supabase.from("whatsapp_bot_rules").select("id").eq("company_id", cid).eq("is_active", true),
        supabase.from("whatsapp_conversations").select("*, whatsapp_contacts(name, phone)").eq("company_id", cid).order("last_message_at", { ascending: false }).limit(5),
      ]);

      const out = allOutbound || [];
      const sent = out.filter((m) => ["sent", "delivered", "read"].includes(m.status)).length;
      const delivered = out.filter((m) => ["delivered", "read"].includes(m.status)).length;
      const read = out.filter((m) => m.status === "read").length;
      const allConvs = convs || [];

      setStats({
        sentToday: (todayMsgs || []).length,
        deliveryRate: sent > 0 ? Math.round((delivered / sent) * 100) : 0,
        readRate: delivered > 0 ? Math.round((read / delivered) * 100) : 0,
        activeConversations: allConvs.filter((c) => ["open", "bot", "waiting"].includes(c.status)).length,
        totalContacts: (contacts || []).length,
        activeCampaigns: (campsData || []).filter((c) => c.status === "running").length,
        botRulesActive: (botRules || []).length,
        waitingQueue: allConvs.filter((c) => c.status === "waiting").length,
      });

      setCampaigns(campsData || []);
      setConversations(recentConvs || []);
    } finally {
      setLoading(false);
    }
  };

  if (!activeCompany) return null;

  return (
    <div className="min-h-screen bg-slate-50/20 font-sans p-4 lg:p-6 space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-600 pl-4 uppercase">
            Messaging Intelligence
          </h1>
          <div className="flex items-center gap-2 pl-4">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase leading-none">
              Official Business API (WABA) Control &bull; {activeCompany.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          </button>
          <Link to="/apps/whatsapp/campaigns">
            <Button size="sm" className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black shadow-lg shadow-emerald-500/20 uppercase tracking-widest rounded-lg">
              <Plus className="w-3.5 h-3.5 mr-2" /> New Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Sent Today", value: stats?.sentToday ?? 0, sub: "Bulk & Session", icon: Send, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Delivery Rate", value: `${stats?.deliveryRate ?? 0}%`, sub: "Verified via Meta", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Read Rate", value: `${stats?.readRate ?? 0}%`, sub: "Customer Engagement", icon: Eye, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Active Chats", value: stats?.activeConversations ?? 0, sub: `${stats?.waitingQueue ?? 0} waiting`, icon: MessageCircle, color: "text-slate-600", bg: "bg-slate-100" },
        ].map((k) => (
          <div key={k.label} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("p-2 rounded-lg", k.bg, k.color)}>
                <k.icon className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{k.label}</span>
            </div>
            <p className="text-xl font-black text-slate-900 tracking-tight leading-none">{k.value}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-none">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaigns Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3.5 bg-emerald-500 rounded-full" />
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Campaigns</h2>
            </div>
            <Link to="/apps/whatsapp/campaigns">
              <Button variant="ghost" size="sm" className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50">
                View All
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  <th className="px-4 py-2.5">Campaign</th>
                  <th className="px-4 py-2.5 text-center">Sent</th>
                  <th className="px-4 py-2.5 text-center">Read</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-xs text-slate-400">
                      <Megaphone className="w-6 h-6 mx-auto mb-2 text-slate-200" />
                      No campaigns yet. Create your first campaign.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c) => (
                    <tr key={c.id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{c.name}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{c.campaign_type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-[11px] font-bold text-slate-700">{c.sent_count}</td>
                      <td className="px-4 py-3 text-center text-[11px] font-bold text-emerald-600">{c.read_count}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                          c.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                          c.status === "running" ? "bg-blue-50 text-blue-600 animate-pulse" :
                          c.status === "scheduled" ? "bg-amber-50 text-amber-600" :
                          c.status === "failed" ? "bg-red-50 text-red-600" :
                          "bg-slate-50 text-slate-500"
                        )}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          {/* Recent Conversations */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Chats</h2>
              </div>
              <Link to="/apps/whatsapp/inbox">
                <Button variant="ghost" size="sm" className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-50">
                  Open Inbox
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  <MessageSquare className="w-6 h-6 mx-auto mb-2 text-slate-200" />
                  No active conversations
                </div>
              ) : (
                conversations.slice(0, 4).map((conv) => (
                  <Link
                    key={conv.id}
                    to="/apps/whatsapp/inbox"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      {conv.status === "bot" ? <Bot className="w-3.5 h-3.5 text-purple-500" /> : <UserCircle className="w-4 h-4 text-slate-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-900 truncate">{conv.whatsapp_contacts?.name || "Unknown"}</p>
                      <p className="text-[9px] text-slate-400 truncate">{conv.last_message_preview}</p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[8px] font-bold flex items-center justify-center flex-shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="bg-slate-900 rounded-xl p-5 text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-[9px] font-black tracking-widest text-emerald-400 mb-4 uppercase leading-none">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Contacts", icon: Users, link: "/apps/whatsapp/contacts", color: "text-emerald-400" },
                  { label: "Templates", icon: FileText, link: "/apps/whatsapp/templates", color: "text-blue-400" },
                  { label: "Bot Rules", icon: Bot, link: "/apps/whatsapp/bot-rules", color: "text-purple-400" },
                  { label: "Analytics", icon: BarChart3, link: "/apps/whatsapp/analytics", color: "text-amber-400" },
                  { label: "Accounts", icon: Phone, link: "/apps/whatsapp/accounts", color: "text-cyan-400" },
                  { label: "Logs", icon: Clock, link: "/apps/whatsapp/logs", color: "text-slate-400" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.link}
                    className="p-3 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center gap-2 hover:bg-white/10 transition-all group/item"
                  >
                    <item.icon className={cn("w-4 h-4 transition-transform group-hover/item:scale-110", item.color)} />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none text-center group-hover/item:text-white transition-colors">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-600/10 rounded-full blur-3xl group-hover:bg-emerald-600/20 transition-all pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
