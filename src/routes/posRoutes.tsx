import { lazy } from "react";

const POSDashboard = lazy(() => import("@/pages/modules/pos/POSDashboard"));
const POSTerminal = lazy(() => import("@/pages/modules/pos/Terminal"));
const POSRegister = lazy(() => import("@/pages/modules/pos/Register"));
const POSOrdersLedger = lazy(() => import("@/pages/modules/pos/POSOrders"));

export const posRoutes = [
    { path: "/apps/pos", element: <POSDashboard /> },
    { path: "/apps/pos/terminal", element: <POSTerminal /> },
    { path: "/apps/pos/register", element: <POSRegister /> },
    { path: "/apps/pos/orders", element: <POSOrdersLedger /> },
];
