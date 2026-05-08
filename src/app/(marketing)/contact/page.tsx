import type { Metadata } from "next";
import { ContactContent } from "@/components/marketing/ContactContent";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Get in touch with SmartSeyali. Request a demo, ask questions, or reach our support team in Tiruppur, Tamil Nadu.",
  path: "/contact/",
});

export default function ContactPage() {
  return <ContactContent />;
}
