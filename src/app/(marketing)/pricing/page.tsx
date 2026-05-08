import type { Metadata } from "next";
import { PricingContent } from "@/components/marketing/PricingContent";
import { buildMetadata, organizationJsonLd } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/seoUtils";

export const metadata: Metadata = buildMetadata({
  title: "Pricing",
  description:
    "Simple, transparent pricing for SmartSeyali. Starter, Growth, and Enterprise plans. 14-day free trial, no credit card required.",
  path: "/pricing/",
});

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: `${SITE_NAME} Business Platform`,
  description: "Multi-tenant SaaS for commerce, finance, HRMS, CRM, and analytics.",
  brand: { "@type": "Brand", name: SITE_NAME },
  offers: [
    { "@type": "Offer", name: "Starter", price: "1499", priceCurrency: "INR", url: `${SITE_URL}/pricing/`, availability: "https://schema.org/InStock" },
    { "@type": "Offer", name: "Growth",  price: "3999", priceCurrency: "INR", url: `${SITE_URL}/pricing/`, availability: "https://schema.org/InStock" },
    { "@type": "Offer", name: "Enterprise", price: "9999", priceCurrency: "INR", url: `${SITE_URL}/pricing/`, availability: "https://schema.org/InStock" },
  ],
};

export default function PricingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <PricingContent />
    </>
  );
}
