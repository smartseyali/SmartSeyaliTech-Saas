import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, User, Search, Menu, X, ChevronDown, Package, LogOut, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useTenant } from "@/contexts/TenantContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function StoreHeader() {
    const { user, signOut } = useAuth();
    const { itemCount } = useCart();
    const { activeCompany } = useTenant();
    const { settings } = useStoreSettings();
    const navigate = useNavigate();
    const location = useLocation();

    const [searchQuery, setSearchQuery] = useState("");
    const [accountOpen, setAccountOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const accountRef = useRef<HTMLDivElement>(null);

    const storeLink = (path: string) => {
        const slug = activeCompany?.subdomain || "";
        return `/${slug}${path === "/" ? "" : path}`;
    };

    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) navigate(storeLink(`/shop?search=${encodeURIComponent(searchQuery)}`));
    };

    const navLinks = [
        { label: "Home", path: "/" },
        { label: "Shop", path: "/shop" },
        { label: "About", path: "/about" },
        { label: "Contact", path: "/contact" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 shadow-[0_4px_30px_-15px_rgba(37,99,235,0.1)] transition-all">
            {/* Top Strip */}
            <div className="bg-slate-900 overflow-hidden">
                <div className="max-w-screen-xl mx-auto px-4 py-2 text-center">
                    <p className="text-white/80 text-xs md:text-[13px] font-bold tracking-widest uppercase  flex items-center justify-center gap-6">
                        <span className="flex items-center gap-2"><Activity className="w-3 h-3 text-blue-500" /> GLOBAL_STANDARDS</span>
                        <span className="hidden md:inline text-white/20">|</span>
                        <span className="hidden md:inline">ENTERPRISE_SOLUTIONS</span>
                        <span className="hidden md:inline text-white/20">|</span>
                        <span className="hidden md:inline">PREMIUM_PRODUCTIVITY</span>
                    </p>
                </div>
            </div>

            {/* Main Navigation Bar */}
            <div className="max-w-screen-xl mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between h-20 md:h-24 gap-4">

                    {/* Left: Mobile Menu + Logo */}
                    <div className="flex items-center gap-4">
                        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-slate-900 p-1">
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <Link to={storeLink("/")} className="flex items-center gap-2">
                            {settings?.logo_url ? (
                                <img src={settings.logo_url} alt={settings.store_name} className="h-10 md:h-12 w-auto object-contain" />
                            ) : (
                                <span className="text-slate-900 font-bold text-2xl md:text-3xl tracking-tighter uppercase  leading-none">
                                    {settings?.store_name || "SmartStore"}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Center: Desktop Links */}
                    <nav className="hidden md:flex items-center gap-10">
                        {navLinks.map(link => (
                            <Link
                                key={link.label}
                                to={storeLink(link.path)}
                                className={cn(
                                    "text-[13px] font-bold uppercase tracking-widest transition-all  hover:text-blue-600",
                                    location.pathname === storeLink(link.path) || (link.path === "/" && location.pathname === storeLink("/"))
                                        ? "text-blue-600"
                                        : "text-slate-500"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right: Search, Account, Cart */}
                    <div className="flex items-center gap-3 md:gap-6">

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden h-12 w-72 focus-within:ring-4 focus-within:ring-blue-600/10 focus-within:border-blue-600/20 transition-all shadow-inner px-2">
                            <Search className="w-4 h-4 text-slate-300 ml-4 shrink-0" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search products..."
                                className="flex-grow px-4 text-xs font-bold uppercase tracking-widest outline-none bg-transparent text-slate-900 placeholder:text-slate-200"
                            />
                        </form>

                        {/* Mobile Search Icon */}
                        <button className="lg:hidden p-2 text-slate-900 hover:text-blue-600 transition-colors" onClick={() => navigate(storeLink('/shop'))}>
                            <Search className="w-5 h-5" />
                        </button>

                        {/* Account */}
                        <div className="relative" ref={accountRef}>
                            <button
                                onClick={() => user ? setAccountOpen(!accountOpen) : navigate("/login")}
                                className="p-3 bg-slate-50 rounded-2xl text-slate-900 hover:text-blue-600 transition-all flex items-center gap-1 border border-slate-100 shadow-sm"
                            >
                                <User className="w-5 h-5" />
                            </button>
                            <AnimatePresence>
                                {accountOpen && user && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-4 w-72 bg-white rounded-[2rem] shadow-2xl border border-slate-50 z-50 overflow-hidden"
                                    >
                                        <div className="px-8 py-6 bg-slate-50 border-b border-slate-100">
                                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 ">User Identity</p>
                                            <p className="font-bold text-slate-900 text-sm truncate mt-1  uppercase">{user.email}</p>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            <Link to={storeLink("/orders")} onClick={() => setAccountOpen(false)} className="flex items-center gap-4 px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-[1.25rem] transition-all ">
                                                <Package className="w-4 h-4" /> Order History
                                            </Link>
                                            <button onClick={() => { setAccountOpen(false); signOut(); }} className="w-full flex items-center gap-4 px-6 py-4 text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 rounded-[1.25rem] transition-all  border-none text-left">
                                                <LogOut className="w-4 h-4" /> Logout
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Cart */}
                        <Link to={storeLink("/cart")} className="p-3 bg-slate-900 text-white hover:bg-blue-600 rounded-2xl transition-all relative flex items-center shadow-xl shadow-slate-900/10">
                            <ShoppingCart className="w-5 h-5" />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[13px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-lg">
                                    {itemCount > 9 ? "9+" : itemCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Nav Dropdown */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden border-t border-slate-50 bg-white"
                    >
                        <div className="px-6 py-4 space-y-2">
                            {navLinks.map(link => (
                                <Link
                                    key={link.label}
                                    to={storeLink(link.path)}
                                    className="block px-6 py-4 text-[13px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-2xl transition-all "
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {!user && <Link to="/login" className="block px-6 py-4 text-[13px] font-bold uppercase tracking-widest text-blue-600 border-t border-slate-50 mt-4 ">Login Access</Link>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
