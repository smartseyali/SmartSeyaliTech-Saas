/**
 * Build-time data layer — Phase 6.
 *
 * Every exported function fetches from Supabase at `next build` time.
 * If Supabase is not configured the mock-data fallback is returned so local
 * development without a DB still works.
 *
 * Expected Supabase tables:
 *   ecom_products  — product catalogue scoped by company_id
 *   ecom_categories — (optional) explicit category list; derived from products if absent
 */
import { getServerSupabase } from "./supabase-server";
import { getTenant } from "./tenant";
import { PRODUCTS, CATEGORIES, type Product, type Category, type ProductVariant } from "./mock-data";

// ─── helpers ─────────────────────────────────────────────────────────────────

type RawProduct = Record<string, unknown>;
type RawVariant = Record<string, unknown>;

function mapVariant(v: RawVariant): ProductVariant {
  let attributes: Record<string, string> = {};
  try {
    const raw = v.attributes_summary ?? v.attributes;
    if (typeof raw === "string") attributes = JSON.parse(raw);
    else if (raw && typeof raw === "object") attributes = raw as Record<string, string>;
  } catch { /* ignore */ }
  return {
    id: String(v.id),
    name: String(v.variant_name ?? v.name ?? ""),
    attributes,
    price: Number(v.price ?? 0),
    compareAtPrice: v.compare_at_price != null ? Number(v.compare_at_price) : undefined,
    stockQty: Number(v.stock_qty ?? v.quantity ?? 0),
    imageUrl: typeof v.image_url === "string" ? v.image_url : undefined,
    sku: typeof v.sku === "string" ? v.sku : undefined,
    isDefault: Boolean(v.is_default),
    sortOrder: v.sort_order != null ? Number(v.sort_order) : undefined,
  };
}

function mapProduct(row: RawProduct, variantRows?: RawVariant[]): Product {
  const images = Array.isArray(row.images) ? (row.images as string[]) : undefined;
  const firstImage =
    images?.[0] ??
    (typeof row.image_url === "string" ? row.image_url : null) ??
    (typeof row.image === "string" ? row.image : null) ??
    "/placeholders/product-1.svg";

  const variants = variantRows?.map(mapVariant).sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
  const hasVariants = (variants?.length ?? 0) > 0;

  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name ?? ""),
    category: String(row.category ?? row.category_name ?? ""),
    categorySlug: String(row.category_slug ?? ""),
    description: String(row.description ?? ""),
    shortDescription: String(row.short_description ?? row.shortDescription ?? ""),
    image: firstImage,
    images: images,
    price: Number(row.price ?? 0),
    compareAtPrice:
      row.compare_at_price != null ? Number(row.compare_at_price) : undefined,
    rating: row.rating != null ? Number(row.rating) : undefined,
    ratingCount: row.rating_count != null ? Number(row.rating_count) : undefined,
    badge: (row.badge as Product["badge"]) ?? undefined,
    inStock: row.in_stock !== false,
    weight: typeof row.weight === "string" ? row.weight : undefined,
    hasVariants,
    variants: hasVariants ? variants : undefined,
  };
}

function tenantFilter(tenant: ReturnType<typeof getTenant>) {
  return tenant.companyId
    ? { column: "company_id", value: tenant.companyId }
    : null;
}

// ─── public API ──────────────────────────────────────────────────────────────

let _products: Product[] | null = null;

