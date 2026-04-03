import { lazy } from "react";

const InventoryDashboard = lazy(() => import("@/pages/modules/inventory/InventoryDashboard"));
const InventoryItems = lazy(() => import("@/pages/modules/inventory/Items"));
const Warehouses = lazy(() => import("@/pages/modules/inventory/Warehouses"));
const StockLevels = lazy(() => import("@/pages/modules/inventory/StockLevels"));
const StockTransfers = lazy(() => import("@/pages/modules/inventory/StockTransfers"));
const StockAudits = lazy(() => import("@/pages/modules/inventory/StockAudits"));
const BatchTracking = lazy(() => import("@/pages/modules/inventory/BatchTracking"));

export const inventoryRoutes = [
    { path: "/apps/inventory", element: <InventoryDashboard /> },
    { path: "/apps/inventory/items", element: <InventoryItems /> },
    { path: "/apps/inventory/warehouses", element: <Warehouses /> },
    { path: "/apps/inventory/levels", element: <StockLevels /> },
    { path: "/apps/inventory/transfers", element: <StockTransfers /> },
    { path: "/apps/inventory/audits", element: <StockAudits /> },
    { path: "/apps/inventory/batches", element: <BatchTracking /> },
];
