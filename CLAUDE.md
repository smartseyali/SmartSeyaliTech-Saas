# SmartSeyali SaaS Platform — Claude Development Guide

## Skills Reference

Detailed developer guides live in `.claude/skills/`. Read the relevant guide before making any changes.

| Guide | Path | When to Use |
|-------|------|-------------|
| **Frontend** | [.claude/skills/frontend.md](.claude/skills/frontend.md) | UI components, styling, typography, colors, icons, animations, forms, layout |
| **Backend** | [.claude/skills/backend.md](.claude/skills/backend.md) | Supabase queries, service layer, auth, permissions, multi-tenancy, payments |
| **Fullstack** | [.claude/skills/fullstack.md](.claude/skills/fullstack.md) | End-to-end feature development, adding modules/pages, data flow, state decisions |

---

## Platform Identity

- **Product:** SmartSeyali — multi-tenant SaaS business platform
- **Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Supabase
- **Design Language:** Frappe/ERPNext Desk (compact, professional, data-dense)
- **Font:** Inter (Google Fonts)
- **Primary Color:** `#2490EF` (Frappe blue)

---

## Non-Negotiable Rules

### UI & Styling
- Use **Inter** font. Never introduce another font family.
- Use the **Frappe gray ramp** and **primary blue** palette. No arbitrary hex colors in JSX.
- Always add `dark:` variants alongside light-mode classes on interactive/visible elements.
- Border radius default is `rounded` (6px). Use `rounded-xl` / `rounded-2xl` for cards and large containers.
- Icons are **Lucide React** only. No other icon library.
- Buttons, inputs, and badges follow the exact patterns in `frontend.md`. Do not deviate.

### Multi-Tenancy
- **Every** database query must be scoped with `.eq("company_id", activeCompany.id)`.
- Use `useCrud()` for standard CRUD — it handles `company_id` injection automatically.
- Never access cross-tenant data except as super-admin.

### Architecture
- Import Supabase from `@/lib/supabase`, never directly from `@supabase/supabase-js`.
- Business logic belongs in `src/lib/services/`, not in React components.
- Server state → `useCrud` or React Query. Client UI state → `useState`. Cross-session state → Redux.
- New module pages go in `src/pages/modules/<module>/`. New routes go in `src/routes/<module>Routes.tsx`.

### Code Quality
- No `console.log` in committed code.
- No `any` types on database records — define interfaces in `src/types/`.
- No hardcoded company IDs, user IDs, or environment-specific values.
- Keep components thin — extract data fetching into hooks and business logic into services.

---

## Project Structure (Quick Reference)

```
src/
├── config/         Platform config, module registry, navigation, payment gateways
├── contexts/       AuthContext, TenantContext, PermissionsContext, CartContext
├── hooks/          useCrud, useCheckout, useWebsite, useStoreSettings, ...
├── lib/
│   ├── db.ts       Database provider bridge (Supabase ↔ custom API)
│   ├── supabase.ts Re-exports db as `supabase`
│   ├── auth/       MFA/TOTP helpers
│   └── services/   Business logic (paymentService, emailService, websiteService, ...)
├── components/
│   ├── layout/     AppLayout, AppHeader, AppSidebar, Breadcrumbs
│   └── ui/         shadcn/ui components (40+)
├── pages/          Top-level pages + modules/<module>/ subdirectories
├── routes/         Per-module route arrays
├── store/          Redux store + slices (login, cart, products)
└── types/          TypeScript interfaces (database, erp, storefront)
```

---

## Modules

| ID | Name | Color | Status |
|----|------|-------|--------|
| `ecommerce` | E-Commerce | blue | live |
| `pos` | Point of Sale | violet | beta |
| `crm` | CRM | red/orange | beta |
| `sales` | Sales Management | indigo | live |
| `inventory` | Inventory | yellow/orange | live |
| `purchase` | Purchase | pink/rose | beta |
| `hrms` | HRMS | green/teal | beta |
| `finance` | Finance & Accounting | teal | beta |
| `whatsapp` | WhatsApp Integration | green | live |
| `website` | Website | sky/cyan | live |
| `masters` | Master Data Hub | slate (core) | live |

All module IDs map to Lucide icons via `MODULE_ICONS` in both `AppLauncher.tsx` and `AppHeader.tsx`.

---

## Common Import Aliases

```ts
import { supabase }            from "@/lib/supabase";
import { cn }                  from "@/lib/utils";
import { useCrud }             from "@/hooks/useCrud";
import { useAuth }             from "@/contexts/AuthContext";
import { useTenant }           from "@/contexts/TenantContext";
import { usePermissions }      from "@/contexts/PermissionsContext";
import { toast }               from "sonner";
import PLATFORM_CONFIG         from "@/config/platform";
import { PLATFORM_MODULES }    from "@/config/modules";
import { MODULE_NAV }          from "@/config/navigation";
```
