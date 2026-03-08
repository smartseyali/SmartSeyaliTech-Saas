import { useState } from "react";
import {
    LayoutDashboard,
    BarChart3,
    Boxes,
    LayoutGrid,
    Star,
    Library,
    Truck,
    MapPin,
    Tag,
    Zap,
    RotateCcw,
    ShoppingBag,
    ImageIcon,
    Check,
    ChevronDown,
    ChevronLeft,
    Globe2,
    ShoppingCart as EcomCart,
    CreditCard,
    Settings,
    ShieldCheck,
    Users,
    ExternalLink,
    Crown,
    Award,
    Layout,
    Rocket,
    Box
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useTenant } from "@/contexts/TenantContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";

interface NavItem {
    title: string;
    url: string;
    icon: React.ElementType;
    resource?: string;
}

interface NavGroup {
    label: string;
    icon: React.ElementType;
    items: NavItem[];
    module?: string;
}

const INDUSTRY_MAP: Record<string, any> = {
    education: {
        labels: {
            "Catalog & Media": "Academic Content",
            "Sales & Logistics": "Student Records",
            "Marketing & Growth": "Student Success"
        },
        items: {
            "/ecommerce/masters/products": "Academic Courses",
            "/ecommerce/masters/categories": "Departmental Units",
            "/ecommerce/orders": "Student Enrollments",
            "/ecommerce/customers": "Student Database",
            "/ecommerce/masters/collections": "Course Faculty",
            "/ecommerce/delivery": "Study Material Ops"
        }
    },
    services: {
        labels: {
            "Catalog & Media": "Service Portfolio",
            "Sales & Logistics": "Booking Ops",
        },
        items: {
            "/ecommerce/masters/products": "Available Services",
            "/ecommerce/orders": "Booked Appointments",
            "/ecommerce/customers": "Client Records"
        }
    }
};

