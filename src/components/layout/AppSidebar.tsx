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
    Layout
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
}

interface NavGroup {
    label: string;
    icon: React.ElementType;
    items: NavItem[];
    module?: string;
}

const navGroups: NavGroup[] = [
    {
        label: "Catalog & Media",
        module: "Ecommerce",
        icon: Library,
        items: [
            { title: "Products", url: "/ecommerce/masters/products", icon: Boxes },
            { title: "Categories", url: "/ecommerce/masters/categories", icon: LayoutGrid },
            { title: "Brands", url: "/ecommerce/masters/brands", icon: Award },
            { title: "Collections", url: "/ecommerce/masters/collections", icon: Library },
            { title: "Hero Banners", url: "/ecommerce/banners", icon: Layout },
            { title: "Media Gallery", url: "/ecommerce/gallery", icon: ImageIcon },
        ],
    },
    {
        label: "Sales & Logistics",
        module: "Ecommerce",
        icon: ShoppingBag,
        items: [
            { title: "Orders", url: "/ecommerce/orders", icon: EcomCart },
            { title: "Deliveries", url: "/ecommerce/deliveries", icon: Truck },
            { title: "Refunds", url: "/ecommerce/refunds", icon: RotateCcw },
            { title: "Abandoned Carts", url: "/ecommerce/abandoned-carts", icon: ShoppingBag },
        ],
    },
    {
        label: "Marketing & Growth",
        module: "Ecommerce",
        icon: Zap,
        items: [
            { title: "Coupons", url: "/ecommerce/coupons", icon: Tag },
            { title: "Offers", url: "/ecommerce/offers", icon: Zap },
            { title: "Reviews", url: "/ecommerce/reviews", icon: Star },
        ],
    },
    {
        label: "Business Insights",
        module: "Ecommerce",
        icon: BarChart3,
        items: [
            { title: "Analytics", url: "/ecommerce/analytics", icon: Zap },
            { title: "Reports", url: "/ecommerce/reports", icon: BarChart3 },
        ],
    },
    {
        label: "Settings & Systems",
        module: "Ecommerce",
        icon: Settings,
        items: [
            { title: "Website Manager", url: "/ecommerce/website", icon: Globe2 },
            { title: "Billing & Plans", url: "/ecommerce/billing", icon: CreditCard },
            { title: "Team Management", url: "/ecommerce/team", icon: Users },
            { title: "Payment Gateways", url: "/ecommerce/payment-gateways", icon: ShieldCheck },
            { title: "Shipping Zones", url: "/ecommerce/shipping-zones", icon: MapPin },
            { title: "API & Integrations", url: "/ecommerce/api-integrations", icon: Zap },
            { title: "General Settings", url: "/ecommerce/settings", icon: Settings },
            { title: "View Storefront", url: "STOREFRONT", icon: ExternalLink },
        ],
    }
];

