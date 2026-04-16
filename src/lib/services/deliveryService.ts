import { supabase } from "@/lib/supabase";

// ─── UoM Converter Service ─────────────────────────────────────────────────

interface ParsedUnit {
    grams: number;
    ml: number;
}

/**
 * Parse product weight/volume from a string like "250g", "1kg", "500ml", "1.5l"
 * Detects unit type from string pattern and product title (oil/liquid → volume)
 */
export function parseItemUnit(unitStr: string, title?: string): ParsedUnit {
    if (!unitStr) return { grams: 250, ml: 0 };

    const str = unitStr.toString().toLowerCase().trim();
    const num = parseFloat(str.replace(/[^\d.]/g, "")) || 0;

    // Volume: ml, liter, litre, l — or product title contains oil/juice/liquid
    if (/ml|liter|litre/.test(str) || (/^\d+(\.\d+)?l$/.test(str))) {
        if (/liter|litre|^\d+(\.\d+)?l$/.test(str)) {
            return { grams: 0, ml: num * 1000 };
        }
        return { grams: 0, ml: num || 1000 };
    }

    // Auto-detect liquid from title
    if (title && /oil|juice|liquid|syrup|shampoo|lotion/i.test(title) && num > 0) {
        return { grams: 0, ml: num };
    }

    // Weight: kg
    if (/kg/.test(str)) {
        return { grams: num * 1000, ml: 0 };
    }

    // Weight: g, gram, or just a number
    return { grams: num || 250, ml: 0 };
}

// ─── Aggregator Service ─────────────────────────────────────────────────────

export interface CartItemForShipping {
    weight?: string;
    title?: string;
    quantity: number;
    price?: number;
}

interface Aggregated {
    totalGrams: number;
    totalMl: number;
    totalQty: number;
    orderValue: number;
}

export function aggregateCart(items: CartItemForShipping[]): Aggregated {
    let totalGrams = 0;
    let totalMl = 0;
    let totalQty = 0;
    let orderValue = 0;

    for (const item of items) {
        const { grams, ml } = parseItemUnit(item.weight || "", item.title);
        const qty = item.quantity || 1;
        totalGrams += grams * qty;
        totalMl += ml * qty;
        totalQty += qty;
        orderValue += (item.price || 0) * qty;
    }

    return {
        totalGrams: Math.ceil(totalGrams),
        totalMl: Math.ceil(totalMl),
        totalQty,
        orderValue: Math.round(orderValue * 100) / 100,
    };
}

// ─── Shipping Calculator (calls DB pipeline) ────────────────────────────────

export interface ShippingResult {
    shippingCharge: number;
    zone: string;
    method: string;
    freeShipping: boolean;
    breakdown: {
        base: number;
        extras: number;
        extraItems: Array<{ type: string; name: string; amount: number }>;
    };
}

export async function calculateShippingCharge(
    companyId: number,
    state: string,
    items: CartItemForShipping[],
    paymentMethod: string = "prepaid",
    pincode: string = ""
): Promise<ShippingResult> {
    const agg = aggregateCart(items);

    // Unified engine: send grams and ml directly (not kg/cm³)
    const { data, error } = await supabase.rpc("calc_shipping", {
        p_company_id: companyId,
        p_state: state,
        p_pincode: pincode,
        p_weight_kg: agg.totalGrams,    // grams (param name kept for compat)
        p_qty: agg.totalQty,
        p_order_value: agg.orderValue,
        p_volume_cm3: agg.totalMl,      // ml (param name kept for compat)
        p_payment_method: paymentMethod,
    });

    if (error || !data) {
        console.error("Shipping calc error:", error);
        return {
            shippingCharge: 0, zone: "Default", method: "error", freeShipping: false,
            breakdown: { base: 0, extras: 0, extraItems: [] },
        };
    }

    return {
        shippingCharge: Number(data.shipping_charge) || 0,
        zone: data.zone || "Default",
        method: data.method || "unknown",
        freeShipping: data.free_shipping || false,
        breakdown: {
            base: Number(data.breakdown?.base) || 0,
            extras: Number(data.breakdown?.extras) || 0,
            extraItems: data.breakdown?.extra_items || [],
        },
    };
}
