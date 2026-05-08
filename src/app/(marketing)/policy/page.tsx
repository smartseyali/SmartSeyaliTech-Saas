import type { Metadata } from "next";
import { PolicyContent } from "@/components/marketing/PolicyContent";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: "SmartSeyali privacy policy — how we collect, store, and protect your data.",
  path: "/policy/",
  noIndex: true,
});

export default function PolicyPage() {
  return <PolicyContent />;
}
