import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, Truck, ShieldCheck, ArrowLeft, Leaf } from "lucide-react";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ProductActions } from "@/components/storefront/ProductActions";
import { ProductReviews } from "@/components/storefront/ProductReviews";
import { ProductGallery } from "@/components/storefront/ProductGallery";
import { getProducts, getProductReviews } from "@/lib/build-data";
import { buildMetadata } from "@/lib/seo";
import { getTenant, getSiteUrl } from "@/lib/tenant";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((p) => p.slug === slug);
  if (!product) return {};
  return buildMetadata({
    title: product.name,
    description: product.shortDescription,
    path: `/product/${slug}/`,
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const tenant = getTenant();
  const siteUrl = getSiteUrl();
  const related = products.filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4);
  const { reviews, avgRating, totalCount } = await getProductReviews(product.slug);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: `${siteUrl}${product.image}`,
    brand: { "@type": "Brand", name: tenant.brandName },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/product/${product.slug}/`,
      priceCurrency: "INR",
      price: product.price,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: tenant.brandName },
    },
    ...((totalCount > 0 || product.rating !== undefined) && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: totalCount > 0 ? avgRating.toFixed(1) : product.rating,
        reviewCount: totalCount > 0 ? totalCount : (product.ratingCount ?? 1),
        bestRating: 5,
      },
    }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />

      {/* Breadcrumb */}
      <nav className="border-b border-border bg-white">
        <div className="container-tight py-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-brand transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop/" className="hover:text-brand transition-colors">Shop</Link>
          <span>/</span>
          <Link href={`/category/${product.categorySlug}/`} className="hover:text-brand transition-colors">{product.category}</Link>
          <span>/</span>
          <span className="text-brand-900 font-medium line-clamp-1">{product.name}</span>
        </div>
      </nav>

      {/* Product detail */}
      <section className="container-tight py-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery — swaps image when a variant is selected */}
          <ProductGallery
            mainImage={product.image}
            productName={product.name}
            badge={product.badge}
            extraImages={product.variants?.filter((v) => v.imageUrl).map((v) => v.imageUrl!) ?? []}
          />

          {/* Info */}
          <div>
            <Link href={`/category/${product.categorySlug}/`} className="text-xs font-bold uppercase tracking-widest text-accent-600 hover:underline">
              {product.category}
            </Link>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-900 mt-2 mb-3">{product.name}</h1>

            {product.rating !== undefined && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn("w-4 h-4", i < Math.round(product.rating!) ? "fill-accent-500 text-accent-500" : "text-gray-200")}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">{product.rating} ({product.ratingCount} reviews)</span>
              </div>
            )}

            <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>

            {/* Live-hydrated price, quantity, and add to cart */}
            <ProductActions
              id={product.id}
              slug={product.slug}
              name={product.name}
              image={product.image}
              staticPrice={product.price}
              staticCompareAt={product.compareAtPrice}
              weight={product.weight}
              inStock={product.inStock}
              variants={product.variants}
              hasVariants={product.hasVariants}
            />

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Leaf, text: "100% Natural & Pure" },
                { icon: Truck, text: "Free ship above ₹999" },
                { icon: ShieldCheck, text: "Quality certified" },
                { icon: ShieldCheck, text: "Easy 7-day returns" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className="w-4 h-4 text-brand shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <div className="border-t border-border">
        <ProductReviews
          productId={product.id}
          productSlug={product.slug}
          reviews={reviews}
          avgRating={avgRating}
          totalCount={totalCount}
        />
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="bg-brand-50/40 py-14">
          <div className="container-tight">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-xl font-bold text-brand-900">More from {product.category}</h2>
              <Link href={`/category/${product.categorySlug}/`} className="flex items-center gap-1 text-sm text-brand hover:underline">
                View all <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  name={p.name}
                  category={p.category}
                  image={p.image}
                  price={p.price}
                  compareAtPrice={p.compareAtPrice}
                  rating={p.rating}
                  ratingCount={p.ratingCount}
                  badge={p.badge}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
