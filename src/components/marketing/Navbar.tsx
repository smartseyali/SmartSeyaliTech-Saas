
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  ShoppingCart,
  DollarSign,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

const PRODUCTS_MENU = [
  { label: "Commerce & POS", desc: "Store, orders, inventory", icon: ShoppingCart, href: "/products?category=commerce" },
  { label: "Finance", desc: "Invoicing, accounting, GST", icon: DollarSign, href: "/products?category=finance" },
  { label: "HRMS", desc: "Payroll, attendance, HR", icon: Users, href: "/products?category=people" },
  { label: "CRM", desc: "Leads, pipeline, contacts", icon: UserCheck, href: "/products?category=customer" },
  { label: "Operations", desc: "Procurement, supply chain", icon: Settings, href: "/products?category=operations" },
  { label: "Analytics", desc: "Reports & dashboards", icon: BarChart3, href: "/products?category=analytics" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setProductsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (productsRef.current && !productsRef.current.contains(e.target as Node)) {
        setProductsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white border-b border-gray-200 shadow-sm"
          : "bg-white/95 backdrop-blur-md border-b border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <img
              src="/logo.png"
              alt="SmartSeyali Tech"
              className="h-32 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded transition-colors",
                    isActive
                      ? "text-[#2563EB] bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Products dropdown */}
            <div ref={productsRef} className="relative">
              <button
                onClick={() => setProductsOpen((v) => !v)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded transition-colors",
                  productsOpen || location.pathname.startsWith("/products")
                    ? "text-[#2563EB] bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                Products
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200",
                    productsOpen && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence>
                {productsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[520px] bg-white border border-gray-200 rounded-xl shadow-xl shadow-gray-900/10 p-4"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-2 mb-3">
                      All Modules
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {PRODUCTS_MENU.map(({ label, desc, icon: Icon, href }) => (
                        <Link
                          key={label}
                          to={href}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-[#2563EB] transition-colors">
                            <Icon className="w-4 h-4 text-[#2563EB] group-hover:text-white transition-colors" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 group-hover:text-[#2563EB] transition-colors">
                              {label}
                            </p>
                            <p className="text-xs text-gray-400">{desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 px-2">
                      <Link
                        to="/products"
                        className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-blue-700 transition-colors"
                      >
                        View all products <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded hover:bg-gray-50"
            >
              Sign In
            </Link>
            <Button
              asChild
              className="bg-[#2563EB] hover:bg-blue-700 h-9 px-5 rounded font-semibold text-sm shadow-sm text-white"
            >
              <Link to="/contact">
                Request Demo <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-5 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "block px-4 py-2.5 rounded text-sm font-medium transition-colors",
                    location.pathname === link.href
                      ? "text-[#2563EB] bg-blue-50"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/products"
                className="block px-4 py-2.5 rounded text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Products
              </Link>
              <div className="pt-4 space-y-2 border-t border-gray-100 mt-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-10 rounded border-gray-200 text-gray-700 font-semibold text-sm"
                >
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="w-full h-10 rounded bg-[#2563EB] hover:bg-blue-700 font-semibold text-sm text-white"
                >
                  <Link to="/contact">
                    Request Demo <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
