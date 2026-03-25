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
import PLATFORM_CONFIG from "@/config/platform";
import { PlatformLoader } from "@/components/PlatformLoader";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import { SessionTimeoutHandler } from "@/components/auth/SessionTimeoutHandler";


// ── E-Commerce Module (registered via modules/ecommerce/) ──
import EcommerceDashboard from "./pages/modules/ecommerce/EcommerceDashboard";
import EcomOrders from "./pages/modules/ecommerce/EcomOrders";
import EcomOrderDetail from "./pages/modules/ecommerce/EcomOrderDetail";
import Billing from "./pages/modules/ecommerce/Billing";
import Coupons from "./pages/modules/ecommerce/Coupons";
import Offers from "./pages/modules/ecommerce/Offers";
import Refunds from "./pages/modules/ecommerce/Refunds";
import PaymentGateways from "./pages/modules/ecommerce/PaymentGateways";
import Reviews from "./pages/modules/ecommerce/Reviews";
import AbandonedCarts from "./pages/modules/ecommerce/AbandonedCarts";
import Gallery from "./pages/modules/ecommerce/Gallery";
import ShippingZones from "./pages/modules/ecommerce/ShippingZones";
import Deliveries from "./pages/modules/ecommerce/Deliveries";
import Website from "./pages/modules/ecommerce/Website";
import { EcomProducts } from "./pages/modules/ecommerce/masters/EcomProducts";
import { Categories } from "./pages/modules/ecommerce/masters/Categories";
import { Brands } from "./pages/modules/ecommerce/masters/Brands";
import { Collections } from "./pages/modules/ecommerce/masters/Collections";
import Banners from "./pages/modules/ecommerce/Banners";
import BulkImport from "./pages/modules/ecommerce/BulkImport";
import Team from "./pages/modules/ecommerce/Team";
import Analytics from "./pages/modules/ecommerce/Analytics";
import Reports from "./pages/modules/ecommerce/Reports";
import APIIntegrations from "./pages/modules/ecommerce/APIIntegrations";
import Settings from "./pages/modules/ecommerce/Settings";
import Customers from "./pages/modules/ecommerce/Customers";

import { StoreLayout } from "./components/storefront/StoreLayout";
import StoreHome from "./pages/modules/ecommerce/storefront/home/Index";
import StoreShop from "./pages/modules/ecommerce/storefront/shop/Index";
import StoreProductDetail from "./pages/modules/ecommerce/storefront/product/Index";
import StoreCart from "./pages/modules/ecommerce/storefront/Cart";
import StoreCheckout from "./pages/modules/ecommerce/storefront/Checkout";
import StoreSeeder from "./pages/modules/ecommerce/storefront/Seeder";
import StoreAbout from "./pages/modules/ecommerce/storefront/About";
import StoreOrders from "./pages/modules/ecommerce/storefront/Orders";
import StoreOrderDetail from "./pages/modules/ecommerce/storefront/OrderDetail";
import StoreOrderSuccess from "./pages/modules/ecommerce/storefront/OrderSuccess";
import StoreContact from "./pages/modules/ecommerce/storefront/Contact";

import SuperAdminDashboard from "./pages/super-admin/Dashboard";
import HeadlessConsole from "./pages/super-admin/HeadlessConsole";
import PlatformTenants from "./pages/super-admin/Tenants";
import PlatformUsers from "./pages/super-admin/Users";
import PlatformTemplates from "./pages/super-admin/Templates";
import PlatformPlans from "./pages/super-admin/Plans";
import PlatformModules from "./pages/super-admin/Modules";
import Onboarding from "./pages/modules/ecommerce/Onboarding";
import AppLauncher from "./pages/AppLauncher";

// ── CRM Module ──
import CRMDashboard from "./pages/modules/crm/CRMDashboard";
import CRMLeads from "./pages/modules/crm/Leads";
import CRMDeals from "./pages/modules/crm/Deals";
import CRMContacts from "./pages/modules/crm/Contacts";
import CRMPipelines from "./pages/modules/crm/Pipelines";

