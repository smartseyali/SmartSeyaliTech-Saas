import { lazy } from "react";

const WhatsAppDashboard = lazy(() => import("@/pages/modules/whatsapp/WhatsAppDashboard"));
const WhatsAppAccounts = lazy(() => import("@/pages/modules/whatsapp/Accounts"));
const WhatsAppTemplates = lazy(() => import("@/pages/modules/whatsapp/Templates"));
const WhatsAppCampaigns = lazy(() => import("@/pages/modules/whatsapp/Campaigns"));

export const whatsappRoutes = [
    { path: "/apps/whatsapp", element: <WhatsAppDashboard /> },
    { path: "/apps/whatsapp/accounts", element: <WhatsAppAccounts /> },
    { path: "/apps/whatsapp/templates", element: <WhatsAppTemplates /> },
    { path: "/apps/whatsapp/campaigns", element: <WhatsAppCampaigns /> },
];
