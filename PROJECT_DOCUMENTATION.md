# E-Commerce Suite: End-to-End Project Documentation

This document outlines the complete architectural setup, implementation steps, and logic flows achieved in the `ecommerce-suite` application, going from scratch up to a fully multi-tenant, functioning ecosystem.

## 1. Project Initialization & Folder Structure

We started by initializing a modern frontend setup using **React + Vite** with **TypeScript** and **Tailwind CSS**.

### Initial Steps:
- Initialized Vite React-TS template (`npm create vite@latest ecommerce-suite -- --template react-ts`).
- Installed **Tailwind CSS**, **PostCSS**, and configured `tailwind.config.ts`.
- Integrated **shadcn/ui** (built on Radix UI) for robust, accessible UI components.
- Established a module-based `src` folder structure:
  - `components/`: Granular UI components, Layout wrappers (Storefront vs App Layout).
  - `contexts/`: React context providers handling Auth, Tenant mapping, Permissions, and Cart logic.
  - `pages/`: The primary route components, distinctly segregated into:
    - `/ecommerce`: Merchant Admin Portal.
    - `/storefront`: The actual customer-facing end-user eCommerce websites.
    - `/super-admin`: Platform control center.
  - `store/`: **Redux Toolkit** configuration providing global state management.
  - `hooks/`: Reusable React Hooks.
  - `lib/`: Core utilities and integrations, notably the Supabase client connection (`supabase.ts`).

## 2. Backend Creation & Database Connections

Instead of building a traditional Express/Node backend from scratch, we utilized **Supabase** as an integrated Backend-as-a-Service (BaaS).

### Steps Done:
- Provisioned a given Supabase project and exposed the API credentials (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) securely via `.env`.
- Linked the local application to Supabase using the Supabase CLI (`npm run supabase:link`).
- Configured PostgreSQL relational database structure.
- Implemented robust **TypeScript types generation** (`npm run supabase:types`) ensuring an end-to-end typed developer experience connecting our DB schemas directly with UI representations.
- Generated core functional schemas spanning: `users`, `companies`, `company_users`, `ecom_settings`, `products`, `orders`, and more.

## 3. User Handling & Authentication

Authentication is handled via Supabase's native auth modules mapped internally through a custom React Context.

### Handling Flow:
- **`AuthContext.tsx`**: Responsible for syncing the current active session state globally. It establishes `supabase.auth.onAuthStateChange` listeners on mount, auto-logging users in if a valid session exists.
- **Auto-Syncing User Profiles**: While Supabase handles raw authentication, we keep an internal `users` table synced. In `TenantContext`, whenever a user with a valid OAuth/Email session arrives but doesn't have a public DB profile, we auto-create a persistent Postgres entity, allowing mapping custom metadata like `is_super_admin`, roles, and `full_name`.
- **Role-based Renderings**: Integrated `PermissionsContext.tsx` dynamically evaluating access, segregating `SuperAdminRoute` views from regular `ProtectedRoutes`.

## 4. Multi-Tenant Architecture End-to-End

To support multiple merchants running their distinct storefronts out of a single codebase dynamically, a sophisticated tenant resolution engine was built.

### The Tenant Resolution Flow (`TenantContext.tsx`):
1. **URL Interception**: The platform identifies the URL pathname snippet or subdomain (e.g., `/:companySlug/shop`).
2. **Context Provider Validation**: We query the `companies` table using the detected slug to pinpoint the active storefront session.
3. **Admin vs Customer Separation**:
   - If a customer visits a storefront path without an account, we inject the specific `Company` data representing that brand into the context, modifying the entire site appearance passively.
   - If an authenticated user enters the app, we match `user.id` against the `company_users` edge table.
   - Super Admins get access to an overview state where they can swap between all companies dynamically.

## 5. Merchant Site Creations (Auto-Onboarding)

We built an invisible, friction-less onboarding sequence allowing immediate application utility upon initial login without complex wizard forms.

### The Logic Sequence:
- When a user logs into a **Merchant Intent Path** (like `/ecommerce`), the app attempts to locate their mapped company.
- If finding **0 companies mapped**, the platform initiates an **Auto-Onboarding** script:
  1. **Creates a `Company` Base Record**: Generates a uniquely branded namespace (e.g., "John's Store") and a unique path-slug (`johnstore1234`).
  2. **Assigns Ownership**: Inserts an administrative relation between `user.id` and the new `company.id` within the `company_users` table.
  3. **Seeds Default Configs**: Emits base records into `ecom_settings` providing instant theme layouts and tags.
  4. **Updates User Profile**: Binds the default active instance `company_id` to the local user profile entity so subsequent logins bypass onboard checks.

## 6. Website Integrations & Unified Routing

The platform utilizes a dynamic, multi-headed routing layer configured in `App.tsx` utilizing `react-router-dom`.

### The Interface Layers:
- **Customer Storefront**: Resolves routes like `/:companySlug/shop`, `/:companySlug/checkout`. These interfaces utilize a public-facing `StoreLayout` and rely heavily on specific tenant contexts matching the query slug. Components pull down specific store products mapped strictly to the active `tenant.id`.
- **Merchant Intranet (Ecommerce Admin)**: Protected under `.com/ecommerce/*`, presenting standard CMS functionalities: Product Masters, Categories, Brand Configurations, Stock Management, Analytics (Dashboard), Order/Payment tracking, and UI website configurations.
- **Platform Console**: Protected under `.com/super-admin`, a high-level headless access zone where platform owners oversee multi-tenant configurations, orchestrate connections, and manage macro-level tenants.

## Summary

The `ecommerce-suite` is architected dynamically to spin-up headless and frontend instances for newly onboarded merchants automatically. Driven by a centralized Supabase logic tier and tightly knit context layers, it represents an automated, horizontal-scaling true **Software as a Service (SaaS)**.
