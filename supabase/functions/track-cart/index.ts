// Edge Function: track-cart
// Called by storefront when customer enters email in checkout.
// Upserts an abandoned cart record for later recovery emails.
// Deploy: supabase functions deploy track-cart --no-verify-jwt

import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...cors, "Content-Type": "application/json" },
    });
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    let payload: any;
    try { payload = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

    const { company_id, customer_email, customer_name, customer_phone, cart_items, cart_value } = payload || {};
    if (!company_id || !customer_email) return json({ error: "Missing company_id or customer_email" }, 400);

    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const recoveryToken = crypto.randomUUID().replace(/-/g, "");
        const tokenExpires = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();

        const { data, error } = await supabase
            .from("ecom_abandoned_carts")
            .upsert({
                company_id,
                customer_email: customer_email.toLowerCase(),
                customer_name,
                customer_phone,
                cart_items: cart_items || [],
                cart_value: cart_value || 0,
                recovery_token: recoveryToken,
                recovery_token_expires: tokenExpires,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: "customer_email,company_id",
                ignoreDuplicates: false,
            })
            .select("id, recovery_token")
            .single();

        if (error) return json({ error: error.message }, 500);
        return json({ success: true, cart_id: data.id, recovery_token: data.recovery_token });
    } catch (err: any) {
        return json({ error: err.message }, 500);
    }
});
