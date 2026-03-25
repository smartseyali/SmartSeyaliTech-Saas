import { useState, useEffect } from "react";
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
    UserPlus,
    ExternalLink,
    Crown,
    Award,
    Layout,
    Rocket,
    Box,
    Binary,
    FileInput,
    Building2,
    Database,
    Key,
    Palette,
    Flag,
    Hash,
    Scale,
    GitPullRequest,
    Activity,
    MessageSquare,
    Smartphone,
    Flame,
    Clock,
    Layers,
    ListTree,
    Ruler,
    DollarSign,
    Percent,
    Share2
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
    requiredModule?: string;
    requiredPermissions?: { action: string; resource: string }[];
    subItems?: NavItem[];
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
            label: "Website & Media",
            module: "ecommerce",
            icon: Layout,
            items: [
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
                { title: "Website Settings", url: "/apps/ecommerce/website", icon: Globe2, resource: "settings" },
                { title: "Billing & GST", url: "/apps/ecommerce/billing", icon: CreditCard, resource: "settings" },
                { title: "Team", url: "/apps/ecommerce/team", icon: Users, resource: "team" },
                { title: "Payments", url: "/apps/ecommerce/payment-gateways", icon: ShieldCheck, resource: "settings" },
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
                { title: "Leads", url: "/apps/crm/leads", icon: Users, resource: "leads" },
                { title: "Deal Pipeline", url: "/apps/crm/deals", icon: ShoppingBag, resource: "deals" },
                { title: "Segments", url: "/apps/crm/segments", icon: Tag, resource: "marketing" },
                { title: "Sales Forecast", url: "/apps/crm/forecast", icon: BarChart3, resource: "analytics" },
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
                { title: "Onboarding", url: "/apps/hrms/induction", icon: Rocket, resource: "team" },
                { title: "Departments", url: "/apps/hrms/departments", icon: LayoutGrid, resource: "team" },
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
    sales: [
        {
            label: "Sales Management",
            module: "sales",
            icon: ShoppingBag,
            items: [
                { title: "Quotations", url: "/apps/sales/quotations", icon: Library, resource: "orders" },
                { title: "Sales Orders", url: "/apps/sales/orders", icon: ShoppingBag, resource: "orders" },
                { title: "Delivery Challans", url: "/apps/sales/deliveries", icon: Truck, resource: "orders" },
                { title: "Sales Invoices", url: "/apps/sales/invoices", icon: CreditCard, resource: "orders" },
                { title: "Payment Receipts", url: "/apps/sales/payments", icon: Zap, resource: "orders" },
            ]
        }
    ]
};

const INIT_NAV_GROUPS: NavGroup[] = [
    {
        label: "GOVERNANCE",
        module: "masters",
        icon: Database,
        items: [
            { 
                title: "Master Hub", 
                url: "/apps/masters", 
                icon: Database, 
                resource: "products",
                subItems: [
                    { title: "Item Registry", url: "/apps/masters/items", icon: Box, resource: "products" },
                    { title: "Category Matrix", url: "/apps/masters/categories", icon: ListTree, resource: "products" },
                    { title: "Brand Catalog", url: "/apps/masters/brands", icon: Flag, resource: "products" },
                    { title: "UOM Matrix", url: "/apps/masters/uoms", icon: Hash, resource: "products" },
                    { title: "Tax Slabs", url: "/apps/masters/tax", icon: Percent, resource: "settings" },
                    { title: "Price Matrix", url: "/apps/masters/pricing", icon: DollarSign, resource: "settings" },
                    { title: "Contact Hub", url: "/apps/masters/contacts", icon: Users, resource: "leads" },
                ]
            },
            { title: "User Directory", url: "/apps/masters/users", icon: Users, resource: "users" },
            { title: "Role Matrix", url: "/apps/masters/roles", icon: ShieldCheck, resource: "users" },
        ]
    },
    {
        label: "FINANCIALS",
        module: "masters",
        icon: DollarSign,
        items: [
            { title: "Chart of Accounts", url: "/apps/masters/coa", icon: LayoutGrid, resource: "settings" },
            { title: "Fiscal Cycle", url: "/apps/masters/fiscal-years", icon: Clock, resource: "settings" },
        ]
    }
];

// Peripheral modules that shouldn't switch the main navigation context
const PERIPHERAL_MODULES = ['masters', 'settings', 'documents', 'projects'];

