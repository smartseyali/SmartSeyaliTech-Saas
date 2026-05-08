import { CheckoutContent } from "@/components/storefront/CheckoutContent";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({ title: "Checkout", description: "Complete your order.", path: "/checkout/" });
}

export default function CheckoutPage() {
  return <CheckoutContent />;
}
