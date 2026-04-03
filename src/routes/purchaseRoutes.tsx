import { lazy } from "react";

const PurchaseDashboard = lazy(() => import("@/pages/modules/purchase/PurchaseDashboard"));
const PurchaseVendors = lazy(() => import("@/pages/modules/purchase/Vendors"));
const PurchaseOrders = lazy(() => import("@/pages/modules/purchase/PurchaseOrders"));
const PurchaseRequests = lazy(() => import("@/pages/modules/purchase/PurchaseRequests"));
const PurchaseBills = lazy(() => import("@/pages/modules/purchase/PurchaseBills"));
const GoodsReceipts = lazy(() => import("@/pages/modules/purchase/GoodsReceipts"));

export const purchaseRoutes = [
    { path: "/apps/purchase", element: <PurchaseDashboard /> },
    { path: "/apps/purchase/vendors", element: <PurchaseVendors /> },
    { path: "/apps/purchase/requests", element: <PurchaseRequests /> },
    { path: "/apps/purchase/orders", element: <PurchaseOrders /> },
    { path: "/apps/purchase/bills", element: <PurchaseBills /> },
    { path: "/apps/purchase/receipts", element: <GoodsReceipts /> },
];
