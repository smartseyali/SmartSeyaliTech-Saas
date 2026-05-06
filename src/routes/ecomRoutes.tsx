import { lazy } from "react";

// ── E-Commerce Admin Pages ──
const EcommerceDashboard = lazy(() => import("@/pages/modules/ecommerce/EcommerceDashboard"));
const EcomOrders = lazy(() => import("@/pages/modules/ecommerce/EcomOrders"));
const EcomOrderDetail = lazy(() => import("@/pages/modules/ecommerce/EcomOrderDetail"));
const Billing = lazy(() => import("@/pages/modules/ecommerce/Billing"));
const Coupons = lazy(() => import("@/pages/modules/ecommerce/Coupons"));
const Offers = lazy(() => import("@/pages/modules/ecommerce/Offers"));
const Refunds = lazy(() => import("@/pages/modules/ecommerce/Refunds"));
const PaymentGateways = lazy(() => import("@/pages/modules/ecommerce/PaymentGateways"));
const Reviews = lazy(() => import("@/pages/modules/ecommerce/Reviews"));
const AbandonedCarts = lazy(() => import("@/pages/modules/ecommerce/AbandonedCarts"));
const Gallery = lazy(() => import("@/pages/modules/ecommerce/Gallery"));
const ShippingZones = lazy(() => import("@/pages/modules/ecommerce/ShippingZones"));
const Deliveries = lazy(() => import("@/pages/modules/ecommerce/Deliveries"));
const Website = lazy(() => import("@/pages/modules/ecommerce/Website"));
const Banners = lazy(() => import("@/pages/modules/ecommerce/Banners"));
const Team = lazy(() => import("@/pages/modules/ecommerce/Team"));
const Analytics = lazy(() => import("@/pages/modules/ecommerce/Analytics"));
const Reports = lazy(() => import("@/pages/modules/ecommerce/Reports"));
const APIIntegrations = lazy(() => import("@/pages/modules/ecommerce/APIIntegrations"));
const Settings = lazy(() => import("@/pages/modules/ecommerce/Settings"));
const DomainHosting = lazy(() => import("@/pages/modules/ecommerce/DomainHosting"));
const Customers = lazy(() => import("@/pages/modules/ecommerce/Customers"));
const OrderTracking = lazy(() => import("@/pages/modules/ecommerce/OrderTracking"));
const EcomOnboarding = lazy(() => import("@/pages/modules/ecommerce/Onboarding"));

/** Admin routes rendered inside AppLayout with ProtectedRoute */
export const ecomAdminRoutes = [
    { path: "/apps/ecommerce", element: <EcommerceDashboard /> },
    { path: "/apps/ecommerce/team", element: <Team /> },
    { path: "/apps/ecommerce/billing", element: <Billing /> },
    { path: "/apps/ecommerce/orders", element: <EcomOrders /> },
    { path: "/apps/ecommerce/orders/:id", element: <EcomOrderDetail /> },
    { path: "/apps/ecommerce/customers", element: <Customers /> },
    { path: "/apps/ecommerce/coupons", element: <Coupons /> },
    { path: "/apps/ecommerce/offers", element: <Offers /> },
    { path: "/apps/ecommerce/refunds", element: <Refunds /> },
    { path: "/apps/ecommerce/payment-gateways", element: <PaymentGateways /> },
    { path: "/apps/ecommerce/reviews", element: <Reviews /> },
    { path: "/apps/ecommerce/abandoned-carts", element: <AbandonedCarts /> },
    { path: "/apps/ecommerce/gallery", element: <Gallery /> },
    { path: "/apps/ecommerce/shipping-zones", element: <ShippingZones /> },
    { path: "/apps/ecommerce/deliveries", element: <Deliveries /> },
    { path: "/apps/ecommerce/website", element: <Website /> },
    { path: "/apps/ecommerce/banners", element: <Banners /> },
    { path: "/apps/ecommerce/analytics", element: <Analytics /> },
    { path: "/apps/ecommerce/reports", element: <Reports /> },
    { path: "/apps/ecommerce/api-integrations", element: <APIIntegrations /> },
    { path: "/apps/ecommerce/settings", element: <Settings /> },
    { path: "/apps/ecommerce/domain", element: <DomainHosting /> },
    { path: "/apps/ecommerce/track", element: <OrderTracking /> },
    { path: "/apps/ecommerce/track/:orderNumber", element: <OrderTracking /> },
    { path: "/apps/ecommerce/onboarding", element: <EcomOnboarding /> },
];
