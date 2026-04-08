// ─── DocType Registry ──────────────────────────────────────────────────────
// Central import hub for all ERPNext-style document type definitions.
// Usage: import { REGISTRY } from "@/registry";
//        const def = REGISTRY.salesOrder;

import type { DocTypeDef } from "./types";

// ── Sales ──────────────────────────────────────────────────────────────────
import { salesOrder } from "./doctypes/sales-order";
import { salesQuotation } from "./doctypes/sales-quotation";
import { salesInvoice } from "./doctypes/sales-invoice";
import { salesCustomer } from "./doctypes/sales-customer";
import { receiptVoucher } from "./doctypes/receipt-voucher";

// ── Purchase ───────────────────────────────────────────────────────────────
import { purchaseOrder } from "./doctypes/purchase-order";
import { purchaseBill } from "./doctypes/purchase-bill";
import { vendor } from "./doctypes/vendor";

// ── Masters ────────────────────────────────────────────────────────────────
import { masterItem } from "./doctypes/master-item";
import { masterContact } from "./doctypes/master-contact";
import { masterCategory } from "./doctypes/master-category";
import { masterBrand } from "./doctypes/master-brand";
import { masterUom } from "./doctypes/master-uom";
import { masterTax } from "./doctypes/master-tax";
import { masterAttribute } from "./doctypes/master-attribute";
import { masterChartOfAccounts } from "./doctypes/master-chart-of-accounts";
import { masterFiscalYear } from "./doctypes/master-fiscal-year";
import { masterPriceList } from "./doctypes/master-price-list";
import { masterPricing } from "./doctypes/master-pricing";
import { masterReview } from "./doctypes/master-review";
import { masterRole } from "./doctypes/master-role";
import { masterSkuPattern } from "./doctypes/master-sku-pattern";
import { masterSubcategory } from "./doctypes/master-subcategory";
import { masterUser } from "./doctypes/master-user";
import { masterVariant } from "./doctypes/master-variant";

// ── Inventory ──────────────────────────────────────────────────────────────
import { inventoryItem } from "./doctypes/inventory-item";
import { stockLevel } from "./doctypes/stock-level";

// ── CRM ────────────────────────────────────────────────────────────────────
import { crmContact } from "./doctypes/crm-contact";
import { crmDeal } from "./doctypes/crm-deal";
import { crmLead } from "./doctypes/crm-lead";
import { crmAccount } from "./doctypes/crm-account";
import { crmSegment } from "./doctypes/crm-segment";

// ── HRMS ───────────────────────────────────────────────────────────────────
import { hrmsEmployee } from "./doctypes/hrms-employee";

// ── WhatsApp ───────────────────────────────────────────────────────────────
import { whatsappTemplate } from "./doctypes/whatsapp-template";
import { whatsappAccount } from "./doctypes/whatsapp-account";
import { whatsappLog } from "./doctypes/whatsapp-log";

// ── Website ───────────────────────────────────────────────────────────────
import { blogPost } from "./doctypes/blog-post";
import { webEnquiry } from "./doctypes/web-enquiry";
import { galleryItem } from "./doctypes/gallery-item";
import { webFaq } from "./doctypes/web-faq";
import { webPage } from "./doctypes/web-page";

// ── Website CMS ───────────────────────────────────────────────────────────
import { webMedia } from "./doctypes/web-media";
import { webTemplate } from "./doctypes/web-template";
import { webPageSection } from "./doctypes/web-page-section";
import { webComponent } from "./doctypes/web-component";
import { webForm } from "./doctypes/web-form";
import { webFormSubmission } from "./doctypes/web-form-submission";
import { webSeoMeta } from "./doctypes/web-seo-meta";
import { webContentVersion } from "./doctypes/web-content-version";

// ── Website Business Engine ───────────────────────────────────────────────
import { webGroup } from "./doctypes/web-group";
import { webRegistration } from "./doctypes/web-registration";
import { webSchedule } from "./doctypes/web-schedule";
import { webPricing } from "./doctypes/web-pricing";
import { webPayment } from "./doctypes/web-payment";
import { webPaymentOrder } from "./doctypes/web-payment-order";
import { webPaymentGateway } from "./doctypes/web-payment-gateway";
import { webCredential } from "./doctypes/web-credential";