// ── MODULE-SPECIFIC NAVIGATION ────────────────────────────────
const MODULE_NAV_MAP: Record<string, NavGroup[]> = {
    ecommerce: [
        {
            label: "Catalog & Media",
            module: "ecommerce",
            icon: Library,
            items: [
                { title: "Products", url: "/apps/ecommerce/masters/products", icon: Boxes, resource: "products" },
                { title: "Categories", url: "/apps/ecommerce/masters/categories", icon: LayoutGrid, resource: "products" },
                { title: "Brands", url: "/apps/ecommerce/masters/brands", icon: Award, resource: "products" },
                { title: "Collections", url: "/apps/ecommerce/masters/collections", icon: Library, resource: "products" },
                { title: "Hero Banners", url: "/apps/ecommerce/banners", icon: Layout, resource: "marketing" },
                { title: "Media Gallery", url: "/apps/ecommerce/gallery", icon: ImageIcon, resource: "products" },
            ],
        },
        {
            label: "Sales & Logistics",
            module: "ecommerce",
            icon: ShoppingBag,
            items: [
                { title: "Orders", url: "/apps/ecommerce/orders", icon: EcomCart, resource: "orders" },
                { title: "Customers", url: "/apps/ecommerce/customers", icon: Users, resource: "customers" },
                { title: "Deliveries", url: "/apps/ecommerce/deliveries", icon: Truck, resource: "orders" },
                { title: "Refunds", url: "/apps/ecommerce/refunds", icon: RotateCcw, resource: "orders" },
                { title: "Abandoned Carts", url: "/apps/ecommerce/abandoned-carts", icon: ShoppingBag, resource: "orders" },
            ],
        },
        {
            label: "Marketing & Growth",
            module: "ecommerce",
            icon: Zap,
            items: [
                { title: "Coupons", url: "/apps/ecommerce/coupons", icon: Tag, resource: "marketing" },
                { title: "Offers", url: "/apps/ecommerce/offers", icon: Zap, resource: "marketing" },
                { title: "Reviews", url: "/apps/ecommerce/reviews", icon: Star, resource: "marketing" },
            ],
        },
        {
            label: "Business Insights",
            module: "ecommerce",
            icon: BarChart3,
            items: [
                { title: "Analytics", url: "/apps/ecommerce/analytics", icon: Zap, resource: "analytics" },
                { title: "Reports", url: "/apps/ecommerce/reports", icon: BarChart3, resource: "analytics" },
            ],
        },
        {
            label: "Settings & Systems",
            module: "ecommerce",
            icon: Settings,
            items: [
                { title: "Website Manager", url: "/apps/ecommerce/website", icon: Globe2, resource: "settings" },
                { title: "Billing & Plans", url: "/apps/ecommerce/billing", icon: CreditCard, resource: "settings" },
                { title: "Team Management", url: "/apps/ecommerce/team", icon: Users, resource: "team" },
                { title: "Payment Gateways", url: "/apps/ecommerce/payment-gateways", icon: ShieldCheck, resource: "settings" },
                { title: "Shipping Zones", url: "/apps/ecommerce/shipping-zones", icon: MapPin, resource: "settings" },
                { title: "API & Integrations", url: "/apps/ecommerce/api-integrations", icon: Zap, resource: "settings" },
                { title: "General Settings", url: "/apps/ecommerce/settings", icon: Settings, resource: "settings" },
                { title: "View Storefront", url: "STOREFRONT", icon: ExternalLink },
            ],
        }
    ],
    crm: [
        {
            label: "Sales Pipeline",
            module: "crm",
            icon: Zap,
            items: [
                { title: "Leads", url: "/apps/crm/leads", icon: Users },
                { title: "Deals", url: "/apps/crm/deals", icon: ShoppingBag },
                { title: "Pipeline View", url: "/apps/crm/pipeline", icon: LayoutGrid },
                { title: "Forecast", url: "/apps/crm/forecast", icon: BarChart3 },
            ],
        },
        {
            label: "Customer Data",
            module: "crm",
            icon: Users,
            items: [
                { title: "Contacts", url: "/apps/crm/contacts", icon: Users },
                { title: "Accounts", url: "/apps/crm/accounts", icon: Library },
                { title: "Segments", url: "/apps/crm/segments", icon: Tag },
            ],
        }
    ],
    pos: [
        {
            label: "Point of Sale",
            module: "pos",
            icon: LayoutGrid,
            items: [
                { title: "Terminal", url: "/apps/pos/terminal", icon: Zap },
                { title: "Register", url: "/apps/pos/register", icon: CreditCard },
                { title: "POS Orders", url: "/apps/pos/orders", icon: ShoppingBag },
            ],
        }
    ],
    inventory: [
        {
            label: "Stock Management",
            module: "inventory",
            icon: Boxes,
            items: [
                { title: "Items", url: "/apps/inventory/items", icon: Boxes },
                { title: "Stock Levels", url: "/apps/inventory/levels", icon: BarChart3 },
                { title: "Warehouses", url: "/apps/inventory/warehouses", icon: MapPin },
                { title: "Transfers", url: "/apps/inventory/transfers", icon: Truck },
            ],
        }
    ],
    hrms: [
        {
            label: "People Management",
            module: "hrms",
            icon: Users,
            items: [
                { title: "Directory", url: "/apps/hrms/directory", icon: Users },
                { title: "Departments", url: "/apps/hrms/departments", icon: LayoutGrid },
                { title: "Onboarding", url: "/apps/hrms/onboarding", icon: Rocket },
            ],
        },
        {
            label: "Ops & Benefits",
            module: "hrms",
            icon: Zap,
            items: [
                { title: "Attendance", url: "/apps/hrms/attendance", icon: Check },
                { title: "Leave Tracker", url: "/apps/hrms/leave", icon: MapPin },
                { title: "Payroll", url: "/apps/hrms/payroll", icon: CreditCard },
            ],
        }
    ],
    purchase: [
        {
            label: "Procurement",
            module: "purchase",
            icon: ShoppingBag,
            items: [
                { title: "Vendors", url: "/apps/purchase/vendors", icon: Users },
                { title: "Purchase Orders", url: "/apps/purchase/orders", icon: ShoppingBag },
                { title: "Goods Receipt", url: "/apps/purchase/receipts", icon: Box },
            ],
        }
    ],
    sales: [
        {
            label: "Sales Management",
            module: "sales",
            icon: ShoppingBag,
            items: [
                { title: "Quotations", url: "/apps/sales/quotations", icon: Library },
                { title: "Sales Orders", url: "/apps/sales/orders", icon: ShoppingBag },
                { title: "Customers", url: "/apps/sales/customers", icon: Users },
            ]
        }
    ],
    books: [
        {
            label: "Accounting",
            module: "books",
            icon: BarChart3,
            items: [
                { title: "Chart of Accounts", url: "/apps/books/accounts", icon: LayoutGrid },
                { title: "Journals", url: "/apps/books/journals", icon: Library },
                { title: "Expenses", url: "/apps/books/expenses", icon: CreditCard },
            ]
        }
    ],
    invoicing: [
        {
            label: "Billing",
            module: "invoicing",
            icon: CreditCard,
            items: [
                { title: "Invoices", url: "/apps/invoicing/invoices", icon: CreditCard },
                { title: "Payments", url: "/apps/invoicing/payments", icon: Zap },
            ]
        }
    ],
    payroll: [
        {
            label: "Payroll Setup",
            module: "payroll",
            icon: CreditCard,
            items: [
                { title: "Salary Structures", url: "/apps/payroll/structures", icon: LayoutGrid },
                { title: "Run Payroll", url: "/apps/payroll/run", icon: Zap },
            ]
        }
    ],
    helpdesk: [
        {
            label: "Support Ops",
            module: "helpdesk",
            icon: ShieldCheck,
            items: [
                { title: "Tickets", url: "/apps/helpdesk/tickets", icon: Tag },
                { title: "SLA Policies", url: "/apps/helpdesk/sla", icon: ShieldCheck },
            ]
        }
    ],
    hospital: [
        {
            label: "Clinical Records",
            module: "hospital",
            icon: Zap,
            items: [
                { title: "Patients", url: "/apps/hospital/patients", icon: Users },
                { title: "Appointments", url: "/apps/hospital/appointments", icon: MapPin },
            ]
        }
    ],
    whatsapp: [
        {
            label: "Messaging",
            module: "whatsapp",
            icon: Zap,
            items: [
                { title: "Templates", url: "/apps/whatsapp/templates", icon: Library },
                { title: "Campaigns", url: "/apps/whatsapp/campaigns", icon: Zap },
            ]
        }
    ],
    "landing-page": [
        {
            label: "Web Builder",
            module: "landing-page",
            icon: Globe2,
            items: [
                { title: "Pages", url: "/apps/landing-page/pages", icon: LayoutGrid },
                { title: "Themes", url: "/apps/landing-page/themes", icon: ImageIcon },
            ]
        }
    ]
};

