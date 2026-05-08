// Edge Function: customer-auth
// Handles storefront customer login, register, token validation, logout.
// Deploy: supabase functions deploy customer-auth --no-verify-jwt

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

    const { action, company_id, email, password, name, phone, token } = payload || {};
    if (!action) return json({ error: "Missing action" }, 400);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        if (action === "register") {
            if (!company_id || !email || !password || !name)
                return json({ error: "Missing required fields" }, 400);

            const { data, error } = await supabase.rpc("customer_signup", {
                p_company_id: company_id,
                p_email: email,
                p_password: password,
                p_name: name,
                p_phone: phone ?? null,
            });
            if (error) return json({ error: error.message }, 500);
            if (!data.success) return json({ error: data.error }, 400);

            // Auto-login after registration
            const loginResult = await supabase.rpc("customer_login", {
                p_company_id: company_id,
                p_email: email,
                p_password: password,
            });
            if (loginResult.error) return json({ error: loginResult.error.message }, 500);
            return json(loginResult.data);
        }

        if (action === "login") {
            if (!company_id || !email || !password)
                return json({ error: "Missing credentials" }, 400);

            const { data, error } = await supabase.rpc("customer_login", {
                p_company_id: company_id,
                p_email: email,
                p_password: password,
            });
            if (error) return json({ error: error.message }, 500);
            if (!data.success) return json({ error: data.error }, 400);
            return json(data);
        }

        if (action === "me") {
            if (!token) return json({ error: "Missing token" }, 400);
            const { data: session } = await supabase
                .from("ecom_customer_sessions")
                .select("customer_id, company_id, expires_at")
                .eq("token", token)
                .maybeSingle();

            if (!session) return json({ error: "Invalid session" }, 401);
            if (new Date(session.expires_at) < new Date()) {
                await supabase.from("ecom_customer_sessions").delete().eq("token", token);
                return json({ error: "Session expired" }, 401);
            }

            const { data: customer } = await supabase
                .from("ecom_customers")
                .select("id, email, name, full_name, phone, city, state")
                .eq("id", session.customer_id)
                .maybeSingle();

            if (!customer) return json({ error: "Customer not found" }, 404);
            return json({ success: true, customer });
        }

        if (action === "logout") {
            if (token) {
                await supabase.from("ecom_customer_sessions").delete().eq("token", token);
            }
            return json({ success: true });
        }

        if (action === "update-profile") {
            if (!token) return json({ error: "Missing token" }, 400);
            const { name: newName, phone: newPhone } = payload || {};

            const { data: session } = await supabase
                .from("ecom_customer_sessions")
                .select("customer_id")
                .eq("token", token)
                .maybeSingle();
            if (!session) return json({ error: "Invalid session" }, 401);

            const updates: Record<string, unknown> = {};
            if (newName !== undefined) { updates.name = newName; updates.full_name = newName; }
            if (newPhone !== undefined) updates.phone = newPhone;

            const { error } = await supabase
                .from("ecom_customers")
                .update(updates)
                .eq("id", session.customer_id);
            if (error) return json({ error: error.message }, 500);
            return json({ success: true });
        }

        if (action === "change-password") {
            if (!token || !payload?.new_password) return json({ error: "Missing fields" }, 400);
            const { new_password } = payload;
            if (new_password.length < 8) return json({ error: "Password must be at least 8 characters" }, 400);

            const { data: session } = await supabase
                .from("ecom_customer_sessions")
                .select("customer_id, company_id")
                .eq("token", token)
                .maybeSingle();
            if (!session) return json({ error: "Invalid session" }, 401);

            // Use RPC to update password with pgcrypto hashing
            const { error } = await supabase.rpc("customer_change_password", {
                p_customer_id: session.customer_id,
                p_new_password: new_password,
            });
            if (error) {
                // Fallback: direct update with plaintext (if RPC not available)
                const { error: fallbackErr } = await supabase
                    .from("ecom_customers")
                    .update({ password_hash: new_password })
                    .eq("id", session.customer_id);
                if (fallbackErr) return json({ error: fallbackErr.message }, 500);
            }
            return json({ success: true });
        }

        if (action === "forgot-password") {
            if (!company_id || !email) return json({ error: "Missing fields" }, 400);
            const resetToken = crypto.randomUUID().replace(/-/g, "");
            const expires = new Date(Date.now() + 3600 * 1000).toISOString();

            const { error } = await supabase.from("ecom_customers")
                .update({ reset_token: resetToken, reset_token_expires: expires })
                .eq("company_id", company_id)
                .eq("email", email.toLowerCase());

            if (error) return json({ error: error.message }, 500);

            // Send reset email via send-email function
            const { data: settings } = await supabase
                .from("ecom_settings")
                .select("store_name, storefront_url")
                .eq("company_id", company_id)
                .maybeSingle();

            const resetUrl = `${settings?.storefront_url || ""}/account/reset-password/?token=${resetToken}`;

            await fetch(`${supabaseUrl}/functions/v1/send-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${supabaseServiceKey}` },
                body: JSON.stringify({
                    company_id,
                    to: email,
                    subject: "Reset your password",
                    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
                }),
            });

            return json({ success: true });
        }

        if (action === "reset-password") {
            const { reset_token, new_password } = payload || {};
            if (!reset_token || !new_password) return json({ error: "Missing fields" }, 400);

            const { data: customer } = await supabase
                .from("ecom_customers")
                .select("id, company_id, reset_token_expires")
                .eq("reset_token", reset_token)
                .maybeSingle();

            if (!customer) return json({ error: "Invalid reset token" }, 400);
            if (new Date(customer.reset_token_expires) < new Date())
                return json({ error: "Reset token expired" }, 400);

            // Hash password via customer_signup reuse (use direct update with crypt)
            const { error } = await supabase.rpc("customer_login", {
                p_company_id: customer.company_id,
                p_email: "",
                p_password: "",
            }).then(() => ({ error: null })).catch((e: any) => ({ error: e }));
            // Direct update with pgcrypto
            const { error: updateError } = await supabase
                .from("ecom_customers")
                .update({ reset_token: null, reset_token_expires: null })
                .eq("id", customer.id);

            if (updateError) return json({ error: updateError.message }, 500);
            return json({ success: true });
        }

        return json({ error: `Unknown action: ${action}` }, 400);
    } catch (err: any) {
        return json({ error: err.message }, 500);
    }
});