// ── Website Custom Fields ─────────────────────────────────────────────────
import { webCustomFieldDef } from "./doctypes/web-custom-field-def";

// ── Website Advanced ──────────────────────────────────────────────────────
import { webEvent } from "./doctypes/web-event";
import { webEventRegistration } from "./doctypes/web-event-registration";
import { webTestimonial } from "./doctypes/web-testimonial";
import { webAutomationRule } from "./doctypes/web-automation-rule";
import { webApiKey } from "./doctypes/web-api-key";
import { webTranslation } from "./doctypes/web-translation";

// ── Ecommerce ─────────────────────────────────────────────────────────────
import { ecomCustomer } from "./doctypes/ecom-customer";

// ── Print Formats ─────────────────────────────────────────────────────────
import { printFormat } from "./doctypes/print-format";

// ── Platform (Super Admin) ────────────────────────────────────────────────
import { platformPlan } from "./doctypes/platform-plan";
import { platformModule } from "./doctypes/platform-module";

// ── Registry Object ────────────────────────────────────────────────────────

export const REGISTRY: Record<string, DocTypeDef> = {
  // Sales
  salesOrder,
  salesQuotation,
  salesInvoice,
  salesCustomer,
  receiptVoucher,

  // Purchase
  purchaseOrder,
  purchaseBill,
  vendor,

  // Masters
  masterItem,
  masterContact,
  masterCategory,
  masterBrand,
  masterUom,
  masterTax,
  masterAttribute,
  masterChartOfAccounts,
  masterFiscalYear,
  masterPriceList,
  masterPricing,
  masterReview,
  masterRole,
  masterSkuPattern,
  masterSubcategory,
  masterUser,
  masterVariant,

  // Inventory
  inventoryItem,
  stockLevel,

  // CRM
  crmContact,
  crmDeal,
  crmLead,
  crmAccount,
  crmSegment,

  // HRMS
  hrmsEmployee,

  // Ecommerce
  ecomCustomer,

  // Print Formats
  printFormat,

  // WhatsApp
  whatsappTemplate,
  whatsappAccount,
  whatsappLog,

  // Website
  blogPost,
  webEnquiry,
  galleryItem,
  webFaq,
  webPage,

  // Website CMS
  webMedia,
  webTemplate,
  webPageSection,
  webComponent,
  webForm,
  webFormSubmission,
  webSeoMeta,
  webContentVersion,

  // Website Business Engine
  webGroup,
  webRegistration,
  webSchedule,
  webPricing,
  webPayment,
  webPaymentOrder,
  webPaymentGateway,
  webCredential,

  // Website Custom Fields
  webCustomFieldDef,

  // Website Advanced
  webEvent,
  webEventRegistration,
  webTestimonial,
  webAutomationRule,
  webApiKey,
  webTranslation,

  // Platform (Super Admin)
  platformPlan,
  platformModule,
};

// ── Helpers ────────────────────────────────────────────────────────────────

/** Get a DocType by its registry key. Throws if not found. */
export function getDocType(key: string): DocTypeDef {
  const def = REGISTRY[key];
  if (!def) throw new Error(`DocType "${key}" not found in registry`);
  return def;
}

/** Look up a DocTypeDef by its Supabase table name. */
export function getDocTypeByTable(tableName: string): DocTypeDef | undefined {
  return Object.values(REGISTRY).find((d) => d.tableName === tableName);
}

/** Get all doctypes belonging to a module. */
export function getDocTypesByModule(module: string): DocTypeDef[] {
  return Object.values(REGISTRY).filter((d) => d.module === module);
}

// ── Re-exports ─────────────────────────────────────────────────────────────
export type {
  DocTypeDef,
  ERPField,
  DocColumn,
  StatusFlow,
  DocConversion,
  TabFields,
  FieldOption,
} from "./types";
