"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/mock-data";

const WISHLIST_KEY = "ss_wishlist";

export function WishlistContent({ allProducts }: { allProducts: Product[] }) {
  const [ids, setIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      setIds(JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]"));
    } catch {
      setIds([]);
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container-tight py-20 text-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const products = allProducts.filter((p) => ids.includes(p.id));

  if (products.length === 0) {
    return (
      <div className="container-tight py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-brand/30" />
        </div>
        <h2 className="text-xl font-bold text-brand-900 mb-2">Your wishlist is empty</h2>
        <p className="text-muted-foreground mb-8">Save products you love and come back to them any time.</p>
        <Button asChild>
          <Link href="/shop/">Browse products <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-tight py-10">
      <h1 className="text-2xl font-bold text-brand-900 mb-8">Wishlist ({products.length})</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            id={p.id}
            slug={p.slug}
            name={p.name}
            category={p.category}
            image={p.image}
            price={p.price}
            compareAtPrice={p.compareAtPrice}
            rating={p.rating}
            ratingCount={p.ratingCount}
            badge={p.badge}
          />
        ))}
      </div>
    </div>
  );
}
