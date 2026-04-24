import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "./TenantContext";
import { useAuth } from "./AuthContext";
import PLATFORM_CONFIG from "@/config/platform";
import { syncModulesToDB } from "@/lib/syncModules";

export interface Permission {
    resource: string;
    action: string;
}

interface PermissionsContextType {
    availableModules: string[];
    permissions: Permission[];
    can: (action: string, resource: string) => boolean;
    hasModule: (moduleName: string) => boolean;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    emailVerified: boolean;
    loading: boolean;
    refreshPermissions: () => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
    const { activeCompany } = useTenant();
    const { user } = useAuth();
    const [availableModules, setAvailableModules] = useState<string[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshTick, setRefreshTick] = useState(0); // incrementing this triggers a reload

    // Call this after subscribing/unsubscribing a module to instantly update the sidebar
    const refreshPermissions = () => setRefreshTick(t => t + 1);

    useEffect(() => {
        const loadPermissions = async () => {
            // Not logged in → reset everything
            if (!user) {
                setLoading(false);
                setIsAdmin(false);
                setIsSuperAdmin(false);
                setEmailVerified(false);
                setPermissions([]);
                setAvailableModules([]);
                return;
            }

            try {
                // Always set loading true when starting a fresh check
                setLoading(true);

                // 1. Fetch ALL system modules (needed for Super Admin or for general lookup)
                const { data: systemModules } = await supabase
                    .from("system_modules")
                    .select("id, name, slug, is_core");

                // 2. HARDCORE BYPASS for the Primary Super Admin
                const isSuperAdminByEmail = user.email?.toLowerCase() === PLATFORM_CONFIG.superAdminEmail.toLowerCase();

                // 3. Look up the user in public.users — check for super admin flag.
                // Fail-open on email_verified: if the column is missing (SQL not yet applied),
                // the row is missing, or the query errors out, we do NOT gate on verification —
                // otherwise a legitimately logged-in user gets bounced to /verify-email-pending.
                // A user who genuinely needs to verify will have an explicit email_verified = false.
                let localUser = null;
                try {
                    // Query by id (auth user PK) — consistent with Login.tsx; username may not equal email.
                    const { data, error } = await supabase
                        .from("users")
                        .select("id, is_super_admin, email_verified")
                        .eq("id", user.id)
                        .maybeSingle();

                    if (error) {
                        // Most common cause: email_verified column missing (SQL not applied yet).
                        console.warn("Profile lookup error, treating as verified:", error.message);
                        setEmailVerified(true);
                    } else if (data) {
                        localUser = data;
                        // Only treat as unverified when the flag is explicitly false.
                        setEmailVerified(data.email_verified !== false);
                    } else {
                        // No row yet (handle_new_user trigger hasn't fired / race). Fail-open.
                        setEmailVerified(true);
                    }
                } catch (e: any) {
                    console.warn("User lookup threw, treating as verified:", e?.message || e);
                    setEmailVerified(true);
                }

                // 4. SUPER ADMIN: Auto-sync modules from config to DB (Odoo-style)
                if (isSuperAdminByEmail || localUser?.is_super_admin) {
                    // Sync config → DB, then re-fetch so new modules are immediately visible
                    await syncModulesToDB();
                    const { data: refreshedModules } = await supabase
                        .from("system_modules")
                        .select("id, name, slug, is_core");
                    const refreshedIdentifiers = refreshedModules?.flatMap(sm => [sm.name, sm.slug]) || [];

                    setIsAdmin(true);
                    setIsSuperAdmin(true);
                    setEmailVerified(true);
                    setAvailableModules(refreshedIdentifiers.filter(Boolean) as string[]);
                    setPermissions([]);
                    setLoading(false);
                    return;
                }

                // If not super admin, ensure the flag is false
                setIsSuperAdmin(false);

                // 5. No active company → default to Ecommerce visible + core modules
                if (!activeCompany) {
                    setIsAdmin(false);
                    // Core modules are always available to help navigation
                    const coreModules = systemModules?.filter(sm => sm.is_core).flatMap(sm => [sm.name, sm.slug]) || [];
                    const finalModules = Array.from(new Set([...coreModules])).filter(Boolean) as string[];
                    setAvailableModules(finalModules);
                    setPermissions([]);
                    setLoading(false);
                    return;
                }

                // 6. Check company_users mapping for this user in the active company
                let companyMapping: any = null;
                if (localUser) {
                    const { data } = await supabase
                        .from("company_users")
                        .select("id, role")
                        .eq("company_id", activeCompany.id)
                        .eq("user_id", localUser.id)
                        .maybeSingle();
                    companyMapping = data;
                }

                // 7. Fetch the subscribed modules for this company
                let { data: companyModules, error: mErr } = await supabase
                    .from("company_modules")
                    .select("module_slug")
                    .eq("company_id", activeCompany.id)
                    .eq("is_active", true);

                let finalSubscribedModules: string[] = [];

                // Resilience Fallback: If module_slug fails (legacy DB), try module_id
                if (mErr) {
                    const { data: legacyModules } = await supabase
                        .from("company_modules")
                        .select("module_id")
                        .eq("company_id", activeCompany.id)
                        .eq("is_active", true);
                    
                    const purchasedIds = new Set(legacyModules?.map(tm => tm.module_id));
                    finalSubscribedModules = systemModules
                        ?.filter(sm => sm.is_core || purchasedIds.has(sm.id))
                        .flatMap(sm => [sm.name, sm.slug]) || [];
                } else {
                    const purchasedModuleSlugs = new Set(companyModules?.map(tm => tm.module_slug));
                    finalSubscribedModules = systemModules
                        ?.filter(sm => sm.is_core || purchasedModuleSlugs.has(sm.slug))
                        .flatMap(sm => [sm.name, sm.slug]) || [];
                }
                setAvailableModules(finalSubscribedModules);
                const subscribedModules = finalSubscribedModules; // For backwards compatibility in subsequent logic

                // 8. Determine tenant role
                const isTenantAdmin =
                    (companyMapping && (
                        companyMapping.role === "owner"
                        || companyMapping.role === "admin"
                    )) || (activeCompany as any).user_id === user.id;

                setIsAdmin(isTenantAdmin);

                if (isTenantAdmin) {
                    // Sees core modules + subscribed modules
                    const coreModules = systemModules?.filter(sm => sm.is_core).flatMap(sm => [sm.name, sm.slug]) || [];
                    const finalModules = Array.from(new Set([...coreModules, ...subscribedModules])).filter(Boolean) as string[];

                    setAvailableModules(finalModules);
                    setPermissions([]);
                } else {
                    // STAFF MEMBER: Fetch granular permissions
                    const coreModules = systemModules?.filter(sm => sm.is_core).flatMap(sm => [sm.name, sm.slug]) || [];
                    setAvailableModules(coreModules.filter(Boolean) as string[]);

                    if (companyMapping) {
                        const { data: userPerms } = await supabase
                            .from('user_permissions')
                            .select('resource, action')
                            .eq('company_user_id', companyMapping.id);

                        if (userPerms) setPermissions(userPerms);
                    } else {
                        setPermissions([]);
                    }
                }

            } catch (err) {
                console.error("Error loading permissions:", err);
                // Fail-closed: don't grant admin on error
                setIsAdmin(false);
                setAvailableModules(["Masters"]); // Only basic fallback
                setPermissions([]);
            } finally {
                setLoading(false);
            }
        };

        loadPermissions();
    }, [activeCompany?.id, user?.id, refreshTick]); // More specific dependencies

    const can = (action: string, resource: string) => {
        if (isAdmin) return true;
        return (
            permissions.some(p => p.action === action && p.resource === resource) ||
            permissions.some(p => p.action === "manage" && p.resource === resource)
        );
    };

    const hasModule = (moduleName: string) => {
        if (!moduleName) return true;
        // Super Admins ALWAYS have all modules
        if (isSuperAdmin) return true;

        const normalized = moduleName.toLowerCase();
        return availableModules.some(m => m.toLowerCase() === normalized);
    };

    return (
        <PermissionsContext.Provider value={{ availableModules, permissions, can, hasModule, isAdmin, isSuperAdmin, emailVerified, loading, refreshPermissions }}>
            {children}
        </PermissionsContext.Provider>
    );
}

export function usePermissions() {
    const context = useContext(PermissionsContext);
    if (context === undefined) {
        throw new Error("usePermissions must be used within a PermissionsProvider");
    }
    return context;
}
