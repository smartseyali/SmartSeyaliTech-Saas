/**
 * Navigation Configuration — Data-driven sidebar menu
 *
 * Extracted from AppSidebar.tsx (699 lines → config + ~100 line component).
 * All module navigation is defined here and consumed by AppSidebar.
 */
import {
  LayoutDashboard, BarChart3, Boxes, LayoutGrid, Star, Library, Truck, MapPin,
  Tag, Zap, RotateCcw, ShoppingBag, ImageIcon, Check, Globe2, Globe,
  ShoppingCart as EcomCart, CreditCard, Settings, ShieldCheck, Users,
  Layout, Rocket, Box, FileInput, Building2, Database,
  Key, Flag, Hash, Scale, Activity, MessageSquare, Smartphone,
  Clock, Layers, ListTree, Ruler, DollarSign, Percent, Share2,
  Landmark, BookOpen, PieChart, ArrowLeftRight, Receipt, TrendingUp,
  UserPlus, Award, Palette, CalendarDays, Languages, GraduationCap,
  FileText, Bot, MessageCircle, Megaphone, Mail, Eye,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────────────────── */

export interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  resource?: string;
  subItems?: NavItem[];
}

export interface NavGroup {
  label: string;
  icon: React.ElementType;
  module?: string;
  items: NavItem[];
}

/* ── Module Navigation Map ─────────────────────────────────────────────────── */

