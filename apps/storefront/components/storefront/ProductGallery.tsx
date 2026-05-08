"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  mainImage: string;
  productName: string;
  badge?: string;
  extraImages?: string[];
};

export function ProductGallery({ mainImage, productName, badge, extraImages = [] }: Props) {
  const [activeImage, setActiveImage] = useState(mainImage);

  useEffect(() => {
    function onVariantImage(e: Event) {
      const url = (e as CustomEvent<{ imageUrl: string }>).detail.imageUrl;
      if (url) setActiveImage(url);
    }
    window.addEventListener("ss:variant-image", onVariantImage);
    return () => window.removeEventListener("ss:variant-image", onVariantImage);
  }, []);

  // Reset to main image if mainImage prop changes (e.g. navigating to different product)
  useEffect(() => { setActiveImage(mainImage); }, [mainImage]);

  const thumbnails = [mainImage, ...extraImages.filter((img) => img !== mainImage)].slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="aspect-square rounded-2xl overflow-hidden bg-brand-50 relative">
        <Image
          src={activeImage}
          alt={productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-opacity duration-200"
          priority
        />
        {badge && (
          <span className={cn(
            "absolute top-4 left-4 px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-full",
            badge === "bestseller" ? "bg-accent-500 text-white" : "bg-brand text-white"
          )}>
            {badge === "bestseller" ? "Best Seller" : badge === "new" ? "New" : badge}
          </span>
        )}
      </div>
      {thumbnails.length > 1 && (
        <div className="flex gap-3">
          {thumbnails.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveImage(img)}
              className={cn(
                "w-20 h-20 rounded-xl overflow-hidden relative cursor-pointer ring-2 transition-all",
                activeImage === img ? "ring-brand" : "ring-transparent hover:ring-brand/40"
              )}
            >
              <Image src={img} alt={productName} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
