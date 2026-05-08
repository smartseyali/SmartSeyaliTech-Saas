import type { Metadata } from "next";
import { HomeContent } from "@/components/marketing/HomeContent";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "SmartSeyali",
  description:
    "Run your entire business from one platform. Commerce, Finance, HRMS, CRM, and Analytics — unified for growing companies in India.",
  path: "/",
});

export default function HomePage() {
  return <HomeContent />;
}
