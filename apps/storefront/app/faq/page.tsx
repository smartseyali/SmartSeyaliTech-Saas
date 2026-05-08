import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getTenant } from "@/lib/tenant";

export function generateMetadata() {
  return buildMetadata({
    title: "FAQ",
    description: "Answers to common questions about our products, shipping, returns, and ordering process.",
    path: "/faq/",
  });
}

const FAQS = [
  {
    q: "Are your products really free of preservatives?",
    a: "Yes. Every product we sell contains zero chemical preservatives, artificial colours, or flavour enhancers. The only ingredients are the natural ones listed on each product. We get every batch independently lab-tested to verify this.",
  },
  {
    q: "What is cold-pressed / chekku oil?",
    a: "Cold-pressed (chekku) oil is extracted by slow-pressing seeds or nuts in a traditional wooden press at room temperature. This preserves the natural aroma, flavour, and nutrients that are destroyed by modern heat-extraction methods. The press never gets hot enough to degrade the oil.",
  },
  {
    q: "How long do your products stay fresh?",
    a: "Cold-pressed oils: 6–9 months unopened, 3 months after opening (store in a cool, dark place). Millets and flours: 6 months in an airtight container. Spice powders: 3–4 months in an airtight container. Raw honey: 12+ months (honey never truly expires). All best-before dates are printed on packaging.",
  },
  {
    q: "Do you offer free shipping?",
    a: "Yes — free shipping on all orders above ₹999. For orders below ₹999, a flat shipping fee of ₹99 applies. Orders are dispatched within 1–2 business days and delivered in 3–5 business days across India.",
  },
  {
    q: "Can I return or exchange products?",
    a: "If you receive a damaged or incorrect product, contact us within 48 hours of delivery with a photo and we will replace it or refund you at no cost. For quality concerns, we review on a case-by-case basis — we stand behind our products.",
  },
  {
    q: "Do you ship outside India?",
    a: "Currently we ship only within India. International shipping is on our roadmap — drop us your email on the contact page and we'll notify you when it's available.",
  },
  {
    q: "Are your products suitable for diabetics?",
    a: "Many of our products are naturally low-GI and suitable for diabetics — including most millets, cold-pressed oils, and raw forest honey. However, we are not a medical organisation and recommend consulting your doctor before making dietary changes.",
  },
  {
    q: "How do I place a bulk or wholesale order?",
    a: "We offer bulk pricing for quantities above 10 units of any single product, and wholesale pricing for registered retailers and distributors. Contact us via the Contact page or WhatsApp with your requirements.",
  },
];

export default function FAQPage() {
  const tenant = getTenant();
  return (
    <>
      <section className="bg-gradient-to-br from-brand-50 to-accent-50 border-b border-border">
        <div className="container-tight py-12 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-brand-900">Frequently Asked Questions</h1>
          <p className="text-muted-foreground mt-2">Can&apos;t find your answer? <Link href="/contact/" className="text-brand hover:underline font-semibold">Contact us</Link>.</p>
        </div>
      </section>

      <section className="py-14">
        <div className="container-tight max-w-3xl mx-auto">
          <div className="space-y-3">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="group border border-border rounded-xl bg-white overflow-hidden">
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer font-semibold text-brand-900 select-none list-none hover:bg-brand-50 transition-colors">
                  {q}
                  <span className="shrink-0 w-6 h-6 rounded-full bg-brand-50 group-open:bg-brand flex items-center justify-center text-brand group-open:text-white transition-all text-lg leading-none">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 pt-1">
                  <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center bg-brand-50 rounded-2xl p-8">
            <h3 className="font-bold text-brand-900 mb-2">Still have questions?</h3>
            <p className="text-sm text-muted-foreground mb-5">We&apos;re happy to help — reach out via WhatsApp or email.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {tenant.contact.whatsapp && (
                <a
                  href={`https://wa.me/${tenant.contact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  WhatsApp Us
                </a>
              )}
              <Link
                href="/contact/"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-brand text-brand text-sm font-semibold hover:bg-brand-50 transition-colors"
              >
                Send a Message
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