export const MODULE_NAV: Record<string, NavGroup[]> = {
  ecommerce: [
    // Template selection happens once during onboarding registration and is handled
    // by the super admin via /super-admin/deployments. Tenants don't manage templates
    // directly — so no "Storefront → Template" sidebar item here.
    {
      label: "Website & Media",
      icon: Layout,
      items: [
        { title: "Landing Banners", url: "/apps/ecommerce/banners", icon: Layout, resource: "marketing" },
        { title: "Gallery", url: "/apps/ecommerce/gallery", icon: ImageIcon, resource: "products" },
      ],
    },
    {
      label: "Sales & Invoicing",
      icon: ShoppingBag,
      items: [
        { title: "E-comm Orders", url: "/apps/ecommerce/orders", icon: EcomCart, resource: "orders" },
        { title: "Customers", url: "/apps/ecommerce/customers", icon: Users, resource: "orders" },
        { title: "Delivery Challans", url: "/apps/ecommerce/deliveries", icon: Truck, resource: "orders" },
        { title: "Sales Returns", url: "/apps/ecommerce/refunds", icon: RotateCcw, resource: "orders" },
        { title: "Abandoned Carts", url: "/apps/ecommerce/abandoned-carts", icon: ShoppingBag, resource: "orders" },
      ],
    },
    {
      label: "Marketing",
      icon: Zap,
      items: [
        { title: "Coupons", url: "/apps/ecommerce/coupons", icon: Tag, resource: "marketing" },
        { title: "Offers", url: "/apps/ecommerce/offers", icon: Zap, resource: "marketing" },
        { title: "Reviews", url: "/apps/ecommerce/reviews", icon: Star, resource: "marketing" },
      ],
    },
    {
      label: "Analytics",
      icon: BarChart3,
      items: [
        { title: "Analytics", url: "/apps/ecommerce/analytics", icon: Zap, resource: "analytics" },
        { title: "Reports", url: "/apps/ecommerce/reports", icon: BarChart3, resource: "analytics" },
      ],
    },
    {
      label: "Settings",
      icon: Settings,
      items: [
        { title: "Website Settings", url: "/apps/ecommerce/website", icon: Globe2, resource: "settings" },
        { title: "Domain & Hosting", url: "/apps/ecommerce/domain", icon: Globe, resource: "settings" },
        { title: "Billing & GST", url: "/apps/ecommerce/billing", icon: CreditCard, resource: "settings" },
        { title: "Team", url: "/apps/ecommerce/team", icon: Users, resource: "team" },
        { title: "Payments", url: "/apps/ecommerce/payment-gateways", icon: ShieldCheck, resource: "settings" },
        { title: "Shipping Zones", url: "/apps/ecommerce/shipping-zones", icon: MapPin, resource: "settings" },
        { title: "API & Integrations", url: "/apps/ecommerce/api-integrations", icon: Zap, resource: "settings" },
        { title: "General Settings", url: "/apps/ecommerce/settings", icon: Settings, resource: "settings" },
      ],
    },
  ],

  crm: [
    {
      label: "Sales Pipeline",
      icon: Zap,
      items: [
        { title: "Leads", url: "/apps/crm/leads", icon: Users, resource: "leads" },
        { title: "Deal Pipeline", url: "/apps/crm/deals", icon: ShoppingBag, resource: "deals" },
        { title: "Segments", url: "/apps/crm/segments", icon: Tag, resource: "marketing" },
        { title: "Sales Forecast", url: "/apps/crm/forecast", icon: BarChart3, resource: "analytics" },
      ],
    },
  ],

  pos: [
    {
      label: "Point of Sale",
      icon: LayoutGrid,
      items: [
        { title: "Terminal", url: "/apps/pos/terminal", icon: Zap, resource: "orders" },
        { title: "Register", url: "/apps/pos/register", icon: CreditCard, resource: "orders" },
        { title: "POS Orders", url: "/apps/pos/orders", icon: ShoppingBag, resource: "orders" },
      ],
    },
  ],

  inventory: [
    {
      label: "Stock & Godown",
      icon: Boxes,
      items: [
        { title: "Current Stock", url: "/apps/inventory/levels", icon: BarChart3, resource: "products" },
        { title: "Warehouses", url: "/apps/inventory/warehouses", icon: MapPin, resource: "settings" },
        { title: "Stock Transfers", url: "/apps/inventory/transfers", icon: Truck, resource: "products" },
        { title: "Stock Audits", url: "/apps/inventory/audits", icon: Check, resource: "products" },
        { title: "Batch / Expiry", url: "/apps/inventory/batches", icon: Tag, resource: "products" },
      ],
    },
  ],

  hrms: [
    {
      label: "People Management",
      icon: Users,
      items: [
        { title: "Employee Directory", url: "/apps/hrms/employees", icon: Users, resource: "team" },
        { title: "Onboarding", url: "/apps/hrms/induction", icon: Rocket, resource: "team" },
        { title: "Departments", url: "/apps/hrms/departments", icon: LayoutGrid, resource: "team" },
        { title: "Appraisals", url: "/apps/hrms/appraisals", icon: Star, resource: "team" },
      ],
    },
    {
      label: "Attendance & Payroll",
      icon: Zap,
      items: [
        { title: "Attendance", url: "/apps/hrms/attendance", icon: Check, resource: "attendance" },
        { title: "Leave Tracker", url: "/apps/hrms/leaves", icon: MapPin, resource: "attendance" },
        { title: "Employee Claims", url: "/apps/hrms/claims", icon: CreditCard, resource: "attendance" },
        { title: "Payroll Cycles", url: "/apps/hrms/payroll", icon: CreditCard, resource: "payroll" },
      ],
    },
  ],

  purchase: [
    {
      label: "Procurement",
      icon: ShoppingBag,
      items: [
        { title: "Purchase Requests", url: "/apps/purchase/requests", icon: FileInput, resource: "orders" },
        { title: "Purchase Orders (PO)", url: "/apps/purchase/orders", icon: ShoppingBag, resource: "orders" },
        { title: "Goods Receipt (GRN)", url: "/apps/purchase/receipts", icon: Box, resource: "orders" },
        { title: "Supplier Bills (AP)", url: "/apps/purchase/bills", icon: CreditCard, resource: "orders" },
      ],
    },
  ],

  whatsapp: [
    {
      label: "Messaging",
      icon: MessageSquare,
      items: [
        { title: "Contacts", url: "/apps/whatsapp/contacts", icon: Users, resource: "contacts" },
        { title: "Templates", url: "/apps/whatsapp/templates", icon: FileText, resource: "marketing" },
        { title: "Campaigns", url: "/apps/whatsapp/campaigns", icon: Megaphone, resource: "marketing" },
      ],
    },
    {
      label: "Conversations",
      icon: MessageCircle,
      items: [
        { title: "Agent Inbox", url: "/apps/whatsapp/inbox", icon: Mail, resource: "support" },
        { title: "All Conversations", url: "/apps/whatsapp/conversations", icon: MessageCircle, resource: "support" },
        { title: "Bot Rules", url: "/apps/whatsapp/bot-rules", icon: Bot, resource: "automation" },
      ],
    },
    {
      label: "Insights",
      icon: BarChart3,
      items: [
        { title: "Analytics", url: "/apps/whatsapp/analytics", icon: Eye, resource: "analytics" },
        { title: "Logs", url: "/apps/whatsapp/logs", icon: Clock, resource: "settings" },
        { title: "Accounts", url: "/apps/whatsapp/accounts", icon: Smartphone, resource: "settings" },
      ],
    },
  ],

  website: [
    // Template selection is a super-admin-managed flow — tenants pick once during
    // onboarding, so no "Storefront → Template" sidebar item for them.
    {
      label: "Content",
      icon: Layout,
      items: [
        { title: "Web Pages", url: "/apps/website/pages", icon: Globe2, resource: "settings" },
        { title: "Blog Posts", url: "/apps/website/blog", icon: BookOpen, resource: "marketing" },
        { title: "Media Library", url: "/apps/website/media", icon: ImageIcon, resource: "marketing" },
        { title: "Components", url: "/apps/website/components", icon: Layers, resource: "settings" },
      ],
    },
    {
      label: "Design",
      icon: Palette,
      items: [
        { title: "Templates", url: "/apps/website/templates", icon: Layout, resource: "settings" },
        { title: "Navigation Menu", url: "/apps/website/menu", icon: ListTree, resource: "settings" },
      ],
    },
    {
      label: "Operations",
      icon: Rocket,
      items: [
        { title: "Groups", url: "/apps/website/groups", icon: Layers, resource: "products" },
        { title: "Schedules", url: "/apps/website/schedules", icon: CalendarDays, resource: "products" },
      ],
    },
    {
      label: "Registrations",
      icon: UserPlus,
      items: [
        { title: "Registrations", url: "/apps/website/registrations", icon: UserPlus, resource: "orders" },
        { title: "Pricing Plans", url: "/apps/website/pricing", icon: DollarSign, resource: "settings" },
        { title: "Payments", url: "/apps/website/payments", icon: CreditCard, resource: "orders" },
        { title: "Payment Orders", url: "/apps/website/payment-orders", icon: Receipt, resource: "orders" },
        { title: "Credentials", url: "/apps/website/credentials", icon: Award, resource: "orders" },
      ],
    },
    {
      label: "Engagement",
      icon: Users,
      items: [
        { title: "Enquiries", url: "/apps/website/enquiries", icon: MessageSquare, resource: "leads" },
        { title: "Form Builder", url: "/apps/website/forms", icon: FileInput, resource: "settings" },
        { title: "Form Responses", url: "/apps/website/form-submissions", icon: Database, resource: "leads" },
        { title: "Events", url: "/apps/website/events", icon: Flag, resource: "marketing" },
        { title: "Registrations", url: "/apps/website/event-registrations", icon: UserPlus, resource: "leads" },
        { title: "Testimonials", url: "/apps/website/testimonials", icon: Star, resource: "marketing" },
        { title: "FAQs", url: "/apps/website/faqs", icon: Library, resource: "settings" },
        { title: "Gallery", url: "/apps/website/gallery", icon: ImageIcon, resource: "marketing" },
      ],
    },
    {
      label: "Configuration",
      icon: Settings,
      items: [
        { title: "SEO Manager", url: "/apps/website/seo", icon: TrendingUp, resource: "settings" },
        { title: "Translations", url: "/apps/website/translations", icon: Languages, resource: "settings" },
        { title: "Automations", url: "/apps/website/automations", icon: Zap, resource: "settings" },
        { title: "API Keys", url: "/apps/website/api-keys", icon: Key, resource: "settings" },
        { title: "Content Versions", url: "/apps/website/versions", icon: Clock, resource: "settings" },
        { title: "Payment Gateways", url: "/apps/website/payment-gateways", icon: CreditCard, resource: "settings" },
        { title: "Custom Fields", url: "/apps/website/custom-fields", icon: Hash, resource: "settings" },
        { title: "Website Settings", url: "/apps/website/settings", icon: Settings, resource: "settings" },
      ],
    },
  ],

  sales: [
    {
      label: "Sales & Invoicing",
      icon: ShoppingBag,
      items: [
        { title: "Proforma Invoices", url: "/apps/sales/quotations", icon: Library, resource: "orders" },
        { title: "Sales Orders (SO)", url: "/apps/sales/orders", icon: ShoppingBag, resource: "orders" },
        { title: "Delivery Challans", url: "/apps/sales/deliveries", icon: Truck, resource: "orders" },
        { title: "Sales Tax Invoices", url: "/apps/sales/invoices", icon: CreditCard, resource: "orders" },
        { title: "Payment Receipts", url: "/apps/sales/payments", icon: Zap, resource: "orders" },
      ],
    },
  ],

  finance: [
    {
      label: "Accounts & Books",
      icon: BookOpen,
      items: [
        { title: "Journal Entries", url: "/apps/finance/journal-entries", icon: Receipt, resource: "settings" },
        { title: "General Ledger", url: "/apps/finance/ledger", icon: BookOpen, resource: "settings" },
        { title: "Chart of Accounts", url: "/apps/finance/coa", icon: ListTree, resource: "settings" },
        { title: "Trial Balance", url: "/apps/finance/trial-balance", icon: Scale, resource: "settings" },
      ],
    },
    {
      label: "Financial Reports",
      icon: PieChart,
      items: [
        { title: "Profit & Loss", url: "/apps/finance/profit-loss", icon: TrendingUp, resource: "analytics" },
        { title: "Balance Sheet", url: "/apps/finance/balance-sheet", icon: BarChart3, resource: "analytics" },
      ],
    },
    {
      label: "Banking",
      icon: Landmark,
      items: [
        { title: "Bank Accounts", url: "/apps/finance/bank-accounts", icon: Landmark, resource: "settings" },
        { title: "Reconciliation", url: "/apps/finance/reconciliation", icon: ArrowLeftRight, resource: "settings" },
      ],
    },
    {
      label: "Tax & Compliance",
      icon: Percent,
      items: [
        { title: "GST & Tax Config", url: "/apps/finance/tax-config", icon: Percent, resource: "settings" },
      ],
    },
  ],
};

