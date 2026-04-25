import { supabase } from "@/lib/supabase";

/**
 * Email Service — Sends emails via merchant's configured SMTP
 *
 * Flow:
 * 1. Reads SMTP config from ecom_settings
 * 2. Posts to a Supabase Edge Function (/functions/v1/send-email)
 *    which connects to the merchant's SMTP (Gmail etc.)
 * 3. The Edge Function handles the actual SMTP connection
 *
 * Merchants configure: smtp_host, smtp_port, smtp_user, smtp_pass,
 * smtp_from_name, smtp_from_email in Store Settings.
 */

interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

async function getStoreInfo(companyId: number) {
    // Use public view to get non-sensitive store info (no SMTP creds)
    const { data } = await supabase
        .from("ecom_settings_public")
        .select("store_name, storefront_url")
        .eq("company_id", companyId)
        .maybeSingle();
    return data;
}

async function sendEmail(companyId: number, payload: EmailPayload): Promise<boolean> {
    try {
        // Edge Function reads SMTP config from DB using service role — credentials never leave the server
        const { data, error } = await supabase.functions.invoke("send-email", {
            body: {
                company_id: companyId,
                to: payload.to,
                subject: payload.subject,
                html: payload.html,
            },
        });

        if (error) {
            console.error("Email send error:", error);
            return false;
        }
        return true;
    } catch (err) {
        console.error("Email service error:", err);
        return false;
    }
}

export async function sendVerificationEmail(
    companyId: number,
    customerEmail: string,
    customerName: string,
    verificationToken: string
): Promise<boolean> {
    const config = await getStoreInfo(companyId);
    const storeName = config?.store_name || "Store";
    const baseUrl = config?.storefront_url || window.location.origin;
    const verifyUrl = `${baseUrl}/store/verify?token=${verificationToken}`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <div style="background:#2563eb;padding:32px 24px;text-align:center;">
      <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0;letter-spacing:0.5px;">${storeName}</h1>
    </div>
    <div style="padding:32px 24px;">
      <h2 style="color:#0f172a;font-size:18px;font-weight:700;margin:0 0 12px;">Verify Your Email</h2>
      <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Hi ${customerName},<br><br>
        Welcome to ${storeName}! Please verify your email address to start placing orders.
      </p>
      <a href="${verifyUrl}"
         style="display:inline-block;background:#2563eb;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:10px;letter-spacing:0.5px;">
        Verify Email Address
      </a>
      <p style="color:#94a3b8;font-size:12px;margin:24px 0 0;line-height:1.5;">
        This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
      </p>
      <hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0;">
      <p style="color:#cbd5e1;font-size:11px;margin:0;text-align:center;">
        Can't click the button? Copy this link:<br>
        <span style="color:#94a3b8;word-break:break-all;">${verifyUrl}</span>
      </p>
    </div>
  </div>
</body>
</html>`;

    return sendEmail(companyId, {
        to: customerEmail,
        subject: `Verify your email — ${storeName}`,
        html,
    });
}

/**
 * Platform-level email — uses env-var SMTP (no company_id needed)
 * Throws on failure with the actual reason (SMTP not configured, edge fn down, etc.)
 *
 * Uses a direct fetch() instead of supabase.functions.invoke() because the
 * SDK's FunctionsHttpError swallows the response body in some versions, leaving
 * callers with the generic "Edge Function returned a non-2xx status code".
 */
async function sendPlatformEmail(payload: EmailPayload): Promise<void> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase URL/anon key not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
    }

    const url = `${supabaseUrl.replace(/\/+$/, "")}/functions/v1/send-email`;

    let res: Response;
    try {
        res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseAnonKey}`,
                "apikey": supabaseAnonKey,
            },
            body: JSON.stringify({
                to: payload.to,
                subject: payload.subject,
                html: payload.html,
                // No company_id → edge function uses platform SMTP env vars
            }),
        });
    } catch (netErr: any) {
        throw new Error(`Could not reach send-email edge function: ${netErr?.message || netErr}`);
    }

    // Read body once, regardless of status, so we can surface the real reason.
    const rawText = await res.text().catch(() => "");
    let parsedBody: any = null;
    if (rawText) {
        try { parsedBody = JSON.parse(rawText); } catch { /* not JSON */ }
    }

    if (!res.ok) {
        // Prefer the function's own error message in the body
        let detail: string | undefined =
            parsedBody?.error || parsedBody?.message || (rawText && rawText.trim()) || undefined;

        if (!detail) {
            if (res.status === 404) {
                detail = "send-email edge function not deployed. Run: supabase functions deploy send-email";
            } else if (res.status === 401 || res.status === 403) {
                detail = "send-email edge function rejected the request (auth). Check anon key / function permissions.";
            } else {
                detail = `Edge function returned HTTP ${res.status}`;
            }
        }
        console.error("send-email failed", { status: res.status, body: parsedBody ?? rawText });
        throw new Error(detail);
    }

    if (parsedBody?.error) throw new Error(parsedBody.error);
    if (parsedBody && parsedBody.success === false) throw new Error("Email send returned failure");
}