// Help detect active module from route
const getCurrentModule = (pathname: string): string => {
    // Expected path structure: /apps/<module_name>/...
    const parts = pathname.split('/');
    if (parts.length >= 3 && parts[1] === 'apps') {
        const mod = parts[2];
        // If module exists in MODULE_NAV_MAP, return it. Otherwise default to ecommerce
        if (MODULE_NAV_MAP[mod]) return mod;
    }
    return 'ecommerce'; // Default
};

export const getRequiredResource = (pathname: string): string | undefined => {
    const activeModule = getCurrentModule(pathname);
    const groups = MODULE_NAV_MAP[activeModule] || [];
    for (const group of groups) {
        const match = group.items.find(item => pathname.startsWith(item.url));
        if (match) return match.resource;
    }
    return undefined;
};

interface AppSidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const superAdminNavGroups: NavGroup[] = [
    {
        label: "Platform Hub",
        module: "Platform",
        icon: ShieldCheck,
        items: [
            { title: "Platform Dashboard", url: "/super-admin", icon: LayoutDashboard },
            { title: "Tenant/Company List", url: "/super-admin/tenants", icon: Globe2 },
            { title: "Subscription Plans", url: "/super-admin/plans", icon: CreditCard },
            { title: "Marketplace Modules", url: "/super-admin/modules", icon: LayoutGrid },
            { title: "User Management", url: "/super-admin/users", icon: Users },
            { title: "Template Management", url: "/super-admin/templates", icon: Layout },
            { title: "Headless Connectors", url: "/super-admin/connectors", icon: Zap },
        ],
    }
];

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
    const location = useLocation();
    const { hasModule, isSuperAdmin, can } = usePermissions();
    const { activeCompany, companies, setCompany } = useTenant();
    const { settings } = useStoreSettings();
    const [showCompanySwitcher, setShowCompanySwitcher] = useState(false);

    const isSuperAdminView = location.pathname.startsWith('/super-admin');

    const logoUrl = settings?.logo_url;
    const storeName = isSuperAdminView ? "Platform Admin" : (settings?.store_name || activeCompany?.name || "LiteAdmin");

    // Dynamic Navigation Generation based on Active Module & Industry
    const activeModule = getCurrentModule(location.pathname);
    const moduleNavGroups = MODULE_NAV_MAP[activeModule] || MODULE_NAV_MAP.ecommerce;
    const industry = activeCompany?.industry_type || 'retail';
    const overrides = INDUSTRY_MAP[industry] || { labels: {}, items: {} };

    const navGroups = moduleNavGroups.map(group => ({
        ...group,
        label: overrides.labels[group.label] || group.label,
        items: group.items.map(item => ({
            ...item,
            title: overrides.items[item.url] || item.title
        }))
    }));

    const activeGroupsToRender = isSuperAdminView ? superAdminNavGroups : navGroups;

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 min-h-screen h-full flex flex-col z-50 transition-all duration-300 ease-in-out border-r border-slate-200 shadow-sm overflow-y-auto overflow-x-hidden select-none bg-white",
                collapsed ? "w-[80px]" : "w-[260px]"
            )}
        >
            {/* Header / Logo + Collapse Toggle */}
            {collapsed ? (
                /* Collapsed: centered logo icon, click to expand */
                <button
                    onClick={onToggle}
                    className="flex items-center justify-center h-16 w-full border-b border-slate-100 shrink-0 group"
                    title="Expand sidebar"
                >
                    {logoUrl && !isSuperAdminView ? (
                        <img
                            src={logoUrl}
                            alt={storeName}
                            className="w-9 h-9 rounded-lg object-contain bg-slate-50 border border-slate-100 shrink-0 group-hover:border-blue-200 transition-all"
                        />
                    ) : (
                        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors", isSuperAdminView ? "bg-slate-900 group-hover:bg-slate-800" : "bg-blue-600 group-hover:bg-blue-700")}>
                            {isSuperAdminView ? <ShieldCheck className="text-white w-4 h-4" /> : <Rocket className="text-white w-4 h-4" />}
                        </div>
                    )}
                </button>
            ) : (
                /* Expanded: logo + name on left, chevron on right */
                <div className="flex items-center h-16 px-4 justify-between shrink-0 border-b border-slate-100">
                    <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                        {logoUrl && !isSuperAdminView ? (
                            <img
                                src={logoUrl}
                                alt={storeName}
                                className="w-9 h-9 rounded-lg object-contain bg-slate-50 border border-slate-100 shrink-0"
                            />
                        ) : (
                            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm", isSuperAdminView ? "bg-slate-900" : "bg-blue-600")}>
                                {isSuperAdminView ? <ShieldCheck className="text-white w-4 h-4" /> : <Rocket className="text-white w-4 h-4" />}
                            </div>
                        )}
                        <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-slate-900 tracking-tight text-[15px] truncate">
                                {storeName}
                            </span>
                            {!isSuperAdminView && settings?.store_tagline && (
                                <span className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                                    {settings.store_tagline}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Collapse chevron */}
                    <button
                        onClick={onToggle}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0 ml-2"
                        title="Collapse sidebar"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                </div>
            )}


            {/* Tenant Switcher (Hide on Super Admin View) */}
            {!collapsed && activeCompany && !isSuperAdminView && (
                <div className="px-4 py-2 shrink-0">
                    <button
                        onClick={() => setShowCompanySwitcher(!showCompanySwitcher)}
                        className="w-full flex items-center gap-3 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 group text-left relative"
                    >
                        <div className="w-5 h-5 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0">
                            <Crown className="w-3 h-3 text-blue-600" />
                        </div>
                        <span className="flex-1 font-medium truncate text-[13px] text-slate-900">{activeCompany.name}</span>
                        {(companies.length > 1) && (
                            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showCompanySwitcher && "rotate-180")} />
                        )}
                    </button>

                    {showCompanySwitcher && companies.length > 1 && (
                        <div className="absolute left-4 right-4 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50">
                            {companies.map((c: any) => (
                                <button
                                    key={c.id}
                                    onClick={() => { setCompany(c.id); setShowCompanySwitcher(false); }}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0",
                                        activeCompany.id === c.id && "bg-blue-50 text-blue-600"
                                    )}
                                >
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold text-slate-600">{c.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <span className="flex-1 truncate font-medium">{c.name}</span>
                                    {activeCompany.id === c.id && <Check className="w-4 h-4 text-blue-600" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Navigation Sections */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pt-4 px-3 space-y-4 pb-4">
                <div className="space-y-1">
                    {!isSuperAdminView && (
                        <NavLink
                            to="/apps"
                            className={cn(
                                "group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all font-medium text-sm relative text-slate-500 hover:text-slate-900",
                                collapsed ? "justify-center" : ""
                            )}
                            activeClassName="text-blue-600 bg-blue-50/50 font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-blue-600 before:rounded-r-full"
                        >
                            <LayoutGrid className="w-5 h-5 shrink-0" />
                            {!collapsed && <span className="flex-1 truncate font-bold uppercase tracking-widest text-[10px]">App Launcher</span>}
                        </NavLink>
                    )}
                    <NavLink
                        to={isSuperAdminView ? "/super-admin" : `/apps/${activeModule}`}
                        className={cn(
                            "group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all font-medium text-sm relative",
                            collapsed ? "justify-center" : "",
                            "text-slate-500 hover:text-slate-900"
                        )}
                        activeClassName="text-blue-600 bg-blue-50/50 font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-blue-600 before:rounded-r-full"
                    >
                        <LayoutDashboard className="w-5 h-5 shrink-0" />
                        {!collapsed && <span className="flex-1 truncate">Dashboard Hub</span>}
                    </NavLink>
                </div>

                {activeGroupsToRender
                    .map((group) => {
                        const visibleItems = group.items.filter(item => !item.resource || can('manage', item.resource) || isSuperAdminView);
                        if (visibleItems.length === 0) return null;

                        return (
                            <div key={group.label} className="space-y-1">
                                {!collapsed && (
                                    <div className="px-4 py-2 mt-4">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-500 transition-colors">{group.label}</p>
                                    </div>
                                )}
                                {visibleItems.map((item) => {
                                    const isExternal = item.url === "STOREFRONT";
                                    if (isExternal) {
                                        return (
                                            <a
                                                key={item.url}
                                                href={`/${activeCompany?.subdomain || ''}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={cn(
                                                    "group flex items-center gap-3 px-4 py-2 rounded-lg transition-all font-medium text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                                                    collapsed ? "justify-center" : ""
                                                )}
                                            >
                                                <item.icon className="w-4 h-4 shrink-0" />
                                                {!collapsed && <span className="flex-1 truncate">{item.title}</span>}
                                            </a>
                                        );
                                    }
                                    return (
                                        <NavLink
                                            key={item.url}
                                            to={item.url}
                                            className={cn(
                                                "group flex items-center gap-3 px-4 py-2 rounded-lg transition-all font-medium text-sm text-slate-500 hover:text-slate-900 relative",
                                                collapsed ? "justify-center" : ""
                                            )}
                                            activeClassName="text-blue-600 bg-blue-50/50 font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-blue-600 before:rounded-r-full"
                                        >
                                            <item.icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                                            {!collapsed && <span className="flex-1 truncate">{item.title}</span>}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        );
                    })}
            </div>

            {/* Bottom Utilities */}
            <div className="p-3 space-y-1 border-t border-slate-100 bg-slate-50/50 shrink-0">
                {isSuperAdmin && (
                    <NavLink
                        to={isSuperAdminView ? "/ecommerce" : "/super-admin"}
                        className={cn(
                            "group flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-semibold hover:bg-slate-200/50",
                            isSuperAdminView ? "text-slate-600" : "text-blue-600 hover:bg-blue-100/50",
                            collapsed ? "justify-center" : ""
                        )}
                        activeClassName={isSuperAdminView ? "bg-slate-200" : "bg-blue-100"}
                    >
                        {isSuperAdminView ? <LayoutDashboard className="w-5 h-5 shrink-0" /> : <ShieldCheck className="w-5 h-5 shrink-0" />}
                        {!collapsed && <span className="flex-1 truncate">{isSuperAdminView ? "Merchant mode" : "Platform Admin"}</span>}
                    </NavLink>
                )}
            </div>
        </aside>
    );
}
