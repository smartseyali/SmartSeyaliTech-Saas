import { notFound } from "next/navigation";
import { ShopContent } from "@/components/storefront/ShopContent";
import { getProducts, getCategories } from "@/lib/build-data";
import { buildMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((cat) => ({ slug: cat.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return {};
  return buildMetadata({
    title: cat.name,
    description: `Shop our ${cat.name} collection — pure, traditional, and preservative-free.`,
    path: `/category/${slug}/`,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();

  return (
    <div>
      <div className="bg-gradient-to-br from-brand-50 to-accent-50 border-b border-border">
        <div className="container-tight py-8">
          <h1 className="text-3xl font-bold text-brand-900">{cat.name}</h1>
          <p className="text-muted-foreground mt-1">{cat.productCount} products</p>
        </div>
      </div>
      <ShopContent products={products} categories={categories} initialCategory={slug} />
    </div>
  );
}
