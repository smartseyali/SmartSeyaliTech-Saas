import type { Metadata } from "next";
import { AboutContent } from "@/components/marketing/AboutContent";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About Us",
  description:
    "SmartSeyali Tech engineers business software that eliminates operational friction. Based in Tiruppur, serving 50+ businesses across India.",
  path: "/about/",
});

export default function AboutPage() {
  return <AboutContent />;
}
