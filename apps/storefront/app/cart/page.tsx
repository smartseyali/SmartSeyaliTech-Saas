import { CartContent } from "@/components/storefront/CartContent";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({ title: "Your Cart", description: "Review your cart and proceed to checkout.", path: "/cart/" });
}

export default function CartPage() {
  return <CartContent />;
}
