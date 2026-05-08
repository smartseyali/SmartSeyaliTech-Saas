// Edge Function: create-shipment
// Called from admin EcomOrderDetail to create a shipment in Shiprocket.
// Deploy: supabase functions deploy create-shipment --no-verify-jwt

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

    const { order_id, company_id, weight_kg = 0.5, length = 15, breadth = 12, height = 10 } = payload || {};
    if (!order_id || !company_id) return json({ error: "Missing order_id or company_id" }, 400);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // Get Shiprocket credentials
        const { data: settings } = await supabase
            .from("ecom_settings")
            .select("shiprocket_email, shiprocket_password, shiprocket_channel_id, store_name, support_phone")
            .eq("company_id", company_id)
            .maybeSingle();

        if (!settings?.shiprocket_email || !settings?.shiprocket_password) {
            return json({ error: "Shiprocket credentials not configured. Go to E-Commerce → Settings → Shipping." }, 400);
        }

        // Get order details
        const { data: order } = await supabase
            .from("ecom_orders")
            .select("*, ecom_order_items(*)")
            .eq("id", order_id)
            .maybeSingle();

        if (!order) return json({ error: "Order not found" }, 404);

        // Authenticate with Shiprocket
        const authRes = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: settings.shiprocket_email, password: settings.shiprocket_password }),
        });
        const authData = await authRes.json();
        if (!authData.token) return json({ error: "Shiprocket authentication failed" }, 400);

        const srToken = authData.token;
        const address = order.shipping_address || {};

        // Create Shiprocket order + auto-assign courier
        const srOrderPayload = {
            order_id: order.order_number,
            order_date: new Date(order.created_at).toISOString().split("T")[0],
            pickup_location: "Primary",
            channel_id: settings.shiprocket_channel_id || "",
            billing_customer_name: order.customer_name,
            billing_last_name: "",
            billing_address: address.line1 || address.address || "",
            billing_city: address.city || "",
            billing_pincode: address.pincode || "",
            billing_state: address.state || "",
            billing_country: "India",
            billing_email: order.customer_email,
            billing_phone: order.customer_phone || "",
            shipping_is_billing: true,
            order_items: (order.ecom_order_items || []).map((item: any) => ({
                name: item.product_name,
                sku: item.sku || item.product_id,
                units: item.quantity,
                selling_price: item.unit_price,
                discount: 0,
                tax: 0,
                hsn: item.hsn_code || 0,
            })),
            payment_method: order.payment_method === "cod" ? "COD" : "Prepaid",
            sub_total: order.subtotal,
            length, breadth, height, weight: weight_kg,
        };

        const srRes = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${srToken}` },
            body: JSON.stringify(srOrderPayload),
        });
        const srData = await srRes.json();

        if (srData.status_code !== 1 && !srData.order_id) {
            return json({ error: srData.message || "Shiprocket order creation failed", details: srData }, 400);
        }

        const awb = srData.awb_code || srData.shipment_id?.toString() || "";
        const courier = srData.courier_name || "";

        // Update our order with tracking info
        await supabase.from("ecom_orders").update({
            tracking_number: awb,
            courier_name: courier,
            status: "confirmed",
        }).eq("id", order_id);

        await supabase.from("ecom_order_timeline").insert({
            order_id, company_id,
            status: "confirmed",
            note: `Shipment created in Shiprocket. Courier: ${courier}. AWB: ${awb}`,
        });

        return json({ success: true, awb, courier, shiprocket_order_id: srData.order_id });
    } catch (err: any) {
        return json({ error: err.message }, 500);
    }
});
