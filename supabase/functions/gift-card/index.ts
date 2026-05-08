// Edge Function: gift-card
// Actions: validate, redeem, issue
// Deploy: supabase functions deploy gift-card --no-verify-jwt

import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};
function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
    let payload: any;
    try { payload = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

    const { action, company_id } = payload || {};
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        if (action === "validate") {
            const { code } = payload;
            const { data, error } = await supabase.rpc("validate_gift_card", {
                p_company_id: company_id, p_code: code,
            });
            if (error) return json({ error: error.message }, 500);
            return json(data);
        }

        if (action === "redeem") {
            const { gift_card_id, order_id, amount } = payload;
            const { data, error } = await supabase.rpc("redeem_gift_card", {
                p_gift_card_id: gift_card_id, p_order_id: order_id, p_amount: amount,
            });
            if (error) return json({ error: error.message }, 500);
            return json(data);
        }

        if (action === "issue") {
            const { initial_value, sent_to_email, sent_to_name, message, purchased_by_email } = payload;
            // Generate unique code
            const code = `GC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
            const { data, error } = await supabase.from("ecom_gift_cards").insert({
                company_id, code, initial_value, remaining_value: initial_value,
                sent_to_email, sent_to_name, message, purchased_by_email,
            }).select("id, code").single();

            if (error) return json({ error: error.message }, 500);

            // Send gift card email
            if (sent_to_email) {
                const { data: settings } = await supabase.from("ecom_settings")
                    .select("store_name").eq("company_id", company_id).maybeSingle();
                await fetch(`${supabaseUrl}/functions/v1/send-email`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${supabaseServiceKey}` },
                    body: JSON.stringify({
                        company_id, to: sent_to_email,
                        subject: `You received a gift card from ${settings?.store_name || "us"}!`,
                        html: `<h2>You have a gift card worth ₹${initial_value}!</h2>
                        <p>Your code: <strong>${code}</strong></p>
                        ${message ? `<p>"${message}"</p>` : ""}
                        <p>Use this code at checkout.</p>`,
                    }),
                });
            }
            return json({ success: true, code, id: data.id });
        }

        return json({ error: `Unknown action: ${action}` }, 400);
    } catch (err: any) {
        return json({ error: err.message }, 500);
    }
});