/**
 * Send verification email to a tenant (platform) user during onboarding.
 * Throws Error on failure — callers should surface the message to the user.
 */
export async function sendTenantVerificationEmail(
    userEmail: string,
    userName: string,
    verificationToken: string
): Promise<void> {
    const verifyUrl = `${window.location.origin}/verify-tenant-email?token=${verificationToken}`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <div style="background:#0f172a;padding:32px 24px;text-align:center;">
      <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0;letter-spacing:0.5px;">Smartseyali</h1>
      <p style="color:#94a3b8;font-size:12px;margin:8px 0 0;letter-spacing:1px;">BUSINESS PLATFORM</p>
    </div>
    <div style="padding:32px 24px;">
      <h2 style="color:#0f172a;font-size:18px;font-weight:700;margin:0 0 12px;">Verify Your Email</h2>
      <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Hi ${userName},<br><br>
        Welcome to Smartseyali! Please verify your email address to complete your account setup and access the platform.
      </p>
      <a href="${verifyUrl}"
         style="display:inline-block;background:#2563eb;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:10px;letter-spacing:0.5px;">
        Verify Email Address
      </a>
      <p style="color:#94a3b8;font-size:12px;margin:24px 0 0;line-height:1.5;">
        This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
      </p>
      <hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0;">
      <p style="color:#cbd5e1;font-size:11px;margin:0;text-align:center;">
        Can't click the button? Copy this link:<br>
        <span style="color:#94a3b8;word-break:break-all;">${verifyUrl}</span>
      </p>
    </div>
  </div>
</body>
</html>`;

    await sendPlatformEmail({
        to: userEmail,
        subject: "Verify your email — Smartseyali",
        html,
    });
}

export async function sendOrderConfirmationEmail(
    companyId: number,
    customerEmail: string,
    customerName: string,
    orderNumber: string,
    grandTotal: number
): Promise<boolean> {
    const config = await getStoreInfo(companyId);
    const storeName = config?.store_name || "Store";
    const baseUrl = config?.storefront_url || window.location.origin;
    const trackUrl = `${baseUrl}/store/track`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <div style="background:#059669;padding:32px 24px;text-align:center;">
      <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0;">${storeName}</h1>
      <p style="color:#d1fae5;font-size:12px;margin:8px 0 0;letter-spacing:1px;">ORDER CONFIRMED</p>
    </div>
    <div style="padding:32px 24px;">
      <h2 style="color:#0f172a;font-size:18px;font-weight:700;margin:0 0 12px;">Thank you, ${customerName}!</h2>
      <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Your order <strong style="color:#0f172a;">${orderNumber}</strong> has been placed successfully.
      </p>
      <div style="background:#f8fafc;border-radius:10px;padding:16px;margin:0 0 24px;border:1px solid #e2e8f0;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="color:#64748b;font-size:12px;font-weight:600;letter-spacing:1px;">TOTAL</span>
          <span style="color:#0f172a;font-size:20px;font-weight:700;">₹${grandTotal.toLocaleString("en-IN")}</span>
        </div>
      </div>
      <a href="${trackUrl}"
         style="display:inline-block;background:#2563eb;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:10px;letter-spacing:0.5px;">
        Track Your Order
      </a>
    </div>
  </div>
</body>
</html>`;

    return sendEmail(companyId, {
        to: customerEmail,
        subject: `Order Confirmed — ${orderNumber} | ${storeName}`,
        html,
    });
}
