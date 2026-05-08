import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://smartseyali.com",
  ),
  title: {
    default: "SmartSeyali — Business Platform",
    template: "%s | SmartSeyali",
  },
  description:
    "Multi-tenant SaaS business platform for commerce, finance, HRMS, CRM, and analytics — built for growing companies in India.",
  applicationName: "SmartSeyali",
  generator: "Next.js",
  keywords: [
    "SaaS",
    "ERP",
    "ecommerce platform",
    "POS",
    "CRM",
    "HRMS",
    "inventory",
    "Tiruppur",
    "India",
  ],
  authors: [
    {
      name: "SmartSeyali",
      url: process.env.NEXT_PUBLIC_SITE_URL || "https://smartseyali.com",
    },
  ],
  creator: "SmartSeyali",
  publisher: "SmartSeyali",
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/icon.png" }],
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1419" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
