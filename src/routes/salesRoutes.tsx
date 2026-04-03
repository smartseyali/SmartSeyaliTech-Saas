import { lazy } from "react";

const SalesDashboard = lazy(() => import("@/pages/modules/sales/SalesDashboard"));
const SalesQuotations = lazy(() => import("@/pages/modules/sales/Quotations"));
const SalesOrders = lazy(() => import("@/pages/modules/sales/Orders"));
const SalesDeliveries = lazy(() => import("@/pages/modules/sales/Deliveries"));
const SalesCustomers = lazy(() => import("@/pages/modules/sales/Customers"));
const InvoiceList = lazy(() => import("@/pages/modules/sales/Invoices"));
const ReceiptVouchers = lazy(() => import("@/pages/modules/sales/ReceiptVouchers"));

export const salesRoutes = [
    { path: "/apps/sales", element: <SalesDashboard /> },
    { path: "/apps/sales/quotations", element: <SalesQuotations /> },
    { path: "/apps/sales/orders", element: <SalesOrders /> },
    { path: "/apps/sales/deliveries", element: <SalesDeliveries /> },
    { path: "/apps/sales/customers", element: <SalesCustomers /> },
    { path: "/apps/sales/invoices", element: <InvoiceList /> },
    { path: "/apps/sales/payments", element: <ReceiptVouchers /> },
];
