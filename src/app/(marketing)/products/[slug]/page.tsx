import type { Metadata } from "next";
import { ModuleDetailContent } from "@/components/marketing/ModuleDetailContent";
import { buildMetadata } from "@/lib/seo";
import { MODULES } from "@/components/marketing/FeaturesContent";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const mod = MODULES.find((m) => m.slug === slug);
  return buildMetadata({
    title: mod ? `${mod.name} Module` : "Module",
    description: mod?.tagline ?? "SmartSeyali business module",
    path: `/products/${slug}/`,
  });
}

export default async function ModuleDetailPage({ params }: Props) {
  const { slug } = await params;
  return <ModuleDetailContent slug={slug} />;
}