export async function getProducts(): Promise<Product[]> {
  if (_products) return _products;

  const db = getServerSupabase();
  if (!db) return PRODUCTS;

  const tenant = getTenant();
  const filter = tenantFilter(tenant);

  let query = db
    .from("ecom_products")
    .select(
      "id, slug, name, category, category_slug, description, short_description, image, image_url, images, price, compare_at_price, rating, rating_count, badge, in_stock, weight, product_variants(id, variant_name, attributes_summary, price, compare_at_price, stock_qty, image_url, sku, is_default, sort_order)"
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (filter) query = query.eq(filter.column, filter.value);

  const { data, error } = await query;

  if (error || !data?.length) {
    console.warn("[build-data] ecom_products fetch failed or empty — using mock data.", error?.message);
    return PRODUCTS;
  }

  _products = data.map((row) => {
    const { product_variants, ...rest } = row as RawProduct & { product_variants?: RawVariant[] };
    return mapProduct(rest, product_variants);
  });
  return _products;
}

export async function getCategories(products?: Product[]): Promise<Category[]> {
  const db = getServerSupabase();
  const tenant = getTenant();
  const filter = tenantFilter(tenant);

  // 1. Try dedicated ecom_categories table
  if (db) {
    let query = db
      .from("ecom_categories")
      .select("slug, name, image, image_url, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (filter) query = query.eq(filter.column, filter.value);

    const { data } = await query;
    if (data?.length) {
      const prods = products ?? (await getProducts());
      return data.map((cat) => ({
        slug: String(cat.slug),
        name: String(cat.name),
        image:
          (typeof cat.image_url === "string" ? cat.image_url : null) ??
          (typeof cat.image === "string" ? cat.image : null) ??
          `/placeholders/category-${cat.slug}.svg`,
        productCount: prods.filter((p) => p.categorySlug === cat.slug).length,
      }));
    }
  }

  // 2. Derive categories from products (group by category_slug)
  if (!db) return CATEGORIES;

  const prods = products ?? (await getProducts());
  const catMap = new Map<string, { name: string; count: number }>();
  prods.forEach((p) => {
    if (!p.categorySlug) return;
    const existing = catMap.get(p.categorySlug);
    if (existing) existing.count++;
    else catMap.set(p.categorySlug, { name: p.category, count: 1 });
  });

  return Array.from(catMap.entries()).map(([slug, { name, count }]) => ({
    slug,
    name,
    image: `/placeholders/category-${slug}.svg`,
    productCount: count,
  }));
}

export type ProductReview = {
  id: string;
  author_name: string;
  rating: number;
  title?: string;
  body: string;
  created_at: string;
  helpful_count?: number;
  admin_reply?: string;
  verified_purchase?: boolean;
};

export async function getProductReviews(slug: string): Promise<{ reviews: ProductReview[]; avgRating: number; totalCount: number }> {
  const db = getServerSupabase();
  if (!db) return { reviews: [], avgRating: 0, totalCount: 0 };

  const tenant = getTenant();
  const filter = tenantFilter(tenant);

  let query = db
    .from("ecom_product_reviews")
    .select("id, author_name, rating, title, body, created_at, helpful_count, admin_reply, verified_purchase")
    .eq("product_slug", slug)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(50);

  if (filter) query = query.eq(filter.column, filter.value);

  const { data } = await query;
  if (!data?.length) return { reviews: [], avgRating: 0, totalCount: 0 };

  const avgRating = data.reduce((s, r) => s + r.rating, 0) / data.length;
  return { reviews: data as ProductReview[], avgRating, totalCount: data.length };
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const db = getServerSupabase();
  const tenant = getTenant();
  const filter = tenantFilter(tenant);

  // Try is_featured flag first
  if (db) {
    let query = db
      .from("ecom_products")
      .select(
        "id, slug, name, category, category_slug, description, short_description, image, image_url, images, price, compare_at_price, rating, rating_count, badge, in_stock, weight, product_variants(id, variant_name, attributes_summary, price, compare_at_price, stock_qty, image_url, sku, is_default, sort_order)"
      )
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("sort_order", { ascending: true })
      .limit(limit);

    if (filter) query = query.eq(filter.column, filter.value);
    const { data } = await query;
    if (data?.length) return data.map((row) => {
      const { product_variants, ...rest } = row as RawProduct & { product_variants?: RawVariant[] };
      return mapProduct(rest, product_variants);
    });
  }

  // Fallback: first `limit` products
  const all = await getProducts();
  return all.slice(0, limit);
}
