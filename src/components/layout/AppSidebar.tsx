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

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
    const location = useLocation();
    const { hasModule, isSuperAdmin, can } = usePermissions();
    const { activeCompany, companies, setCompany } = useTenant();
    const [openGroups, setOpenGroups] = useState<string[]>(["Ecommerce"]);
    const [showCompanySwitcher, setShowCompanySwitcher] = useState(false);

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

    const isGroupActive = (group: NavGroup) =>
        group.items.some((item) => location.pathname.startsWith(item.url));

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 min-h-screen h-full flex flex-col z-50 transition-all duration-300 ease-in-out border-r border-slate-200 shadow-sm overflow-y-auto overflow-x-hidden select-none bg-white",
                collapsed ? "w-[80px]" : "w-[260px]"
            )}
        >
            {/* Header / Logo Section */}
            <div className="flex items-center h-16 md:h-20 px-6 shrink-0 z-10">
                <div className="flex items-center gap-3 overflow-hidden cursor-pointer group">
                    <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center shrink-0">
                        <Rocket className="text-white w-5 h-5" />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-900 tracking-tight text-lg">
                                LiteAdmin
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tenant Switcher */}
            {!collapsed && activeCompany && (
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
                        to="/ecommerce"
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

                {navGroups
                    .filter((group) => hasModule(group.module || group.label))
                    .map((group) => {
                        const visibleItems = group.items.filter(item => !item.resource || can('manage', item.resource));
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
            <div className="p-4 space-y-1 border-t border-slate-100 bg-slate-50/50 shrink-0">
                {isSuperAdmin && (
                    <NavLink
                        to="/super-admin"
                        className={cn(
                            "group flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm font-semibold text-blue-600 hover:bg-blue-100/50",
                            collapsed ? "justify-center" : ""
                        )}
                        activeClassName="bg-blue-100"
                    >
                        <ShieldCheck className="w-5 h-5 shrink-0" />
                        {!collapsed && <span className="flex-1 truncate">Platform Admin</span>}
                    </NavLink>
                )}

                <button
                    onClick={onToggle}
                    className={cn(
                        "group flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-all text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100",
                        collapsed ? "justify-center" : ""
                    )}
                >
                    <ChevronLeft className={cn("w-5 h-5 shrink-0 transition-transform", collapsed && "rotate-180")} />
                    {!collapsed && <span className="flex-1 text-left truncate">Collapse</span>}
                </button>
            </div>
        </aside>
    );
}
