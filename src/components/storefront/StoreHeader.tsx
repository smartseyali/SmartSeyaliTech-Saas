import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, User, Search, Menu, X, ChevronDown, Package, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useTenant } from "@/contexts/TenantContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { AnimatePresence, motion } from "framer-motion";

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
        { label: "Categories", path: "/shop" },
        { label: "About", path: "/about" },
        { label: "Contact", path: "/contact" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full bg-[#f8fafc] border-b border-border shadow-[0_4px_20px_-10px_rgba(20,83,45,0.1)] transition-all">
            {/* Top Green Strip */}
            <div className="bg-[#14532d]">
                <div className="max-w-screen-xl mx-auto px-4 py-1.5 md:py-2 text-center">
                    <p className="text-white/90 text-[10px] md:text-xs font-semibold tracking-wider uppercase">
                        🚚 Free Delivery on orders above ₹999 &nbsp;|&nbsp; 🇳🇳 Made in India &nbsp;|&nbsp; 📞 24/7 Customer Support
                    </p>
                </div>
            </div>

            {/* Main Navigation Bar */}
            <div className="max-w-screen-xl mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between h-16 md:h-20 gap-4">

                    {/* Left: Mobile Menu + Logo */}
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-[#14532d] p-1">
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <Link to={storeLink("/")} className="flex items-center gap-2">
                            {settings?.logo_url ? (
                                <img src={settings.logo_url} alt={settings.store_name} className="h-8 md:h-10 w-auto object-contain" />
                            ) : (
                                <span className="text-[#14532d] font-black text-xl md:text-2xl tracking-tighter">
                                    {settings?.store_name || "OrganicStore"}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Center: Desktop Links */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map(link => (
                            <Link
                                key={link.label}
                                to={storeLink(link.path)}
                                className="text-sm font-semibold text-[#14532d] hover:text-[#f97316] transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right: Search, Account, Cart */}
                    <div className="flex items-center gap-2 md:gap-5">

                        {/* Search Bar - Hidden on small mobile, expands on md */}
                        <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-white border border-[#14532d]/20 rounded-full overflow-hidden h-10 w-64 focus-within:ring-2 focus-within:ring-[#f97316]/50 transition-all shadow-inner">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Kya dhundh rahe ho?"
                                className="flex-grow px-4 text-sm outline-none bg-transparent text-[#14532d] placeholder:text-[#14532d]/40"
                            />
                            <button type="submit" className="px-3 text-[#14532d] hover:text-[#f97316] transition-colors">
                                <Search className="w-4 h-4" />
                            </button>
                        </form>

                        {/* Mobile Search Icon */}
                        <button className="lg:hidden p-2 text-[#14532d] hover:text-[#f97316] transition-colors" onClick={() => navigate(storeLink('/shop'))}>
                            <Search className="w-5 h-5" />
                        </button>

                        {/* Account */}
                        <div className="relative" ref={accountRef}>
                            <button
                                onClick={() => user ? setAccountOpen(!accountOpen) : navigate("/login")}
                                className="p-2 text-[#14532d] hover:text-[#f97316] transition-colors flex items-center gap-1 focus:outline-none"
                            >
                                <User className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                            <AnimatePresence>
                                {accountOpen && user && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-border z-50 overflow-hidden"
                                    >
                                        <div className="px-4 py-4 bg-[#f8fafc] border-b border-border">
                                            <p className="text-xs text-[#14532d]/60 font-medium">Signed in as</p>
                                            <p className="font-bold text-[#14532d] text-sm truncate">{user.email}</p>
                                        </div>
                                        <div className="py-2">
                                            <Link to={storeLink("/orders")} onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#14532d] hover:bg-[#f8fafc] hover:text-[#f97316] transition-colors">
                                                <Package className="w-4 h-4" /> My Orders
                                            </Link>
                                            <button onClick={() => { setAccountOpen(false); signOut(); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                                                <LogOut className="w-4 h-4" /> Sign Out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Cart */}
                        <Link to={storeLink("/cart")} className="p-2 text-[#14532d] hover:text-[#f97316] transition-colors relative flex items-center">
                            <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                            {itemCount > 0 && (
                                <span className="absolute 0 top-0 right-0 bg-[#f97316] text-white text-[10px] font-bold w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm transform translate-x-1/4 -translate-y-1/4">
                                    {itemCount > 9 ? "9+" : itemCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Nav Dropsown */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden border-t border-[#14532d]/10 bg-white"
                    >
                        <div className="px-4 py-2 space-y-1">
                            {navLinks.map(link => (
                                <Link
                                    key={link.label}
                                    to={storeLink(link.path)}
                                    className="block px-4 py-3 text-sm font-semibold text-[#14532d] hover:bg-[#14532d]/5 hover:text-[#f97316] rounded-lg transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {!user && <Link to="/login" className="block px-4 py-3 text-sm font-semibold text-[#f97316] border-t border-[#14532d]/10 mt-2">Login / Register</Link>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
