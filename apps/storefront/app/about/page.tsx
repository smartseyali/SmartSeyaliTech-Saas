import Link from "next/link";
import { ArrowRight, Leaf, Users, Heart, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";
import { getTenant } from "@/lib/tenant";

export function generateMetadata() {
  return buildMetadata({
    title: "Our Story",
    description: "Learn how Pattikadai was born from a passion for preserving traditional South Indian food culture and bringing pure, authentic foods to modern kitchens.",
    path: "/about/",
  });
}

const VALUES = [
  { icon: Leaf, title: "Pure & Natural", desc: "No preservatives, no chemicals, no shortcuts. What you get is exactly what nature gave us." },
  { icon: Users, title: "Farmer First", desc: "We work directly with small-holding Tamil Nadu farmers — fair prices, no middlemen, long-term partnerships." },
  { icon: Heart, title: "Traditional Methods", desc: "Wood-press, stone-mill, sun-drying. Every product made exactly as grandmothers made them for centuries." },
  { icon: Award, title: "Quality Assured", desc: "Every batch is lab-tested before shipping. If it isn't perfect, it doesn't ship." },
];

export default function AboutPage() {
  const tenant = getTenant();

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 to-accent-50 border-b border-border">
        <div className="container-tight py-16 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-3 block">Our Story</span>
          <h1 className="text-4xl lg:text-5xl font-bold text-brand-900 mb-4">
            Made the way <span className="text-brand">grandmother made it</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {tenant.brandName} was born from a simple belief: the food our grandparents ate was healthier, tastier, and more honest than anything you find in a supermarket today.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 lg:py-20">
        <div className="container-tight">
          <div className="max-w-3xl mx-auto prose prose-green">
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              It started with a simple question: why does my mother&apos;s coconut oil smell so different from what I buy at the store? The answer led us down a rabbit hole of traditional food processing — and we never came back.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We spent months traveling across Tamil Nadu, visiting the last remaining chekku (wood-press) operators, ammikkal (stone-mill) artisans, and millet farming families. What we found was extraordinary: methods passed down for hundreds of years, producing foods with a depth of flavour and nutritional profile that modern processing destroys.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {tenant.brandName} exists to preserve these methods, support the artisans who practise them, and make these extraordinary foods accessible to every Indian kitchen — wherever you are in the country.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-brand-50/40">
        <div className="container-tight">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-2 block">What we stand for</span>
            <h2 className="text-3xl font-bold text-brand-900">Our values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-6 border border-border text-center">
                <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-brand" />
                </div>
                <h3 className="font-semibold text-brand-900 mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container-tight text-center">
          <h2 className="text-2xl font-bold text-brand-900 mb-3">Ready to taste the difference?</h2>
          <p className="text-muted-foreground mb-8">Try our bestsellers — pure, traditional, and delivered to your door.</p>
          <Button asChild size="lg">
            <Link href="/shop/">Shop now <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </>
  );
}
