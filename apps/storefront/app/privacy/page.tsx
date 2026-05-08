import { getTenant, getSiteUrl } from "@/lib/tenant";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = getTenant();
  return {
    title: `Privacy Policy — ${tenant.brandName}`,
    description: `How ${tenant.brandName} collects, uses, and protects your personal information.`,
    alternates: { canonical: `${getSiteUrl()}/privacy/` },
    robots: { index: false },
  };
}

export default function PrivacyPage() {
  const tenant = getTenant();
  const updated = "1 May 2025";

  return (
    <main className="container-tight py-16 max-w-3xl">
      <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: {updated}</p>

      <div className="prose prose-sm max-w-none text-foreground space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
          <p>
            When you place an order or contact us, we collect your name, email address, phone
            number, and delivery address. We also collect usage data (pages visited, browser
            type) via analytics tools like Google Tag Manager.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To process and deliver your orders</li>
            <li>To send order confirmation and shipping updates</li>
            <li>To respond to your enquiries</li>
            <li>To improve our website and product range</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Sharing Your Information</h2>
          <p>
            We do not sell your personal data. We share your information only with:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Logistics partners (courier companies) to fulfil deliveries
            </li>
            <li>
              Payment processors (Razorpay) to handle transactions securely
            </li>
            <li>
              Analytics services (Google Analytics) under their own privacy policies
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Data Retention</h2>
          <p>
            We retain order records for 7 years for accounting and legal compliance. Marketing
            analytics data is retained for 26 months.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Cookies</h2>
          <p>
            We use essential cookies (cart, session) and analytics cookies (Google Tag Manager).
            You may disable non-essential cookies in your browser settings; this will not affect
            your ability to place an order.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data at any
            time by emailing us at{" "}
            <a href={`mailto:${tenant.contact.email}`} className="text-brand underline">
              {tenant.contact.email}
            </a>
            . We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Security</h2>
          <p>
            All data is transmitted over HTTPS. Payments are processed via Razorpay's
            PCI-DSS-compliant gateway — we never store card details on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. The revised policy will be posted on
            this page with a new "Last updated" date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Contact Us</h2>
          <p>
            For privacy-related queries, contact us at:
          </p>
          <address className="not-italic mt-2 text-sm">
            <strong>{tenant.brandName}</strong>
            <br />
            {tenant.contact.address}
            <br />
            <a href={`mailto:${tenant.contact.email}`} className="text-brand underline">
              {tenant.contact.email}
            </a>
            <br />
            <a href={`tel:${tenant.contact.phone.replace(/\s/g, "")}`} className="text-brand underline">
              {tenant.contact.phone}
            </a>
          </address>
        </section>
      </div>
    </main>
  );
}