// Help detect active module from route
export const getCurrentModule = (pathname: string): string => {
    // Expected path structure: /apps/<module_name>/...
    const parts = pathname.split('/');
    if (parts.length >= 3 && parts[1] === 'apps') {
        const mod = parts[2];
        
        // If it's a peripheral module, don't update the framework state
        if (PERIPHERAL_MODULES.includes(mod)) {
            return localStorage.getItem('erp_active_framework') || 'ecommerce';
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
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    
    const isSuperAdminView = location.pathname.startsWith('/super-admin');
    const activeModule = getCurrentModule(location.pathname);

    // Auto-expand current active module's sub-items
    useEffect(() => {
        const path = location.pathname;
        const allGroups = isSuperAdminView ? superAdminNavGroups : [...(MODULE_NAV_MAP[activeModule] || []), ...INIT_NAV_GROUPS];
        
        allGroups.forEach(group => {
            group.items.forEach(item => {
                if (item.subItems && (path === item.url || path.startsWith(item.url + '/'))) {
                    if (!expandedItems.includes(item.url)) {
                        setExpandedItems(prev => [...prev, item.url]);
                    }
                }
            });
        });
    }, [location.pathname, activeModule]);

    const logoUrl = settings?.logo_url;
    const storeName = isSuperAdminView ? "Platform Admin" : (settings?.store_name || activeCompany?.name || PLATFORM_CONFIG.name);

    // Dynamic Navigation Generation based on Active Module & Industry
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

    // Always include INIT_NAV_GROUPS to ensure Master Data & User Directory are visible
    // within the context of the active module.
    const activeGroupsToRender = isSuperAdminView 
        ? superAdminNavGroups 
        : [...navGroups, ...INIT_NAV_GROUPS];

    return (
        <aside
            className={cn(
                "h-full flex flex-col shrink-0 border-r border-slate-200 shadow-sm overflow-y-auto overflow-x-hidden select-none bg-white transition-all duration-300 ease-in-out",
                collapsed ? "w-[60px]" : "w-[240px]"
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
                            <span className="font-bold text-slate-900 tracking-tight text-[13px] truncate">
                                {storeName}
                            </span>
                        </div>
                    </div>

                    {/* Collapse chevron */}
                    <button
                        onClick={onToggle}
                        className="w-5 h-5 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0"
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
                        <span className="flex-1 font-medium truncate text-[13px] text-slate-900">{activeCompany.name}</span>
                        {(companies.length > 1) && (
                            <ChevronDown className={cn("w-3 h-3 text-slate-500 transition-transform", showCompanySwitcher && "rotate-180")} />
                        )}
                    </button>

                    {showCompanySwitcher && companies.length > 1 && (
                        <div className="absolute left-2 right-2 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50">
                            {companies.map((c: any) => (
                                <button
                                    key={c.id}
                                    onClick={() => { setCompany(c.id); setShowCompanySwitcher(false); }}
                                    className={cn(
                                        "w-full flex items-center gap-2 px-3 py-2 text-[13px] text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0",
                                        activeCompany.id === c.id && "bg-blue-50 text-blue-600"
                                    )}
                                >
                                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                        <span className="text-[13px] font-bold text-slate-600">{c.name.charAt(0).toUpperCase()}</span>
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
            <div className="flex-1 flex flex-col gap-1 p-2 custom-scrollbar overflow-y-auto">
                {/* ── Dashboard Hub ── */}
                <div className="space-y-0.5">
                    <NavLink
                        to={isSuperAdminView ? "/super-admin" : `/apps/${activeModule}`}
                        className={cn(
                            "group flex items-center justify-start gap-2 px-3 py-1.5 rounded-md transition-all font-bold text-[13px] text-slate-700 hover:text-slate-900 relative uppercase tracking-tight",
                            collapsed ? "justify-center" : "justify-start"
                        )}
                        activeClassName="text-blue-600 bg-blue-50/50 font-semibold before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-blue-600 before:rounded-r-full"
                    >
                        <LayoutDashboard className="w-5 h-5 shrink-0" />
                        {!collapsed && <span className="flex-1 text-left">Dashboard Hub</span>}
                    </NavLink>
                </div>

                {activeGroupsToRender.map((group) => {
                    const visibleItems = group.items.filter(item => {
                        if (item.requiredModule && !hasModule(item.requiredModule)) return false;
                        return true;
                    });

                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={group.label} className="space-y-0.5">
                            {!collapsed && (
                                <div className="px-3 py-1 mt-4">
                                    <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">{group.label}</p>
                                </div>
                            )}
                            {visibleItems.map((item) => {
                                const hasSubItems = item.subItems && item.subItems.length > 0;
                                const isExpanded = expandedItems.includes(item.url);
                                const toggleExpand = (e: React.MouseEvent) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setExpandedItems(prev =>
                                        prev.includes(item.url)
                                            ? prev.filter(u => u !== item.url)
                                            : [...prev, item.url]
                                    );
                                };

                                const isExternal = item.url === "STOREFRONT";

                                if (isExternal) {
                                    return (
                                        <a
                                            key={item.url}
                                            href={`/${activeCompany?.subdomain || ''}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={cn(
                                                "group flex items-center justify-start gap-2 px-3 py-1.5 rounded-md transition-all font-bold text-[13px] text-slate-700 hover:text-slate-900 relative uppercase tracking-tight",
                                                collapsed ? "justify-center" : "justify-start"
                                            )}
                                        >
                                            <item.icon className="w-5 h-5 shrink-0 opacity-70 group-hover:opacity-100" />
                                            {!collapsed && <span className="flex-1 text-left">{item.title}</span>}
                                        </a>
                                    );
                                }

                                return (
                                    <div key={item.url} className="space-y-0.5">
                                        <NavLink
                                            to={item.url}
                                            className={cn(
                                                "group flex items-center justify-start gap-2 px-3 py-1.5 rounded-md transition-all font-bold text-[13px] text-slate-700 hover:text-slate-900 relative uppercase tracking-tight",
                                                collapsed ? "justify-center" : "justify-start"
                                            )}
                                            activeClassName="text-blue-600 bg-blue-50/50 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:bg-blue-600 before:rounded-r-full"
                                        >
                                            <item.icon className={cn(
                                                "w-5 h-5 shrink-0 transition-transform group-hover:scale-110 opacity-70 group-hover:opacity-100",
                                                (isExpanded || location.pathname.startsWith(item.url)) && "opacity-100"
                                            )} />
                                            {!collapsed && (
                                                <>
                                                    <span className="flex-1 text-left">{item.title}</span>
                                                    {hasSubItems && (
                                                        <button 
                                                            onClick={toggleExpand}
                                                            className="p-1 hover:bg-slate-200/50 rounded transition-all"
                                                        >
                                                            <ChevronDown className={cn(
                                                                "w-4 h-4 text-slate-400 transition-transform",
                                                                isExpanded && "rotate-180"
                                                            )} />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </NavLink>

                                        {hasSubItems && isExpanded && !collapsed && (
                                            <div className="ml-5 mt-1 border-l border-slate-200 pl-1 space-y-0.5">
                                                {item.subItems?.map((sub) => (
                                                    <NavLink
                                                        key={sub.url}
                                                        to={sub.url}
                                                        className="group flex items-center justify-start gap-2 px-3 py-1.5 rounded-md border-0 transition-all font-bold text-[13px] text-slate-600 hover:text-blue-600 hover:bg-blue-50/20 uppercase tracking-tight"
                                                        activeClassName="text-blue-600 bg-blue-50/50 font-bold"
                                                    >
                                                        <sub.icon className="w-4 h-4 opacity-60 group-hover:opacity-100" />
                                                        <span className="text-left">{sub.title}</span>
                                                    </NavLink>
                                                ))}
                                            </div>
                                        )}
                                    </div>
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
                            "group flex items-center justify-start gap-2 px-2 py-1.5 rounded-md transition-all text-[13px] font-semibold hover:bg-slate-200/50",
                            isSuperAdminView ? "text-slate-600" : "text-blue-600 hover:bg-blue-100/50",
                            collapsed ? "justify-center" : "justify-start"
                        )}
                        activeClassName={isSuperAdminView ? "bg-slate-200" : "bg-blue-100"}
                    >
                        {isSuperAdminView ? <LayoutDashboard className="w-4 h-4 shrink-0" /> : <ShieldCheck className="w-4 h-4 shrink-0" />}
                        {!collapsed && <span className="flex-1">{isSuperAdminView ? "Merchant mode" : "Platform Admin"}</span>}
                    </NavLink>
                )}
            </div>
        </aside>
    );
}

