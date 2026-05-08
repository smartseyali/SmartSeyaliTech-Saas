import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Award, Leaf, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/ProductCard";
import { getCategories, getFeaturedProducts } from "@/lib/build-data";
import { buildMetadata } from "@/lib/seo";
import { getTenant } from "@/lib/tenant";

export function generateMetadata() {
  const tenant = getTenant();
  return buildMetadata({
    title: tenant.brandName,
    description: tenant.description,
    path: "/",
  });
}

const TRUST_BADGES = [
  { icon: Leaf, title: "100% Natural", desc: "No preservatives, no chemicals" },
  { icon: Truck, title: "Free Shipping", desc: "On orders above ₹999" },
  { icon: ShieldCheck, title: "Quality Assured", desc: "Lab-tested & certified" },
  { icon: Award, title: "Traditional Methods", desc: "Stone-ground, wood-pressed" },
];

export default async function HomePage() {
  const tenant = getTenant();
  const [categories, featured] = await Promise.all([getCategories(), getFeaturedProducts(8)]);
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-accent-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(26,71,42,0.08),transparent_60%),radial-gradient(circle_at_80%_80%,rgba(255,142,26,0.08),transparent_60%)]" />
        <div className="container-tight relative py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand text-white text-xs font-semibold uppercase tracking-wide mb-6">
                <Leaf className="w-3 h-3" />
                {tenant.tagline}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-900 leading-[1.1] tracking-tight mb-6">
                Pure, healthy,
                <br />
                preservative-free
                <br />
                <span className="text-brand">country foods.</span>
              </h1>
              <p className="text-base lg:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8">
                Cold-pressed oils, hand-pounded spices, organic millets, and grandmother&apos;s recipes — sourced directly from
                Tamil Nadu farms.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button asChild size="lg">
                  <Link href="/shop/">
                    Shop Now <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/about/">Our Story</Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-brand-100 to-accent-100 shadow-2xl shadow-brand-900/20">
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-9xl font-bold text-brand/10">{tenant.brandName[0]}</span>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-5 max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent-500 text-white flex items-center justify-center font-bold text-xl">
                    50+
                  </div>
                  <div>
                    <p className="font-semibold text-brand-900">Happy customers</p>
                    <p className="text-xs text-muted-foreground">Every day, all over India</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border bg-white">
        <div className="container-tight py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_BADGES.map((badge) => (
              <div key={badge.title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                  <badge.icon className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-900">{badge.title}</p>
                  <p className="text-xs text-muted-foreground">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 lg:py-20">
        <div className="container-tight">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-2 block">Shop by category</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-brand-900">
              Find what your <span className="text-brand">kitchen needs</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}/`}
                className="group flex flex-col items-center text-center p-4 rounded-xl bg-white border border-border hover:border-brand hover:shadow-md transition-all"
              >
                <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mb-3 group-hover:bg-brand transition-colors">
                  <Leaf className="w-8 h-8 text-brand group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-sm font-semibold text-brand-900 group-hover:text-brand transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{cat.productCount} products</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="py-16 lg:py-20 bg-brand-50/40">
        <div className="container-tight">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-2 block">Our products</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-brand-900">
                Fresh from <span className="text-brand">our farms</span>
              </h2>
              <p className="text-muted-foreground mt-2 max-w-xl">
                Sourced directly. Processed traditionally. Delivered to your door.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/shop/">
                View all <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                slug={product.slug}
                name={product.name}
                category={product.category}
                image={product.image}
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                rating={product.rating}
                ratingCount={product.ratingCount}
                badge={product.badge}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Story strip */}
      <section className="py-16 lg:py-24">
        <div className="container-tight">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-brand to-brand-900 flex items-center justify-center text-white">
              <Award className="w-24 h-24 opacity-30" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-2 block">Our promise</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-brand-900 mb-4">
                Made the way <span className="text-brand">grandmother made it</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We work directly with small-holding farmers and artisan producers across Tamil Nadu. Every oil is wood-pressed in
                small batches. Every spice is hand-pounded. Every grain is sun-dried and hand-cleaned. No shortcuts.
              </p>
              <ul className="space-y-3">
                {[
                  "Sourced directly from farmers — fair prices, no middlemen",
                  "Traditional wood-press (chekku) and stone-mill processing",
                  "Zero preservatives, additives, or refined ingredients",
                  "Quality lab-tested before every batch ships",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Leaf className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button asChild>
                  <Link href="/about/">
                    Read our story <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand text-white">
        <div className="container-tight text-center">
          <h2 className="text-2xl lg:text-3xl font-bold mb-3">
            Ready to taste the difference?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Try our bestsellers risk-free. Loved by 50+ customers. Free shipping on orders over ₹999.
          </p>
          <Button asChild variant="accent" size="lg">
            <Link href="/shop/">
              Start shopping <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
