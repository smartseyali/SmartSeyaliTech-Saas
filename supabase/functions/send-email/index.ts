// Supabase Edge Function: send-email
// Reads SMTP config from ecom_settings (via service role) — credentials never hit the frontend
// Deploy: supabase functions deploy send-email

import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
    // CORS
    if (req.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
            },
        });
    }

    try {
        const { company_id, to, subject, html } = await req.json();

        if (!company_id || !to || !subject) {
            return new Response(JSON.stringify({ error: "Missing company_id, to, or subject" }), {
                status: 400,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
        }

        // Read SMTP config from DB using service role (secure — never exposed to frontend)
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data: settings, error: dbErr } = await supabase
            .from("ecom_settings")
            .select("smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from_name, smtp_from_email, store_name")
            .eq("company_id", company_id)
            .maybeSingle();

        if (dbErr || !settings?.smtp_user || !settings?.smtp_pass) {
            return new Response(JSON.stringify({ error: "SMTP not configured for this store" }), {
                status: 400,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
        }

        const client = new SMTPClient({
            connection: {
                hostname: settings.smtp_host || "smtp.gmail.com",
                port: settings.smtp_port || 587,
                tls: true,
                auth: {
                    username: settings.smtp_user,
                    password: settings.smtp_pass,
                },
            },
        });

        const fromName = settings.smtp_from_name || settings.store_name || "Store";
        const fromEmail = settings.smtp_from_email || settings.smtp_user;

        await client.send({
            from: `${fromName} <${fromEmail}>`,
            to,
            subject,
            content: "Please view this email in an HTML-capable client.",
            html,
        });

        await client.close();

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
    } catch (error: any) {
        console.error("SMTP Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
    }
});
