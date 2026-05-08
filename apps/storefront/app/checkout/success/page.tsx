import { Suspense } from "react";
import { OrderSuccess } from "@/components/storefront/OrderSuccess";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({ title: "Order Confirmed", description: "Your order has been placed.", path: "/checkout/success/" });
}

export default function SuccessPage() {
  return (
    <Suspense>
      <OrderSuccess />
    </Suspense>
  );
}
