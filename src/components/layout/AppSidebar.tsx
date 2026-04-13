/**
 * AppSidebar — Data-driven navigation sidebar
 *
 * Uses navigation config from @/config/navigation instead of 300+ lines of hardcoded menus.
 */
import { useState, useEffect } from "react";
import {
    LayoutDashboard, ChevronDown, ChevronLeft, Check,
    ShieldCheck, Rocket, Crown, Globe2, CreditCard,
    LayoutGrid, Layout, Users, Zap, ChevronRight, CalendarDays, Settings
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useTenant } from "@/contexts/TenantContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import PLATFORM_CONFIG from "@/config/platform";
import { MODULE_NAV, CORE_NAV, INDUSTRY_LABELS, getCurrentModule } from "@/config/navigation";
import type { NavItem, NavGroup } from "@/config/navigation";

/* ── Super Admin Navigation ────────────────────────────────────────────────── */

const superAdminNavGroups: NavGroup[] = [
    {
        label: "Platform Hub",
        icon: ShieldCheck,
        items: [
            { title: "Platform Dashboard", url: "/super-admin", icon: LayoutDashboard },
            { title: "Tenant/Company List", url: "/super-admin/tenants", icon: Globe2 },
            { title: "Subscriptions", url: "/super-admin/subscriptions", icon: CalendarDays },
            { title: "Subscription Plans", url: "/super-admin/plans", icon: CreditCard },
            { title: "Marketplace Modules", url: "/super-admin/modules", icon: LayoutGrid },
            { title: "User Management", url: "/super-admin/users", icon: Users },
            { title: "Headless Connectors", url: "/super-admin/connectors", icon: Zap },
            { title: "Platform Settings", url: "/super-admin/settings", icon: Settings },
        ],
    }
];

/* ── Exported Helpers ──────────────────────────────────────────────────────── */

export { getCurrentModule };

export const getRequiredResource = (pathname: string): string | undefined => {
    const activeModule = getCurrentModule(pathname);
    const groups = MODULE_NAV[activeModule] || [];
    for (const group of groups) {
        const match = group.items.find(item => pathname.startsWith(item.url));
        if (match) return match.resource;
    }
    for (const group of CORE_NAV) {
        const match = group.items.find(item => pathname.startsWith(item.url));
        if (match) return match.resource;
    }
    return undefined;
};

/* ── Component ─────────────────────────────────────────────────────────────── */

