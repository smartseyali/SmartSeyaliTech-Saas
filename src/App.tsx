import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TenantProvider, useTenant } from "@/contexts/TenantContext";
import { PermissionsProvider, usePermissions } from "@/contexts/PermissionsContext";
import { CartProvider } from "@/contexts/CartContext";
import { AppLayout } from "@/components/layout/AppLayout";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";

import EcomDashboard from "./pages/ecommerce/EcomDashboard";
import EcomOrders from "./pages/ecommerce/EcomOrders";
import EcomOrderDetail from "./pages/ecommerce/EcomOrderDetail";
import Billing from "./pages/ecommerce/Billing";
import Coupons from "./pages/ecommerce/Coupons";
import Offers from "./pages/ecommerce/Offers";
import Refunds from "./pages/ecommerce/Refunds";
import PaymentGateways from "./pages/ecommerce/PaymentGateways";
import Reviews from "./pages/ecommerce/Reviews";
import AbandonedCarts from "./pages/ecommerce/AbandonedCarts";
import Gallery from "./pages/ecommerce/Gallery";
import ShippingZones from "./pages/ecommerce/ShippingZones";
import Deliveries from "./pages/ecommerce/Deliveries";
import Website from "./pages/ecommerce/Website";
import { EcomProducts } from "./pages/ecommerce/masters/EcomProducts";
import { Categories } from "./pages/ecommerce/masters/Categories";
import { Brands } from "./pages/ecommerce/masters/Brands";
import { Collections } from "./pages/ecommerce/masters/Collections";
import Banners from "./pages/ecommerce/Banners";
import BulkImport from "./pages/ecommerce/BulkImport";
import Team from "./pages/ecommerce/Team";
import Analytics from "./pages/ecommerce/Analytics";
import Reports from "./pages/ecommerce/Reports";
import APIIntegrations from "./pages/ecommerce/APIIntegrations";
import Settings from "./pages/ecommerce/Settings";
import Customers from "./pages/ecommerce/Customers";

import { StoreLayout } from "./components/storefront/StoreLayout";
import StoreHome from "./pages/storefront/home/Index";
import StoreShop from "./pages/storefront/shop/Index";
import StoreProductDetail from "./pages/storefront/product/Index";
import StoreCart from "./pages/storefront/Cart";
import StoreCheckout from "./pages/storefront/Checkout";
import StoreSeeder from "./pages/storefront/Seeder";
import StoreAbout from "./pages/storefront/About";
import StoreOrders from "./pages/storefront/Orders";
import StoreOrderDetail from "./pages/storefront/OrderDetail";
import StoreOrderSuccess from "./pages/storefront/OrderSuccess";
import StoreContact from "./pages/storefront/Contact";

import SuperAdminDashboard from "./pages/super-admin/Dashboard";
import HeadlessConsole from "./pages/super-admin/HeadlessConsole";
import Onboarding from "./pages/ecommerce/Onboarding";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const { needsOnboarding, loading } = useTenant();

    if (!user) return <Navigate to="/login" replace />;
    if (loading) return null;

    // Force onboarding if company doesn't exist AND we aren't already on the onboarding page
    if (needsOnboarding && window.location.pathname !== "/onboarding") {
        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
};

const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const { isSuperAdmin, loading: pLoading } = usePermissions();
    const { loading: tLoading } = useTenant();

    if (!user) return <Navigate to="/login" replace />;
    if (pLoading || tLoading) return null;

    // Only actual Super Admins can enter the Control Center
    if (!isSuperAdmin) return <Navigate to="/ecommerce" replace />;

    return <>{children}</>;
};

import { ThemeProvider } from "@/components/ThemeProvider";

