import type { Metadata } from "next";
import { TermsContent } from "@/components/marketing/TermsContent";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms & Conditions",
  description: "SmartSeyali terms and conditions of service.",
  path: "/terms/",
  noIndex: true,
});

export default function TermsPage() {
  return <TermsContent />;
}
