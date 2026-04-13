// Supabase Edge Function: send-email
// Reads SMTP config from ecom_settings (via service role) — credentials never hit the frontend
// Supports platform-level SMTP via env vars when no company_id is provided
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

        if (!to || !subject) {
            return new Response(JSON.stringify({ error: "Missing to or subject" }), {
                status: 400,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
        }

        let smtpHost: string;
        let smtpPort: number;
        let smtpUser: string;
        let smtpPass: string;
        let fromName: string;
        let fromEmail: string;

        if (company_id) {
            // Company-level SMTP: read from ecom_settings
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

            smtpHost = settings.smtp_host || "smtp.gmail.com";
            smtpPort = settings.smtp_port || 587;
            smtpUser = settings.smtp_user;
            smtpPass = settings.smtp_pass;
            fromName = settings.smtp_from_name || settings.store_name || "Store";
            fromEmail = settings.smtp_from_email || settings.smtp_user;
        } else {
            // Platform-level SMTP: read from env vars
            const envUser = Deno.env.get("PLATFORM_SMTP_USER");
            const envPass = Deno.env.get("PLATFORM_SMTP_PASS");

            if (!envUser || !envPass) {
                return new Response(JSON.stringify({ error: "Platform SMTP not configured. Set PLATFORM_SMTP_USER and PLATFORM_SMTP_PASS env vars." }), {
                    status: 400,
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                });
            }

            smtpHost = Deno.env.get("PLATFORM_SMTP_HOST") || "smtp.gmail.com";
            smtpPort = parseInt(Deno.env.get("PLATFORM_SMTP_PORT") || "587");
            smtpUser = envUser;
            smtpPass = envPass;
            fromName = Deno.env.get("PLATFORM_SMTP_FROM_NAME") || "Smartseyali";
            fromEmail = Deno.env.get("PLATFORM_SMTP_FROM_EMAIL") || envUser;
        }

        const client = new SMTPClient({
            connection: {
                hostname: smtpHost,
                port: smtpPort,
                tls: true,
                auth: {
                    username: smtpUser,
                    password: smtpPass,
                },
            },
        });

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