interface AppSidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
    const location = useLocation();
    const { hasModule, isSuperAdmin, can } = usePermissions();
    const { activeCompany, companies, setCompany } = useTenant();
    const { settings } = useStoreSettings();
    const [showCompanySwitcher, setShowCompanySwitcher] = useState(false);
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    const isSuperAdminView = location.pathname.startsWith('/super-admin');
    const activeModule = getCurrentModule(location.pathname);

    // Auto-expand active group and sub-items
    useEffect(() => {
        const path = location.pathname;
        const allGroups = isSuperAdminView ? superAdminNavGroups : [...(MODULE_NAV[activeModule] || []), ...CORE_NAV];

        allGroups.forEach(group => {
            // Auto-expand group if it contains the active item
            const hasActiveItem = group.items.some(item =>
                path === item.url || path.startsWith(item.url + '/')
            );
            if (hasActiveItem) {
                setExpandedGroups(prev => new Set([...prev, group.label]));
            }

            group.items.forEach(item => {
                if (item.subItems && (path === item.url || path.startsWith(item.url + '/'))) {
                    if (!expandedItems.includes(item.url)) {
                        setExpandedItems(prev => [...prev, item.url]);
                    }
                }
            });
        });
    }, [location.pathname, activeModule]);

    const toggleGroup = (label: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(label)) next.delete(label);
            else next.add(label);
            return next;
        });
    };

    const logoUrl = settings?.logo_url;
    const storeName = isSuperAdminView ? "Platform Admin" : (settings?.store_name || activeCompany?.name || PLATFORM_CONFIG.name);

    // Dynamic Navigation with industry overrides
    const moduleNavGroups = MODULE_NAV[activeModule] || [];
    const industry = activeCompany?.industry_type || 'retail';
    const overrides = INDUSTRY_LABELS[industry] || { labels: {}, items: {} };

    const navGroups = moduleNavGroups.map(group => ({
        ...group,
        label: overrides.labels?.[group.label] || group.label,
        items: group.items.map(item => ({
            ...item,
            title: overrides.items?.[item.url] || item.title
        }))
    }));

    const activeGroupsToRender = isSuperAdminView
        ? superAdminNavGroups
        : [...navGroups, ...CORE_NAV];

    return (
        <aside className={cn(
            "h-full flex flex-col shrink-0 border-r border-slate-200/80 overflow-y-auto overflow-x-hidden select-none bg-white transition-all duration-300 ease-in-out",
            collapsed ? "w-[56px]" : "w-[244px]"
        )}>
            {/* ── Header / Logo ─────────────────────────────────────────── */}
            {collapsed ? (
                <button onClick={onToggle} className="flex items-center justify-center h-12 w-full border-b border-slate-100 shrink-0 group" title="Expand sidebar">
                    {logoUrl && !isSuperAdminView ? (
                        <img src={logoUrl} alt={storeName} className="w-7 h-7 rounded-lg object-contain" />
                    ) : (
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", isSuperAdminView ? "bg-slate-800" : "bg-blue-600")}>
                            {isSuperAdminView ? <ShieldCheck className="text-white w-3.5 h-3.5" /> : <Rocket className="text-white w-3.5 h-3.5" />}
                        </div>
                    )}
                </button>
            ) : (
                <div className="flex items-center h-12 px-3 justify-between shrink-0 border-b border-slate-100">
                    <div className="flex items-center gap-2 overflow-hidden min-w-0">
                        {logoUrl && !isSuperAdminView ? (
                            <img src={logoUrl} alt={storeName} className="w-7 h-7 rounded-lg object-contain shrink-0" />
                        ) : (
                            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", isSuperAdminView ? "bg-slate-800" : "bg-blue-600")}>
                                {isSuperAdminView ? <ShieldCheck className="text-white w-3.5 h-3.5" /> : <Rocket className="text-white w-3.5 h-3.5" />}
                            </div>
                        )}
                        <span className="font-semibold text-slate-800 text-sm truncate">{storeName}</span>
                    </div>
                    <button onClick={onToggle} className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0" title="Collapse sidebar">
                        <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* ── Tenant Switcher ────────────────────────────────────────── */}
            {!collapsed && activeCompany && !isSuperAdminView && (
                <div className="px-3 py-2 shrink-0 border-b border-slate-50">
                    <button onClick={() => setShowCompanySwitcher(!showCompanySwitcher)}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-150 text-left">
                        <div className="w-5 h-5 rounded bg-blue-600/10 flex items-center justify-center shrink-0">
                            <Crown className="w-3 h-3 text-blue-600" />
                        </div>
                        <span className="flex-1 font-medium truncate text-xs text-slate-700">{activeCompany.name}</span>
                        {companies.length > 1 && <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform", showCompanySwitcher && "rotate-180")} />}
                    </button>
                    {showCompanySwitcher && companies.length > 1 && (
                        <div className="absolute left-3 right-3 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50">
                            {companies.map((c: any) => (
                                <button key={c.id} onClick={() => { setCompany(c.id); setShowCompanySwitcher(false); }}
                                    className={cn("w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0", activeCompany.id === c.id && "bg-blue-50 text-blue-700")}>
                                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold text-slate-600">{c.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <span className="flex-1 truncate font-medium">{c.name}</span>
                                    {activeCompany.id === c.id && <Check className="w-3 h-3 text-blue-600" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Navigation ─────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col px-2 pt-2 pb-3 custom-scrollbar overflow-y-auto">
                {/* Dashboard Link */}
                <NavLink to={isSuperAdminView ? "/super-admin" : `/apps/${activeModule}`}
                    className={cn(
                        "group flex items-center gap-2.5 px-2.5 py-[7px] rounded-md transition-colors text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 relative",
                        collapsed ? "justify-center" : "justify-start"
                    )}
                    activeClassName="text-blue-700 bg-blue-50 font-semibold before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-blue-600 before:rounded-r">
                    <LayoutDashboard className="w-[18px] h-[18px] shrink-0 opacity-60 group-hover:opacity-100" />
                    {!collapsed && <span>Dashboard</span>}
                </NavLink>

                {/* Nav Groups */}
                {activeGroupsToRender.map((group) => {
                    const visibleItems = group.items.filter(item => {
                        if ((item as any).requiredModule && !hasModule((item as any).requiredModule)) return false;
                        return true;
                    });
                    if (visibleItems.length === 0) return null;

                    const isGroupExpanded = expandedGroups.has(group.label);
                    const hasActiveChild = visibleItems.some(item =>
                        location.pathname === item.url || location.pathname.startsWith(item.url + '/')
                    );

                    return (
                        <div key={group.label} className="mt-1">
                            {/* Group Header — collapsible */}
                            {!collapsed && (
                                <button
                                    onClick={() => toggleGroup(group.label)}
                                    className={cn(
                                        "w-full flex items-center gap-2 px-2.5 py-[6px] mt-2 rounded-md text-left transition-colors",
                                        hasActiveChild ? "text-slate-800" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                                    )}>
                                    <group.icon className="w-[15px] h-[15px] shrink-0 opacity-50" />
                                    <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider">{group.label}</span>
                                    {isGroupExpanded
                                        ? <ChevronDown className="w-3 h-3 opacity-40" />
                                        : <ChevronRight className="w-3 h-3 opacity-40" />
                                    }
                                </button>
                            )}

                            {/* Group Items */}
                            {(collapsed || isGroupExpanded) && (
                                <div className={cn(!collapsed && "ml-1 space-y-[1px]")}>
                                    {visibleItems.map((item) => {
                                        const hasSubItems = item.subItems && item.subItems.length > 0;
                                        const isExpanded = expandedItems.includes(item.url);

                                        return (
                                            <div key={item.url}>
                                                <NavLink to={item.url}
                                                    className={cn(
                                                        "group flex items-center gap-2.5 px-2.5 py-[6px] rounded-md transition-colors text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-50 relative",
                                                        collapsed ? "justify-center" : "justify-start"
                                                    )}
                                                    activeClassName="text-blue-700 bg-blue-50/80 font-medium before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-blue-600 before:rounded-r">
                                                    <item.icon className="w-[16px] h-[16px] shrink-0 opacity-50 group-hover:opacity-80" />
                                                    {!collapsed && (
                                                        <>
                                                            <span className="flex-1 text-left">{item.title}</span>
                                                            {hasSubItems && (
                                                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpandedItems(prev => prev.includes(item.url) ? prev.filter(u => u !== item.url) : [...prev, item.url]); }}
                                                                    className="p-0.5 hover:bg-slate-200/50 rounded transition-colors">
                                                                    <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform", isExpanded && "rotate-180")} />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </NavLink>
                                                {hasSubItems && isExpanded && !collapsed && (
                                                    <div className="ml-6 border-l border-slate-150 pl-2 space-y-[1px]">
                                                        {item.subItems?.map((sub) => (
                                                            <NavLink key={sub.url} to={sub.url}
                                                                className="group flex items-center gap-2 px-2.5 py-[5px] rounded-md transition-colors text-[12px] text-slate-500 hover:text-blue-700 hover:bg-blue-50/30"
                                                                activeClassName="text-blue-700 bg-blue-50/60 font-medium">
                                                                <sub.icon className="w-3.5 h-3.5 opacity-50 group-hover:opacity-80" />
                                                                <span>{sub.title}</span>
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

            {/* ── Bottom Utilities ────────────────────────────────────────── */}
            <div className="p-2 border-t border-slate-100 bg-slate-50/30 shrink-0">
                {isSuperAdmin && (
                    <NavLink to={isSuperAdminView ? "/ecommerce" : "/super-admin"}
                        className={cn(
                            "group flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-colors text-[13px] font-medium",
                            isSuperAdminView ? "text-slate-500 hover:text-slate-700 hover:bg-slate-100" : "text-blue-600 hover:bg-blue-50",
                            collapsed ? "justify-center" : "justify-start"
                        )}
                        activeClassName={isSuperAdminView ? "bg-slate-200/60" : "bg-blue-50"}>
                        {isSuperAdminView ? <LayoutDashboard className="w-4 h-4 shrink-0" /> : <ShieldCheck className="w-4 h-4 shrink-0" />}
                        {!collapsed && <span>{isSuperAdminView ? "Merchant Mode" : "Platform Admin"}</span>}
                    </NavLink>
                )}
            </div>
        </aside>
    );
}
