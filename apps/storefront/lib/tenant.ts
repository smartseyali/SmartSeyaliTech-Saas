/**
 * Tenant configuration — read at BUILD TIME via TENANT_SLUG env var.
 *
 * Each tenant gets one Next.js build → deployed to public_html/tenants/{slug}/
 * on Hostinger. The build is fully static; tenant identity is baked in.
 *
 * Phase 3: hardcoded tenant registry (mocked).
 * Phase 6: replace with Supabase fetch at build time.
 */

export type TenantTheme = {
  primary: string;
  primaryDark: string;
  accent: string;
  font: string;
};

export type TenantConfig = {
  slug: string;
  brandName: string;
  tagline: string;
  description: string;
  logo: string;
  favicon?: string;
  theme: TenantTheme;
  contact: {
    email: string;
    phone: string;
    whatsapp?: string;
    address: string;
  };
  social?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
  analytics: {
    gtmId?: string;
    metaPixelId?: string;
    googleAdsId?: string;
    googleSiteVerification?: string;
  };
  primaryDomain?: string;
  /** Supabase company_id — set via NEXT_PUBLIC_COMPANY_ID at build time */
  companyId?: number;
  /** Prefix for storefront order numbers, e.g. "PATTI" → PATTI-XYZ123 */
  orderPrefix?: string;
  /** Razorpay publishable key — set via NEXT_PUBLIC_RAZORPAY_KEY_ID */
  razorpayKeyId?: string;
};

const TENANTS: Record<string, TenantConfig> = {
  pattikadai: {
    slug: "pattikadai",
    brandName: "Pattikadai",
    tagline: "Authentic tradition, crafted by Grandma's hands",
    description:
      "Pure, healthy, preservative-free country foods inspired by traditional South Indian cooking. Cold-pressed oils, hand-pounded spices, organic millets, and more — delivered to your door.",
    logo: "/logo.png",
    theme: {
      primary: "#1a472a",
      primaryDark: "#0f2e1c",
      accent: "#ff8e1a",
      font: "Poppins",
    },
    contact: {
      email: "hello@pattikadai.com",
      phone: "+91 90477 36612",
      whatsapp: "919047736612",
      address: "SR Nagar, Tiruppur, Tamil Nadu",
    },
    social: {
      instagram: "https://instagram.com/pattikadai",
      facebook: "https://facebook.com/pattikadai",
    },
    analytics: {
      gtmId: process.env.NEXT_PUBLIC_GTM_ID,
      metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID,
      googleAdsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID,
      googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
    primaryDomain: process.env.NEXT_PUBLIC_PRIMARY_DOMAIN,
    companyId: process.env.NEXT_PUBLIC_COMPANY_ID ? Number(process.env.NEXT_PUBLIC_COMPANY_ID) : undefined,
    orderPrefix: process.env.NEXT_PUBLIC_ORDER_PREFIX ?? "PATTI",
    razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  },
};

export function getTenant(): TenantConfig {
  const slug = (process.env.TENANT_SLUG || "pattikadai").toLowerCase();
  const tenant = TENANTS[slug];
  if (!tenant) {
    throw new Error(
      `Unknown TENANT_SLUG="${slug}". Known tenants: ${Object.keys(TENANTS).join(", ")}`
    );
  }
  return tenant;
}

export function getSiteUrl(): string {
  const tenant = getTenant();
  if (tenant.primaryDomain) return tenant.primaryDomain.replace(/\/$/, "");
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  return `https://${tenant.slug}.smartseyali.com`;
}
