"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useLiveData } from "@/contexts/LiveDataContext";
import { formatINR, cn } from "@/lib/utils";

const CART_KEY = "ss_cart";
const WISHLIST_KEY = "ss_wishlist";

export type ProductCardProps = {
  id: string;
  slug: string;
  name: string;
  category?: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  rating?: number;
  ratingCount?: number;
  badge?: "new" | "bestseller" | "sale" | "out-of-stock";
  weight?: string;
};

const BADGE_STYLES: Record<string, string> = {
  new: "bg-brand text-white",
  bestseller: "bg-accent-500 text-white",
  sale: "bg-red-500 text-white",
  "out-of-stock": "bg-gray-400 text-white",
};

const BADGE_LABEL: Record<string, string> = {
  new: "New",
  bestseller: "Best",
  sale: "Sale",
  "out-of-stock": "Sold out",
};

export function ProductCard(props: ProductCardProps) {
  const { id, slug, name, category, image, price, compareAtPrice, rating, ratingCount, badge, weight } = props;

  // Live price from Supabase overwrites the static build-time price after hydration
  const live = useLiveData().get(slug);
  const displayPrice = live?.price ?? price;
  const displayCompareAt = live?.compare_at_price ?? compareAtPrice;
  const inStock = live?.in_stock ?? badge !== "out-of-stock";
  const stockQty = live?.stock_qty ?? null;
  const lowStock = inStock && stockQty !== null && stockQty > 0 && stockQty <= 5;

  const discount =
    displayCompareAt && displayCompareAt > displayPrice
      ? Math.round(((displayCompareAt - displayPrice) / displayCompareAt) * 100)
      : null;

  const [wishlisted, setWishlisted] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return (JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]") as string[]).includes(id);
    } catch { return false; }
  });

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    try {
      const cart = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
      const existing = cart.find((i: { id: string }) => i.id === id);
      if (existing) { existing.quantity += 1; }
      else { cart.push({ id, slug, name, image, price: displayPrice, quantity: 1, weight }); }
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      window.dispatchEvent(new Event("ss:cart-updated"));
    } catch { /* no-op */ }
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    try {
      const ids = JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]") as string[];
      const next = wishlisted ? ids.filter((x) => x !== id) : [...ids, id];
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      setWishlisted(!wishlisted);
      window.dispatchEvent(new Event("ss:cart-updated"));
    } catch { /* no-op */ }
  }

  return (
    <article className="group bg-white border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative aspect-square bg-brand-50 overflow-hidden">
        <Link href={`/product/${slug}/`} className="block w-full h-full">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        {!inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="px-3 py-1.5 bg-gray-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">Sold out</span>
          </div>
        )}
        {badge && inStock && (
          <span className={cn("absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full", BADGE_STYLES[badge])}>
            {BADGE_LABEL[badge]}
          </span>
        )}
        {discount && !badge && inStock && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full bg-red-500 text-white">
            -{discount}%
          </span>
        )}
        {lowStock && (
          <span className="absolute bottom-3 left-3 px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-500 text-white">
            Only {stockQty} left!
          </span>
        )}
        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleWishlist}
          className={cn(
            "absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center transition-colors",
            wishlisted ? "text-red-500" : "text-foreground hover:text-red-500"
          )}
        >
          <Heart className={cn("w-4 h-4", wishlisted && "fill-current")} />
        </button>
      </div>

      <div className="p-4">
        {category && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{category}</span>
        )}
        <h3 className="mt-1 font-semibold text-foreground line-clamp-2 min-h-[2.6rem] hover:text-brand transition-colors">
          <Link href={`/product/${slug}/`}>{name}</Link>
        </h3>

        {rating !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn("w-3.5 h-3.5", i < Math.round(rating) ? "fill-accent-500 text-accent-500" : "text-gray-200")}
                />
              ))}
            </div>
            {ratingCount !== undefined && (
              <span className="text-xs text-muted-foreground">({ratingCount})</span>
            )}
          </div>
        )}

        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-brand" data-product-price data-product-id={id}>
              {formatINR(displayPrice)}
            </span>
            {displayCompareAt && displayCompareAt > displayPrice && (
              <span className="text-sm text-muted-foreground line-through">{formatINR(displayCompareAt)}</span>
            )}
          </div>
          <button
            type="button"
            aria-label={`Add ${name} to cart`}
            onClick={handleAddToCart}
            disabled={!inStock}
            className="w-9 h-9 rounded-full bg-brand text-white hover:bg-brand-dark flex items-center justify-center transition-colors disabled:opacity-40"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
