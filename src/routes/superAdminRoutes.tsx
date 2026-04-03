import { lazy } from "react";

const SuperAdminDashboard = lazy(() => import("@/pages/super-admin/Dashboard"));
const HeadlessConsole = lazy(() => import("@/pages/super-admin/HeadlessConsole"));
const PlatformTenants = lazy(() => import("@/pages/super-admin/Tenants"));
const PlatformUsers = lazy(() => import("@/pages/super-admin/Users"));
const PlatformPlans = lazy(() => import("@/pages/super-admin/Plans"));
const PlatformModules = lazy(() => import("@/pages/super-admin/Modules"));

export const superAdminRoutes = [
    { path: "/super-admin", element: <SuperAdminDashboard /> },
    { path: "/super-admin/tenants", element: <PlatformTenants /> },
    { path: "/super-admin/users", element: <PlatformUsers /> },
    { path: "/super-admin/plans", element: <PlatformPlans /> },
    { path: "/super-admin/modules", element: <PlatformModules /> },
    { path: "/super-admin/connectors", element: <HeadlessConsole /> },
];