// ── SALES Module ──
import SalesDashboard from "./pages/modules/sales/SalesDashboard";
import SalesQuotations from "./pages/modules/sales/Quotations";
import SalesOrders from "./pages/modules/sales/Orders";
import SalesDeliveries from "./pages/modules/sales/Deliveries";
import SalesCustomers from "./pages/modules/sales/Customers";

// ── BOOKS Module ──
import BooksDashboard from "./pages/modules/books/BooksDashboard";
import ChartOfAccounts from "./pages/modules/books/ChartOfAccounts";
import Expenses from "./pages/modules/books/Expenses";
import Journals from "./pages/modules/books/Journals";

// ── INVOICING Module ──
import InvoicingDashboard from "./pages/modules/invoicing/InvoicingDashboard";
import InvoiceList from "./pages/modules/invoicing/Invoices";

// ── PAYROLL Module ──
import PayrollDashboard from "./pages/modules/payroll/PayrollDashboard";
import PayrollPayslips from "./pages/modules/payroll/Payslips";

// ── HELPDESK Module ──
import HelpdeskDashboard from "./pages/modules/helpdesk/HelpdeskDashboard";
import SupportTickets from "./pages/modules/helpdesk/Tickets";

// ── HOSPITAL Module ──
import HospitalDashboard from "./pages/modules/hospital/HospitalDashboard";
import PatientRecords from "./pages/modules/hospital/Patients";

// ── WHATSAPP Module ──
import WhatsAppDashboard from "./pages/modules/whatsapp/WhatsAppDashboard";
import WhatsAppAccounts from "./pages/modules/whatsapp/Accounts";
import WhatsAppTemplates from "./pages/modules/whatsapp/Templates";
import WhatsAppCampaigns from "./pages/modules/whatsapp/Campaigns";

// ── LANDING PAGE Module ──
import LandingPageDashboard from "./pages/modules/landing-page/LandingPageDashboard";

// ── HRMS Module ──
import HRMSDashboard from "./pages/modules/hrms/HRMSDashboard";
import HRMSRegistry from "./pages/modules/hrms/Employees";
import HRMSInduction from "./pages/modules/hrms/Induction";
import Attendance from "./pages/modules/hrms/Attendance";
import LeaveManagement from "./pages/modules/hrms/LeaveManagement";

// ── PURCHASE Module ──
import PurchaseDashboard from "./pages/modules/purchase/PurchaseDashboard";
import PurchaseVendors from "./pages/modules/purchase/Vendors";
import PurchaseOrders from "./pages/modules/purchase/PurchaseOrders";
import PurchaseRequests from "./pages/modules/purchase/PurchaseRequests";
import PurchaseBills from "./pages/modules/purchase/PurchaseBills";

// ── INVENTORY Module ──
import InventoryDashboard from "./pages/modules/inventory/InventoryDashboard";
import InventoryItems from "./pages/modules/inventory/Items";
import Warehouses from "./pages/modules/inventory/Warehouses";

// ── MASTER REGISTRY (Common Foundation) ──
import MasterDashboard from "./pages/modules/masters/MasterDashboard";
import MastersItems from "./pages/modules/masters/Items";
import MastersContacts from "./pages/modules/masters/Contacts";
import MastersCategories from "./pages/modules/masters/Categories";
import UOMMaster from "./pages/modules/masters/UOMs";
import AttributeMaster from "./pages/modules/masters/Attributes";
import BrandMaster from "./pages/modules/masters/Brands";
import VariantMaster from "./pages/modules/masters/Variants";
import ReviewMaster from "./pages/modules/masters/Reviews";

// ── WORKFLOW Module ──
import WorkflowDashboard from "./pages/modules/workflow/WorkflowDashboard";
import ApprovalMatrix from "./pages/modules/workflow/Approvals";

// ── AUTOMATION Module ──
import AutomationDashboard from "./pages/modules/automation/AutomationDashboard";
import AutomationJobs from "./pages/modules/automation/Jobs";

// ── DOCUMENTS Module ──
import DocumentsHub from "./pages/modules/documents/Documents";

// ── PROJECTS Module ──
import ProjectPortfolio from "./pages/modules/projects/Projects";

// ── POS Module ──
import POSDashboard from "./pages/modules/pos/POSDashboard";
import POSTerminal from "./pages/modules/pos/Terminal";

