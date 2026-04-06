import { useState } from "react";
import { Bell, Search, User, LogOut, Settings as SettingsIcon, ChevronDown, Grid3X3, ExternalLink, Building2, Check } from "lucide-react";
import { GlobalSearch } from "../GlobalSearch";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useTenant } from "@/contexts/TenantContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PLATFORM_MODULES } from "@/config/modules";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import PLATFORM_CONFIG from "@/config/platform";

export function AppHeader() {
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
        <header className="h-12 border-b border-slate-200/80 bg-white sticky top-0 z-40 w-full">
            <div className="h-full px-4 flex items-center justify-between gap-3">

                {/* Left — Search */}
                <div className="flex-1 max-w-md">
                    <GlobalSearch />
                </div>

                {/* Right — Actions */}
                <div className="flex items-center gap-1">

                    {/* Company Switcher */}
                    {showCompanySwitcher && (
                        <Popover onOpenChange={(open) => { if (!open) setCompanySearch(""); }}>
                            <PopoverTrigger asChild>
                                <button
                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 max-w-[200px]"
                                    title="Switch Company"
                                >
                                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="text-[12px] font-medium truncate">
                                        {activeCompany?.name || "Select Company"}
                                    </span>
                                    <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent align="end" sideOffset={8} className="w-[280px] p-0 rounded-xl shadow-lg border border-slate-200">
                                <div className="px-3 pt-3 pb-2">
                                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Switch Company</p>
                                    {companies.length > 5 && (
                                        <input
                                            type="text"
                                            placeholder="Search companies..."
                                            value={companySearch}
                                            onChange={(e) => setCompanySearch(e.target.value)}
                                            className="w-full h-8 px-2.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 mb-2"
                                        />
                                    )}
                                </div>
                                <div className="max-h-[280px] overflow-y-auto px-1.5 pb-1.5">
                                    {companies
                                        .filter(c => !companySearch || c.name.toLowerCase().includes(companySearch.toLowerCase()))
                                        .map((company) => {
                                            const isActive = activeCompany?.id === company.id;
                                            return (
                                                <button
                                                    key={company.id}
                                                    onClick={() => {
                                                        setCompany(company.id);
                                                    }}
                                                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                                                        isActive
                                                            ? "bg-blue-50 text-blue-700"
                                                            : "text-slate-700 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold shrink-0 ${
                                                        isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                                                    }`}>
                                                        {company.name[0]}
                                                    </div>
                                                    <span className="text-[13px] font-medium truncate flex-1">{company.name}</span>
                                                    {isActive && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    {companies.filter(c => !companySearch || c.name.toLowerCase().includes(companySearch.toLowerCase())).length === 0 && (
                                        <p className="text-xs text-slate-400 text-center py-4">No companies found</p>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}

                    {/* App Launcher */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                title="Switch Module"
                            >
                                <Grid3X3 className="w-[18px] h-[18px]" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent align="end" sideOffset={8} className="w-[320px] p-3 rounded-xl shadow-lg border border-slate-200">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <p className="text-xs font-semibold text-slate-500">{PLATFORM_CONFIG.name}</p>
                                <div className="flex items-center gap-3">
                                    <Link
                                        to="/apps"
                                        className="text-xs font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1"
                                    >
                                        All Apps
                                    </Link>
                                    <Link
                                        to="/marketplace"
                                        className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    >
                                        Marketplace <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                                {PLATFORM_MODULES
                                    .filter(m => m.status === "live" || m.status === "beta")
                                    .sort((a, b) => {
                                        const aOk = isSuperAdmin || a.isCore || hasModule(a.name) || hasModule(a.id);
                                        const bOk = isSuperAdmin || b.isCore || hasModule(b.name) || hasModule(b.id);
                                        if (aOk && !bOk) return -1;
                                        if (!aOk && bOk) return 1;
                                        return 0;
                                    })
                                    .map(mod => {
                                        const ok = isSuperAdmin || mod.isCore || hasModule(mod.name) || hasModule(mod.id);
                                        return (
                                            <Link
                                                key={mod.id}
                                                to={ok ? mod.dashboardRoute : "#"}
                                                onClick={(e) => !ok && e.preventDefault()}
                                                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors group ${
                                                    ok ? "hover:bg-slate-50" : "opacity-35 cursor-not-allowed"
                                                }`}
                                            >
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg bg-gradient-to-br ${mod.colorFrom} ${mod.colorTo} shadow-sm ${ok ? "group-hover:scale-105 transition-transform" : ""}`}>
                                                    {mod.icon}
                                                </div>
                                                <span className={`text-[11px] font-medium text-center leading-tight ${ok ? "text-slate-600" : "text-slate-400"}`}>
                                                    {mod.name}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                <Link to="/marketplace" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-50 transition-colors group">
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-100 group-hover:bg-slate-200 transition-colors">
                                        <Grid3X3 className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <span className="text-[11px] font-medium text-slate-400">Marketplace</span>
                                </Link>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Notifications */}
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors relative">
                        <Bell className="w-[18px] h-[18px]" />
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                    </button>

                    {/* Divider */}
                    <div className="w-px h-6 bg-slate-200 mx-1" />

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors">
                                <Avatar className="h-7 w-7 rounded-full">
                                    <AvatarImage src="" className="rounded-full hidden" />
                                    <AvatarFallback className="bg-blue-600 text-white text-[11px] font-semibold rounded-full">
                                        {userInitial}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden md:flex flex-col items-start">
                                    <span className="text-[13px] font-medium text-slate-800 leading-tight">
                                        {userName}
                                    </span>
                                    <span className="text-[11px] text-slate-400 leading-tight">
                                        {userRole}
                                    </span>
                                </div>
                                <ChevronDown className="w-3 h-3 text-slate-400 hidden md:block" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-lg p-1.5 shadow-lg border-slate-200">
                            <DropdownMenuLabel className="px-2 py-1.5">
                                <p className="text-sm font-medium text-slate-800">{userName}</p>
                                <p className="text-xs text-slate-400">{userEmail}</p>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem className="rounded-md gap-2.5 cursor-pointer py-2 text-[13px] text-slate-600 focus:bg-slate-50 focus:text-slate-900">
                                <User className="w-4 h-4 opacity-60" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-md gap-2.5 cursor-pointer py-2 text-[13px] text-slate-600 focus:bg-slate-50 focus:text-slate-900">
                                <SettingsIcon className="w-4 h-4 opacity-60" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="rounded-md gap-2.5 cursor-pointer py-2 text-[13px] text-red-500 focus:bg-red-50 focus:text-red-600"
                            >
                                <LogOut className="w-4 h-4 opacity-60" />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
