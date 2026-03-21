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
    Box,
    FileInput,
    Building2,
    Database,
    Key,
    Ruler,
    Palette,
    Flag,
    Hash,
    Scale,
    GitPullRequest,
    Activity,
    MessageSquare,
    Smartphone,
    Binary,
    Flame,
    Clock
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useTenant } from "@/contexts/TenantContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import PLATFORM_CONFIG from "@/config/platform";

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
                { title: "Item Master", url: "/apps/ecommerce/masters/products", icon: Boxes, resource: "products" },
                { title: "Department Matrix", url: "/apps/ecommerce/masters/categories", icon: LayoutGrid, resource: "products" },
                { title: "Brand Entries", url: "/apps/ecommerce/masters/brands", icon: Award, resource: "products" },
                { title: "Category Hub", url: "/apps/ecommerce/masters/collections", icon: Library, resource: "products" },
                { title: "Landing Banners", url: "/apps/ecommerce/banners", icon: Layout, resource: "marketing" },
                { title: "Asset Gallery", url: "/apps/ecommerce/gallery", icon: ImageIcon, resource: "products" },
            ],
        },
        {
            label: "Sales & Logistics",
            module: "ecommerce",
            icon: ShoppingBag,
            items: [
                { title: "Sales Orders", url: "/apps/ecommerce/orders", icon: EcomCart, resource: "orders" },
                { title: "Party Master", url: "/apps/ecommerce/customers", icon: Users, resource: "customers" },
                { title: "Delivery Challans", url: "/apps/ecommerce/deliveries", icon: Truck, resource: "orders" },
                { title: "Sales Returns", url: "/apps/ecommerce/refunds", icon: RotateCcw, resource: "orders" },
                { title: "Pending Inquiry", url: "/apps/ecommerce/abandoned-carts", icon: ShoppingBag, resource: "orders" },
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
                { title: "Storefront Ops", url: "/apps/ecommerce/website", icon: Globe2, resource: "settings" },
                { title: "Billing & GST", url: "/apps/ecommerce/billing", icon: CreditCard, resource: "settings" },
                { title: "User Controls", url: "/apps/ecommerce/team", icon: Users, resource: "team" },
                { title: "POS Gateways", url: "/apps/ecommerce/payment-gateways", icon: ShieldCheck, resource: "settings" },
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
                { title: "Inquiry Nodes", url: "/apps/crm/leads", icon: Users, resource: "leads" },
                { title: "Deal Pipeline", url: "/apps/crm/deals", icon: ShoppingBag, resource: "deals" },
                { title: "Kanban View", url: "/apps/crm/pipeline", icon: LayoutGrid, resource: "deals" },
                { title: "Sales Forecast", url: "/apps/crm/forecast", icon: BarChart3, resource: "analytics" },
            ],
        },
        {
            label: "Customer Data",
            module: "crm",
            icon: Users,
            items: [
                { title: "Accounts", url: "/apps/crm/accounts", icon: Library, resource: "customers" },
                { title: "Segments", url: "/apps/crm/segments", icon: Tag, resource: "marketing" },
            ],
        }
    ],
    pos: [
        {
            label: "Point of Sale",
            module: "pos",
            icon: LayoutGrid,
            items: [
                { title: "Terminal", url: "/apps/pos/terminal", icon: Zap, resource: "orders" },
                { title: "Register", url: "/apps/pos/register", icon: CreditCard, resource: "orders" },
                { title: "POS Orders", url: "/apps/pos/orders", icon: ShoppingBag, resource: "orders" },
            ],
        }
    ],
    inventory: [
        {
            label: "Stock Management",
            module: "inventory",
            icon: Boxes,
            items: [
                { title: "Stock Levels", url: "/apps/inventory/levels", icon: BarChart3, resource: "products" },
                { title: "Warehouses", url: "/apps/inventory/warehouses", icon: MapPin, resource: "settings" },
                { title: "Transfers", url: "/apps/inventory/transfers", icon: Truck, resource: "products" },
                { title: "Stock Audits", url: "/apps/inventory/audits", icon: Check, resource: "products" },
                { title: "Batch Tracking", url: "/apps/inventory/batches", icon: Tag, resource: "products" },
            ],
        }
    ],
    hrms: [
        {
            label: "People Management",
            module: "hrms",
            icon: Users,
            items: [
                { title: "Employee Directory", url: "/apps/hrms/employees", icon: Users, resource: "team" },
                { title: "Induction Protocol", url: "/apps/hrms/induction", icon: Rocket, resource: "team" },
                { title: "Departments Hub", url: "/apps/hrms/departments", icon: LayoutGrid, resource: "team" },
                { title: "Appraisals", url: "/apps/hrms/appraisals", icon: Star, resource: "team" },
            ],
        },
        {
            label: "Ops & Benefits",
            module: "hrms",
            icon: Zap,
            items: [
                { title: "Attendance", url: "/apps/hrms/attendance", icon: Check, resource: "attendance" },
                { title: "Leave Tracker", url: "/apps/hrms/leaves", icon: MapPin, resource: "attendance" },
                { title: "Employee Claims", url: "/apps/hrms/claims", icon: CreditCard, resource: "attendance" },
                { title: "Payroll Cycles", url: "/apps/hrms/payroll", icon: CreditCard, resource: "payroll" },
            ],
        }
    ],
    purchase: [
        {
            label: "Procurement",
            module: "purchase",
            icon: ShoppingBag,
            items: [
                { title: "Indents (Internal)", url: "/apps/purchase/requests", icon: FileInput, resource: "orders" },
                { title: "Purchase Orders", url: "/apps/purchase/orders", icon: ShoppingBag, resource: "orders" },
                { title: "Goods Receipt (GRN)", url: "/apps/purchase/receipts", icon: Box, resource: "orders" },
                { title: "Purchase Bills", url: "/apps/purchase/bills", icon: CreditCard, resource: "orders" },
            ],
        }
    ],
    sales: [
        {
            label: "Sales Management",
            module: "sales",
            icon: ShoppingBag,
            items: [
                { title: "Quotations", url: "/apps/sales/quotations", icon: Library, resource: "orders" },
                { title: "Sales Orders", url: "/apps/sales/orders", icon: ShoppingBag, resource: "orders" },
                { title: "Delivery Challans", url: "/apps/sales/deliveries", icon: Truck, resource: "orders" },
                { title: "Sales Invoices", url: "/apps/invoicing/invoices", icon: CreditCard, resource: "orders" },
            ]
        }
    ],
    books: [
        {
            label: "Accounting",
            module: "books",
            icon: BarChart3,
            items: [
                { title: "Chart of Accounts", url: "/apps/books/accounts", icon: LayoutGrid, resource: "settings" },
                { title: "Journals", url: "/apps/books/journals", icon: Library, resource: "orders" },
                { title: "Expenses", url: "/apps/books/expenses", icon: CreditCard, resource: "orders" },
            ]
        },
        {
            label: "Financial Control",
            module: "books",
            icon: ShieldCheck,
            items: [
                { title: "Bank Sync", url: "/apps/books/reconciliation", icon: Zap, resource: "settings" },
                { title: "Tax Slabs", url: "/apps/books/tax", icon: Tag, resource: "settings" },
                { title: "Financial Reports", url: "/apps/books/reports", icon: BarChart3, resource: "settings" },
                { title: "Fiscal Years", url: "/apps/settings/fiscal-years", icon: Clock, resource: "settings" },
            ]
        }
    ],
    invoicing: [
        {
            label: "Billing",
            module: "invoicing",
            icon: CreditCard,
            items: [
                { title: "Sales Invoices", url: "/apps/invoicing/invoices", icon: CreditCard, resource: "orders" },
                { title: "Receipt Vouchers", url: "/apps/invoicing/payments", icon: Zap, resource: "orders" },
            ]
        }
    ],
    payroll: [
        {
            label: "Payroll Setup",
            module: "payroll",
            icon: CreditCard,
            items: [
                { title: "Payslip Registry", url: "/apps/payroll/payslips", icon: FileInput, resource: "payroll" },
                { title: "Salary Structures", url: "/apps/payroll/structures", icon: LayoutGrid, resource: "payroll" },
                { title: "Run Payroll Batch", url: "/apps/payroll/run", icon: Zap, resource: "payroll" },
            ]
        }
    ],
    helpdesk: [
        {
            label: "Support Ops",
            module: "helpdesk",
            icon: ShieldCheck,
            items: [
                { title: "Tickets", url: "/apps/helpdesk/tickets", icon: Tag, resource: "orders" },
                { title: "SLA Policies", url: "/apps/helpdesk/sla", icon: ShieldCheck, resource: "settings" },
            ]
        }
    ],
    hospital: [
        {
            label: "Clinical Records",
            module: "hospital",
            icon: Zap,
            items: [
                { title: "Patients", url: "/apps/hospital/patients", icon: Users, resource: "customers" },
                { title: "Appointments", url: "/apps/hospital/appointments", icon: MapPin, resource: "orders" },
            ]
        }
    ],
    whatsapp: [
        {
            label: "Messaging",
            module: "whatsapp",
            icon: MessageSquare,
            items: [
                { title: "Account Registry", url: "/apps/whatsapp/accounts", icon: Smartphone, resource: "settings" },
                { title: "Meta Templates", url: "/apps/whatsapp/templates", icon: Library, resource: "marketing" },
                { title: "Campaign Hub", url: "/apps/whatsapp/campaigns", icon: Zap, resource: "marketing" },
            ]
        }
    ],
    "landing-page": [
        {
            label: "Web Builder",
            module: "landing-page",
            icon: Globe2,
            items: [
                { title: "Pages", url: "/apps/landing-page/pages", icon: LayoutGrid, resource: "settings" },
                { title: "Themes", url: "/apps/landing-page/themes", icon: ImageIcon, resource: "settings" },
            ]
        }
    ],
    masters: [
        {
            label: "Operational Resources",
            module: "masters",
            icon: Boxes,
            items: [
                { title: "Item Master", url: "/apps/masters/items", icon: Box, resource: "products" },
                { title: "Category Tree", url: "/apps/masters/categories", icon: LayoutGrid, resource: "products" },
                { title: "Brand Entries", url: "/apps/masters/brands", icon: Flag, resource: "products" },
                { title: "UOM Registry", url: "/apps/masters/uoms", icon: Scale, resource: "products" },
            ]
        },
        {
            label: "Catalog Engineering",
            module: "masters",
            icon: Settings,
            items: [
                { title: "Attribute Master", url: "/apps/masters/attributes", icon: Tag, resource: "products" },
                { title: "Variant Hub", url: "/apps/masters/variants", icon: Binary, resource: "products" },
                { title: "Review Moderation", url: "/apps/masters/reviews", icon: Star, resource: "products" },
            ]
        },
        {
            label: "Entity Management",
            module: "masters",
            icon: Users,
            items: [
                { title: "Party Hub", url: "/apps/masters/contacts", icon: Users, resource: "customers" },
                { title: "Location Master", url: "/apps/masters/departments", icon: Building2, resource: "team" },
            ]
        }
    ],
    workflow: [
        {
            label: "Governance Hub",
            module: "workflow",
            icon: GitPullRequest,
            items: [
                { title: "Approval Matrix", url: "/apps/workflow/approvals", icon: ShieldCheck, resource: "settings" },
                { title: "Transition Logs", url: "/apps/workflow/logs", icon: Activity, resource: "settings" },
            ]
        }
    ],
    automation: [
        {
            label: "Orchestration Layer",
            module: "automation",
            icon: Zap,
            items: [
                { title: "Jobs Registry", url: "/apps/automation/jobs", icon: Flame, resource: "settings" },
                { title: "Execution Matrix", url: "/apps/automation/history", icon: Activity, resource: "settings" },
            ]
        }
    ],
    documents: [
        {
            label: "Content Repository",
            module: "documents",
            icon: Box,
            items: [
                { title: "Enterprise Hub", url: "/apps/documents", icon: Box, resource: "documents" },
                { title: "Shared Protocols", url: "/apps/documents/shared", icon: Users, resource: "documents" },
            ]
        }
    ],
    projects: [
        {
            label: "Delivery Portfolio",
            module: "projects",
            icon: Rocket,
            items: [
                { title: "Active Projects", url: "/apps/projects", icon: Rocket, resource: "projects" },
                { title: "Task Boards", url: "/apps/projects/tasks", icon: LayoutGrid, resource: "projects" },
            ]
        }
    ]
};

