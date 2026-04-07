import { supabase } from "@/lib/supabase";

/**
 * Parse item weight/volume from a string like "250g", "1kg", "500ml", "1.5l"
 * Returns { grams, ml }
 */
export function parseItemUnit(unitStr: string, title?: string): { grams: number; ml: number } {
    if (!unitStr) return { grams: 250, ml: 0 }; // default fallback

    const str = unitStr.toString().toLowerCase().trim();

    // Volume detection: ml, liter, litre, l
    if (/ml|liter|litre/.test(str) || (title && /oil|juice|liquid|syrup/i.test(title))) {
        const num = parseFloat(str.replace(/[^\d.]/g, "")) || 0;
        if (/liter|litre|^\d+(\.\d+)?l$/.test(str)) {
            return { grams: 0, ml: num * 1000 };
        }
        return { grams: 0, ml: num || 1000 };
    }

    // Weight detection: kg, g, gram
    if (/kg/.test(str)) {
        const num = parseFloat(str.replace(/[^\d.]/g, "")) || 0;
        return { grams: num * 1000, ml: 0 };
    }

    const num = parseFloat(str.replace(/[^\d.]/g, "")) || 0;
    return { grams: num || 250, ml: 0 };
}

/**
 * Calculate delivery charge for a cart
 */
export async function calculateDeliveryCharge(
    companyId: number,
    state: string,
    items: Array<{ weight?: string; title?: string; quantity: number }>
): Promise<{ deliveryCharge: number; zone: string; weightCharge: number; volumeCharge: number; totalGrams: number; totalMl: number }> {
    // 1. Parse all items into total grams and total ml
    let totalGrams = 0;
    let totalMl = 0;

    for (const item of items) {
        const { grams, ml } = parseItemUnit(item.weight || "", item.title);
        totalGrams += grams * (item.quantity || 1);
        totalMl += ml * (item.quantity || 1);
    }

    // 2. Call DB function for calculation
    const { data, error } = await supabase.rpc("calculate_delivery_charge", {
        p_company_id: companyId,
        p_state: state,
        p_total_grams: Math.ceil(totalGrams),
        p_total_ml: Math.ceil(totalMl),
    });

    if (error || !data) {
        console.error("Delivery calculation error:", error);
        return { deliveryCharge: 0, zone: "REST", weightCharge: 0, volumeCharge: 0, totalGrams, totalMl };
    }

    return {
        deliveryCharge: Number(data.delivery_charge) || 0,
        zone: data.zone || "REST",
        weightCharge: Number(data.weight_charge) || 0,
        volumeCharge: Number(data.volume_charge) || 0,
        totalGrams,
        totalMl,
    };
}

/**
 * Check if order qualifies for free delivery
 */
export async function checkFreeDelivery(companyId: number, orderTotal: number): Promise<boolean> {
    const { data } = await supabase
        .from("ecom_settings")
        .select("free_delivery_above")
        .eq("company_id", companyId)
        .maybeSingle();

    const threshold = Number(data?.free_delivery_above) || 0;
    return threshold > 0 && orderTotal >= threshold;
}
