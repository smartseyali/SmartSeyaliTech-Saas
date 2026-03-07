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
    Rocket
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

const baseNavGroups: NavGroup[] = [
    {
        label: "Catalog & Media",
        module: "Ecommerce",
        icon: Library,
        items: [
            { title: "Products", url: "/ecommerce/masters/products", icon: Boxes, resource: "products" },
            { title: "Categories", url: "/ecommerce/masters/categories", icon: LayoutGrid, resource: "products" },
            { title: "Brands", url: "/ecommerce/masters/brands", icon: Award, resource: "products" },
            { title: "Collections", url: "/ecommerce/masters/collections", icon: Library, resource: "products" },
            { title: "Hero Banners", url: "/ecommerce/banners", icon: Layout, resource: "marketing" },
            { title: "Media Gallery", url: "/ecommerce/gallery", icon: ImageIcon, resource: "products" },
        ],
    },
    {
        label: "Sales & Logistics",
        module: "Ecommerce",
        icon: ShoppingBag,
        items: [
            { title: "Orders", url: "/ecommerce/orders", icon: EcomCart, resource: "orders" },
            { title: "Customers", url: "/ecommerce/customers", icon: Users, resource: "customers" },
            { title: "Deliveries", url: "/ecommerce/deliveries", icon: Truck, resource: "orders" },
            { title: "Refunds", url: "/ecommerce/refunds", icon: RotateCcw, resource: "orders" },
            { title: "Abandoned Carts", url: "/ecommerce/abandoned-carts", icon: ShoppingBag, resource: "orders" },
        ],
    },
    {
        label: "Marketing & Growth",
        module: "Ecommerce",
        icon: Zap,
        items: [
            { title: "Coupons", url: "/ecommerce/coupons", icon: Tag, resource: "marketing" },
            { title: "Offers", url: "/ecommerce/offers", icon: Zap, resource: "marketing" },
            { title: "Reviews", url: "/ecommerce/reviews", icon: Star, resource: "marketing" },
        ],
    },
    {
        label: "Business Insights",
        module: "Ecommerce",
        icon: BarChart3,
        items: [
            { title: "Analytics", url: "/ecommerce/analytics", icon: Zap, resource: "analytics" },
            { title: "Reports", url: "/ecommerce/reports", icon: BarChart3, resource: "analytics" },
        ],
    },
    {
        label: "Settings & Systems",
        module: "Ecommerce",
        icon: Settings,
        items: [
            { title: "Website Manager", url: "/ecommerce/website", icon: Globe2, resource: "settings" },
            { title: "Billing & Plans", url: "/ecommerce/billing", icon: CreditCard, resource: "settings" },
            { title: "Team Management", url: "/ecommerce/team", icon: Users, resource: "team" },
            { title: "Payment Gateways", url: "/ecommerce/payment-gateways", icon: ShieldCheck, resource: "settings" },
            { title: "Shipping Zones", url: "/ecommerce/shipping-zones", icon: MapPin, resource: "settings" },
            { title: "API & Integrations", url: "/ecommerce/api-integrations", icon: Zap, resource: "settings" },
            { title: "General Settings", url: "/ecommerce/settings", icon: Settings, resource: "settings" },
            { title: "View Storefront", url: "STOREFRONT", icon: ExternalLink },
        ],
    }
];

export const getRequiredResource = (pathname: string): string | undefined => {
    for (const group of baseNavGroups) {
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

    // Dynamic Navigation Generation based on Industry
    const industry = activeCompany?.industry_type || 'retail';
    const overrides = INDUSTRY_MAP[industry] || { labels: {}, items: {} };

    const navGroups = baseNavGroups.map(group => ({
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
                            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", isSuperAdminView ? "bg-slate-900" : "bg-blue-600")}>
                                {isSuperAdminView ? <ShieldCheck className="text-white w-4 h-4" /> : <Rocket className="text-white w-4 h-4" />}
                            </div>
                        )}
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-900 tracking-tight text-[15px] truncate leading-tight">
                                {storeName}
                            </span>
                            {!isSuperAdminView && settings?.store_tagline && (
                                <span className="text-[10px] text-slate-400 font-medium truncate leading-none mt-0.5">
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
                        className="w-full flex items-center gap-3 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all border border-slate-200 group text-left relative"
                    >
                        <Crown className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="flex-1 font-semibold truncate text-[13px] text-slate-700">{activeCompany.name}</span>
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
                    <NavLink
                        to={isSuperAdminView ? "/super-admin" : "/ecommerce"}
                        className={cn(
                            "group flex items-center gap-3 px-4 py-2 rounded-lg transition-all font-medium text-sm",
                            collapsed ? "justify-center" : "",
                            "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        )}
                        activeClassName="text-blue-600 bg-blue-50 font-semibold"
                    >
                        <LayoutDashboard className="w-5 h-5 shrink-0" />
                        {!collapsed && <span className="flex-1 truncate">Dashboard</span>}
                    </NavLink>
                </div>

                {activeGroupsToRender
                    .filter((group) => isSuperAdminView ? true : hasModule(group.module || group.label))
                    .map((group) => {
                        const visibleItems = group.items.filter(item => !item.resource || can('manage', item.resource) || isSuperAdminView);
                        if (visibleItems.length === 0) return null;

                        return (
                            <div key={group.label} className="space-y-1">
                                {!collapsed && (
                                    <div className="px-4 py-2 mt-2">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{group.label}</p>
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
                                                "group flex items-center gap-3 px-4 py-2 rounded-lg transition-all font-medium text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                                                collapsed ? "justify-center" : ""
                                            )}
                                            activeClassName="text-blue-600 bg-blue-50 font-semibold"
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
