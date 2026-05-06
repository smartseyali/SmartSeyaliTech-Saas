import { useState } from "react";
import {
    Bell, User, LogOut, Settings as SettingsIcon, ChevronDown, Grid3X3, ExternalLink,
    Building2, Check, Menu, Plus, HelpCircle,
    ShoppingCart, Monitor, Target, TrendingUp, Package, ShoppingBag, Users,
    BarChart3, MessageCircle, Globe, Database, type LucideIcon,
} from "lucide-react";

const MODULE_ICONS: Record<string, LucideIcon> = {
    ecommerce: ShoppingCart,
    pos:       Monitor,
    crm:       Target,
    sales:     TrendingUp,
    inventory: Package,
    purchase:  ShoppingBag,
    hrms:      Users,
    finance:   BarChart3,
    whatsapp:  MessageCircle,
    website:   Globe,
    masters:   Database,
};
import { GlobalSearch } from "../GlobalSearch";
import { Breadcrumbs } from "./Breadcrumbs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useTenant } from "@/contexts/TenantContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PLATFORM_MODULES } from "@/config/modules";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import PLATFORM_CONFIG from "@/config/platform";

export function AppHeader({ onMobileMenuToggle }: { onMobileMenuToggle?: () => void }) {
    const { user, signOut } = useAuth();
    const { isAdmin, isSuperAdmin, hasModule } = usePermissions();
    const { activeCompany, companies, setCompany } = useTenant();
    const navigate = useNavigate();
    const location = useLocation();
    const [companySearch, setCompanySearch] = useState("");

    const isSuperAdminView = location.pathname.startsWith("/super-admin");
    const showCompanySwitcher = (isSuperAdmin || (isAdmin && companies.length > 1)) && !isSuperAdminView;

    const handleLogout = async () => {
        await signOut();
        navigate("/login");
    };

    const userEmail = user?.email || "user@example.com";
    const userInitial = userEmail.charAt(0).toUpperCase();
    const userName = userEmail.split("@")[0];
    const userRole = isSuperAdmin ? "Super Admin" : isAdmin ? "Admin" : "Member";

    return (
        <header className="h-12 border-b border-gray-200 bg-card sticky top-0 z-40 w-full dark:border-border">
            <div className="h-full px-3 flex items-center gap-2">
                {/* Mobile menu toggle */}
                {onMobileMenuToggle && (
                    <button
                        onClick={onMobileMenuToggle}
                        className="md:hidden p-1.5 -ml-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors dark:hover:bg-accent"
                    >
                        <Menu className="w-4 h-4" />
                    </button>
                )}

                {/* Breadcrumbs */}
                <Breadcrumbs className="hidden md:flex shrink-0" />

                {/* Spacer */}
                <div className="flex-1" />

                {/* Center — Awesome Bar */}
                <div className="hidden md:flex flex-1 max-w-[420px] justify-center">
                    <GlobalSearch />
                </div>

                {/* Right — Actions */}
                <div className="flex items-center gap-0.5 ml-auto">
                    {/* Company Switcher */}
                    {showCompanySwitcher && (
                        <Popover onOpenChange={(open) => { if (!open) setCompanySearch(""); }}>
                            <PopoverTrigger asChild>
                                <button
                                    className="flex items-center gap-1.5 h-8 px-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors max-w-[200px] dark:hover:bg-accent dark:hover:text-foreground"
                                    title="Switch Company"
                                >
                                    <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <span className="text-xs font-medium truncate hidden lg:block">
                                        {activeCompany?.name || "Select Company"}
                                    </span>
                                    <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent align="end" sideOffset={6} className="w-[280px] p-0 rounded-md shadow-md border-gray-200 dark:border-border">
                                <div className="px-2.5 pt-2.5 pb-1.5 border-b border-gray-100 dark:border-border">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Switch Company</p>
                                    {companies.length > 5 && (
                                        <input
                                            type="text"
                                            placeholder="Search…"
                                            value={companySearch}
                                            onChange={(e) => setCompanySearch(e.target.value)}
                                            className="w-full h-7 px-2 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-card dark:border-border"
                                        />
                                    )}
                                </div>
                                <div className="max-h-[280px] overflow-y-auto erp-scrollbar p-1">
                                    {companies
                                        .filter((c) => !companySearch || c.name.toLowerCase().includes(companySearch.toLowerCase()))
                                        .map((company) => {
                                            const isActive = activeCompany?.id === company.id;
                                            return (
                                                <button
                                                    key={company.id}
                                                    onClick={() => setCompany(company.id)}
                                                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${
                                                        isActive
                                                            ? "bg-primary-50 text-primary-700 dark:bg-accent dark:text-accent-foreground"
                                                            : "text-gray-700 hover:bg-gray-100 dark:text-foreground dark:hover:bg-accent"
                                                    }`}
                                                >
                                                    <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-semibold shrink-0 ${
                                                        isActive ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-600 dark:bg-accent/60 dark:text-foreground"
                                                    }`}>
                                                        {company.name[0]}
                                                    </div>
                                                    <span className="text-xs font-medium truncate flex-1">{company.name}</span>
                                                    {isActive && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    {companies.filter((c) => !companySearch || c.name.toLowerCase().includes(companySearch.toLowerCase())).length === 0 && (
                                        <p className="text-xs text-gray-400 text-center py-4">No companies found</p>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}

                    {/* Quick Create (+) */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="w-8 h-8 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors dark:hover:bg-accent dark:hover:text-foreground"
                                title="Create new"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Create New</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigate("/apps/sales/invoices/new")}>
                                <span>Sales Invoice</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate("/apps/sales/orders/new")}>
                                <span>Sales Order</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate("/apps/masters/items/new")}>
                                <span>Item</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate("/apps/crm/contacts/new")}>
                                <span>Contact</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* App Launcher */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                className="w-8 h-8 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors dark:hover:bg-accent dark:hover:text-foreground"
                                title="Switch app"
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent align="end" sideOffset={6} className="w-[320px] p-2 rounded-md shadow-md border-gray-200 dark:border-border">
                            <div className="flex items-center justify-between mb-2 px-1">
                                <p className="text-xs font-semibold text-gray-500 dark:text-foreground">{PLATFORM_CONFIG.name}</p>
                                <div className="flex items-center gap-2.5">
                                    <Link to="/apps" className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-foreground">All Apps</Link>
                                    <Link to="/marketplace" className="text-xs font-medium text-primary hover:text-primary-700 flex items-center gap-0.5">
                                        Marketplace <ExternalLink className="w-2.5 h-2.5" />
                                    </Link>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                                {PLATFORM_MODULES
                                    .filter((m) => m.status === "live" || m.status === "beta")
                                    .sort((a, b) => {
                                        const aOk = isSuperAdmin || a.isCore || hasModule(a.name) || hasModule(a.id);
                                        const bOk = isSuperAdmin || b.isCore || hasModule(b.name) || hasModule(b.id);
                                        if (aOk && !bOk) return -1;
                                        if (!aOk && bOk) return 1;
                                        return 0;
                                    })
                                    .map((mod) => {
                                        const ok = isSuperAdmin || mod.isCore || hasModule(mod.name) || hasModule(mod.id);
                                        return (
                                            <Link
                                                key={mod.id}
                                                to={ok ? mod.dashboardRoute : "#"}
                                                onClick={(e) => !ok && e.preventDefault()}
                                                className={`flex flex-col items-center gap-1 p-2 rounded-md transition-colors ${
                                                    ok ? "hover:bg-gray-50 dark:hover:bg-accent" : "opacity-40 cursor-not-allowed"
                                                }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-sm ${mod.colorFrom} ${mod.colorTo}`}>
                                                    {(() => { const Icon = MODULE_ICONS[mod.id]; return Icon ? <Icon className="w-5 h-5 text-white" strokeWidth={1.75} /> : <span className="text-base">{mod.icon}</span>; })()}
                                                </div>
                                                <span className={`text-[10px] font-medium text-center leading-tight ${ok ? "text-gray-600 dark:text-foreground" : "text-gray-400"}`}>
                                                    {mod.name}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                <Link to="/marketplace" className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-gray-50 transition-colors dark:hover:bg-accent">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-accent/40 shadow-sm">
                                        <Grid3X3 className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-400">Marketplace</span>
                                </Link>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Help */}
                    <button
                        className="hidden md:inline-flex w-8 h-8 rounded-md items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors dark:hover:bg-accent dark:hover:text-foreground"
                        title="Help"
                    >
                        <HelpCircle className="w-4 h-4" />
                    </button>

                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Notifications */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                className="w-8 h-8 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors relative dark:hover:bg-accent dark:hover:text-foreground"
                                title="Notifications"
                            >
                                <Bell className="w-4 h-4" />
                                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent align="end" sideOffset={6} className="w-[320px] p-0 rounded-md shadow-md border-gray-200 dark:border-border">
                            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-border">
                                <p className="text-sm font-semibold text-gray-800 dark:text-foreground">Notifications</p>
                                <button className="text-xs text-primary hover:text-primary-700">Mark all read</button>
                            </div>
                            <div className="max-h-[320px] overflow-y-auto erp-scrollbar p-2 text-center">
                                <p className="text-xs text-gray-400 py-8">No new notifications</p>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <div className="w-px h-5 bg-gray-200 mx-0.5 dark:bg-border" />

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-1.5 pl-1 pr-2 h-8 rounded-md hover:bg-gray-100 transition-colors dark:hover:bg-accent">
                                <Avatar className="h-6 w-6 rounded-full">
                                    <AvatarImage src="" className="rounded-full hidden" />
                                    <AvatarFallback className="bg-primary text-white text-[10px] font-semibold rounded-full">
                                        {userInitial}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden md:flex flex-col items-start leading-none">
                                    <span className="text-xs font-medium text-gray-800 dark:text-foreground">
                                        {userName}
                                    </span>
                                </div>
                                <ChevronDown className="w-3 h-3 text-gray-400 hidden md:block" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <p className="text-sm font-medium text-gray-800 dark:text-foreground">{userName}</p>
                                <p className="text-xs text-gray-500 font-normal normal-case tracking-normal">{userEmail}</p>
                                <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded normal-case tracking-normal">
                                    {userRole}
                                </span>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate("/profile")}>
                                <User className="w-3.5 h-3.5" />
                                My Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate("/apps/ecommerce/settings")}>
                                <SettingsIcon className="w-3.5 h-3.5" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-destructive focus:text-destructive focus:bg-destructive-50"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
