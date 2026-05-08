"use client";

import { useState, useMemo, useEffect } from "react";
import { ShoppingCart, Heart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLiveData } from "@/contexts/LiveDataContext";
import { formatINR, cn } from "@/lib/utils";
import type { ProductVariant } from "@/lib/mock-data";

const CART_KEY = "ss_cart";
const WISHLIST_KEY = "ss_wishlist";

type Props = {
  id: string;
  slug: string;
  name: string;
  image: string;
  staticPrice: number;
  staticCompareAt?: number;
  weight?: string;
  inStock?: boolean;
  variants?: ProductVariant[];
  hasVariants?: boolean;
};

export function ProductActions({
  id, slug, name, image,
  staticPrice, staticCompareAt,
  weight, inStock: staticInStock,
  variants, hasVariants,
}: Props) {
  const live = useLiveData().get(slug);

  // Variant selection state — key: attributeName, value: chosen option
  const defaultVariant = variants?.find((v) => v.isDefault) ?? variants?.[0];
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(defaultVariant?.id);

  const selectedVariant = variants?.find((v) => v.id === selectedVariantId);

  // Derive attribute axes from all variants (e.g. {Size: ["250ml","500ml","1L"], …})
  const attributeAxes = useMemo(() => {
    if (!variants?.length) return {} as Record<string, string[]>;
    const axes: Record<string, Set<string>> = {};
    for (const v of variants) {
      for (const [k, val] of Object.entries(v.attributes)) {
        if (!axes[k]) axes[k] = new Set();
        axes[k].add(val);
      }
    }
    return Object.fromEntries(Object.entries(axes).map(([k, s]) => [k, Array.from(s)]));
  }, [variants]);

  // Selected attributes (one per axis)
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(() => {
    if (!defaultVariant) return {};
    return { ...defaultVariant.attributes };
  });

  // When an attribute changes, find the best-matching variant
  function selectAttr(axis: string, value: string) {
    const next = { ...selectedAttrs, [axis]: value };
    setSelectedAttrs(next);
    const match = variants?.find((v) =>
      Object.entries(next).every(([k, val]) => v.attributes[k] === val)
    );
    if (match) setSelectedVariantId(match.id);
  }

  // Resolve price from: selected variant → live overlay → static
  const price = selectedVariant?.price ?? live?.price ?? staticPrice;
  const compareAt = selectedVariant?.compareAtPrice ?? live?.compare_at_price ?? staticCompareAt;
  const inStock = (selectedVariant ? selectedVariant.stockQty > 0 : undefined) ?? live?.in_stock ?? staticInStock ?? true;
  const variantImage = selectedVariant?.imageUrl ?? image;

  // Notify gallery when variant image changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("ss:variant-image", { detail: { imageUrl: variantImage } }));
  }, [variantImage]);

  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const ids: string[] = JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]");
      return ids.includes(id);
    } catch { return false; }
  });

  const discount = compareAt && compareAt > price
    ? Math.round(((compareAt - price) / compareAt) * 100)
    : null;

  const cartItemKey = selectedVariant ? `${id}__${selectedVariant.id}` : id;
  const variantLabel = selectedVariant
    ? Object.values(selectedVariant.attributes).join(" / ")
    : undefined;

  function addToCart() {
    try {
      const cart = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
      const existing = cart.find((i: { id: string }) => i.id === cartItemKey);
      if (existing) {
        existing.quantity += qty;
      } else {
        cart.push({
          id: cartItemKey,
          productId: id,
          variantId: selectedVariant?.id,
          variantLabel,
          slug, name, image: variantImage, price, quantity: qty, weight,
        });
      }
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      window.dispatchEvent(new Event("ss:cart-updated"));
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch { /* no-op */ }
  }

  function toggleWishlist() {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]");
      const next = wishlisted ? ids.filter((x) => x !== id) : [...ids, id];
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      setWishlisted(!wishlisted);
      window.dispatchEvent(new Event("ss:cart-updated"));
    } catch { /* no-op */ }
  }

  return (
    <div>
      {/* Live price */}
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-3xl font-bold text-brand" data-product-price data-product-id={id}>
          {formatINR(price)}
        </span>
        {compareAt && compareAt > price && (
          <span className="text-lg text-muted-foreground line-through">{formatINR(compareAt)}</span>
        )}
        {discount && (
          <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold">{discount}% off</span>
        )}
      </div>
      {weight && !hasVariants && (
        <p className="text-sm text-muted-foreground mb-4">Net weight: {weight}</p>
      )}

      {/* Variant selectors */}
      {hasVariants && Object.entries(attributeAxes).map(([axis, options]) => (
        <div key={axis} className="mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {axis}
            {selectedAttrs[axis] && (
              <span className="ml-2 text-foreground normal-case font-bold">{selectedAttrs[axis]}</span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
              const isSelected = selectedAttrs[axis] === opt;
              const variantForOpt = variants?.find((v) =>
                v.attributes[axis] === opt &&
                Object.entries(selectedAttrs).every(([k, val]) => k === axis || v.attributes[k] === val)
              );
              const outOfStock = variantForOpt ? variantForOpt.stockQty === 0 : false;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={outOfStock}
                  onClick={() => selectAttr(axis, opt)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full border text-sm font-semibold transition-all",
                    isSelected
                      ? "border-brand bg-brand text-white shadow-sm"
                      : outOfStock
                      ? "border-border text-muted-foreground line-through opacity-50 cursor-not-allowed"
                      : "border-border text-foreground hover:border-brand hover:text-brand"
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!inStock ? (
        <p className="text-sm font-semibold text-red-500 mb-4">Out of stock</p>
      ) : (
        selectedVariant && selectedVariant.stockQty <= 5 && selectedVariant.stockQty > 0 && (
          <p className="text-sm font-semibold text-amber-600 mb-4">Only {selectedVariant.stockQty} left!</p>
        )
      )}

      {/* Quantity + CTA */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 border border-border rounded-full px-2">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center hover:text-brand transition-colors">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center text-sm font-semibold">{qty}</span>
          <button type="button" onClick={() => setQty((q) => q + 1)} className="w-8 h-8 flex items-center justify-center hover:text-brand transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <Button
          size="lg"
          className={cn("flex-1 transition-all", addedToCart && "bg-green-600 hover:bg-green-600")}
          disabled={!inStock}
          onClick={addToCart}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {addedToCart ? "Added!" : "Add to Cart"}
        </Button>
        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={toggleWishlist}
          className={cn(
            "w-12 h-12 rounded-full border flex items-center justify-center transition-colors",
            wishlisted ? "border-red-300 bg-red-50 text-red-500" : "border-border hover:bg-red-50 hover:text-red-500 hover:border-red-200"
          )}
        >
          <Heart className={cn("w-5 h-5", wishlisted && "fill-current")} />
        </button>
      </div>
    </div>
  );
}
