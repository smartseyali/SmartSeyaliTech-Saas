"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingCart, Heart, User, Menu, X } from "lucide-react";
import { getTenant } from "@/lib/tenant";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop/" },
  { label: "About", href: "/about/" },
  { label: "FAQ", href: "/faq/" },
  { label: "Contact", href: "/contact/" },
];

const CART_KEY = "ss_cart";
const WISHLIST_KEY = "ss_wishlist";

function getCount(key: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return 0;
    if (key === CART_KEY) return arr.reduce((s: number, i: { qty?: number }) => s + (i.qty ?? 1), 0);
    return arr.length;
  } catch {
    return 0;
  }
}

export function StorefrontHeader() {
  const tenant = getTenant();
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishCount, setWishCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const refresh = useCallback(() => {
    setCartCount(getCount(CART_KEY));
    setWishCount(getCount(WISHLIST_KEY));
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("storage", refresh);
    // Custom event fired by ProductCard / ProductActions after cart mutation
    window.addEventListener("ss:cart-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("ss:cart-updated", refresh);
    };
  }, [refresh]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/shop/?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setQuery("");
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-border shadow-sm">
        {/* Top bar */}
        <div className="bg-brand text-white text-xs">
          <div className="container-tight flex justify-between items-center h-8">
            <span className="hidden sm:block">Free shipping on orders above ₹999</span>
            <div className="flex items-center gap-4">
              <a
                href={`tel:${tenant.contact.phone.replace(/\s/g, "")}`}
                className="hover:underline"
              >
                {tenant.contact.phone}
              </a>
              <span className="hidden sm:block opacity-50">·</span>
              <a
                href={`mailto:${tenant.contact.email}`}
                className="hidden sm:inline hover:underline"
              >
                {tenant.contact.email}
              </a>
            </div>
          </div>
        </div>

        {/* Main nav row */}
        <div className="container-tight flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-bold text-brand tracking-tight">
              {tenant.brandName}
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "px-4 py-2 text-sm font-medium transition-colors rounded",
                  isActive(link.href)
                    ? "text-brand font-semibold bg-brand-50"
                    : "text-foreground hover:text-brand hover:bg-brand-50",
                ].join(" ")}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen((v) => !v)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-brand-50 transition-colors text-foreground"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist/"
              aria-label={`Wishlist (${wishCount})`}
              className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-brand-50 transition-colors text-foreground"
            >
              <Heart className="w-4 h-4" />
              {wishCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {wishCount > 9 ? "9+" : wishCount}
                </span>
              )}
            </Link>

            {/* Account */}
            <Link
              href="/account/"
              aria-label="Account"
              className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full hover:bg-brand-50 transition-colors text-foreground"
            >
              <User className="w-4 h-4" />
            </Link>

            {/* Cart */}
            <Link
              href="/cart/"
              aria-label={`Cart (${cartCount} items)`}
              className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-brand-50 transition-colors text-foreground"
            >
              <ShoppingCart className="w-4 h-4" />
              <span
                className={[
                  "absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center leading-none transition-colors",
                  cartCount > 0 ? "bg-accent-500" : "bg-gray-300",
                ].join(" ")}
              >
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            </Link>

            {/* Hamburger */}
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-brand-50 transition-colors text-foreground"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Search bar (expands below nav row) */}
        {searchOpen && (
          <div className="border-t border-border bg-white px-4 py-3">
            <form onSubmit={handleSearch} className="container-tight flex gap-2">
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="flex-1 h-10 rounded-full border border-border px-4 text-sm outline-none focus:border-brand"
              />
              <button
                type="submit"
                className="h-10 px-5 rounded-full bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="h-10 px-4 rounded-full border border-border text-sm text-muted-foreground hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile slide-in menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 flex lg:hidden">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />
          {/* Drawer */}
          <nav className="relative ml-auto w-72 bg-white h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="text-lg font-bold text-brand">{tenant.brandName}</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 py-2 overflow-y-auto">
              {NAV.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    "flex items-center px-5 py-3 text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "text-brand bg-brand-50 font-semibold"
                      : "text-foreground hover:bg-gray-50 hover:text-brand",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border mt-2 pt-2">
                <Link
                  href="/account/"
                  className="flex items-center gap-2 px-5 py-3 text-sm text-foreground hover:bg-gray-50 hover:text-brand transition-colors"
                >
                  <User className="w-4 h-4" /> My Account
                </Link>
                <Link
                  href="/wishlist/"
                  className="flex items-center gap-2 px-5 py-3 text-sm text-foreground hover:bg-gray-50 hover:text-brand transition-colors"
                >
                  <Heart className="w-4 h-4" /> Wishlist
                  {wishCount > 0 && (
                    <span className="ml-auto text-xs font-bold bg-accent-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                      {wishCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
            <div className="p-4 border-t border-border text-xs text-muted-foreground">
              <p>{tenant.contact.phone}</p>
              <p>{tenant.contact.email}</p>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
