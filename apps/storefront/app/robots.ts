import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/tenant";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/account/", "/cart/", "/checkout/", "/wishlist/"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
