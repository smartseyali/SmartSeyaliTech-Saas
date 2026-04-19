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

    // Per-line slab lookup: each cart line runs its own calc_shipping and we sum
    // the slab (`base`) charges. Extras (COD/handling/etc) apply once at cart level
    // so we pull them from a single aggregated call.
    let totalBase = 0;
    let zone = "Default";
    let method = "per_item";
    let freeShipping = false;

    for (const item of items) {
        const { grams, ml } = parseItemUnit(item.weight || "", item.title);
        const qty = item.quantity || 1;
        const lineGrams = grams * qty;
        const lineMl = ml * qty;

        if (lineGrams === 0 && lineMl === 0) continue;

        const { data, error } = await supabase.rpc("calc_shipping", {
            p_company_id: companyId,
            p_state: state,
            p_pincode: pincode,
            p_weight_kg: lineGrams,        // grams (param name kept for compat)
            p_qty: qty,
            p_order_value: agg.orderValue, // full order value for free-shipping check
            p_volume_cm3: lineMl,          // ml (param name kept for compat)
            p_payment_method: paymentMethod,
        });

        if (error || !data) {
            console.error("Shipping calc error (line):", error, item);
            continue;
        }

        totalBase += Number(data.breakdown?.base) || 0;
        zone = data.zone || zone;
        method = data.method || method;
        if (data.free_shipping) freeShipping = true;
    }

    // One aggregated call just to resolve cart-level extras (COD, handling, etc)
    const { data: extrasData } = await supabase.rpc("calc_shipping", {
        p_company_id: companyId,
        p_state: state,
        p_pincode: pincode,
        p_weight_kg: agg.totalGrams,
        p_qty: agg.totalQty,
        p_order_value: agg.orderValue,
        p_volume_cm3: agg.totalMl,
        p_payment_method: paymentMethod,
    });
    const extras = Number(extrasData?.breakdown?.extras) || 0;
    const extraItems = extrasData?.breakdown?.extra_items || [];

    if (freeShipping) {
        return {
            shippingCharge: 0, zone, method: "free_shipping", freeShipping: true,
            breakdown: { base: 0, extras: 0, extraItems: [] },
        };
    }

    return {
        shippingCharge: Math.ceil(totalBase + extras),
        zone,
        method,
        freeShipping: false,
        breakdown: { base: Math.ceil(totalBase), extras, extraItems },
    };
}
