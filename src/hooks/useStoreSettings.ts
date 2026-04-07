import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";

export interface StoreSettings {
    id: number;
    company_id: number;
    store_name: string;
    store_tagline: string;
    logo_url: string;
    favicon_url: string;
    primary_color: string;
    contact_email: string;
    contact_phone: string;
    address: string;
    facebook_url?: string;
    instagram_url?: string;
    twitter_url?: string;
    whatsapp_number?: string;
    footer_text: string;
    order_prefix?: string;
    next_order_number?: number;
    auto_confirm_paid_orders?: boolean;
    tax_rate?: number;
    return_policy?: string;
}

const defaultSettings: Partial<StoreSettings> = {
    store_name: "ECOM SUITE",
    store_tagline: "LUXURY SHOP",
    footer_text: "© 2026 ECOM SUITE LUXURY. ARCHITECTED BY CORESUITE.",
};

export function useStoreSettings() {
    const { activeCompany } = useTenant();
    const [settings, setSettings] = useState<StoreSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        if (!activeCompany) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("ecom_settings")
                .select("*")
                .eq("company_id", activeCompany.id)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setSettings(data);
            } else {
                // Fallback to default if no settings exist for this company yet
                setSettings({ ...defaultSettings, company_id: activeCompany.id } as any);
            }
        } catch (error) {
            console.error("Error fetching store settings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, [activeCompany?.id]);

    const updateSettings = async (newSettings: Partial<StoreSettings>) => {
        if (!activeCompany) return;

        try {
            const payload = {
                ...newSettings,
                company_id: activeCompany.id
            };

            const { data, error } = await supabase
                .from("ecom_settings")
                .upsert(payload, { onConflict: 'company_id' })
                .select()
                .single();

            if (error) throw error;
            setSettings(data);
            return data;
        } catch (error) {
            console.error("Error updating store settings:", error);
            throw error;
        }
    };

    return { settings, loading, updateSettings, refreshSettings: fetchSettings };
}
