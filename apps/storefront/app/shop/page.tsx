import { ShopContent } from "@/components/storefront/ShopContent";
import { getProducts, getCategories } from "@/lib/build-data";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Shop All Products",
    description: "Browse our full range of cold-pressed oils, organic millets, hand-pounded spices, raw honey, and traditional snacks.",
    path: "/shop/",
  });
}

type Props = { searchParams: Promise<{ q?: string; category?: string }> };

export default async function ShopPage({ searchParams }: Props) {
  const { q, category } = await searchParams;
  const products = await getProducts();
  const categories = await getCategories(products);
  return (
    <ShopContent
      products={products}
      categories={categories}
      initialSearch={q}
      initialCategory={category}
    />
  );
}
