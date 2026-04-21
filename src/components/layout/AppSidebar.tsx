/**
 * ERPNext v16 Desk sidebar — flat, compact, module-switcher on top.
 * Data-driven: consumes navigation config from @/config/navigation.
 */
import { useState, useEffect } from "react";
import {
    LayoutDashboard, ChevronDown, Check,
    ShieldCheck, Rocket, Crown, ChevronRight, Settings,
    PanelLeftClose, PanelLeftOpen,
    LayoutGrid, Globe2, CalendarDays, CreditCard, Users, Zap,
    DollarSign, Languages, Factory, Percent, Mail, Megaphone, ToggleRight, History, Database,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useTenant } from "@/contexts/TenantContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import PLATFORM_CONFIG from "@/config/platform";
import { MODULE_NAV, CORE_NAV, INDUSTRY_LABELS, getCurrentModule } from "@/config/navigation";
import type { NavGroup } from "@/config/navigation";

/* ── Super Admin Navigation ────────────────────────────────────────────────── */
const superAdminNavGroups: NavGroup[] = [
    {
        label: "Platform",
        icon: ShieldCheck,
        items: [
            { title: "Dashboard", url: "/super-admin", icon: LayoutDashboard },
            { title: "Tenants", url: "/super-admin/tenants", icon: Globe2 },
            { title: "Subscriptions", url: "/super-admin/subscriptions", icon: CalendarDays },
            { title: "Plans", url: "/super-admin/plans", icon: CreditCard },
            { title: "Modules", url: "/super-admin/modules", icon: LayoutGrid },
            { title: "Users", url: "/super-admin/users", icon: Users },
        ],
    },
    {
        label: "Master Data",
        icon: Database,
        items: [
            { title: "Currencies", url: "/super-admin/currencies", icon: DollarSign },
            { title: "Countries", url: "/super-admin/countries", icon: Globe2 },
            { title: "Languages", url: "/super-admin/languages", icon: Languages },
            { title: "Industries", url: "/super-admin/industries", icon: Factory },
            { title: "Tax Rates", url: "/super-admin/tax-rates", icon: Percent },
        ],
    },
    {
        label: "Communications",
        icon: Mail,
        items: [
            { title: "Email Templates", url: "/super-admin/email-templates", icon: Mail },
            { title: "Announcements", url: "/super-admin/announcements", icon: Megaphone },
        ],
    },
    {
        label: "System",
        icon: Settings,
        items: [
            { title: "Feature Flags", url: "/super-admin/feature-flags", icon: ToggleRight },
            { title: "Audit Logs", url: "/super-admin/audit-logs", icon: History },
            { title: "Connectors", url: "/super-admin/connectors", icon: Zap },
            { title: "Settings", url: "/super-admin/settings", icon: Settings },
        ],
    },
];

export { getCurrentModule };

