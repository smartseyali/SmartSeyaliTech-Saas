import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/blog";
import { SITE_URL } from "@/lib/seoUtils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes = [
    { url: `${SITE_URL}/`,          priority: 1.0 },
    { url: `${SITE_URL}/services/`, priority: 0.9 },
    { url: `${SITE_URL}/products/`, priority: 0.9 },
    { url: `${SITE_URL}/pricing/`,  priority: 0.9 },
    { url: `${SITE_URL}/about/`,    priority: 0.7 },
    { url: `${SITE_URL}/contact/`,  priority: 0.7 },
  ].map((r) => ({
    url: r.url,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: r.priority,
  }));

  const blogRoutes = getAllSlugs().map((slug) => ({
    url: `${SITE_URL}/blog/${slug}/`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
