import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { SITE_REGISTRY, ScreenMapping } from "@/config/site-schema";
import { useToast } from "@/hooks/use-toast";

/**
 * Universal SaaS Data Connector
 * This is the central "path" between Frontend fields and Backend tables.
 * It uses the SITE_REGISTRY to dynamically connect ANY UI component to its data source.
 */
export function useDataConnector(screenId: string, sectionId: string) {
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // 1. Get the mapping configuration for this section
    const config: ScreenMapping | undefined = SITE_REGISTRY[screenId]?.find(m => m.id === sectionId);

    /**
     * Fetch logic: Retrieves data scoped to the active tenant
     */
    const fetchData = useCallback(async () => {
        if (!activeCompany?.id || !config) return [];

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from(config.table)
                .select("*")
                .eq("company_id", activeCompany.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err: any) {
            console.error(`Connector Fetch Error [${sectionId}]:`, err);
            return [];
        } finally {
            setLoading(false);
        }
    }, [activeCompany?.id, config, sectionId]);

    /**
     * Save logic: Upserts data while ensuring multi-tenant isolation
     */
    const saveData = useCallback(async (payload: any) => {
        if (!activeCompany?.id || !config) return null;

        try {
            setLoading(true);

            // Inject multi-tenancy context into every record
            const documents = Array.isArray(payload)
                ? payload.map(item => ({ ...item, company_id: activeCompany.id }))
                : { ...payload, company_id: activeCompany.id };

            const { data, error } = await supabase
                .from(config.table)
                .upsert(documents)
                .select();

            if (error) throw error;

            toast({ title: "System Synced", description: `${config.section} updated successfully.` });
            return data;
        } catch (err: any) {
            toast({ variant: "destructive", title: "Sync Failed", description: err.message });
            return null;
        } finally {
            setLoading(false);
        }
    }, [activeCompany?.id, config, toast]);

    /**
     * Delete logic
     */
    const removeData = useCallback(async (id: string | number) => {
        if (!activeCompany?.id || !config) return false;

        try {
            setLoading(true);
            const { error } = await supabase
                .from(config.table)
                .delete()
                .eq("id", id)
                .eq("company_id", activeCompany.id); // Guard against cross-tenant deletion

            if (error) throw error;
            return true;
        } catch (err: any) {
            toast({ variant: "destructive", title: "Delete Failed", description: err.message });
            return false;
        } finally {
            setLoading(false);
        }
    }, [activeCompany?.id, config, toast]);

    return {
        fetchData,
        saveData,
        removeData,
        loading,
        config
    };
}
