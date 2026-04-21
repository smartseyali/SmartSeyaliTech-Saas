import { lazy } from "react";

const SuperAdminDashboard = lazy(() => import("@/pages/super-admin/Dashboard"));
const HeadlessConsole = lazy(() => import("@/pages/super-admin/HeadlessConsole"));
const PlatformTenants = lazy(() => import("@/pages/super-admin/Tenants"));
const PlatformUsers = lazy(() => import("@/pages/super-admin/Users"));
const PlatformPlans = lazy(() => import("@/pages/super-admin/Plans"));
const PlatformModules = lazy(() => import("@/pages/super-admin/Modules"));
const PlatformSubscriptions = lazy(() => import("@/pages/super-admin/Subscriptions"));
const PlatformSettings = lazy(() => import("@/pages/super-admin/Settings"));

// Global master tables (seeded, managed here, read-only for merchants)
const PlatformCountries = lazy(() => import("@/pages/super-admin/masters/Countries"));
const PlatformStates = lazy(() => import("@/pages/super-admin/masters/States"));
const PlatformDistricts = lazy(() => import("@/pages/super-admin/masters/Districts"));
const PlatformPrintFormats = lazy(() => import("@/pages/super-admin/masters/PrintFormats"));

export const superAdminRoutes = [
    { path: "/super-admin", element: <SuperAdminDashboard /> },
    { path: "/super-admin/tenants", element: <PlatformTenants /> },
    { path: "/super-admin/users", element: <PlatformUsers /> },
    { path: "/super-admin/plans", element: <PlatformPlans /> },
    { path: "/super-admin/modules", element: <PlatformModules /> },
    { path: "/super-admin/subscriptions", element: <PlatformSubscriptions /> },
    { path: "/super-admin/connectors", element: <HeadlessConsole /> },
    { path: "/super-admin/settings", element: <PlatformSettings /> },

    // Global masters
    { path: "/super-admin/masters/countries", element: <PlatformCountries /> },
    { path: "/super-admin/masters/states", element: <PlatformStates /> },
    { path: "/super-admin/masters/districts", element: <PlatformDistricts /> },
    { path: "/super-admin/masters/print-formats", element: <PlatformPrintFormats /> },
];
