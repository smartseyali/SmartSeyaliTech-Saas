import { lazy } from "react";

const WhatsAppDashboard = lazy(() => import("@/pages/modules/whatsapp/WhatsAppDashboard"));
const WhatsAppAccounts = lazy(() => import("@/pages/modules/whatsapp/Accounts"));
const WhatsAppTemplates = lazy(() => import("@/pages/modules/whatsapp/Templates"));
const WhatsAppCampaigns = lazy(() => import("@/pages/modules/whatsapp/Campaigns"));
const WhatsAppContacts = lazy(() => import("@/pages/modules/whatsapp/Contacts"));
const WhatsAppBotRules = lazy(() => import("@/pages/modules/whatsapp/BotRules"));
const WhatsAppConversations = lazy(() => import("@/pages/modules/whatsapp/Conversations"));
const WhatsAppAgentInbox = lazy(() => import("@/pages/modules/whatsapp/AgentInbox"));
const WhatsAppAnalytics = lazy(() => import("@/pages/modules/whatsapp/Analytics"));
const WhatsAppLogs = lazy(() => import("@/pages/modules/whatsapp/Logs"));

export const whatsappRoutes = [
    { path: "/apps/whatsapp", element: <WhatsAppDashboard /> },
    { path: "/apps/whatsapp/accounts", element: <WhatsAppAccounts /> },
    { path: "/apps/whatsapp/templates", element: <WhatsAppTemplates /> },
    { path: "/apps/whatsapp/campaigns", element: <WhatsAppCampaigns /> },
    { path: "/apps/whatsapp/contacts", element: <WhatsAppContacts /> },
    { path: "/apps/whatsapp/bot-rules", element: <WhatsAppBotRules /> },
    { path: "/apps/whatsapp/conversations", element: <WhatsAppConversations /> },
    { path: "/apps/whatsapp/inbox", element: <WhatsAppAgentInbox /> },
    { path: "/apps/whatsapp/analytics", element: <WhatsAppAnalytics /> },
    { path: "/apps/whatsapp/logs", element: <WhatsAppLogs /> },
];