/* ── Core Navigation (always visible) ──────────────────────────────────────── */

export const CORE_NAV: NavGroup[] = [
  {
    label: "Master Data",
    module: "masters",
    icon: Database,
    items: [
      {
        title: "Masters",
        url: "/apps/masters",
        icon: Database,
        resource: "products",
        subItems: [
          { title: "Items", url: "/apps/masters/items", icon: Box, resource: "products" },
          { title: "Categories", url: "/apps/masters/categories", icon: ListTree, resource: "products" },
          { title: "Brands", url: "/apps/masters/brands", icon: Flag, resource: "products" },
          { title: "Units (UOM)", url: "/apps/masters/uoms", icon: Hash, resource: "products" },
          { title: "Tax Rules", url: "/apps/masters/tax", icon: Percent, resource: "settings" },
          { title: "Price Lists", url: "/apps/masters/pricing", icon: DollarSign, resource: "settings" },
          { title: "Contacts", url: "/apps/masters/contacts", icon: Users, resource: "leads" },
          { title: "Chart of Accounts", url: "/apps/masters/coa", icon: LayoutGrid, resource: "settings" },
          { title: "Fiscal Years", url: "/apps/masters/fiscal-years", icon: Clock, resource: "settings" },
        ],
      },
      { title: "Users", url: "/apps/masters/users", icon: Users, resource: "users" },
      { title: "Roles", url: "/apps/masters/roles", icon: ShieldCheck, resource: "users" },
      { title: "Print Formats", url: "/apps/masters/print-formats", icon: FileText, resource: "settings" },
    ],
  },
];

