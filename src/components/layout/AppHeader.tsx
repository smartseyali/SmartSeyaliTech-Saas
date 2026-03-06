import { Bell, Search, User, LogOut, Settings as SettingsIcon, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AppHeader() {
    const { user, signOut } = useAuth();
    const { isAdmin, isSuperAdmin } = usePermissions();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate("/login");
    };

    const userEmail = user?.email || "user@example.com";
    const userInitial = userEmail.charAt(0).toUpperCase();
    const userRole = isSuperAdmin ? "Super Admin" : isAdmin ? "Admin" : "Member";

    return (
        <header className="h-16 border-b bg-white sticky top-0 z-40 w-full transition-all">
            <div className="h-full px-6 flex items-center justify-between gap-8">

                {/* Search Bar */}
                <div className="flex-1 max-w-md relative group hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search..."
                        className="pl-10 bg-slate-100 border-transparent hover:bg-slate-200 focus:bg-white focus:border-blue-500/30 h-9 rounded-md transition-all w-full text-sm"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-30 select-none">
                        <span className="text-[10px] font-bold border border-slate-400 px-1 rounded">/</span>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <ThemeToggle />

                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 relative text-slate-500 hover:bg-slate-100">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </Button>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 px-2 rounded-lg hover:bg-slate-100 flex items-center gap-3 transition-all">
                                <Avatar className="h-7 w-7 rounded-lg">
                                    <AvatarImage src={`https://avatar.vercel.sh/${userEmail}.png`} className="rounded-lg" />
                                    <AvatarFallback className="bg-blue-600 text-white font-bold text-xs rounded-lg">
                                        {userInitial}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-start justify-center hidden md:flex text-left">
                                    <span className="font-bold text-slate-900 text-sm leading-none mb-1">
                                        {userEmail.split('@')[0]}
                                    </span>
                                    <span className="font-medium text-[10px] text-slate-400 leading-none">
                                        {userRole}
                                    </span>
                                </div>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-2xl border-slate-200">
                            <DropdownMenuLabel className="px-2 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">Account</DropdownMenuLabel>
                            <DropdownMenuItem className="rounded-lg gap-3 cursor-pointer py-2.5 text-slate-600 focus:bg-slate-50 focus:text-blue-600">
                                <User className="w-4 h-4" />
                                <span className="font-medium">Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg gap-3 cursor-pointer py-2.5 text-slate-600 focus:bg-slate-50 focus:text-blue-600">
                                <SettingsIcon className="w-4 h-4" />
                                <span className="font-medium">Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1 border-slate-100" />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="rounded-lg gap-3 cursor-pointer py-2.5 text-red-500 focus:bg-red-50 focus:text-red-600"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="font-medium">Sign Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
