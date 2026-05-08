import type { Metadata } from "next";
import { getTenant, getSiteUrl } from "./tenant";

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
  const tenant = getTenant();
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${path}`;
  const fullTitle = title === tenant.brandName ? `${tenant.brandName} — ${tenant.tagline}` : `${title} | ${tenant.brandName}`;
  const absoluteOgImage = ogImage.startsWith("http") ? ogImage : `${siteUrl}${ogImage}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    openGraph: {
      type: "website",
      url,
      title: fullTitle,
      description,
      siteName: tenant.brandName,
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
  const tenant = getTenant();
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: tenant.brandName,
    url: siteUrl,
    logo: `${siteUrl}${tenant.logo}`,
    description: tenant.description,
    telephone: tenant.contact.phone,
    email: tenant.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: tenant.contact.address,
      addressCountry: "IN",
    },
    sameAs: [tenant.social?.instagram, tenant.social?.facebook, tenant.social?.youtube].filter(Boolean),
  };
}

export function websiteJsonLd() {
  const tenant = getTenant();
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: tenant.brandName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/shop/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