/* ── Industry label overrides ──────────────────────────────────────────────── */

export const INDUSTRY_LABELS: Record<string, Record<string, Record<string, string>>> = {
  education: {
    labels: {
      "Catalog & Media": "Academic Content",
      "Sales & Logistics": "Student Records",
      "Marketing & Growth": "Student Success",
    },
    items: {
      "/ecommerce/masters/products": "Academic Courses",
      "/ecommerce/masters/categories": "Departmental Units",
      "/ecommerce/orders": "Student Enrollments",
      "/ecommerce/customers": "Student Database",
    },
  },
  services: {
    labels: {
      "Catalog & Media": "Service Portfolio",
      "Sales & Logistics": "Booking Ops",
    },
    items: {
      "/ecommerce/masters/products": "Available Services",
      "/ecommerce/orders": "Booked Appointments",
      "/ecommerce/customers": "Client Records",
    },
  },
};

/* ── Helpers ───────────────────────────────────────────────────────────────── */

/** Peripheral modules — sidebar stays in the parent module context */
export const PERIPHERAL_MODULES = ["masters", "settings", "documents", "projects"];

/**
 * Detect active module from pathname.
 * Peripheral modules (masters, settings) don't switch the sidebar —
 * they return the last real module from localStorage.
 */
export function getCurrentModule(pathname: string): string {
  const match = pathname.match(/^\/apps\/([^/]+)/);
  if (!match) return localStorage.getItem("erp_active_module") || "ecommerce";

  const mod = match[1];

  // Peripheral modules keep the parent module's sidebar
  if (PERIPHERAL_MODULES.includes(mod)) {
    return localStorage.getItem("erp_active_module") || "ecommerce";
  }

  // Real module — cache it
  if (MODULE_NAV[mod]) {
    localStorage.setItem("erp_active_module", mod);
  }

  return mod;
}
