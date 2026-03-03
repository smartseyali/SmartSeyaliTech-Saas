import { supabase } from './supabaseClient.js';

export const saasApi = {
    async getTemplates() {
        const { data, error } = await supabase
            .from('ecom_templates')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });
        if (error) throw error;
        return data;
    },

    async createMerchantStore(merchantData) {
        const { data, error } = await supabase
            .from('companies')
            .insert([{
                name: merchantData.store_name,
                email: merchantData.email,
                phone: merchantData.phone,
                template_id: merchantData.template_id,
                subdomain: merchantData.name.toLowerCase().replace(/\s+/g, '-'),
                is_active: true
            }])
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};