// ── MARKETING (Smartseyali) ──
import { MarketingLayout } from "./components/marketing/MarketingLayout";
import MarketingIndex from "./pages/marketing/Index";
import MarketingAbout from "./pages/marketing/About";
import MarketingServices from "./pages/marketing/Services";
import MarketingProducts from "./pages/marketing/Products";
import MarketingModuleDetail from "./pages/marketing/ModuleDetail";
import MarketingContact from "./pages/marketing/Contact";
import MarketingPolicy from "./pages/marketing/License";

import Forecast from "./pages/modules/crm/Forecast";
import Accounts from "./pages/modules/crm/Accounts";
import Segments from "./pages/modules/crm/Segments";
import POSRegister from "./pages/modules/pos/Register";
import POSOrdersLedger from "./pages/modules/pos/POSOrders";
import StockLevels from "./pages/modules/inventory/StockLevels";
import StockTransfers from "./pages/modules/inventory/StockTransfers";
import Departments from "./pages/modules/hrms/Departments";
import GoodsReceipts from "./pages/modules/purchase/GoodsReceipts";
import ReceiptVouchers from "./pages/modules/invoicing/ReceiptVouchers";
import SalaryStructures from "./pages/modules/payroll/SalaryStructures";
import RunPayroll from "./pages/modules/payroll/RunPayroll";

import FinancialReports from "./pages/modules/books/FinancialReports";
import BankReconciliation from "./pages/modules/books/BankReconciliation";
import TaxConfigurations from "./pages/modules/books/TaxConfigurations";
import FiscalYears from "./pages/modules/settings/FiscalYears";
import StockAudits from "./pages/modules/inventory/StockAudits";
import BatchTracking from "./pages/modules/inventory/BatchTracking";
import EmployeeClaims from "./pages/modules/hrms/Claims";
import EmployeeAppraisals from "./pages/modules/hrms/Appraisals";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const { needsOnboarding, loading: tLoading } = useTenant();
    const { isSuperAdmin, loading: pLoading } = usePermissions();
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

    // Super Admins bypass the onboarding logic entirely
    if (isSuperAdmin) return <>{children}</>;

    // If user has no company yet, send them to onboarding
    if (needsOnboarding && currentPath !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
};

// Dedicated route for onboarding — FULLY PUBLIC since account doesn't exist yet
// The onboarding page itself handles: already-logged-in-with-company → redirect to /ecommerce

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

