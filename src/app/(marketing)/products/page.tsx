import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductsContent } from "@/components/marketing/ProductsContent";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Products",
  description:
    "Explore SmartSeyali's full module lineup — E-Commerce, Finance, HRMS, CRM, POS, Inventory, WhatsApp, and more.",
  path: "/products/",
});

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  );
}
