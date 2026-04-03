import { lazy } from "react";

// ── Existing Pages ────────────────────────────────────────────────────────
const WebsiteDashboard = lazy(() => import("@/pages/modules/website/WebsiteDashboard"));
const BlogPosts = lazy(() => import("@/pages/modules/website/BlogPosts"));
const Enquiries = lazy(() => import("@/pages/modules/website/Enquiries"));
const GalleryManager = lazy(() => import("@/pages/modules/website/GalleryManager"));
const FAQs = lazy(() => import("@/pages/modules/website/FAQs"));
const WebPages = lazy(() => import("@/pages/modules/website/WebPages"));
const MenuManager = lazy(() => import("@/pages/modules/website/MenuManager"));
const WebsiteSettings = lazy(() => import("@/pages/modules/website/WebsiteSettings"));

// ── Phase 1: CMS Pages ───────────────────────────────────────────────────
const MediaLibrary = lazy(() => import("@/pages/modules/website/MediaLibrary"));
const Templates = lazy(() => import("@/pages/modules/website/Templates"));
const PageSections = lazy(() => import("@/pages/modules/website/PageSections"));
const Components = lazy(() => import("@/pages/modules/website/Components"));
const FormBuilder = lazy(() => import("@/pages/modules/website/FormBuilder"));
const FormSubmissions = lazy(() => import("@/pages/modules/website/FormSubmissions"));
const SEOManager = lazy(() => import("@/pages/modules/website/SEOManager"));
const ContentVersions = lazy(() => import("@/pages/modules/website/ContentVersions"));

// ── Phase 2: Business Engine Pages ───────────────────────────────────────
const Groups = lazy(() => import("@/pages/modules/website/Groups"));
const Registrations = lazy(() => import("@/pages/modules/website/Registrations"));
const Schedules = lazy(() => import("@/pages/modules/website/Schedules"));
const Pricing = lazy(() => import("@/pages/modules/website/Pricing"));
const Payments = lazy(() => import("@/pages/modules/website/Payments"));
const PaymentOrders = lazy(() => import("@/pages/modules/website/PaymentOrders"));
const PaymentGateways = lazy(() => import("@/pages/modules/website/PaymentGateways"));
const Credentials = lazy(() => import("@/pages/modules/website/Credentials"));

// ── Custom Fields ────────────────────────────────────────────────────────
const CustomFields = lazy(() => import("@/pages/modules/website/CustomFields"));

// ── Phase 3: Advanced Pages ──────────────────────────────────────────────
const Events = lazy(() => import("@/pages/modules/website/Events"));
const EventRegistrations = lazy(() => import("@/pages/modules/website/EventRegistrations"));
const Testimonials = lazy(() => import("@/pages/modules/website/Testimonials"));
const AutomationRules = lazy(() => import("@/pages/modules/website/AutomationRules"));
const ApiKeys = lazy(() => import("@/pages/modules/website/ApiKeys"));
const Translations = lazy(() => import("@/pages/modules/website/Translations"));

export const websiteRoutes = [
  // Dashboard
  { path: "/apps/website", element: <WebsiteDashboard /> },

  // Content
  { path: "/apps/website/pages", element: <WebPages /> },
  { path: "/apps/website/blog", element: <BlogPosts /> },
  { path: "/apps/website/media", element: <MediaLibrary /> },
  { path: "/apps/website/components", element: <Components /> },
  { path: "/apps/website/page-sections", element: <PageSections /> },

  // Design
  { path: "/apps/website/templates", element: <Templates /> },
  { path: "/apps/website/menu", element: <MenuManager /> },

  // Business Operations
  { path: "/apps/website/groups", element: <Groups /> },
  { path: "/apps/website/schedules", element: <Schedules /> },

  // Registrations & Payments
  { path: "/apps/website/registrations", element: <Registrations /> },
  { path: "/apps/website/pricing", element: <Pricing /> },
  { path: "/apps/website/payments", element: <Payments /> },
  { path: "/apps/website/payment-orders", element: <PaymentOrders /> },
  { path: "/apps/website/payment-gateways", element: <PaymentGateways /> },
  { path: "/apps/website/credentials", element: <Credentials /> },

  // Engagement
  { path: "/apps/website/enquiries", element: <Enquiries /> },
  { path: "/apps/website/forms", element: <FormBuilder /> },
  { path: "/apps/website/form-submissions", element: <FormSubmissions /> },
  { path: "/apps/website/events", element: <Events /> },
  { path: "/apps/website/event-registrations", element: <EventRegistrations /> },
  { path: "/apps/website/testimonials", element: <Testimonials /> },
  { path: "/apps/website/faqs", element: <FAQs /> },
  { path: "/apps/website/gallery", element: <GalleryManager /> },

  // Configuration
  { path: "/apps/website/seo", element: <SEOManager /> },
  { path: "/apps/website/translations", element: <Translations /> },
  { path: "/apps/website/automations", element: <AutomationRules /> },
  { path: "/apps/website/api-keys", element: <ApiKeys /> },
  { path: "/apps/website/versions", element: <ContentVersions /> },
  { path: "/apps/website/settings", element: <WebsiteSettings /> },
  { path: "/apps/website/custom-fields", element: <CustomFields /> },
];
