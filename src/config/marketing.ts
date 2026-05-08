// Single source of truth for marketing site module data.
// Used by FeaturesContent, ProductsContent, and any marketing component that lists modules.
// Do NOT import this in app-side components — use src/config/modules.ts for that.

import {
  ShoppingCart, Monitor, Target, TrendingUp, Package, ShoppingBag,
  Users, BarChart3, MessageCircle, Globe, Database, type LucideIcon,
} from "lucide-react";

export type MarketingModule = {
  slug: string;
  name: string;
  tagline: string;       // short one-liner used in card headers
  description: string;   // longer marketing copy used in expanded views
  features: string[];    // up to 6 bullets; FeaturesContent shows first 4
  icon: LucideIcon;
  color: string;         // Tailwind gradient e.g. "from-blue-500 to-blue-600"
  categories: string[];  // filter slugs used by ProductsContent
};

export const MARKETING_MODULES: MarketingModule[] = [
  {
    slug: "ecommerce",
    name: "E-Commerce",
    tagline: "Multi-tenant storefronts, cart, checkout, and order management.",
    description:
      "Launch branded online stores with full inventory sync, Razorpay/PhonePe payments, GST invoicing, and real-time order tracking — all in one platform.",
    features: [
      "Multi-tenant storefronts",
      "Cart & checkout",
      "Order management",
      "Payment gateways",
      "GST invoicing",
      "Storefront SEO",
    ],
    icon: ShoppingCart,
    color: "from-blue-500 to-blue-600",
    categories: ["commerce"],
  },
  {
    slug: "pos",
    name: "Point of Sale",
    tagline: "Lightning-fast counter sales with real-time inventory sync.",
    description:
      "Offline-capable POS designed for Indian retail. Works across multiple outlets with barcode scanning, receipt printing, and end-of-day reports.",
    features: [
      "Multi-outlet POS",
      "Offline capability",
      "Barcode scanning",
      "Receipt printing",
      "Real-time stock sync",
      "EOD reports",
    ],
    icon: Monitor,
    color: "from-violet-500 to-violet-600",
    categories: ["commerce"],
  },
  {
    slug: "crm",
    name: "CRM",
    tagline: "Visual sales pipeline, lead scoring, and customer analytics.",
    description:
      "Manage your entire customer lifecycle — from first lead to long-term retention — with a Kanban pipeline, auto-scoring, and built-in WhatsApp follow-ups.",
    features: [
      "Visual Kanban pipeline",
      "Lead scoring",
      "Activity tracking",
      "WhatsApp integration",
      "Customer 360°",
      "Email sequences",
    ],
    icon: Target,
    color: "from-orange-500 to-red-500",
    categories: ["customer"],
  },
  {
    slug: "sales",
    name: "Sales Management",
    tagline: "Quote-to-cash with approval flows and territory management.",
    description:
      "Streamline your B2B sales cycle from quotation to payment collection. Includes multi-level approvals, distributor management, and commission tracking.",
    features: [
      "Quotations & proposals",
      "Multi-level approvals",
      "Territory management",
      "Commission tracking",
      "Collection follow-ups",
      "Target vs actual",
    ],
    icon: TrendingUp,
    color: "from-indigo-500 to-indigo-600",
    categories: ["commerce", "customer"],
  },
  {
    slug: "inventory",
    name: "Inventory",
    tagline: "Multi-warehouse stock with batch, serial, and expiry tracking.",
    description:
      "Full warehouse management with bin-level tracking, FIFO/FEFO valuation, reorder automation, and multi-location transfers.",
    features: [
      "Multi-warehouse",
      "Batch & serial tracking",
      "Expiry management",
      "Reorder automation",
      "Stock transfers",
      "Valuation methods",
    ],
    icon: Package,
    color: "from-yellow-500 to-orange-500",
    categories: ["operations"],
  },
  {
    slug: "purchase",
    name: "Purchase",
    tagline: "Vendor management, POs, and goods receipt automation.",
    description:
      "Automate procurement from purchase request to vendor payment. Includes vendor scorecards, 3-way matching, and TDS/GST compliance.",
    features: [
      "PO automation",
      "Vendor scorecards",
      "3-way matching",
      "GRN processing",
      "Payment terms",
      "TDS & GST",
    ],
    icon: ShoppingBag,
    color: "from-pink-500 to-rose-500",
    categories: ["operations"],
  },
  {
    slug: "hrms",
    name: "HRMS",
    tagline: "Payroll, attendance, and performance — fully Indian law compliant.",
    description:
      "End-to-end HR automation with statutory compliance (PF, ESI, PT, TDS), biometric integration, leave management, and employee self-service portal.",
    features: [
      "Payroll automation",
      "PF, ESI, PT compliance",
      "Biometric integration",
      "Leave management",
      "Self-service portal",
      "Appraisals",
    ],
    icon: Users,
    color: "from-green-500 to-teal-500",
    categories: ["people"],
  },
  {
    slug: "finance",
    name: "Finance & Accounting",
    tagline: "GST filing, multi-currency books, and real-time P&L.",
    description:
      "Fully automated accounting with real-time financial statements, GST return preparation, multi-currency support, and bank reconciliation.",
    features: [
      "Automated invoicing",
      "GST compliance",
      "Multi-currency",
      "Real-time P&L",
      "Bank reconciliation",
      "Budgeting",
    ],
    icon: BarChart3,
    color: "from-teal-500 to-cyan-500",
    categories: ["finance"],
  },
  {
    slug: "whatsapp",
    name: "WhatsApp Integration",
    tagline: "Order alerts, broadcasts, and support via WhatsApp Business API.",
    description:
      "Connect your business to WhatsApp Business API. Send transactional notifications, run broadcast campaigns, and handle customer support in one inbox.",
    features: [
      "Order notifications",
      "Broadcast campaigns",
      "Two-way chat inbox",
      "Template library",
      "Auto-replies",
      "Team assignment",
    ],
    icon: MessageCircle,
    color: "from-green-500 to-green-600",
    categories: ["customer"],
  },
  {
    slug: "website",
    name: "Website Builder",
    tagline: "Branded storefronts and landing pages without code.",
    description:
      "Build SEO-optimised marketing sites and e-commerce storefronts with built-in forms, blog, and analytics — no developer needed.",
    features: [
      "Drag-and-drop editor",
      "SEO-ready themes",
      "Custom domains",
      "Built-in blog",
      "Lead capture forms",
      "Analytics integration",
    ],
    icon: Globe,
    color: "from-sky-500 to-cyan-500",
    categories: ["analytics"],
  },
  {
    slug: "masters",
    name: "Master Data Hub",
    tagline: "Single source of truth for products, customers, and vendors.",
    description:
      "Centralise and govern your master data — products, customers, vendors, and chart of accounts — so every module works from the same verified record.",
    features: [
      "Product master",
      "Customer master",
      "Vendor master",
      "Chart of accounts",
      "Price lists",
      "Tax configurations",
    ],
    icon: Database,
    color: "from-slate-500 to-slate-600",
    categories: ["operations", "analytics"],
  },
];

export const MARKETING_MODULE_CATEGORIES = [
  { value: "all", label: "All Products" },
  { value: "commerce", label: "Commerce & POS" },
  { value: "finance", label: "Finance" },
  { value: "people", label: "HRMS & People" },
  { value: "customer", label: "CRM & Sales" },
  { value: "operations", label: "Operations" },
  { value: "analytics", label: "Analytics & Web" },
];
