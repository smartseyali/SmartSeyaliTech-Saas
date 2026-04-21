import { Suspense, lazy } from "react";
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
import { PlatformLoader } from "@/components/PlatformLoader";
import { SessionTimeoutHandler } from "@/components/auth/SessionTimeoutHandler";
import { ThemeProvider } from "@/components/ThemeProvider";

// ── Eagerly loaded layouts (needed immediately for route structure) ──
import { MarketingLayout } from "./components/marketing/MarketingLayout";

// ── Lazy-loaded standalone pages (not part of any module) ──
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AppLauncher = lazy(() => import("./pages/AppLauncher"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const Profile = lazy(() => import("./pages/Profile"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const VerifyEmailPending = lazy(() => import("./pages/VerifyEmailPending"));
const VerifyTenantEmail = lazy(() => import("./pages/VerifyTenantEmail"));

// ── Storefront Customer Pages (public, not behind ProtectedRoute) ──
const StorefrontLogin = lazy(() => import("./pages/StorefrontLogin"));
const OrderTracking = lazy(() => import("./pages/modules/ecommerce/OrderTracking"));
const MyOrders = lazy(() => import("./pages/modules/ecommerce/MyOrders"));
const VerifyEmail = lazy(() => import("./pages/modules/ecommerce/VerifyEmail"));

// ── Lazy-loaded marketing pages ──
const MarketingIndex = lazy(() => import("./pages/marketing/Index"));
const MarketingAbout = lazy(() => import("./pages/marketing/About"));
const MarketingServices = lazy(() => import("./pages/marketing/Services"));
const MarketingProducts = lazy(() => import("./pages/marketing/Products"));
const MarketingModuleDetail = lazy(() => import("./pages/marketing/ModuleDetail"));
const MarketingContact = lazy(() => import("./pages/marketing/Contact"));
const MarketingPolicy = lazy(() => import("./pages/marketing/License"));

// ── Per-module route arrays (each file lazy-imports its own pages) ──
import { ecomAdminRoutes } from "./routes/ecomRoutes";
import { salesRoutes } from "./routes/salesRoutes";
import { purchaseRoutes } from "./routes/purchaseRoutes";
import { inventoryRoutes } from "./routes/inventoryRoutes";
import { crmRoutes } from "./routes/crmRoutes";
import { hrmsRoutes } from "./routes/hrmsRoutes";
import { posRoutes } from "./routes/posRoutes";
import { financeRoutes } from "./routes/financeRoutes";
import { mastersRoutes } from "./routes/mastersRoutes";
import { whatsappRoutes } from "./routes/whatsappRoutes";
import { websiteRoutes } from "./routes/websiteRoutes";
import { superAdminRoutes } from "./routes/superAdminRoutes";

// ── Query Client ──
const queryClient = new QueryClient();

// ── Route Guards ──

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const { needsOnboarding, loading: tLoading } = useTenant();
    const { isSuperAdmin, emailVerified, loading: pLoading } = usePermissions();
    const currentPath = window.location.pathname;

    // Not logged in → go to login
    if (!user) return <Navigate to="/login" replace />;

    // Still loading critical info? Wait.
    // BUT: If it's a Super Admin, they NEVER need onboarding
    if (pLoading || tLoading) {
        // If we already know isSuperAdmin (from earlier state or fast load), we can skip waiting
        if (isSuperAdmin) return <>{children}</>;

        return <PlatformLoader message="Synchronizing Platform" subtext="Clinical Workspace Induction" />;
    }

    // Super Admins bypass all checks (email verification + onboarding)
    if (isSuperAdmin) return <>{children}</>;

    // Email not verified → must verify before accessing any protected route
    if (!emailVerified) {
        return <Navigate to="/verify-email-pending" replace />;
    }

    // If user has no company yet, send them to onboarding
    if (needsOnboarding && currentPath !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
};

const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const { isSuperAdmin, loading: pLoading } = usePermissions();
    const { loading: tLoading } = useTenant();

    if (!user) return <Navigate to="/login" replace />;

    // Still loading critical info? Wait.
    if (pLoading || tLoading) {
        if (isSuperAdmin) return <>{children}</>;
        return <PlatformLoader message="Verifying Admin Credentials" subtext="Security Node Access Authorization" />;
    }

    if (!isSuperAdmin) return <Navigate to="/apps" replace />;
    return <>{children}</>;
};

// ── App ──

const App = () => (
    <ThemeProvider attribute="class" defaultTheme="system" storageKey="ecom-suite-theme">
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <AuthProvider>
                    <SessionTimeoutHandler />
                    <TenantProvider>
                        <PermissionsProvider>
                            <CartProvider>
                                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                                    <Suspense fallback={<PlatformLoader />}>
                                        <Routes>
                                            {/* ── Marketing Site ── */}
                                            <Route element={<MarketingLayout />}>
                                                <Route path="/" element={<MarketingIndex />} />
                                                <Route path="/about" element={<MarketingAbout />} />
                                                <Route path="/services" element={<MarketingServices />} />
                                                <Route path="/products" element={<MarketingProducts />} />
                                                <Route path="/products/:slug" element={<MarketingModuleDetail />} />
                                                <Route path="/contact" element={<MarketingContact />} />
                                                <Route path="/policy" element={<MarketingPolicy />} />
                                            </Route>

                                            {/* ── Auth ── */}
                                            <Route path="/login" element={<Login />} />
                                            <Route path="/ecommerce-login" element={<Login />} />
                                            <Route path="/reset-password" element={<ResetPassword />} />
                                            <Route path="/verify-email-pending" element={<VerifyEmailPending />} />
                                            <Route path="/verify-tenant-email" element={<VerifyTenantEmail />} />

                                            {/* ── Super Admin Control Center ── */}
                                            <Route element={<AppLayout />}>
                                                {superAdminRoutes.map((r) => (
                                                    <Route key={r.path} path={r.path} element={<SuperAdminRoute>{r.element}</SuperAdminRoute>} />
                                                ))}
                                            </Route>

                                            {/* Onboarding — Public route, no auth needed.
                                                Account is created at the END of the onboarding flow. */}
                                            <Route path="/onboarding" element={<Onboarding />} />

                                            {/* ── Platform App Launcher (installed apps) ── */}
                                            <Route path="/apps" element={<ProtectedRoute><AppLauncher /></ProtectedRoute>} />

                                            {/* ── Marketplace (browse & install new apps) ── */}
                                            <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />

                                            {/* ── User Profile ── */}
                                            <Route element={<AppLayout />}>
                                                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                                            </Route>

                                            {/* ── Storefront Customer Pages (public) ── */}
                                            <Route path="/store/login" element={<StorefrontLogin />} />
                                            <Route path="/store/track" element={<OrderTracking />} />
                                            <Route path="/store/track/:orderNumber" element={<OrderTracking />} />
                                            <Route path="/store/my-orders" element={<MyOrders />} />
                                            <Route path="/store/verify" element={<VerifyEmail />} />

                                            {/* Backward compat: /ecommerce → /apps/ecommerce */}
                                            <Route path="/ecommerce" element={<Navigate to="/apps/ecommerce" replace />} />

                                            {/* ── E-Commerce Module ── */}
                                            <Route element={<AppLayout />}>
                                                {ecomAdminRoutes.map((r) => (
                                                    <Route key={r.path} path={r.path} element={<ProtectedRoute>{r.element}</ProtectedRoute>} />
                                                ))}
                                            </Route>

                                            {/* ── All Other Modules ── */}
                                            <Route element={<AppLayout />}>
                                                {/* CRM */}
                                                {crmRoutes.map((r) => (
                                                    <Route key={r.path} path={r.path} element={<ProtectedRoute>{r.element}</ProtectedRoute>} />
                                                ))}

                                                {/* POS */}
                                                {posRoutes.map((r) => (
                                                    <Route key={r.path} path={r.path} element={<ProtectedRoute>{r.element}</ProtectedRoute>} />
                                                ))}

                                                {/* Sales */}
                                                {salesRoutes.map((r) => (
                                                    <Route key={r.path} path={r.path} element={<ProtectedRoute>{r.element}</ProtectedRoute>} />
                                                ))}

                                                {/* Inventory */}
                                                {inventoryRoutes.map((r) => (
                                                    <Route key={r.path} path={r.path} element={<ProtectedRoute>{r.element}</ProtectedRoute>} />
                                                ))}

                                                {/* HRMS */}
                                                {hrmsRoutes.map((r) => (
                                                    <Route key={r.path} path={r.path} element={<ProtectedRoute>{r.element}</ProtectedRoute>} />
                                                ))}

                                                {/* Purchase */}
                                                {purchaseRoutes.map((r) => (
                                                    <Route key={r.path} path={r.path} element={<ProtectedRoute>{r.element}</ProtectedRoute>} />
                                                ))}

                                                {/* WhatsApp */}
                                                {whatsappRoutes.map((r) => (
                                                    <Route key={r.path} path={r.path} element={<ProtectedRoute>{r.element}</ProtectedRoute>} />
                                                ))}

                                                {/* Finance */}
                                                {financeRoutes.map((r) => (
                                                    <Route key={r.path} path={r.path} element={<ProtectedRoute>{r.element}</ProtectedRoute>} />
                                                ))}

                                                {/* Website */}
                                                {websiteRoutes.map((r) => (
                                                    <Route key={r.path} path={r.path} element={<ProtectedRoute>{r.element}</ProtectedRoute>} />
                                                ))}

                                                {/* Master Registry (Unified Hub) */}
                                                {mastersRoutes.map((r) => (
                                                    <Route key={r.path} path={r.path} element={<ProtectedRoute>{r.element}</ProtectedRoute>} />
                                                ))}
                                            </Route>

                                            <Route path="*" element={<NotFound />} />
                                        </Routes>
                                    </Suspense>
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
