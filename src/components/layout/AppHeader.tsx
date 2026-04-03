import { Bell, Search, User, LogOut, Settings as SettingsIcon, ChevronDown, Grid3X3, ExternalLink } from "lucide-react";
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
import { useNavigate, Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PLATFORM_MODULES } from "@/config/modules";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import PLATFORM_CONFIG from "@/config/platform";

export function AppHeader() {
    const { user, signOut } = useAuth();
    const { isAdmin, isSuperAdmin, hasModule } = usePermissions();
    const navigate = useNavigate();

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
                                <Link
                                    to="/apps"
                                    className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                    All Apps <ExternalLink className="w-3 h-3" />
                                </Link>
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
                                <Link to="/apps" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-50 transition-colors group">
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-100 group-hover:bg-slate-200 transition-colors">
                                        <Grid3X3 className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <span className="text-[11px] font-medium text-slate-400">Browse</span>
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
                                    <AvatarImage src={`https://avatar.vercel.sh/${userEmail}.png`} className="rounded-full" />
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
