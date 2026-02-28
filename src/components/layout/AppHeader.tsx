import { Bell, Search, User, LogOut, Settings as SettingsIcon } from "lucide-react";
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
        <header className="h-16 md:h-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full transition-all">
            <div className="h-full px-4 md:px-8 flex items-center justify-between gap-4 md:gap-8">

                {/* Search Bar */}
                <div className="flex-1 max-w-xl relative group hidden sm:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors" />
                    <Input
                        placeholder="Search dashboard..."
                        className="pl-12 bg-muted/50 border-transparent hover:border-border focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 h-10 rounded-full transition-all w-full text-sm"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50">
                        <span className="text-[10px] font-medium bg-background px-1.5 py-0.5 rounded border shadow-sm">⌘</span>
                        <span className="text-[10px] font-medium bg-background px-1.5 py-0.5 rounded border shadow-sm">K</span>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 md:gap-4 ml-auto">

                    {/* Theme Switcher */}
                    <ThemeToggle />

                    <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 relative">
                        <Bell className="w-5 h-5 text-muted-foreground" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-[#f97316] rounded-full border border-background" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="pl-2 pr-3 h-10 rounded-full border border-border hover:bg-muted flex items-center gap-3 transition-all">
                                <Avatar className="h-7 w-7">
                                    <AvatarImage src={`https://avatar.vercel.sh/${userEmail}.png`} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                        {userInitial}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-start justify-center hidden md:flex">
                                    <span className="font-semibold text-foreground text-xs leading-none mb-1">
                                        {userEmail.split('@')[0]}
                                    </span>
                                    <span className="font-medium text-[10px] text-muted-foreground leading-none">
                                        {userRole}
                                    </span>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-lg">
                            <DropdownMenuLabel className="px-2 py-2 text-xs font-semibold text-muted-foreground">My Account</DropdownMenuLabel>
                            <DropdownMenuItem className="rounded-md gap-2 cursor-pointer py-2">
                                <User className="w-4 h-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-md gap-2 cursor-pointer py-2">
                                <SettingsIcon className="w-4 h-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="rounded-md gap-2 cursor-pointer py-2 text-red-500 hover:text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
