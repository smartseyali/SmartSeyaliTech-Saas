import { lazy } from "react";

const CRMDashboard = lazy(() => import("@/pages/modules/crm/CRMDashboard"));
const CRMLeads = lazy(() => import("@/pages/modules/crm/Leads"));
const CRMDeals = lazy(() => import("@/pages/modules/crm/Deals"));
const CRMContacts = lazy(() => import("@/pages/modules/crm/Contacts"));
const CRMPipelines = lazy(() => import("@/pages/modules/crm/Pipelines"));
const Forecast = lazy(() => import("@/pages/modules/crm/Forecast"));
const Accounts = lazy(() => import("@/pages/modules/crm/Accounts"));
const Segments = lazy(() => import("@/pages/modules/crm/Segments"));

export const crmRoutes = [
    { path: "/apps/crm", element: <CRMDashboard /> },
    { path: "/apps/crm/leads", element: <CRMLeads /> },
    { path: "/apps/crm/deals", element: <CRMDeals /> },
    { path: "/apps/crm/contacts", element: <CRMContacts /> },
    { path: "/apps/crm/pipelines", element: <CRMPipelines /> },
    { path: "/apps/crm/forecast", element: <Forecast /> },
    { path: "/apps/crm/accounts", element: <Accounts /> },
    { path: "/apps/crm/segments", element: <Segments /> },
];
