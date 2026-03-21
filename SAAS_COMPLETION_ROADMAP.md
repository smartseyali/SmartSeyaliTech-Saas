# EcomSuite SaaS Application Completion Roadmap

## 1. Executive Summary: Current Stage
The SaaS application has laid down a robust and premium architectural foundation. The navigation structure (`AppSidebar.tsx`), Multi-Tenant Context routing (`TenantContext.tsx`), Base Authentication, and Global Master CRUD engines (`useCrud`, `ERPEntryForm`, `ERPListView`) are fully operational. Terminology across 54+ files has been seamlessly standardized into professional enterprise language.

However, a comprehensive audit reveals three major gaps that must be addressed to complete the SaaS product:
1. **Broken/Non-Functional Extant Screens:** Several screens are currently in place but experiencing data-fetching errors, UI bugs, or simply acting as static placeholders without working logic.
2. **Missing UI Placements:** Many screens exist in the navigation sidebar but route to a 404 "Not Found" because their underlying `.tsx` components have not been developed.
3. **Unplaced Mandatory ERP Screens:** Crucial, standard operational modules (like Bank Reconciliation, Stock Audits, and Tax Configurations) are entirely missing from both the codebase and the navigation structure. Furthermore, deep transactional workflows (e.g., Quotation -> Sales Order -> Invoice) lack proper state-machine linkage.

---

## 2. Broken & Non-Working Existing Screens
Screens that currently exist in the codebase but require a critical logic audit to ensure they actually save, load, and manipulate database records flawlessly:

- **E-Commerce & Storefront Nodes:** Ensure `Onboarding`, `Checkout`, and `API Integrations` properly record to the Supabase backend without silent failures. 
- **Analytics & Dashboards:** Most module dashboards (e.g., `CRMDashboard`, `SalesDashboard`, `HospitalDashboard`) are currently loading static or placeholder metrics instead of live Supabase/GraphQL aggregated queries.
- **Entry Form Calculations:** Validating that multi-item forms (like Invoices and Purchase Orders) mathematically calculate totals, taxes, and discounts flawlessly upon Save.

---

## 3. Missing Screens from Current Sidebar Navigation (To Be Built)
The following screens are explicitly linked in the sidebar but route to a 404/Empty container:

### 💼 CRM Module
- **Forecast (`/apps/crm/forecast`)**: Predictive analytics dashboard over deals.
- **Accounts (`/apps/crm/accounts`)**: Organizational-level groupings for B2B contacts.
- **Segments (`/apps/crm/segments`)**: Marketing segmentation engine.

### 📦 Point of Sale (POS) Module
- **Cash Register (`/apps/pos/register`)**: Daily opening/closing shift tracking.
- **Orders (`/apps/pos/orders`)**: POS-specific historical order registry.

### 🏭 Inventory / Warehousing Module
- **Stock Levels (`/apps/inventory/levels`)**: Aggregated ledger report of stock.
- **Transfers (`/apps/inventory/transfers`)**: Warehouse-to-warehouse stock transit protocol.

### 👥 HRMS (Human Resources) Module
- **Departments (`/apps/hrms/departments`)**: Org-chart categorization mapping.
- **Payroll Bridging (`/apps/hrms/payroll`)**: Route alignment between sidebar and router.

### 🛒 Purchase / Procurement & Finance Modules
- **Goods Receipt / GRN (`/apps/purchase/receipts`)**: Inventory receiving validation against open POs.
- **Receipt Vouchers (`/apps/invoicing/payments`)**: Incoming fund matching against open Invoices.

### 💳 Payroll Processing
- **Salary Structures (`/apps/payroll/structures`)**: Basic, HRA, allowance formulas setup.
- **Run Batch (`/apps/payroll/run`)**: Auto-generation script for monthly payslips.

---

## 4. Unplaced Mandatory ERP Screens (Critical Omissions)
For this system to function as a *complete* SaaS product, the following mandatory business screens must be physically added to both the Sidebar and the Routing framework:

1. **Finance & Accounting Foundation**
   - **Bank Reconciliation:** Interface to match system ledgers against uploaded bank statements.
   - **Financial Reports:** Trial Balance, Profit & Loss (P&L), and Balance Sheet generators.
   - **Tax Configurations:** Centralized VAT/GST slab management.
2. **Advanced Inventory Ops**
   - **Stock Reconciliation / Audits:** Tools to post adjusting entries when physical stock differs from system stock.
   - **Batch & Expiry Tracking:** Crucial for standard retail and medical SaaS applications.
3. **Core HRMS Expansions**
   - **Claim & Expense Management:** Employee reimbursement tracking against corporate budgets.
   - **Performance / Appraisals:** Standard evaluation matrix for workforce management.
4. **Platform Administration**
   - **Fiscal Years / Accounting Periods:** Setup to lock historical accounting data by specific dates.

---

