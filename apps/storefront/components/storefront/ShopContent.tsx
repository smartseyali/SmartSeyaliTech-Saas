"use client";

import { useState, useMemo } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product, Category } from "@/lib/mock-data";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

type Props = {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  initialSearch?: string;
};

export function ShopContent({ products, categories, initialCategory, initialSearch }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory ?? "all");
  const [selectedBadge, setSelectedBadge] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("featured");
  const [search, setSearch] = useState(initialSearch ?? "");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Derive max price from all products for the range slider
  const maxProductPrice = useMemo(() => Math.max(...products.map((p) => p.price), 1000), [products]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxProductPrice]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (selectedCategory !== "all") list = list.filter((p) => p.categorySlug === selectedCategory);
    if (selectedBadge !== "all") list = list.filter((p) => p.badge === selectedBadge);
    if (inStockOnly) list = list.filter((p) => p.inStock !== false);
    list = list.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q));
    }
    switch (sort) {
      case "price-asc": return list.sort((a, b) => a.price - b.price);
      case "price-desc": return list.sort((a, b) => b.price - a.price);
      case "rating": return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case "newest": return list.filter((p) => p.badge === "new").concat(list.filter((p) => p.badge !== "new"));
      default: return list;
    }
  }, [products, selectedCategory, selectedBadge, sort, search, inStockOnly, priceRange]);

  const priceFiltered = priceRange[0] > 0 || priceRange[1] < maxProductPrice;

  const activeFilters = [
    selectedCategory !== "all" && categories.find((c) => c.slug === selectedCategory)?.name,
    selectedBadge !== "all" && selectedBadge,
    inStockOnly && "In Stock",
    priceFiltered && `₹${priceRange[0]}–₹${priceRange[1]}`,
  ].filter(Boolean) as string[];

  function clearAll() {
    setSelectedCategory("all");
    setSelectedBadge("all");
    setSearch("");
    setInStockOnly(false);
    setPriceRange([0, maxProductPrice]);
  }

  return (
    <div className="container-tight py-10">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Shop All Products</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} products</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="search"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-3 pr-8 text-sm border border-border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 w-48"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-9 pl-3 pr-8 text-sm border border-border rounded-full bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-brand/30 cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden h-9 px-4 flex items-center gap-2 text-sm border border-border rounded-full bg-white hover:bg-brand-50 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>
        </div>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {activeFilters.map((f) => (
            <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand text-xs font-semibold">
              {f}
              <button
                type="button"
                onClick={() => {
                  if (categories.find((c) => c.name === f)) setSelectedCategory("all");
                  else if (f === "In Stock") setInStockOnly(false);
                  else if (f.startsWith("₹")) setPriceRange([0, maxProductPrice]);
                  else setSelectedBadge("all");
                }}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button type="button" onClick={clearAll} className="text-xs text-muted-foreground hover:text-brand transition-colors">
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className={cn(
          "shrink-0 w-56 space-y-6",
          "hidden lg:block",
          sidebarOpen && "!block fixed inset-y-0 left-0 z-50 bg-white p-6 shadow-2xl w-72 overflow-y-auto lg:static lg:shadow-none lg:p-0 lg:w-56"
        )}>
          {sidebarOpen && (
            <div className="flex items-center justify-between lg:hidden mb-4">
              <span className="font-semibold text-brand-900">Filters</span>
              <button type="button" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
            </div>
          )}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Category</h3>
            <ul className="space-y-1">
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={cn("w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors", selectedCategory === "all" ? "bg-brand text-white font-semibold" : "hover:bg-brand-50 text-foreground")}
                >
                  All Categories
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={cn("w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors", selectedCategory === cat.slug ? "bg-brand text-white font-semibold" : "hover:bg-brand-50 text-foreground")}
                  >
                    {cat.name}
                    <span className="ml-1 text-[10px] opacity-60">({cat.productCount})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Price Range</h3>
            <div className="px-1">
              <input
                type="range"
                min={0}
                max={maxProductPrice}
                step={50}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-brand"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>₹0</span>
                <span className="font-semibold text-brand">up to ₹{priceRange[1].toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Filter By</h3>
            <ul className="space-y-1">
              {[
                { value: "all", label: "All Products" },
                { value: "bestseller", label: "Best Sellers" },
                { value: "new", label: "New Arrivals" },
                { value: "sale", label: "On Sale" },
              ].map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => setSelectedBadge(opt.value)}
                    className={cn("w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors", selectedBadge === opt.value ? "bg-brand text-white font-semibold" : "hover:bg-brand-50 text-foreground")}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Availability</h3>
            <label className="flex items-center gap-2.5 px-3 py-1.5 cursor-pointer hover:bg-brand-50 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded accent-brand"
              />
              <span className="text-sm text-foreground">In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">No products found.</p>
              <Button variant="outline" onClick={clearAll}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  category={product.category}
                  image={product.image}
                  price={product.price}
                  compareAtPrice={product.compareAtPrice}
                  rating={product.rating}
                  ratingCount={product.ratingCount}
                  badge={product.badge}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
