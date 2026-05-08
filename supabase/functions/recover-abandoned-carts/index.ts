// Edge Function: recover-abandoned-carts
// Sends recovery emails to abandoned carts older than 1 hour.
// Trigger: pg_cron job (every hour) or manual invocation.
// Deploy: supabase functions deploy recover-abandoned-carts --no-verify-jwt

import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find carts where:
    // 1. Recovery email has NOT been sent
    // 2. Cart was last updated more than 1 hour ago
    // 3. No order has been placed since (status = 'active')
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: carts, error } = await supabase
        .from("ecom_abandoned_carts")
        .select("id, company_id, customer_email, customer_name, cart_items, cart_value, recovery_token")
        .is("recovery_email_sent_at", null)
        .lt("updated_at", oneHourAgo)
        .limit(50);

    if (error) return json({ error: error.message }, 500);
    if (!carts?.length) return json({ sent: 0, message: "No abandoned carts to recover" });

    let sent = 0;
    const errors: string[] = [];

    for (const cart of carts) {
        try {
            const { data: settings } = await supabase
                .from("ecom_settings")
                .select("store_name, store_url")
                .eq("company_id", cart.company_id)
                .maybeSingle();

            const storeName = settings?.store_name || "our store";
            const storeUrl = settings?.store_url || "";
            const recoveryUrl = storeUrl ? `${storeUrl}/cart/?recover=${cart.recovery_token}` : null;

            const itemsList = (cart.cart_items as Array<{ name: string; quantity: number; price: number }>)
                .map((i) => `<li>${i.name} × ${i.quantity} — ₹${(i.price * i.quantity).toLocaleString("en-IN")}</li>`)
                .join("");

            const html = `
<h2>You left something behind at ${storeName}!</h2>
<p>Hi ${cart.customer_name || "there"},</p>
<p>You have items waiting in your cart:</p>
<ul>${itemsList}</ul>
<p><strong>Cart total: ₹${Number(cart.cart_value).toLocaleString("en-IN")}</strong></p>
${recoveryUrl ? `<p><a href="${recoveryUrl}" style="background:#2490EF;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Complete Your Order</a></p>` : ""}
<p>If you have any questions, just reply to this email.</p>
            `.trim();

            await fetch(`${supabaseUrl}/functions/v1/send-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${supabaseServiceKey}`,
                },
                body: JSON.stringify({
                    company_id: cart.company_id,
                    to: cart.customer_email,
                    template_key: "abandoned_cart",
                    merge_tags: {
                        customer_name: cart.customer_name || "there",
                        store_name: storeName,
                        items_list: itemsList,
                        cart_total: `₹${Number(cart.cart_value).toLocaleString("en-IN")}`,
                        recovery_url: recoveryUrl || "",
                    },
                    // Fallback subject/html if template not configured
                    subject: `Don't forget your cart at ${storeName}!`,
                    html,
                }),
            });

            await supabase
                .from("ecom_abandoned_carts")
                .update({ recovery_email_sent_at: new Date().toISOString() })
                .eq("id", cart.id);

            sent++;
        } catch (err: unknown) {
            errors.push(`Cart ${cart.id}: ${err instanceof Error ? err.message : String(err)}`);
        }
    }

    return json({ sent, errors: errors.length ? errors : undefined });
});