const INIT_NAV_GROUPS: NavGroup[] = [
    {
        label: "INIT & MASTERS",
        module: "masters",
        icon: Settings,
        items: [
            { title: "Item Registry", url: "/apps/masters/items", icon: Box, resource: "products" },
            { title: "Category Matrix", url: "/apps/masters/categories", icon: LayoutGrid, resource: "products" },
            { title: "Brand Identities", url: "/apps/masters/brands", icon: Flag, resource: "products" },
            { title: "UOM Protocols", url: "/apps/masters/uoms", icon: Scale, resource: "products" },
            { title: "Attribute Matrix", url: "/apps/masters/attributes", icon: Tag, resource: "products" },
            { title: "Unified Contacts", url: "/apps/masters/contacts", icon: Users, resource: "customers" },
        ]
    }
];

// Help detect active module from route
export const getCurrentModule = (pathname: string): string => {
    // Expected path structure: /apps/<module_name>/...
    const parts = pathname.split('/');
    if (parts.length >= 3 && parts[1] === 'apps') {
        const mod = parts[2];
        
        // Seamless Universal Module Logic: Unify navigation focus
        if (mod === 'masters') {
            const cachedModule = localStorage.getItem('erp_active_framework') || 'ecommerce';
            return MODULE_NAV_MAP[cachedModule] ? cachedModule : 'ecommerce';
        }
        
        // Cache module state if it's a valid root
        if (MODULE_NAV_MAP[mod]) {
            localStorage.setItem('erp_active_framework', mod);
            return mod;
        }
    }
    return localStorage.getItem('erp_active_framework') || 'ecommerce'; // Default
};

