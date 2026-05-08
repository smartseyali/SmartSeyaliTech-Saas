import { WishlistContent } from "@/components/storefront/WishlistContent";
import { getProducts } from "@/lib/build-data";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({ title: "Wishlist", description: "Your saved products.", path: "/wishlist/" });
}

export default async function WishlistPage() {
  const products = await getProducts();
  return <WishlistContent allProducts={products} />;
}
