import type { Metadata } from "next";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "./seoUtils";

type SeoInput = {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
};

export function buildMetadata({
  title,
  description,
  path = "/",
  ogImage = "/og-default.png",
  noIndex = false,
}: SeoInput): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle =
    title === SITE_NAME ? `${SITE_NAME} — ${SITE_TAGLINE}` : `${title} | ${SITE_NAME}`;
  const absoluteOgImage = ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      type: "website",
      url,
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      images: [{ url: absoluteOgImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [absoluteOgImage],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      "Multi-tenant SaaS business platform — commerce, finance, HRMS, CRM, and analytics in one place.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-90477-36612",
      contactType: "customer support",
      areaServed: "IN",
      availableLanguage: ["en", "ta"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "SR Nagar",
      addressLocality: "Tiruppur",
      addressRegion: "Tamil Nadu",
      addressCountry: "IN",
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
