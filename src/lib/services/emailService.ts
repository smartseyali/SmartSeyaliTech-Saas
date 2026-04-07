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
