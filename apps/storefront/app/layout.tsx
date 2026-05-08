import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { getTenant, getSiteUrl } from "@/lib/tenant";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { TenantScripts, TenantNoScript } from "@/components/analytics/TenantScripts";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { LiveDataProvider } from "@/contexts/LiveDataContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export function generateMetadata(): Metadata {
  const tenant = getTenant();
  const siteUrl = getSiteUrl();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${tenant.brandName} — ${tenant.tagline}`,
      template: `%s | ${tenant.brandName}`,
    },
    description: tenant.description,
    applicationName: tenant.brandName,
    icons: {
      icon: tenant.favicon || tenant.logo,
    },
    verification: tenant.analytics.googleSiteVerification
      ? { google: tenant.analytics.googleSiteVerification }
      : undefined,
  };
}

export const viewport: Viewport = {
  themeColor: "#1a472a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = getTenant();
  const themeStyle = {
    "--brand": tenant.theme.primary,
    "--brand-dark": tenant.theme.primaryDark,
    "--accent": tenant.theme.accent,
  } as React.CSSProperties;

  return (
    <html lang="en" className={poppins.variable} style={themeStyle} suppressHydrationWarning>
      <head>
        <TenantScripts />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <TenantNoScript />
        <LiveDataProvider>
          <StorefrontHeader />
          <main className="flex-1">{children}</main>
          <StorefrontFooter />
        </LiveDataProvider>
      </body>
    </html>
  );
}