export const getRequiredResource = (pathname: string): string | undefined => {
    const activeModule = getCurrentModule(pathname);
    const groups = MODULE_NAV[activeModule] || [];
    for (const group of groups) {
        const match = group.items.find((item) => pathname.startsWith(item.url));
        if (match) return match.resource;
    }
    for (const group of CORE_NAV) {
        const match = group.items.find((item) => pathname.startsWith(item.url));
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
    const { hasModule, isSuperAdmin } = usePermissions();
    const { activeCompany, companies, setCompany } = useTenant();
    const { settings } = useStoreSettings();
    const [showCompanySwitcher, setShowCompanySwitcher] = useState(false);
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    const isSuperAdminView = location.pathname.startsWith("/super-admin");
    const activeModule = getCurrentModule(location.pathname);

    useEffect(() => {
        const path = location.pathname;
        const allGroups = isSuperAdminView
            ? superAdminNavGroups
            : [...(MODULE_NAV[activeModule] || []), ...CORE_NAV];

        allGroups.forEach((group) => {
            const hasActiveItem = group.items.some(
                (item) => path === item.url || path.startsWith(item.url + "/"),
            );
            if (hasActiveItem) {
                setExpandedGroups((prev) => new Set([...prev, group.label]));
            }
            group.items.forEach((item) => {
                if (item.subItems && (path === item.url || path.startsWith(item.url + "/"))) {
                    if (!expandedItems.includes(item.url)) {
                        setExpandedItems((prev) => [...prev, item.url]);
                    }
                }
            });
        });
    }, [location.pathname, activeModule]);

    // Auto-expand all top-level groups by default for discoverability
    useEffect(() => {
        const groups = isSuperAdminView
            ? superAdminNavGroups
            : [...(MODULE_NAV[activeModule] || []), ...CORE_NAV];
        setExpandedGroups((prev) => {
            const next = new Set(prev);
            groups.forEach((g) => next.add(g.label));
            return next;
        });
    }, [activeModule, isSuperAdminView]);

    const toggleGroup = (label: string) => {
        setExpandedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(label)) next.delete(label);
            else next.add(label);
            return next;
        });
    };

    const logoUrl = settings?.logo_url;
    const storeName = isSuperAdminView
        ? "Platform"
        : settings?.store_name || activeCompany?.name || PLATFORM_CONFIG.name;

    const moduleNavGroups = MODULE_NAV[activeModule] || [];
    const industry = activeCompany?.industry_type || "retail";
    const overrides = INDUSTRY_LABELS[industry] || { labels: {}, items: {} };

    const navGroups = moduleNavGroups.map((group) => ({
        ...group,
        label: overrides.labels?.[group.label] || group.label,
        items: group.items.map((item) => ({
            ...item,
            title: overrides.items?.[item.url] || item.title,
        })),
    }));

    const activeGroupsToRender = isSuperAdminView
        ? superAdminNavGroups
        : [...navGroups, ...CORE_NAV];

    return (
        <aside
            className={cn(
                "h-full flex flex-col shrink-0 border-r border-sidebar-border bg-sidebar overflow-y-auto overflow-x-hidden select-none transition-all duration-200 ease-out erp-scrollbar",
                collapsed ? "w-[56px]" : "w-[256px]",
            )}
        >
            {/* ── Header / Logo ─────────────────────────────────────── */}
            <div className="flex items-center h-12 px-3 shrink-0 border-b border-sidebar-border">
                <div className={cn("flex items-center gap-2 overflow-hidden min-w-0", collapsed && "justify-center w-full")}>
                    {logoUrl && !isSuperAdminView ? (
                        <img src={logoUrl} alt={storeName} className="w-6 h-6 rounded object-contain shrink-0" />
                    ) : (
                        <div
                            className={cn(
                                "w-6 h-6 rounded flex items-center justify-center shrink-0",
                                isSuperAdminView ? "bg-gray-800" : "bg-primary",
                            )}
                        >
                            {isSuperAdminView ? (
                                <ShieldCheck className="text-white w-3.5 h-3.5" />
                            ) : (
                                <Rocket className="text-white w-3.5 h-3.5" />
                            )}
                        </div>
                    )}
                    {!collapsed && (
                        <span className="font-semibold text-gray-800 dark:text-foreground text-sm truncate">
                            {storeName}
                        </span>
                    )}
                </div>
                {!collapsed && (
                    <button
                        onClick={onToggle}
                        className="ml-auto w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0 dark:hover:bg-accent"
                        title="Collapse sidebar"
                    >
                        <PanelLeftClose className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {collapsed && (
                <button
                    onClick={onToggle}
                    className="flex items-center justify-center h-8 w-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0 dark:hover:bg-accent"
                    title="Expand sidebar"
                >
                    <PanelLeftOpen className="w-3.5 h-3.5" />
                </button>
            )}

            {/* ── Tenant Switcher ─────────────────────────────────── */}
            {!collapsed && activeCompany && !isSuperAdminView && (
                <div className="px-2 py-2 shrink-0 relative">
                    <button
                        onClick={() => setShowCompanySwitcher(!showCompanySwitcher)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors border border-gray-200 text-left dark:bg-accent/40 dark:border-border dark:hover:bg-accent"
                    >
                        <div className="w-5 h-5 rounded bg-primary-100 flex items-center justify-center shrink-0">
                            <Crown className="w-2.5 h-2.5 text-primary-700" />
                        </div>
                        <span className="flex-1 font-medium truncate text-xs text-gray-700 dark:text-foreground">
                            {activeCompany.name}
                        </span>
                        {companies.length > 1 && (
                            <ChevronDown
                                className={cn(
                                    "w-3 h-3 text-gray-400 transition-transform",
                                    showCompanySwitcher && "rotate-180",
                                )}
                            />
                        )}
                    </button>
                    {showCompanySwitcher && companies.length > 1 && (
                        <div className="absolute left-2 right-2 mt-1 bg-popover border border-gray-200 rounded-md shadow-md overflow-hidden z-50 dark:border-border">
                            {companies.map((c: any) => (
                                <button
                                    key={c.id}
                                    onClick={() => {
                                        setCompany(c.id);
                                        setShowCompanySwitcher(false);
                                    }}
                                    className={cn(
                                        "w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left hover:bg-gray-50 transition-colors dark:hover:bg-accent",
                                        activeCompany.id === c.id && "bg-primary-50 text-primary-700 dark:bg-accent dark:text-accent-foreground",
                                    )}
                                >
                                    <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center shrink-0 dark:bg-accent/60">
                                        <span className="text-[10px] font-semibold text-gray-600 dark:text-foreground">
                                            {c.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="flex-1 truncate font-medium">{c.name}</span>
                                    {activeCompany.id === c.id && <Check className="w-3 h-3 text-primary" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Navigation ─────────────────────────────────────── */}
            <div className="flex-1 flex flex-col px-1.5 py-1.5 overflow-y-auto erp-scrollbar">
                {/* Dashboard Link */}
                <NavLink
                    to={isSuperAdminView ? "/super-admin" : `/apps/${activeModule}`}
                    className={cn(
                        "group flex items-center gap-2.5 px-2.5 h-8 rounded text-sm text-sidebar-foreground hover:text-gray-900 hover:bg-gray-100 transition-colors relative dark:hover:text-foreground dark:hover:bg-accent",
                        collapsed ? "justify-center" : "justify-start",
                    )}
                    activeClassName="sidebar-item-active"
                >
                    <LayoutDashboard className="w-[15px] h-[15px] shrink-0 opacity-70" />
                    {!collapsed && <span className="leading-none">Dashboard</span>}
                </NavLink>

                {/* Nav Groups */}
                {activeGroupsToRender.map((group) => {
                    const visibleItems = group.items.filter((item) => {
                        if ((item as any).requiredModule && !hasModule((item as any).requiredModule)) return false;
                        return true;
                    });
                    if (visibleItems.length === 0) return null;

                    const isGroupExpanded = expandedGroups.has(group.label);

                    return (
                        <div key={group.label} className="mt-2">
                            {!collapsed && (
                                <button
                                    onClick={() => toggleGroup(group.label)}
                                    className="w-full flex items-center gap-1.5 px-2 h-6 text-left text-gray-400 hover:text-gray-600 transition-colors dark:hover:text-foreground"
                                >
                                    <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider">
                                        {group.label}
                                    </span>
                                    {isGroupExpanded ? (
                                        <ChevronDown className="w-3 h-3 opacity-60" />
                                    ) : (
                                        <ChevronRight className="w-3 h-3 opacity-60" />
                                    )}
                                </button>
                            )}

                            {(collapsed || isGroupExpanded) && (
                                <div className="space-y-px">
                                    {visibleItems.map((item) => {
                                        const hasSubItems = item.subItems && item.subItems.length > 0;
                                        const isExpanded = expandedItems.includes(item.url);

                                        return (
                                            <div key={item.url}>
                                                <NavLink
                                                    to={item.url}
                                                    className={cn(
                                                        "group flex items-center gap-2.5 px-2.5 h-8 rounded text-sm text-sidebar-foreground hover:text-gray-900 hover:bg-gray-100 transition-colors relative dark:hover:text-foreground dark:hover:bg-accent",
                                                        collapsed ? "justify-center" : "justify-start",
                                                    )}
                                                    activeClassName="sidebar-item-active"
                                                >
                                                    <item.icon className="w-[15px] h-[15px] shrink-0 opacity-70" />
                                                    {!collapsed && (
                                                        <>
                                                            <span className="flex-1 text-left leading-none truncate">
                                                                {item.title}
                                                            </span>
                                                            {hasSubItems && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        setExpandedItems((prev) =>
                                                                            prev.includes(item.url)
                                                                                ? prev.filter((u) => u !== item.url)
                                                                                : [...prev, item.url],
                                                                        );
                                                                    }}
                                                                    className="p-0.5 hover:bg-gray-200/50 rounded transition-colors"
                                                                >
                                                                    <ChevronDown
                                                                        className={cn(
                                                                            "w-3 h-3 text-gray-400 transition-transform",
                                                                            isExpanded && "rotate-180",
                                                                        )}
                                                                    />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </NavLink>
                                                {hasSubItems && isExpanded && !collapsed && (
                                                    <div className="ml-5 border-l border-gray-200 pl-2 space-y-px dark:border-border">
                                                        {item.subItems?.map((sub) => (
                                                            <NavLink
                                                                key={sub.url}
                                                                to={sub.url}
                                                                className="group flex items-center gap-2 px-2 h-6 rounded text-xs text-gray-500 hover:text-primary-700 hover:bg-primary-50/40 transition-colors"
                                                                activeClassName="text-primary-700 bg-primary-50 font-medium"
                                                            >
                                                                <sub.icon className="w-3 h-3 opacity-70" />
                                                                <span className="leading-none truncate">{sub.title}</span>
                                                            </NavLink>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── Bottom — Admin Mode Switcher ─────────────────── */}
            {isSuperAdmin && (
                <div className="p-1.5 border-t border-sidebar-border shrink-0">
                    <NavLink
                        to={isSuperAdminView ? "/apps" : "/super-admin"}
                        className={cn(
                            "group flex items-center gap-2 px-2 h-7 rounded text-sm font-medium transition-colors",
                            isSuperAdminView
                                ? "text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-accent"
                                : "text-primary hover:bg-primary-50",
                            collapsed ? "justify-center" : "justify-start",
                        )}
                    >
                        {isSuperAdminView ? (
                            <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        )}
                        {!collapsed && <span className="leading-none">{isSuperAdminView ? "Merchant Mode" : "Platform Admin"}</span>}
                    </NavLink>
                </div>
            )}
        </aside>
    );
}