export const getRequiredResource = (pathname: string): string | undefined => {
    const activeModule = getCurrentModule(pathname);
    
    // Evaluate main module tree permissions
    const groups = MODULE_NAV_MAP[activeModule] || [];
    for (const group of groups) {
        const match = group.items.find(item => pathname.startsWith(item.url));
        if (match) return match.resource;
    }
    
    // Evaluate universal framework permissions if not found natively
    for (const group of INIT_NAV_GROUPS) {
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
    const storeName = isSuperAdminView ? "Platform Admin" : (settings?.store_name || activeCompany?.name || PLATFORM_CONFIG.name);

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

    // Combine current module groups with INIT groups for integrated experience
    // BUT: Skip INIT groups if we are already in the Masters module to avoid duplication
    const activeGroupsToRender = isSuperAdminView 
        ? superAdminNavGroups 
        : (activeModule === 'masters' ? navGroups : [...navGroups, ...INIT_NAV_GROUPS]);

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 min-h-screen h-full flex flex-col z-50 transition-all duration-300 ease-in-out border-r border-slate-200 shadow-sm overflow-y-auto overflow-x-hidden select-none bg-white",
                collapsed ? "w-[48px]" : "w-[180px]"
            )}
        >
            {/* Header / Logo + Collapse Toggle */}
            {collapsed ? (
                /* Collapsed: centered logo icon, click to expand */
                <button
                    onClick={onToggle}
                    className="flex items-center justify-center h-10 w-full border-b border-slate-100 shrink-0 group"
                    title="Expand sidebar"
                >
                    {logoUrl && !isSuperAdminView ? (
                        <img
                            src={logoUrl}
                            alt={storeName}
                            className="w-8 h-8 rounded-lg object-contain bg-slate-50 border border-slate-100 shrink-0 group-hover:border-blue-200 transition-all"
                        />
                    ) : (
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors", isSuperAdminView ? "bg-slate-900 group-hover:bg-slate-800" : "bg-blue-600 group-hover:bg-blue-700")}>
                            {isSuperAdminView ? <ShieldCheck className="text-white w-3.5 h-3.5" /> : <Rocket className="text-white w-3.5 h-3.5" />}
                        </div>
                    )}
                </button>
            ) : (
                /* Expanded: logo + name on left, chevron on right */
                <div className="flex items-center h-10 px-2 justify-between shrink-0 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
                        {logoUrl && !isSuperAdminView ? (
                            <img
                                src={logoUrl}
                                alt={storeName}
                                className="w-6 h-6 rounded-lg object-contain bg-slate-50 border border-slate-100 shrink-0"
                            />
                        ) : (
                            <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-sm", isSuperAdminView ? "bg-slate-900" : "bg-blue-600")}>
                                {isSuperAdminView ? <ShieldCheck className="text-white w-3 h-3" /> : <Rocket className="text-white w-3 h-3" />}
                            </div>
                        )}
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-900 tracking-tight text-[12px] truncate">
                                {storeName}
                            </span>
                        </div>
                    </div>

                    {/* Collapse chevron */}
                    <button
                        onClick={onToggle}
                        className="w-5 h-5 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0"
                        title="Collapse sidebar"
                    >
                        <ChevronLeft className="w-2.5 h-2.5" />
                    </button>
                </div>
            )}


            {/* Tenant Switcher (Hide on Super Admin View) */}
            {!collapsed && activeCompany && !isSuperAdminView && (
                <div className="px-2 py-1.5 shrink-0">
                    <button
                        onClick={() => setShowCompanySwitcher(!showCompanySwitcher)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all border border-slate-200 group text-left relative"
                    >
                        <div className="w-4 h-4 rounded-md bg-blue-600/10 flex items-center justify-center shrink-0">
                            <Crown className="w-2.5 h-2.5 text-blue-600" />
                        </div>
                        <span className="flex-1 font-medium truncate text-[11px] text-slate-900">{activeCompany.name}</span>
                        {(companies.length > 1) && (
                            <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform", showCompanySwitcher && "rotate-180")} />
                        )}
                    </button>

                    {showCompanySwitcher && companies.length > 1 && (
                        <div className="absolute left-2 right-2 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50">
                            {companies.map((c: any) => (
                                <button
                                    key={c.id}
                                    onClick={() => { setCompany(c.id); setShowCompanySwitcher(false); }}
                                    className={cn(
                                        "w-full flex items-center gap-2 px-3 py-2 text-[11px] text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0",
                                        activeCompany.id === c.id && "bg-blue-50 text-blue-600"
                                    )}
                                >
                                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                        <span className="text-[9px] font-bold text-slate-600">{c.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <span className="flex-1 truncate font-medium">{c.name}</span>
                                    {activeCompany.id === c.id && <Check className="w-3 h-3 text-blue-600" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Navigation Sections */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pt-2 px-2 space-y-3 pb-4">
                <div className="space-y-0.5">
                    {!isSuperAdminView && (
                        <NavLink
                            to="/apps"
                            className={cn(
                                "group flex items-center gap-2 px-3 py-1.5 rounded-md transition-all font-medium text-[12px] relative text-slate-500 hover:text-slate-900",
                                collapsed ? "justify-center" : ""
                            )}
                            activeClassName="text-blue-600 bg-blue-50/50 font-semibold before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-blue-600 before:rounded-r-full"
                        >
                            <LayoutGrid className="w-4 h-4 shrink-0" />
                            {!collapsed && <span className="flex-1 truncate font-bold uppercase tracking-widest text-[9px]">App Launcher</span>}
                        </NavLink>
                    )}
                    <NavLink
                        to={isSuperAdminView ? "/super-admin" : `/apps/${activeModule}`}
                        className={cn(
                            "group flex items-center gap-2 px-3 py-1.5 rounded-md transition-all font-medium text-[12px] relative",
                            collapsed ? "justify-center" : "",
                            "text-slate-500 hover:text-slate-900"
                        )}
                        activeClassName="text-blue-600 bg-blue-50/50 font-semibold before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-blue-600 before:rounded-r-full"
                    >
                        <LayoutDashboard className="w-4 h-4 shrink-0" />
                        {!collapsed && <span className="flex-1 truncate">Dashboard Hub</span>}
                    </NavLink>
                </div>

                {activeGroupsToRender
                    .map((group) => {
                        const visibleItems = group.items.filter(item => !item.resource || can('manage', item.resource) || isSuperAdminView);
                        if (visibleItems.length === 0) return null;

                        return (
                            <div key={group.label} className="space-y-0.5">
                                {!collapsed && (
                                    <div className="px-3 py-1 mt-2">
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">{group.label}</p>
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
                                                    "group flex items-center gap-2 px-3 py-1.5 rounded-md transition-all font-medium text-[12px] text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                                                    collapsed ? "justify-center" : ""
                                                )}
                                            >
                                                <item.icon className="w-3.5 h-3.5 shrink-0" />
                                                {!collapsed && <span className="flex-1 truncate">{item.title}</span>}
                                            </a>
                                        );
                                    }
                                    return (
                                        <NavLink
                                            key={item.url}
                                            to={item.url}
                                            className={cn(
                                                "group flex items-center gap-2 px-3 py-1.5 rounded-md transition-all font-medium text-[12px] text-slate-500 hover:text-slate-900 relative",
                                                collapsed ? "justify-center" : ""
                                            )}
                                            activeClassName="text-blue-600 bg-blue-50/50 font-semibold before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-blue-600 before:rounded-r-full"
                                        >
                                            <item.icon className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110" />
                                            {!collapsed && <span className="flex-1 truncate">{item.title}</span>}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        );
                    })}
            </div>

            {/* Bottom Utilities */}
            <div className="p-2 space-y-0.5 border-t border-slate-100 bg-slate-50/50 shrink-0">
                {isSuperAdmin && (
                    <NavLink
                        to={isSuperAdminView ? "/ecommerce" : "/super-admin"}
                        className={cn(
                            "group flex items-center gap-2 px-2 py-1.5 rounded-md transition-all text-[11px] font-semibold hover:bg-slate-200/50",
                            isSuperAdminView ? "text-slate-600" : "text-blue-600 hover:bg-blue-100/50",
                            collapsed ? "justify-center" : ""
                        )}
                        activeClassName={isSuperAdminView ? "bg-slate-200" : "bg-blue-100"}
                    >
                        {isSuperAdminView ? <LayoutDashboard className="w-4 h-4 shrink-0" /> : <ShieldCheck className="w-4 h-4 shrink-0" />}
                        {!collapsed && <span className="flex-1 truncate">{isSuperAdminView ? "Merchant mode" : "Platform Admin"}</span>}
                    </NavLink>
                )}
            </div>
        </aside>
    );
}