import { ThemeProvider } from "@/components/ThemeProvider";

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

                                        {/* ══ MARKETING ═══════════════════ */}
                                        <Route element={<MarketingLayout />}>
                                            <Route path="/" element={<MarketingIndex />} />
                                            <Route path="/about" element={<MarketingAbout />} />
                                            <Route path="/services" element={<MarketingServices />} />
                                            <Route path="/products" element={<MarketingProducts />} />
                                            <Route path="/products/:slug" element={<MarketingModuleDetail />} />
                                            <Route path="/contact" element={<MarketingContact />} />
                                            <Route path="/policy" element={<MarketingPolicy />} />
                                        </Route>

                                        <Route element={<StoreLayout />}>
                                            <Route path="/seed" element={<StoreSeeder />} />
                                        </Route>

                                        <Route path="/login" element={<Login />} />
                                        <Route path="/ecommerce-login" element={<Login />} />
                                        <Route path="/reset-password" element={<ResetPassword />} />

                                        {/* Super Admin Control Center */}
                                        <Route element={<AppLayout />}>
                                            <Route path="/super-admin" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />
                                            <Route path="/super-admin/tenants" element={<SuperAdminRoute><PlatformTenants /></SuperAdminRoute>} />
                                            <Route path="/super-admin/users" element={<SuperAdminRoute><PlatformUsers /></SuperAdminRoute>} />
                                            <Route path="/super-admin/plans" element={<SuperAdminRoute><PlatformPlans /></SuperAdminRoute>} />
                                            <Route path="/super-admin/modules" element={<SuperAdminRoute><PlatformModules /></SuperAdminRoute>} />
                                            <Route path="/super-admin/templates" element={<SuperAdminRoute><PlatformTemplates /></SuperAdminRoute>} />
                                            <Route path="/super-admin/connectors" element={<SuperAdminRoute><HeadlessConsole /></SuperAdminRoute>} />
                                        </Route>

                                        {/* Onboarding — Public route, no auth needed.
                                            Account is created at the END of the onboarding flow. */}
                                        <Route path="/onboarding" element={<Onboarding />} />

                                        {/* ══ PLATFORM APP LAUNCHER ═══════════════════ */}
                                        <Route path="/apps" element={<ProtectedRoute><AppLauncher /></ProtectedRoute>} />

                                        {/* Backward compat: /ecommerce → /apps/ecommerce */}
                                        <Route path="/ecommerce" element={<Navigate to="/apps/ecommerce" replace />} />

                                        {/* ══ E-COMMERCE MODULE ═══════════════════ */}
                                        <Route element={<AppLayout />}>
                                            <Route path="/apps/ecommerce" element={<ProtectedRoute><EcommerceDashboard /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/orders" element={<ProtectedRoute><EcomOrders /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/orders/:id" element={<ProtectedRoute><EcomOrderDetail /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/coupons" element={<ProtectedRoute><Coupons /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/offers" element={<ProtectedRoute><Offers /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/refunds" element={<ProtectedRoute><Refunds /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/payment-gateways" element={<ProtectedRoute><PaymentGateways /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/abandoned-carts" element={<ProtectedRoute><AbandonedCarts /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/shipping-zones" element={<ProtectedRoute><ShippingZones /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/deliveries" element={<ProtectedRoute><Deliveries /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/website" element={<ProtectedRoute><Website /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/masters/products" element={<ProtectedRoute><EcomProducts /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/masters/products/import" element={<ProtectedRoute><BulkImport /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/masters/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/masters/brands" element={<ProtectedRoute><Brands /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/masters/collections" element={<ProtectedRoute><Collections /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/banners" element={<ProtectedRoute><Banners /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/api-integrations" element={<ProtectedRoute><APIIntegrations /></ProtectedRoute>} />
                                            <Route path="/apps/ecommerce/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                                        </Route>

                                        {/* ══ OTHER MODULES ═════════════════════════════ */}
                                        <Route element={<AppLayout />}>
                                            {/* CRM */}
                                            <Route path="/apps/crm" element={<ProtectedRoute><CRMDashboard /></ProtectedRoute>} />
                                            <Route path="/apps/crm/leads" element={<ProtectedRoute><CRMLeads /></ProtectedRoute>} />
                                            <Route path="/apps/crm/deals" element={<ProtectedRoute><CRMDeals /></ProtectedRoute>} />
                                            <Route path="/apps/crm/contacts" element={<ProtectedRoute><CRMContacts /></ProtectedRoute>} />
                                            <Route path="/apps/crm/pipelines" element={<ProtectedRoute><CRMPipelines /></ProtectedRoute>} />
                                            <Route path="/apps/crm/forecast" element={<ProtectedRoute><Forecast /></ProtectedRoute>} />
                                            <Route path="/apps/crm/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
                                            <Route path="/apps/crm/segments" element={<ProtectedRoute><Segments /></ProtectedRoute>} />

                                            {/* Sales */}
                                            <Route path="/apps/sales" element={<ProtectedRoute><SalesDashboard /></ProtectedRoute>} />
                                            <Route path="/apps/sales/quotations" element={<ProtectedRoute><SalesQuotations /></ProtectedRoute>} />
                                            <Route path="/apps/sales/orders" element={<ProtectedRoute><SalesOrders /></ProtectedRoute>} />
                                            <Route path="/apps/sales/deliveries" element={<ProtectedRoute><SalesDeliveries /></ProtectedRoute>} />
                                            <Route path="/apps/sales/customers" element={<ProtectedRoute><SalesCustomers /></ProtectedRoute>} />

                                            {/* Books */}
                                            <Route path="/apps/books" element={<ProtectedRoute><BooksDashboard /></ProtectedRoute>} />
                                            <Route path="/apps/books/coa" element={<ProtectedRoute><ChartOfAccounts /></ProtectedRoute>} />
                                            <Route path="/apps/books/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
                                            <Route path="/apps/books/journals" element={<ProtectedRoute><Journals /></ProtectedRoute>} />
                                            <Route path="/apps/books/reports" element={<ProtectedRoute><FinancialReports /></ProtectedRoute>} />
                                            <Route path="/apps/books/reconciliation" element={<ProtectedRoute><BankReconciliation /></ProtectedRoute>} />
                                            <Route path="/apps/books/tax" element={<ProtectedRoute><TaxConfigurations /></ProtectedRoute>} />

                                            {/* Invoicing */}
                                            <Route path="/apps/invoicing" element={<ProtectedRoute><InvoicingDashboard /></ProtectedRoute>} />
                                            <Route path="/apps/invoicing/list" element={<ProtectedRoute><InvoiceList /></ProtectedRoute>} />
                                            <Route path="/apps/invoicing/invoices" element={<ProtectedRoute><InvoiceList /></ProtectedRoute>} />
                                            <Route path="/apps/invoicing/payments" element={<ProtectedRoute><ReceiptVouchers /></ProtectedRoute>} />

                                             {/* Payroll */}
                                             <Route path="/apps/payroll" element={<ProtectedRoute><PayrollDashboard /></ProtectedRoute>} />
                                             <Route path="/apps/payroll/payslips" element={<ProtectedRoute><PayrollPayslips /></ProtectedRoute>} />
                                             <Route path="/apps/payroll/structures" element={<ProtectedRoute><SalaryStructures /></ProtectedRoute>} />
                                             <Route path="/apps/payroll/run" element={<ProtectedRoute><RunPayroll /></ProtectedRoute>} />

                                            {/* Helpdesk */}
                                            <Route path="/apps/helpdesk" element={<ProtectedRoute><HelpdeskDashboard /></ProtectedRoute>} />
                                            <Route path="/apps/helpdesk/tickets" element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} />

                                            {/* Landing Page */}
                                            <Route path="/apps/landing-page" element={<ProtectedRoute><LandingPageDashboard /></ProtectedRoute>} />

                                            {/* Hospital */}
                                            <Route path="/apps/hospital" element={<ProtectedRoute><HospitalDashboard /></ProtectedRoute>} />
                                            <Route path="/apps/hospital/patients" element={<ProtectedRoute><PatientRecords /></ProtectedRoute>} />

                                             {/* WhatsApp */}
                                             <Route path="/apps/whatsapp" element={<ProtectedRoute><WhatsAppDashboard /></ProtectedRoute>} />
                                             <Route path="/apps/whatsapp/accounts" element={<ProtectedRoute><WhatsAppAccounts /></ProtectedRoute>} />
                                             <Route path="/apps/whatsapp/templates" element={<ProtectedRoute><WhatsAppTemplates /></ProtectedRoute>} />
                                             <Route path="/apps/whatsapp/campaigns" element={<ProtectedRoute><WhatsAppCampaigns /></ProtectedRoute>} />

                                             {/* HRMS */}
                                             <Route path="/apps/hrms" element={<ProtectedRoute><HRMSDashboard /></ProtectedRoute>} />
                                             <Route path="/apps/hrms/departments" element={<ProtectedRoute><Departments /></ProtectedRoute>} />
                                             <Route path="/apps/hrms/employees" element={<ProtectedRoute><HRMSRegistry /></ProtectedRoute>} />
                                             <Route path="/apps/hrms/induction" element={<ProtectedRoute><HRMSInduction /></ProtectedRoute>} />
                                             <Route path="/apps/hrms/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
                                             <Route path="/apps/hrms/leaves" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
                                             <Route path="/apps/hrms/claims" element={<ProtectedRoute><EmployeeClaims /></ProtectedRoute>} />
                                             <Route path="/apps/hrms/appraisals" element={<ProtectedRoute><EmployeeAppraisals /></ProtectedRoute>} />

                                            {/* Purchase */}
                                            <Route path="/apps/purchase" element={<ProtectedRoute><PurchaseDashboard /></ProtectedRoute>} />
                                            <Route path="/apps/purchase/vendors" element={<ProtectedRoute><PurchaseVendors /></ProtectedRoute>} />
                                            <Route path="/apps/purchase/requests" element={<ProtectedRoute><PurchaseRequests /></ProtectedRoute>} />
                                            <Route path="/apps/purchase/orders" element={<ProtectedRoute><PurchaseOrders /></ProtectedRoute>} />
                                            <Route path="/apps/purchase/bills" element={<ProtectedRoute><PurchaseBills /></ProtectedRoute>} />
                                            <Route path="/apps/purchase/receipts" element={<ProtectedRoute><GoodsReceipts /></ProtectedRoute>} />

                                            {/* Inventory */}
                                            <Route path="/apps/inventory" element={<ProtectedRoute><InventoryDashboard /></ProtectedRoute>} />
                                            <Route path="/apps/inventory/items" element={<ProtectedRoute><InventoryItems /></ProtectedRoute>} />
                                            <Route path="/apps/inventory/warehouses" element={<ProtectedRoute><Warehouses /></ProtectedRoute>} />
                                            <Route path="/apps/inventory/levels" element={<ProtectedRoute><StockLevels /></ProtectedRoute>} />
                                            <Route path="/apps/inventory/transfers" element={<ProtectedRoute><StockTransfers /></ProtectedRoute>} />
                                            <Route path="/apps/inventory/audits" element={<ProtectedRoute><StockAudits /></ProtectedRoute>} />
                                            <Route path="/apps/inventory/batches" element={<ProtectedRoute><BatchTracking /></ProtectedRoute>} />

                                            {/* Master Registry (Foundation) */}
                                            <Route path="/apps/masters" element={<ProtectedRoute><MasterDashboard /></ProtectedRoute>} />
                                            <Route path="/apps/masters/items" element={<ProtectedRoute><MastersItems /></ProtectedRoute>} />
                                             <Route path="/apps/masters/contacts" element={<ProtectedRoute><MastersContacts /></ProtectedRoute>} />
                                             <Route path="/apps/masters/categories" element={<ProtectedRoute><MastersCategories /></ProtectedRoute>} />
                                             <Route path="/apps/masters/uoms" element={<ProtectedRoute><UOMMaster /></ProtectedRoute>} />
                                             <Route path="/apps/masters/attributes" element={<ProtectedRoute><AttributeMaster /></ProtectedRoute>} />
                                             <Route path="/apps/masters/brands" element={<ProtectedRoute><BrandMaster /></ProtectedRoute>} />
                                             <Route path="/apps/masters/variants" element={<ProtectedRoute><VariantMaster /></ProtectedRoute>} />
                                             <Route path="/apps/masters/reviews" element={<ProtectedRoute><ReviewMaster /></ProtectedRoute>} />
                                             <Route path="/apps/settings/fiscal-years" element={<ProtectedRoute><FiscalYears /></ProtectedRoute>} />

                                            {/* Workflow */}
                                            <Route path="/apps/workflow" element={<ProtectedRoute><WorkflowDashboard /></ProtectedRoute>} />
                                            <Route path="/apps/workflow/approvals" element={<ProtectedRoute><ApprovalMatrix /></ProtectedRoute>} />

                                            {/* Automation */}
                                            <Route path="/apps/automation" element={<ProtectedRoute><AutomationDashboard /></ProtectedRoute>} />
                                            <Route path="/apps/automation/jobs" element={<ProtectedRoute><AutomationJobs /></ProtectedRoute>} />

                                            {/* Documents */}
                                            <Route path="/apps/documents" element={<ProtectedRoute><DocumentsHub /></ProtectedRoute>} />

                                            {/* Projects */}
                                            <Route path="/apps/projects" element={<ProtectedRoute><ProjectPortfolio /></ProtectedRoute>} />

                                            {/* POS */}
                                            <Route path="/apps/pos" element={<ProtectedRoute><POSDashboard /></ProtectedRoute>} />
                                            <Route path="/apps/pos/terminal" element={<ProtectedRoute><POSTerminal /></ProtectedRoute>} />
                                            <Route path="/apps/pos/register" element={<ProtectedRoute><POSRegister /></ProtectedRoute>} />
                                            <Route path="/apps/pos/orders" element={<ProtectedRoute><POSOrdersLedger /></ProtectedRoute>} />
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
