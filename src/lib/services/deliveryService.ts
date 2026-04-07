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
        weightCharge: number;
        volumeCharge: number;
        valueCharge: number;
        qtyCharge: number;
        extras: number;
        extraItems: Array<{ type: string; name: string; amount: number }>;
    };
}

export async function calculateShippingCharge(
    companyId: number,
    state: string,
    items: CartItemForShipping[],
    paymentMethod: string = "prepaid"
): Promise<ShippingResult> {
    const agg = aggregateCart(items);

    const { data, error } = await supabase.rpc("calculate_shipping_charge", {
        p_company_id: companyId,
        p_state: state,
        p_total_grams: agg.totalGrams,
        p_total_ml: agg.totalMl,
        p_total_qty: agg.totalQty,
        p_order_value: agg.orderValue,
        p_payment_method: paymentMethod,
    });

    if (error || !data) {
        console.error("Shipping calc error:", error);
        return {
            shippingCharge: 0, zone: "REST", method: "error", freeShipping: false,
            breakdown: { base: 0, weightCharge: 0, volumeCharge: 0, valueCharge: 0, qtyCharge: 0, extras: 0, extraItems: [] },
        };
    }

    return {
        shippingCharge: Number(data.shipping_charge) || 0,
        zone: data.zone || "REST",
        method: data.method || "unknown",
        freeShipping: data.free_shipping || false,
        breakdown: {
            base: Number(data.breakdown?.base) || 0,
            weightCharge: Number(data.breakdown?.weight_charge) || 0,
            volumeCharge: Number(data.breakdown?.volume_charge) || 0,
            valueCharge: Number(data.breakdown?.value_charge) || 0,
            qtyCharge: Number(data.breakdown?.qty_charge) || 0,
            extras: Number(data.breakdown?.extras) || 0,
            extraItems: data.breakdown?.extra_items || [],
        },
    };
}
