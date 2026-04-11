import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import {
  BarChart3, TrendingUp, Send, CheckCheck, Eye,
  AlertCircle, Users, MessageSquare, Bot, UserCircle,
  RefreshCw, Calendar, ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardStats {
  totalContacts: number;
  optedInContacts: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalMessagesSent: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  openConversations: number;
  waitingConversations: number;
  botConversations: number;
  resolvedConversations: number;
  activeBotRules: number;
  deliveryRate: number;
  readRate: number;
  responseRate: number;
}

interface CampaignRow {
  id: number;
  name: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  created_at: string;
}

interface AgentStat {
  agent_id: string;
  agent_name: string;
  open_count: number;
  resolved_count: number;
  avg_response_time: string;
}

export default function WhatsAppAnalytics() {
  const { activeCompany } = useTenant();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [agents, setAgents] = useState<AgentStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("30d");

  useEffect(() => {
    if (activeCompany) loadAnalytics();
  }, [activeCompany, period]);

  const loadAnalytics = async () => {
    if (!activeCompany) return;
    setLoading(true);

    const cid = activeCompany.id;
    const now = new Date();
    const since = period === "7d"
      ? new Date(now.getTime() - 7 * 86400000).toISOString()
      : period === "30d"
        ? new Date(now.getTime() - 30 * 86400000).toISOString()
        : "2000-01-01";

    try {
      const [
        { data: contacts },
        { data: campaignsData },
        { data: campaignMsgs },
        { data: conversations },
        { data: botRules },
        { data: directMsgs },
      ] = await Promise.all([
        supabase.from("whatsapp_contacts").select("id, opt_in").eq("company_id", cid),
        supabase.from("whatsapp_campaigns").select("*").eq("company_id", cid).gte("created_at", since).order("created_at", { ascending: false }),
        supabase.from("whatsapp_campaign_messages").select("status").eq("company_id", cid).gte("created_at", since),
        supabase.from("whatsapp_conversations").select("id, status, assigned_to").eq("company_id", cid),
        supabase.from("whatsapp_bot_rules").select("id").eq("company_id", cid).eq("is_active", true),
        supabase.from("whatsapp_messages").select("status, direction").eq("company_id", cid).gte("created_at", since),
      ]);

      const allContacts = contacts || [];
      const allCampMsgs = campaignMsgs || [];
      const allConvs = conversations || [];
      const allMsgs = directMsgs || [];

      const sent = allCampMsgs.filter((m) => ["sent", "delivered", "read"].includes(m.status)).length +
                   allMsgs.filter((m) => m.direction === "outbound" && ["sent", "delivered", "read"].includes(m.status)).length;
      const delivered = allCampMsgs.filter((m) => ["delivered", "read"].includes(m.status)).length +
                        allMsgs.filter((m) => m.direction === "outbound" && ["delivered", "read"].includes(m.status)).length;
      const read = allCampMsgs.filter((m) => m.status === "read").length +
                   allMsgs.filter((m) => m.direction === "outbound" && m.status === "read").length;
      const failed = allCampMsgs.filter((m) => m.status === "failed").length +
                     allMsgs.filter((m) => m.direction === "outbound" && m.status === "failed").length;

      const inbound = allMsgs.filter((m) => m.direction === "inbound").length;
      const outbound = allMsgs.filter((m) => m.direction === "outbound").length;

      setStats({
        totalContacts: allContacts.length,
        optedInContacts: allContacts.filter((c) => c.opt_in).length,
        totalCampaigns: (campaignsData || []).length,
        activeCampaigns: (campaignsData || []).filter((c) => c.status === "running").length,
        totalMessagesSent: sent,
        totalDelivered: delivered,
        totalRead: read,
        totalFailed: failed,
        openConversations: allConvs.filter((c) => c.status === "open").length,
        waitingConversations: allConvs.filter((c) => c.status === "waiting").length,
        botConversations: allConvs.filter((c) => c.status === "bot").length,
        resolvedConversations: allConvs.filter((c) => c.status === "resolved").length,
        activeBotRules: (botRules || []).length,
        deliveryRate: sent > 0 ? Math.round((delivered / sent) * 100) : 0,
        readRate: delivered > 0 ? Math.round((read / delivered) * 100) : 0,
        responseRate: outbound > 0 ? Math.round((inbound / outbound) * 100) : 0,
      });

      setCampaigns((campaignsData || []).slice(0, 10));

      // Agent stats
      const agentMap = new Map<string, { open: number; resolved: number }>();
      for (const conv of allConvs) {
        if (conv.assigned_to) {
          const current = agentMap.get(conv.assigned_to) || { open: 0, resolved: 0 };
          if (conv.status === "open") current.open++;
          if (conv.status === "resolved") current.resolved++;
          agentMap.set(conv.assigned_to, current);
        }
      }

      const agentStats: AgentStat[] = Array.from(agentMap.entries()).map(([id, s]) => ({
        agent_id: id,
        agent_name: id.substring(0, 8) + "...",
        open_count: s.open,
        resolved_count: s.resolved,
        avg_response_time: "-",
      }));
      setAgents(agentStats);
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
          <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-emerald-600 pl-4 uppercase">WhatsApp Analytics</h1>
          <div className="flex items-center gap-2 pl-4">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase leading-none">
              Campaign Performance & Agent Metrics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(["7d", "30d", "all"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                period === p
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-white border border-slate-200 text-slate-400 hover:text-emerald-600"
              )}
            >
              {p === "all" ? "All Time" : p}
            </button>
          ))}
          <button
            onClick={loadAnalytics}
            className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Messages Sent", value: stats?.totalMessagesSent || 0, sub: `${stats?.totalFailed || 0} failed`, icon: Send, color: "text-emerald-600 bg-emerald-50" },
          { label: "Delivery Rate", value: `${stats?.deliveryRate || 0}%`, sub: `${stats?.totalDelivered || 0} delivered`, icon: CheckCheck, color: "text-blue-600 bg-blue-50" },
          { label: "Read Rate", value: `${stats?.readRate || 0}%`, sub: `${stats?.totalRead || 0} read`, icon: Eye, color: "text-indigo-600 bg-indigo-50" },
          { label: "Response Rate", value: `${stats?.responseRate || 0}%`, sub: "Inbound / Outbound", icon: TrendingUp, color: "text-rose-600 bg-rose-50" },
        ].map((k) => (
          <div key={k.label} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("p-2 rounded-lg", k.color)}>
                <k.icon className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{k.label}</span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{k.value}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Contact & Conversation KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Contacts", value: stats?.totalContacts || 0, icon: Users, color: "text-slate-600" },
          { label: "Opted-In", value: stats?.optedInContacts || 0, icon: CheckCheck, color: "text-emerald-600" },
          { label: "Open Chats", value: stats?.openConversations || 0, icon: MessageSquare, color: "text-blue-600" },
          { label: "Waiting", value: stats?.waitingConversations || 0, icon: AlertCircle, color: "text-amber-600" },
          { label: "Bot Active", value: stats?.botConversations || 0, icon: Bot, color: "text-purple-600" },
          { label: "Bot Rules", value: stats?.activeBotRules || 0, icon: Bot, color: "text-indigo-600" },
        ].map((k) => (
          <div key={k.label} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <k.icon className={cn("w-4 h-4 mb-2", k.color)} />
            <p className="text-lg font-black text-slate-900 leading-none">{k.value}</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Performance Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3.5 bg-emerald-500 rounded-full" />
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign Performance</h2>
            </div>
            <span className="text-[9px] text-slate-400 font-bold">{campaigns.length} campaigns</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  <th className="px-4 py-2.5">Campaign</th>
                  <th className="px-4 py-2.5 text-center">Sent</th>
                  <th className="px-4 py-2.5 text-center">Delivered</th>
                  <th className="px-4 py-2.5 text-center">Read</th>
                  <th className="px-4 py-2.5 text-center">Failed</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-400">
                      No campaigns yet
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c) => {
                    const rate = c.sent_count > 0 ? Math.round((c.delivered_count / c.sent_count) * 100) : 0;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold text-slate-900">{c.name}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs font-mono font-bold text-slate-700">{c.sent_count}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-mono font-bold text-emerald-600">{c.delivered_count}</span>
                            <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${rate}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-xs font-mono font-bold text-blue-600">{c.read_count}</td>
                        <td className="px-4 py-3 text-center text-xs font-mono font-bold text-red-500">{c.failed_count}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                            c.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                            c.status === "running" ? "bg-blue-50 text-blue-600" :
                            c.status === "failed" ? "bg-red-50 text-red-600" :
                            "bg-slate-50 text-slate-500"
                          )}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Agent Performance */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agent Performance</h2>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {agents.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                <UserCircle className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                No agent activity yet
              </div>
            ) : (
              agents.map((a) => (
                <div key={a.agent_id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/50 border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{a.agent_name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[9px] font-bold text-emerald-600">{a.resolved_count} resolved</span>
                      <span className="text-[9px] font-bold text-blue-600">{a.open_count} open</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
