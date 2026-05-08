// Edge Function: validate-stock
// Atomically decrements stock via service role after order creation.
// Called from storefront checkout.ts before confirming payment.
// Deploy: supabase functions deploy validate-stock --no-verify-jwt

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

    const { order_id, company_id } = payload || {};
    if (!order_id || !company_id) return json({ error: "Missing order_id or company_id" }, 400);

    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data, error } = await supabase.rpc("decrement_stock_on_order", {
            p_order_id: order_id,
            p_company_id: company_id,
        });
        if (error) return json({ error: error.message }, 500);
        return json(data);
    } catch (err: any) {
        return json({ error: err.message }, 500);
    }
});