## 5. Unified Data Architecture & Module Interoperability (Cross-Module Integration)
A critical requirement for this SaaS platform is that modules must not operate in isolated silos. If a client purchases or enables a new module later on (e.g., upgrading from just `Ecommerce` to `Ecommerce + CRM + Purchase`), their existing data must seamlessly function in the new operational context without any duplication or data migration effort.

To guarantee this frictionless integration, the following unified master foundations must be strictly enforced across the codebase:

1. **Unified Profiles (Single Source of Truth):**
   - Both B2B Accounts (CRM), B2C Shoppers (Ecommerce), Employees (HRMS), and Suppliers (Purchase) must fundamentally resolve to a single centralized `contacts` or `parties` table structure.
   - Generating a Purchase Order for a "Customer" or selling to a "Supplier" must be instantly possible under the same unified account.

2. **Unified Item Registry:**
   - The exact same physical product record must power the Ecommerce Storefront, the POS Terminal, Inventory Warehousing, and Purchase Orders simultaneously.
   - Rather than syncing "Online Products" with "Offline System Items", all apps must query the exact same underlying `items` registry using simple module-specific toggles (e.g., `is_sellable_online`, `is_raw_material`).

3. **Unified General Ledger (The Finance Hub):**
   - Every financial transaction across any isolated module (Ecommerce Cart Payments, POS Cash Drawer tracking, Vendor Purchase Bills, Employee Payroll deductions) must auto-pipe directly into one centralized `journals` ledger within the `Books` module to form an unbreakable, real-time Trial Balance without batch syncing.

---

## 6. Workflow Depth & Lifecycles (The Core ERP Logic Phase)
Currently, most forms exist as isolated "Create/Update" wrappers. For deep robustness, the following real-world state-machines and lifecycles must be implemented:

1. **Lead To Cash (Sales Workflow)**
   - Allow an accepted *Quotation* to auto-generate a *Sales Order* document without retyping data.
   - Allow a *Sales Order* to dynamically spawn an *Invoice* and a *Delivery Challan* splitting the operational intent.
2. **Procure To Pay (Purchase Workflow)**
   - A *Purchase Order* must be received via a *GRN (Goods Receipt)* which then directly increments *Inventory Stock Levels*.
   - The *Purchase Bill* validation guarantees vendor payments only occur against received inventory.
3. **General Ledger Posting**
   - Every Invoice, Payment, GRN, and Payroll slip must automatically post double-entry JSON/accounting rows to the `journals` mapping in `Books` to retain a cohesive trial balance.

---

## 7. Advanced Enterprise SaaS Features (The Power Multipliers)
To elevate this SaaS from a standard operational tool into a **powerful, premium enterprise application**, we must also implement the following core platform features:

1. **Granular Role-Based Access Control (RBAC):**
   - Tenants must be able to create custom roles (e.g., "Cashier" vs "Store Manager") to explicitly restrict which screens, buttons, and row-level data specific employees can see or manipulate.
2. **Immutable Audit Trails (Compliance):** 
   - A universal `activity_logs` table that tracks "Who changed what Record, and When". If an employee modifies a sales invoice or deletes a contact, the exact previous and new values must be permanently preserved for managerial tracking.
3. **Bulk Data Migration & Export (CSV/Excel):** 
   - Mandatory for seamless onboarding. Users absolutely need the ability to upload an Excel sheet to import 5,000 inventory items or 10,000 CRM contacts at once, and export reports equally fast.
4. **Developer APIs & Webhooks:**
   - Generating standard API Tokens so users can connect your SaaS product to external tools (like Zapier, Make.com, or custom shipping providers) to auto-trigger actions externally.
5. **Scheduled Automations (Cron Jobs):**
   - System-wide background workers to automatically email unpaid invoice reminders, dispatch abandoned cart coupons, or flag expired physical stock.
6. **Multi-Currency & Multi-Location Strategy:**
   - The codebase must support dynamic base currency conversions globally so the SaaS can aggressively expand into international markets.

---

## 8. Next Step Plan of Action
To achieve full "Production Ready" status, we must execute the following systematic sprints:

* **SPRINT 1 (Audit & Fix Working Stage):** Review all *existing* screens to guarantee they successfully write to the database and use dynamic data instead of static placeholders.
* **SPRINT 2 (Missing Screen Bridging):** Rapid creation of all the missing UI wrappers noted in section 3 using the generic `ERPListView` and `ERPEntryForm` templates. 
* **SPRINT 3 (Mandatory Additions):** Integrate the missing core logic screens (Section 4) like Financial Reports, Tax Setups, and Stock Reconciliation.
* **SPRINT 4 (Relational Action Buttons & Triggers):** Add specific "Make Sales Order", "Make Invoice", "Receive Goods" buttons onto the view screens of Quotations, Orders, and Purchase Orders to enforce tight operational lifecycles.