const App = () => (
    <ThemeProvider defaultTheme="system" storageKey="ecom-suite-theme">
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <AuthProvider>
                    <TenantProvider>
                        <PermissionsProvider>
                            <CartProvider>
                                <BrowserRouter>
                                    <Routes>
                                        {/* Storefront Routes (Dynamic Path-based Multi-tenancy) */}
                                        <Route path="/:companySlug" element={<StoreLayout />}>
                                            <Route index element={<StoreHome />} />
                                            <Route path="shop" element={<StoreShop />} />
                                            <Route path="product/:id" element={<StoreProductDetail />} />
                                            <Route path="cart" element={<StoreCart />} />
                                            <Route path="checkout" element={<StoreCheckout />} />
                                            <Route path="about" element={<StoreAbout />} />
                                            <Route path="account/orders" element={<StoreOrders />} />
                                            <Route path="account/orders/:id" element={<StoreOrderDetail />} />
                                            <Route path="order-detail/:id" element={<StoreOrderDetail />} />
                                            <Route path="order-success/:id" element={<StoreOrderSuccess />} />
                                            <Route path="orders" element={<StoreOrders />} />
                                            <Route path="contact" element={<StoreContact />} />
                                        </Route>

                                        {/* Default Storefront (Home) */}
                                        <Route element={<StoreLayout />}>
                                            <Route path="/" element={<StoreHome />} />
                                            <Route path="/seed" element={<StoreSeeder />} />
                                        </Route>

                                        <Route path="/login" element={<Login />} />
                                        <Route path="/ecommerce-login" element={<Login />} />
                                        <Route path="/reset-password" element={<ResetPassword />} />

                                        {/* Super Admin Control Center */}
                                        <Route element={<AppLayout />}>
                                            <Route path="/super-admin" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />
                                            <Route path="/super-admin/connectors" element={<SuperAdminRoute><HeadlessConsole /></SuperAdminRoute>} />
                                        </Route>

                                        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

                                        {/* Ecommerce Admin Routes (Protected) */}
                                        <Route element={<AppLayout />}>
                                            <Route path="/ecommerce" element={<ProtectedRoute><EcomDashboard /></ProtectedRoute>} />
                                            <Route path="/ecommerce/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
                                            <Route path="/ecommerce/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
                                            <Route path="/ecommerce/orders" element={<ProtectedRoute><EcomOrders /></ProtectedRoute>} />
                                            <Route path="/ecommerce/orders/:id" element={<ProtectedRoute><EcomOrderDetail /></ProtectedRoute>} />
                                            <Route path="/ecommerce/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
                                            <Route path="/ecommerce/coupons" element={<ProtectedRoute><Coupons /></ProtectedRoute>} />
                                            <Route path="/ecommerce/offers" element={<ProtectedRoute><Offers /></ProtectedRoute>} />
                                            <Route path="/ecommerce/refunds" element={<ProtectedRoute><Refunds /></ProtectedRoute>} />
                                            <Route path="/ecommerce/payment-gateways" element={<ProtectedRoute><PaymentGateways /></ProtectedRoute>} />
                                            <Route path="/ecommerce/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
                                            <Route path="/ecommerce/abandoned-carts" element={<ProtectedRoute><AbandonedCarts /></ProtectedRoute>} />
                                            <Route path="/ecommerce/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
                                            <Route path="/ecommerce/shipping-zones" element={<ProtectedRoute><ShippingZones /></ProtectedRoute>} />
                                            <Route path="/ecommerce/deliveries" element={<ProtectedRoute><Deliveries /></ProtectedRoute>} />
                                            <Route path="/ecommerce/website" element={<ProtectedRoute><Website /></ProtectedRoute>} />
                                            <Route path="/ecommerce/masters/products" element={<ProtectedRoute><EcomProducts /></ProtectedRoute>} />
                                            <Route path="/ecommerce/masters/products/import" element={<ProtectedRoute><BulkImport /></ProtectedRoute>} />
                                            <Route path="/ecommerce/masters/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
                                            <Route path="/ecommerce/masters/brands" element={<ProtectedRoute><Brands /></ProtectedRoute>} />
                                            <Route path="/ecommerce/masters/collections" element={<ProtectedRoute><Collections /></ProtectedRoute>} />
                                            <Route path="/ecommerce/banners" element={<ProtectedRoute><Banners /></ProtectedRoute>} />
                                            <Route path="/ecommerce/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                                            <Route path="/ecommerce/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                                            <Route path="/ecommerce/api-integrations" element={<ProtectedRoute><APIIntegrations /></ProtectedRoute>} />
                                            <Route path="/ecommerce/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                                        </Route>

                                        <Route path="*" element={<StoreLayout><NotFound /></StoreLayout>} />
                                    </Routes>
                                </BrowserRouter>
                            </CartProvider>
                        </PermissionsProvider>
                    </TenantProvider>
                </AuthProvider>
            </TooltipProvider>
        </QueryClientProvider>
    </ThemeProvider>
);

export default App;
