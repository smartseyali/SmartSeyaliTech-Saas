// Supabase Edge Function: send-email
// Reads SMTP config from ecom_settings (via service role) — credentials never hit the frontend
// Supports platform-level SMTP via env vars when no company_id is provided
//
// Deploy: supabase functions deploy send-email --no-verify-jwt
//
// Required platform secrets (only when called without company_id):
//   PLATFORM_SMTP_USER, PLATFORM_SMTP_PASS
// Optional:
//   PLATFORM_SMTP_HOST (default smtp.gmail.com)
//   PLATFORM_SMTP_PORT (default 587)
//   PLATFORM_SMTP_FROM_NAME (default "Smartseyali")
//   PLATFORM_SMTP_FROM_EMAIL (default = PLATFORM_SMTP_USER)
//
// Uses npm: specifiers (Supabase Edge Runtime preferred path) instead of
// deno.land/x — that registry sometimes fails to resolve at boot, producing
// "InvalidWorkerCreation: could not find an appropriate entrypoint".

import nodemailer from "npm:nodemailer@6.9.14";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }
    if (req.method !== "POST") {
        return json({ error: "Method not allowed" }, 405);
    }

    let payload: any;
    try {
        payload = await req.json();
    } catch {
        return json({ error: "Invalid JSON body" }, 400);
    }

    const { company_id, to, subject, html } = payload || {};
    if (!to || !subject) {
        return json({ error: "Missing 'to' or 'subject'" }, 400);
    }

    let smtpHost: string;
    let smtpPort: number;
    let smtpUser: string;
    let smtpPass: string;
    let fromName: string;
    let fromEmail: string;

    try {
        if (company_id) {
            // Company-level SMTP: read from ecom_settings via service role
            if (!supabaseUrl || !supabaseServiceKey) {
                return json({ error: "Edge function missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env" }, 500);
            }
            const supabase = createClient(supabaseUrl, supabaseServiceKey);
            const { data: settings, error: dbErr } = await supabase
                .from("ecom_settings")
                .select("smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from_name, smtp_from_email, store_name")
                .eq("company_id", company_id)
                .maybeSingle();

            if (dbErr) {
                return json({ error: `DB lookup failed: ${dbErr.message}` }, 500);
            }
            if (!settings?.smtp_user || !settings?.smtp_pass) {
                return json({ error: "SMTP not configured for this store" }, 400);
            }

            smtpHost = settings.smtp_host || "smtp.gmail.com";
            smtpPort = Number(settings.smtp_port) || 587;
            smtpUser = settings.smtp_user;
            smtpPass = settings.smtp_pass;
            fromName = settings.smtp_from_name || settings.store_name || "Store";
            fromEmail = settings.smtp_from_email || settings.smtp_user;
        } else {
            // Platform-level SMTP: env vars
            const envUser = Deno.env.get("PLATFORM_SMTP_USER");
            const envPass = Deno.env.get("PLATFORM_SMTP_PASS");
            if (!envUser || !envPass) {
                return json({
                    error: "Platform SMTP not configured. Run: supabase secrets set PLATFORM_SMTP_USER=... PLATFORM_SMTP_PASS=...",
                }, 400);
            }
            smtpHost = Deno.env.get("PLATFORM_SMTP_HOST") || "smtp.gmail.com";
            smtpPort = parseInt(Deno.env.get("PLATFORM_SMTP_PORT") || "587", 10);
            smtpUser = envUser;
            smtpPass = envPass;
            fromName = Deno.env.get("PLATFORM_SMTP_FROM_NAME") || "Smartseyali";
            fromEmail = Deno.env.get("PLATFORM_SMTP_FROM_EMAIL") || envUser;
        }

        // 587 = STARTTLS (secure:false), 465 = implicit TLS (secure:true)
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: { user: smtpUser, pass: smtpPass },
        });

        await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to,
            subject,
            html,
        });

        return json({ success: true });
    } catch (err: any) {
        console.error("[send-email] failure:", err?.message || err, err?.stack);
        return json({ error: err?.message || String(err) }, 500);
    }
});
