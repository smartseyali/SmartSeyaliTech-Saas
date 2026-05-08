import { getTenant, getSiteUrl } from "@/lib/tenant";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = getTenant();
  return {
    title: `Terms & Conditions — ${tenant.brandName}`,
    description: `Terms and conditions governing purchases from ${tenant.brandName}.`,
    alternates: { canonical: `${getSiteUrl()}/terms/` },
    robots: { index: false },
  };
}

export default function TermsPage() {
  const tenant = getTenant();
  const updated = "1 May 2025";

  return (
    <main className="container-tight py-16 max-w-3xl">
      <h1 className="text-3xl font-bold text-foreground mb-2">Terms &amp; Conditions</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: {updated}</p>

      <div className="prose prose-sm max-w-none text-foreground space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p>
            By placing an order on this website you agree to be bound by these terms and
            conditions. If you do not agree, please do not place an order.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Products</h2>
          <p>
            All products are described as accurately as possible. Product images are for
            illustrative purposes; actual colours and packaging may vary slightly. We reserve
            the right to discontinue any product without notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Pricing</h2>
          <p>
            Prices are in Indian Rupees (INR) and include applicable taxes unless stated
            otherwise. We reserve the right to change prices at any time. Orders are billed at
            the price shown at the time of checkout.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Orders &amp; Payment</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Orders are confirmed only after successful payment or COD acceptance.</li>
            <li>
              For Cash on Delivery (COD) orders, payment is due at the time of delivery.
            </li>
            <li>
              For Razorpay orders, payment is processed immediately. Your bank statement will
              show a charge from Razorpay / {tenant.brandName}.
            </li>
            <li>We reserve the right to cancel any order at our discretion.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Shipping &amp; Delivery</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>We ship within India only.</li>
            <li>Standard delivery takes 3–7 business days.</li>
            <li>Free shipping applies to orders above ₹999.</li>
            <li>
              Delivery timelines are estimates; we are not liable for delays caused by couriers
              or circumstances beyond our control.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Returns &amp; Refunds</h2>
          <p>
            We accept returns of damaged or incorrectly shipped items within 48 hours of
            delivery. To initiate a return, contact us at{" "}
            <a href={`mailto:${tenant.contact.email}`} className="text-brand underline">
              {tenant.contact.email}
            </a>{" "}
            with your order number and photos of the issue. Perishable food items cannot be
            returned unless damaged. Refunds are processed within 7–10 business days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Intellectual Property</h2>
          <p>
            All content on this website — including text, images, logos, and product
            descriptions — is the property of {tenant.brandName} and may not be reproduced
            without permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, {tenant.brandName} is not liable for any
            indirect, incidental, or consequential damages arising from your use of this website
            or our products.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Governing Law</h2>
          <p>
            These terms are governed by the laws of India. Any disputes shall be subject to
            the exclusive jurisdiction of the courts at Tiruppur, Tamil Nadu.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
          <address className="not-italic text-sm">
            <strong>{tenant.brandName}</strong>
            <br />
            {tenant.contact.address}
            <br />
            <a href={`mailto:${tenant.contact.email}`} className="text-brand underline">
              {tenant.contact.email}
            </a>
          </address>
        </section>
      </div>
    </main>
  );
}
