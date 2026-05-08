"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRODUCTS_MENU = [
  {
    label: "Commerce & POS",
    desc: "Store, orders, inventory",
    icon: ShoppingCart,
    href: "/products?category=commerce",
  },
  {
    label: "Finance",
    desc: "Invoicing, accounting, GST",
    icon: DollarSign,
    href: "/products?category=finance",
  },
  {
    label: "HRMS",
    desc: "Payroll, attendance, HR",
    icon: Users,
    href: "/products?category=people",
  },
  {
    label: "CRM",
    desc: "Leads, pipeline, contacts",
    icon: UserCheck,
    href: "/products?category=customer",
  },
  {
    label: "Operations",
    desc: "Procurement, supply chain",
    icon: Settings,
    href: "/products?category=operations",
  },
  {
    label: "Analytics",
    desc: "Reports & dashboards",
    icon: BarChart3,
    href: "/products?category=analytics",
  },
];

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Pricing", href: "/pricing" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setProductsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        productsRef.current &&
        !productsRef.current.contains(e.target as Node)
      ) {
        setProductsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white border-b border-gray-200 shadow-sm"
          : "bg-white/95 backdrop-blur-md border-b border-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0"
            aria-label="SmartSeyali home"
          >
            <Image
              src="/logo.png"
              alt="SmartSeyali"
              width={300}
              height={90}
              priority
              style={{ height: "45px", width: "auto" }}
              className="object-contain"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded transition-colors",
                  pathname === link.href
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                )}
              >
                {link.name}
              </Link>
            ))}

            <div ref={productsRef} className="relative">
              <button
                type="button"
                onClick={() => setProductsOpen((v) => !v)}
                aria-expanded={productsOpen}
                aria-haspopup="true"
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded transition-colors",
                  productsOpen || pathname.startsWith("/products")
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                )}
              >
                Products
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200",
                    productsOpen && "rotate-180",
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
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[520px] bg-white border border-gray-200 rounded-xl shadow-xl p-4"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-2 mb-3">
                      All Modules
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {PRODUCTS_MENU.map(
                        ({ label, desc, icon: Icon, href }) => (
                          <Link
                            key={label}
                            href={href}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                          >
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                              <Icon className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                {label}
                              </p>
                              <p className="text-xs text-gray-400">{desc}</p>
                            </div>
                          </Link>
                        ),
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 px-2">
                      <Link
                        href="/products"
                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        View all products <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded hover:bg-gray-50"
            >
              Sign In
            </Link>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-0 shadow-sm transition-colors">
              <Link href="/contact">
                Request Demo <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
          >
            {isOpen ? (
              <X className="h-5 w-5 text-gray-700" />
            ) : (
              <Menu className="h-5 w-5 text-gray-700" />
            )}
          </button>
        </div>
      </div>

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
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "block px-4 py-2.5 rounded text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:bg-gray-50",
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/products"
                className="block px-4 py-2.5 rounded text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Products
              </Link>
              <div className="pt-4 space-y-2 border-t border-gray-100 mt-3">
                <Button asChild variant="outline" className="w-full h-10">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="w-full h-10 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-0 transition-colors">
                  <Link href="/contact">
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
}
