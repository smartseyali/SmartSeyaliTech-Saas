import { GTMScript, GTMNoScript } from "@/components/analytics/GTMScript";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GTMScript />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
      />
      <GTMNoScript />
      <PageViewTracker />
      <div className="light-forced min-h-screen flex flex-col bg-white text-gray-900">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </div>
    </>
  );
}
