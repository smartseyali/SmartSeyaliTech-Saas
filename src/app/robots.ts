import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seoUtils";

export const revalidate = 86400;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/login", "/apps/", "/onboarding", "/verify-email-pending", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
