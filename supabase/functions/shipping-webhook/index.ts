// Edge Function: shipping-webhook
// Receives POST from Shiprocket / Delhivery when shipment status changes.
// Updates ecom_orders tracking info and fires delivery email.
// Configure webhook URL in Shiprocket: <supabase_url>/functions/v1/shipping-webhook
// Deploy: supabase functions deploy shipping-webhook --no-verify-jwt

import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey" };
function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

// Map Shiprocket statuses → our statuses
const STATUS_MAP: Record<string, string> = {
    "PICKED UP": "confirmed",
    "IN TRANSIT": "shipped",
    "OUT FOR DELIVERY": "out_for_delivery",
    "DELIVERED": "delivered",
    "RTO INITIATED": "rto",
    "CANCELLED": "cancelled",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    let payload: any;
    try { payload = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log the raw event
    await supabase.from("ecom_webhook_events").insert({
        provider: "shiprocket",
        event_type: payload.current_status || payload.status,
        payload,
    });

    // Extract order number (Shiprocket sends it as order_id or awb_assigned_order_id)
    const orderNumber = payload.order_id || payload.awb_order_id;
    const awb = payload.awb || payload.awb_code;
    const courier = payload.courier_name || payload.shipper_name;
    const shiprocketStatus = (payload.current_status || payload.status || "").toUpperCase();
    const ourStatus = STATUS_MAP[shiprocketStatus];

    if (!orderNumber) return json({ ok: true, skipped: "no order number" });

    // Find the order
    const { data: order } = await supabase
        .from("ecom_orders")
        .select("id, company_id, customer_email, customer_name, order_number")
        .eq("order_number", orderNumber)
        .maybeSingle();

    if (!order) return json({ ok: true, skipped: "order not found" });

    // Update order
    const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (awb) updatePayload.tracking_number = awb;
    if (courier) updatePayload.courier_name = courier;
    if (ourStatus) updatePayload.status = ourStatus;

    await supabase.from("ecom_orders").update(updatePayload).eq("id", order.id);

    // Timeline entry
    await supabase.from("ecom_order_timeline").insert({
        order_id: order.id,
        company_id: order.company_id,
        status: ourStatus || shiprocketStatus.toLowerCase(),
        note: `${courier || "Courier"}: ${payload.current_status || payload.status}${awb ? ` (AWB: ${awb})` : ""}`,
    });

    // Send email on shipped / delivered
    if (ourStatus === "shipped" && order.customer_email) {
        const trackingLink = awb
            ? `<p><a href="https://shiprocket.co/tracking/${awb}">Track your shipment →</a></p>`
            : "";
        await fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${supabaseServiceKey}` },
            body: JSON.stringify({
                company_id: order.company_id,
                to: order.customer_email,
                template_key: "order_shipped",
                merge_tags: {
                    customer_name: order.customer_name,
                    order_number: order.order_number,
                    courier_name: courier || "Our courier partner",
                    tracking_number: awb || "—",
                    tracking_link: trackingLink,
                },
            }),
        });
    }

    if (ourStatus === "delivered" && order.customer_email) {
        await fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${supabaseServiceKey}` },
            body: JSON.stringify({
                company_id: order.company_id,
                to: order.customer_email,
                template_key: "order_delivered",
                merge_tags: {
                    customer_name: order.customer_name,
                    order_number: order.order_number,
                    review_url: "",
                    store_name: "",
                    store_address: "",
                },
            }),
        });
    }

    // Mark webhook processed
    await supabase.from("ecom_webhook_events")
        .update({ processed: true, order_id: order.id })
        .eq("payload->>'order_id'", orderNumber)
        .eq("processed", false);

    return json({ ok: true });
});