interface AppSidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
    const location = useLocation();
    const { hasModule, isSuperAdmin } = usePermissions();
    const { activeCompany, companies, setCompany } = useTenant();
    const [openGroups, setOpenGroups] = useState<string[]>(["Ecommerce"]);
    const [showCompanySwitcher, setShowCompanySwitcher] = useState(false);

    const isGroupActive = (group: NavGroup) =>
        group.items.some((item) => location.pathname.startsWith(item.url));

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 min-h-screen h-full flex flex-col z-50 transition-all duration-300 ease-in-out border-r border-[#14532d]/20 shadow-xl overflow-y-auto overflow-x-hidden text-white/80 select-none",
                "bg-gradient-to-b from-[#0a2e18] to-[#14532d]",
                collapsed ? "w-[80px]" : "w-[260px]"
            )}
        >
            {/* Header / Logo Section */}
            <div className="flex items-center h-20 px-6 shrink-0 relative bg-black/10 backdrop-blur-sm z-10 border-b border-white/10">
                <div className="flex items-center gap-3 overflow-hidden cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-[#f97316] flex items-center justify-center shrink-0 shadow-lg shadow-[#f97316]/20">
                        <span className="text-white font-black text-xl leading-none">S</span>
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="font-bold text-white tracking-tight text-lg">
                                SmartSaaS
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tenant Switcher */}
            {!collapsed && activeCompany && (
                <div className="px-4 py-4 shrink-0">
                    <button
                        onClick={() => setShowCompanySwitcher(!showCompanySwitcher)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 group text-left relative"
                    >
                        <Crown className="w-4 h-4 text-[#f97316] shrink-0" />
                        <span className="flex-1 font-semibold truncate text-sm text-white/90">{activeCompany.name}</span>
                        {(companies.length > 1) && (
                            <ChevronDown className={cn("w-4 h-4 text-white/50 transition-transform", showCompanySwitcher && "rotate-180")} />
                        )}
                    </button>

                    {showCompanySwitcher && companies.length > 1 && (
                        <div className="absolute left-4 right-4 mt-2 bg-[#092212] border border-[#f97316]/20 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                            {companies.map((c: any) => (
                                <button
                                    key={c.id}
                                    onClick={() => { setCompany(c.id); setShowCompanySwitcher(false); }}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-0",
                                        activeCompany.id === c.id && "bg-[#f97316]/10 text-white"
                                    )}
                                >
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold text-white">{c.name.charAt(0)}</span>
                                    </div>
                                    <span className="flex-1 truncate font-medium">{c.name}</span>
                                    {activeCompany.id === c.id && <Check className="w-4 h-4 text-[#f97316]" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Navigation Sections */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pt-4 px-3 space-y-6 scrollbar-hide pb-4">
                <div className="space-y-1">
                    <NavLink
                        to="/ecommerce"
                        className={cn(
                            "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-[13px]",
                            collapsed ? "justify-center" : "",
                            "text-white/60 hover:text-white hover:bg-white/10"
                        )}
                        activeClassName="text-white bg-[#f97316] font-bold shadow-md shadow-[#f97316]/20"
                    >
                        <LayoutDashboard className="w-5 h-5 shrink-0" />
                        {!collapsed && <span className="flex-1 truncate">Dashboard</span>}
                    </NavLink>
                </div>

                {navGroups
                    .filter((group) => hasModule(group.module || group.label))
                    .map((group) => {
                        return (
                            <div key={group.label} className="space-y-1">
                                {!collapsed && (
                                    <div className="px-4 py-2">
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#f97316]">{group.label}</p>
                                    </div>
                                )}
                                {group.items.map((item) => {
                                    const isExternal = item.url === "STOREFRONT";
                                    if (isExternal) {
                                        return (
                                            <a
                                                key={item.url}
                                                href={`/${activeCompany?.subdomain || ''}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={cn(
                                                    "group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-[13px] text-white/60 hover:text-white hover:bg-white/10",
                                                    collapsed ? "justify-center" : ""
                                                )}
                                            >
                                                <item.icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 text-white/50 group-hover:text-white" />
                                                {!collapsed && <span className="flex-1 truncate">{item.title}</span>}
                                            </a>
                                        );
                                    }
                                    return (
                                        <NavLink
                                            key={item.url}
                                            to={item.url}
                                            className={cn(
                                                "group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-[13px] text-white/60 hover:text-white hover:bg-white/10",
                                                collapsed ? "justify-center" : ""
                                            )}
                                            activeClassName="text-white bg-white/15 font-bold border border-white/10 shadow-sm"
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
            <div className="p-4 space-y-2 border-t border-white/10 shrink-0 bg-black/10 backdrop-blur-sm">
                {isSuperAdmin && (
                    <NavLink
                        to="/super-admin"
                        className={cn(
                            "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[13px] font-medium text-[#f97316] hover:bg-[#f97316]/10 border border-[#f97316]/20",
                            collapsed ? "justify-center" : ""
                        )}
                        activeClassName="bg-[#f97316]/20 font-bold"
                    >
                        <ShieldCheck className="w-5 h-5 shrink-0" />
                        {!collapsed && <span className="flex-1 truncate">Platform Admin</span>}
                    </NavLink>
                )}

                <button
                    onClick={onToggle}
                    className={cn(
                        "group flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-[13px] font-medium text-white/60 hover:text-white hover:bg-white/10",
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
