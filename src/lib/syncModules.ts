import { supabase } from "./supabase";
import { PLATFORM_MODULES } from "@/config/modules";

/**
 * Auto-sync module config to database (Odoo-style).
 * Runs on app startup for super admins — any changes in
 * config/modules.ts are automatically reflected in the system_modules table.
 */
let hasSynced = false;

export async function syncModulesToDB() {
    // Only sync once per session
    if (hasSynced) return;
    hasSynced = true;

    try {
        const payloads = PLATFORM_MODULES.map((mod, index) => ({
            slug: mod.id,
            name: mod.name,
            tagline: mod.tagline,
            description: mod.description,
            icon: mod.icon,
            color: mod.color,
            color_from: mod.colorFrom,
            color_to: mod.colorTo,
            route: mod.route,
            dashboard_route: mod.dashboardRoute,
            category: mod.category,
            status: mod.status,
            features: mod.features,
            included_in_plans: mod.includedInPlans,
            needs_template: mod.needsTemplate,
            is_core: mod.isCore,
            is_active: true,
            is_free: mod.isFree,
            price_monthly: mod.priceMonthly,
            price_yearly: mod.priceYearly || null,
            trial_days: mod.trialDays,
            sort_order: index,
        }));

        const { error } = await supabase
            .from("system_modules")
            .upsert(payloads, { onConflict: "slug" });

        if (error) {
            console.warn("Module sync skipped:", error.message);
        }
    } catch {
        // Silent fail for non-super-admin users (RLS will block)
    }
}
