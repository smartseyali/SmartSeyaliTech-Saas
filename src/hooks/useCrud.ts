import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useTenant } from "@/contexts/TenantContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useAuth } from "@/contexts/AuthContext";

/**
 * useCrud — Multi-tenant aware CRUD hook.
 *
 * - All queries are SCOPED to activeCompany.id via company_id column.
 * - Super-admin users also get company_id scoped to the currently selected company.
 *   (Super-admin can switch companies via the TenantContext to view any company's data.)
 * - onCreate: automatically injects company_id from activeCompany.
 * - onUpdate/Delete: also enforces company_id to prevent cross-tenant mutations.
 */
export function useCrud(tableName: string, selectQuery: string = "*") {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { activeCompany } = useTenant();
    const { user: authUser } = useAuth();
    const { isAdmin, isSuperAdmin } = usePermissions();

    const fetchItems = async () => {
        if (!activeCompany) return;
        setLoading(true);

        let query = supabase
            .from(tableName)
            .select(selectQuery);

        if (activeCompany) {
            query = query.eq("company_id", activeCompany.id);
        }

        query = query.order("id", { ascending: false });

        const { data: result, error } = await query;

        if (error) {
            toast({ variant: "destructive", title: "Fetch Error", description: error.message });
        } else {
            setData(result || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (activeCompany || isSuperAdmin) {
            fetchItems();
        } else {
            setData([]);
            setLoading(false);
        }
    }, [tableName, activeCompany]);

    const createItem = async (payload: any) => {
        if (!activeCompany) throw new Error("No active workspace selected.");

        // Clean payload to prevent joined relations from breaking the insert
        const cleanPayload = (data: any) => {
            const cleaned = { ...data };
            const jsonColumns = ['shipping_address', 'config', 'content', 'mapping_config'];

            // 1. Remove objects/arrays that are not json columns
            for (const key in cleaned) {
                const val = cleaned[key];
                if (val !== null && typeof val === 'object' && !(val instanceof Date) && !jsonColumns.includes(key)) {
                    delete cleaned[key];
                }
            }

            // 2. Extract implicitly joined relations from the selectQuery and strip them out
            // e.g. "*, ecom_categories(id, name)" -> extracts "ecom_categories"
            const matches = selectQuery.match(/(\w+)\s*\(/g);
            if (matches) {
                matches.forEach(m => {
                    const relationKey = m.replace('(', '').trim();
                    delete cleaned[relationKey];
                });
            }

            return cleaned;
        };

        // Always stamp company_id and created_by on creation — the SaaS foundation
        const payloadWithCompany = cleanPayload({
            ...payload,
            company_id: activeCompany.id,
            user_id: authUser?.id // Optional: attribute to specific user
        });

        const { data: result, error } = await supabase
            .from(tableName)
            .insert([payloadWithCompany])
            .select();

        if (error) {
            toast({ variant: "destructive", title: "Create Error", description: error.message });
            throw error;
        } else {
            toast({ title: "Created successfully" });
            setData(prev => [result[0], ...prev]);
            return result[0];
        }
    };

    const updateItem = async (id: number | string, payload: any) => {
        if (!activeCompany) throw new Error("No active workspace selected.");

        // Clean payload to prevent joined relations from breaking the update
        const cleanPayload = (data: any) => {
            const cleaned = { ...data };
            const jsonColumns = ['shipping_address', 'config', 'content', 'mapping_config'];

            // 1. Remove objects/arrays that are not json columns
            for (const key in cleaned) {
                const val = cleaned[key];
                if (val !== null && typeof val === 'object' && !(val instanceof Date) && !jsonColumns.includes(key)) {
                    delete cleaned[key];
                }
            }

            // 2. Extract implicitly joined relations from the selectQuery and strip them out
            const matches = selectQuery.match(/(\w+)\s*\(/g);
            if (matches) {
                matches.forEach(m => {
                    const relationKey = m.replace('(', '').trim();
                    delete cleaned[relationKey];
                });
            }

            return cleaned;
        };

        const cleanedPayload = cleanPayload(payload);

        const query = supabase
            .from(tableName)
            .update(cleanedPayload)
            .eq("id", id);

        if (activeCompany) {
            query.eq("company_id", activeCompany.id);
        }

        const { data: result, error } = await query.select();

        if (error) {
            toast({ variant: "destructive", title: "Update Error", description: error.message });
            throw error;
        } else {
            toast({ title: "Updated successfully" });
            setData(prev => prev.map(item => item.id === id ? result[0] : item));
            return result[0];
        }
    };

    const deleteItem = async (id: number | string) => {
        if (!activeCompany) throw new Error("No active workspace selected.");

        const query = supabase
            .from(tableName)
            .delete()
            .eq("id", id);

        if (activeCompany) {
            query.eq("company_id", activeCompany.id);
        }

        const { error } = await query;

        if (error) {
            toast({ variant: "destructive", title: "Delete Error", description: error.message });
            throw error;
        } else {
            toast({ title: "Deleted successfully" });
            setData(prev => prev.filter(item => item.id !== id));
        }
    };

    return { data, loading, fetchItems, createItem, updateItem, deleteItem };
}
