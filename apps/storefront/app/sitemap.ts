import type { MetadataRoute } from "next";
import { getProducts, getCategories } from "@/lib/build-data";
import { getSiteUrl } from "@/lib/tenant";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/shop/`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about/`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact/`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/faq/`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${base}/category/${cat.slug}/`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/product/${p.slug}/`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
