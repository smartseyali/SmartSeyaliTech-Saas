import type { Metadata } from "next";
import { FeaturesContent } from "@/components/marketing/FeaturesContent";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Services",
  description:
    "Comprehensive business services — ERP modules for commerce, finance, HRMS, CRM, inventory, and analytics. All in one platform.",
  path: "/services/",
});

export default function ServicesPage() {
  return <FeaturesContent />;
}
