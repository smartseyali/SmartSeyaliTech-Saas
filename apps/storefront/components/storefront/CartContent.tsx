"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";

export type CartItem = {
  id: string;
  productId?: string;
  variantId?: string;
  variantLabel?: string;
  sku?: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  weight?: string;
};

const CART_KEY = "ss_cart";

function readCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("ss:cart-updated"));
}

export function CartContent() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(readCart());
    setMounted(true);
  }, []);

  function updateQty(id: string, delta: number) {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      );
      writeCart(next);
      return next;
    });
  }

  function remove(id: string) {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      writeCart(next);
      return next;
    });
  }

  if (!mounted) {
    return (
      <div className="container-tight py-20 text-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container-tight py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-brand/30" />
        </div>
        <h2 className="text-xl font-bold text-brand-900 mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">Add some products and they&apos;ll show up here.</p>
        <Button asChild>
          <Link href="/shop/">Start shopping <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-tight py-10">
      <h1 className="text-2xl font-bold text-brand-900 mb-8">Your Cart ({items.length})</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white border border-border rounded-xl p-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-brand-50 shrink-0">
                <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.slug}/`} className="font-semibold text-brand-900 hover:text-brand line-clamp-1 transition-colors">
                  {item.name}
                </Link>
                {item.variantLabel && <p className="text-xs text-muted-foreground mt-0.5">{item.variantLabel}</p>}
                {!item.variantLabel && item.weight && <p className="text-xs text-muted-foreground mt-0.5">{item.weight}</p>}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, -1)}
                      className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-brand-50 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, 1)}
                      className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-brand-50 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-brand">{formatINR(item.price * item.quantity)}</span>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors text-muted-foreground"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-border rounded-xl p-6 sticky top-28 space-y-4">
            <h2 className="font-bold text-brand-900 text-lg">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className={shipping === 0 ? "text-brand font-semibold" : ""}>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-accent-600 bg-accent-50 px-3 py-2 rounded-lg">
                  Add {formatINR(999 - subtotal)} more for free shipping!
                </p>
              )}
            </div>
            <div className="border-t border-border pt-4 flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-brand">{formatINR(total)}</span>
            </div>
            <Button asChild size="lg" className="w-full">
              <Link href="/checkout/">Proceed to Checkout <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="ghost" className="w-full text-sm">
              <Link href="/shop/">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
