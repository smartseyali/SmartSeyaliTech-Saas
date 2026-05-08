import { AccountContent } from "@/components/storefront/AccountContent";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({ title: "My Account", description: "Sign in to track your orders and manage your wishlist.", path: "/account/" });
}

export default function AccountPage() {
  return <AccountContent />;
}
