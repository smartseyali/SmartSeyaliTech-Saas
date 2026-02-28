import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { getMappedTable } from "@/config/site-schema";

/**
 * SaaS Dynamic Content Hook
 * Fetches data based on the Screen Registry to ensure backend-frontend consistency.
 * Now supports full CRUD for merchant management.
 */
export function useDynamicContent(screenId: string, sectionId: string) {
    const { activeCompany } = useTenant();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const tableName = getMappedTable(screenId, sectionId);

    const fetchData = useCallback(async () => {
        if (!activeCompany || !tableName) return;

        try {
            setLoading(true);
            let query = supabase.from(tableName).select("*").eq("company_id", activeCompany.id);

            // Apply section-specific filters (convention-based via the `position` column on banners)
            if (sectionId === "hero_banners") {
                query = query.eq("is_active", true)
                    .in("position", ["hero", "full_width", "slider"])
                    .order("display_order", { ascending: true });
            } else if (sectionId === "offer_zone") {
                // Queries the 'offers' table (managed via Offers & Promotions admin)
                query = query.eq("is_active", true)
                    .order("created_at", { ascending: false });
            } else if (sectionId === "bottom_banners") {
                query = query.eq("is_active", true)
                    .in("position", ["bottom", "footer_banner", "scrollable"])
                    .order("display_order", { ascending: true });
            } else if (sectionId === "site_highlights") {
                query = query.eq("is_active", true)
                    .in("position", ["highlight", "info", "feature"])
                    .order("display_order", { ascending: true });
            } else if (sectionId === "top_selling" || sectionId === "featured_products") {
                query = query.eq("is_ecommerce", true)
                    .in("status", ["active"])
                    .or("is_best_seller.eq.true,is_featured.eq.true")
                    .order("created_at", { ascending: false })
                    .limit(8);
            } else if (sectionId === "top_categories") {
                query = query.eq("is_active", true).limit(12);
            } else if (sectionId === "payment_gateways") {
                query = query.eq("is_active", true);
            } else if ([
                "shop_header", "shop_mid",
                "product_top", "product_bottom",
                "cart_top", "checkout_top", "payment_top"
            ].includes(sectionId)) {
                // Per-page banners: position stored in DB matches the sectionId exactly
                query = query.eq("is_active", true)
                    .eq("position", sectionId)
                    .order("display_order", { ascending: true });
            }

            const { data: result, error: fetchError } = await query;
            if (fetchError) throw fetchError;
            setData(result || []);
        } catch (err) {
            console.error(`Error fetching dynamic content [${sectionId}]:`, err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [activeCompany?.id, screenId, sectionId, tableName]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateItem = async (id: string | number, payload: any) => {
        if (!tableName || !activeCompany) return null;
        try {
            const { data: result, error } = await supabase
                .from(tableName)
                .update({ ...payload, company_id: activeCompany.id })
                .eq("id", id)
                .eq("company_id", activeCompany.id)
                .select()
                .single();
            if (error) throw error;
            setData(prev => prev.map(item => item.id === id ? result : item));
            return result;
        } catch (err) {
            console.error(`Error updating [${sectionId}]:`, err);
            return null;
        }
    };

    const createItem = async (payload: any) => {
        if (!tableName || !activeCompany) return null;
        try {
            const { data: result, error } = await supabase
                .from(tableName)
                .insert({ ...payload, company_id: activeCompany.id })
                .select()
                .single();
            if (error) throw error;
            setData(prev => [...prev, result]);
            return result;
        } catch (err) {
            console.error(`Error creating [${sectionId}]:`, err);
            return null;
        }
    };

    const deleteItem = async (id: string | number) => {
        if (!tableName || !activeCompany) return false;
        try {
            const { error } = await supabase
                .from(tableName)
                .delete()
                .eq("id", id)
                .eq("company_id", activeCompany.id);
            if (error) throw error;
            setData(prev => prev.filter(item => item.id !== id));
            return true;
        } catch (err) {
            console.error(`Error deleting [${sectionId}]:`, err);
            return false;
        }
    };

    return {
        data,
        loading,
        error,
        refresh: fetchData,
        updateItem,
        createItem,
        deleteItem
    };
}
