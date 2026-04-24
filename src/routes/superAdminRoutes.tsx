import { lazy } from "react";

const SuperAdminDashboard = lazy(() => import("@/pages/super-admin/Dashboard"));
const HeadlessConsole = lazy(() => import("@/pages/super-admin/HeadlessConsole"));
const PlatformTenants = lazy(() => import("@/pages/super-admin/Tenants"));
const PlatformUsers = lazy(() => import("@/pages/super-admin/Users"));
const PlatformPlans = lazy(() => import("@/pages/super-admin/Plans"));
const PlatformModules = lazy(() => import("@/pages/super-admin/Modules"));
const PlatformSubscriptions = lazy(() => import("@/pages/super-admin/Subscriptions"));
const PlatformQuotations = lazy(() => import("@/pages/super-admin/Quotations"));
const PlatformSettings = lazy(() => import("@/pages/super-admin/Settings"));

// Master data
const PlatformCurrencies     = lazy(() => import("@/pages/super-admin/Currencies"));
const PlatformCountries      = lazy(() => import("@/pages/super-admin/Countries"));
const PlatformLanguages      = lazy(() => import("@/pages/super-admin/Languages"));
const PlatformIndustries     = lazy(() => import("@/pages/super-admin/Industries"));
const PlatformTaxRates       = lazy(() => import("@/pages/super-admin/TaxRates"));
const PlatformEmailTemplates = lazy(() => import("@/pages/super-admin/EmailTemplates"));
const PlatformAnnouncements  = lazy(() => import("@/pages/super-admin/Announcements"));
const PlatformFeatureFlags   = lazy(() => import("@/pages/super-admin/FeatureFlags"));
const PlatformAuditLogs      = lazy(() => import("@/pages/super-admin/AuditLogs"));
const PlatformTemplates      = lazy(() => import("@/pages/super-admin/Templates"));
const PlatformDeployments    = lazy(() => import("@/pages/super-admin/Deployments"));

export const superAdminRoutes = [
    { path: "/super-admin", element: <SuperAdminDashboard /> },
    { path: "/super-admin/tenants", element: <PlatformTenants /> },
    { path: "/super-admin/users", element: <PlatformUsers /> },
    { path: "/super-admin/plans", element: <PlatformPlans /> },
    { path: "/super-admin/modules", element: <PlatformModules /> },
    { path: "/super-admin/subscriptions", element: <PlatformSubscriptions /> },
    { path: "/super-admin/quotations", element: <PlatformQuotations /> },
    { path: "/super-admin/connectors", element: <HeadlessConsole /> },
    { path: "/super-admin/settings", element: <PlatformSettings /> },

    // Master data
    { path: "/super-admin/currencies",      element: <PlatformCurrencies /> },
    { path: "/super-admin/countries",       element: <PlatformCountries /> },
    { path: "/super-admin/languages",       element: <PlatformLanguages /> },
    { path: "/super-admin/industries",      element: <PlatformIndustries /> },
    { path: "/super-admin/tax-rates",       element: <PlatformTaxRates /> },
    { path: "/super-admin/email-templates", element: <PlatformEmailTemplates /> },
    { path: "/super-admin/announcements",   element: <PlatformAnnouncements /> },
    { path: "/super-admin/feature-flags",   element: <PlatformFeatureFlags /> },
    { path: "/super-admin/audit-logs",      element: <PlatformAuditLogs /> },
    { path: "/super-admin/templates",       element: <PlatformTemplates /> },
    { path: "/super-admin/deployments",      element: <PlatformDeployments /> },
];
