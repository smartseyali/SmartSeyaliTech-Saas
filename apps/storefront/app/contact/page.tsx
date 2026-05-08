import { ContactContent } from "@/components/storefront/ContactContent";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Contact Us",
    description: "Get in touch with us for orders, queries, or wholesale enquiries.",
    path: "/contact/",
  });
}

export default function ContactPage() {
  return <ContactContent />;
}
