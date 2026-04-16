-- ========================================================================================
-- UNIFIED DELIVERY CHARGE ENGINE v4
-- Replaces the old dual-tariff (WEIGHT + VOLUME) system with a single unified engine.
--
-- Core idea: convert everything to grams using a configurable factor:
--   effective_weight = weight_g + (volume_ml × ml_to_g_factor)
--
-- Then: detect zone → match slab → return price.
--
-- RUN THIS IN SUPABASE SQL EDITOR
-- ========================================================================================

-- ─── 1. Schema: add conversion factor to tariffs ─────────────────────────────

ALTER TABLE public.shipping_tariffs
  ADD COLUMN IF NOT EXISTS ml_to_g_factor DECIMAL(5,2) DEFAULT 1.0;

COMMENT ON COLUMN public.shipping_tariffs.ml_to_g_factor
  IS 'Conversion: 1 ml = this many grams. Default 1.0. Used by UNIFIED shipping_type.';

-- ─── 2. Replace calc_shipping() ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.calc_shipping(
    p_company_id  BIGINT,
    p_state       TEXT    DEFAULT '',
    p_pincode     TEXT    DEFAULT '',
    p_weight_kg   DECIMAL DEFAULT 0,      -- For UNIFIED: pass grams here
    p_qty         INT     DEFAULT 1,
    p_order_value DECIMAL DEFAULT 0,
    p_volume_cm3  DECIMAL DEFAULT 0,      -- For UNIFIED: pass ml here
    p_payment_method TEXT DEFAULT 'prepaid'
)
RETURNS JSONB AS $$
DECLARE
    v_tariff      RECORD;
    v_zone        RECORD;
    v_slab        RECORD;
    v_calc_value  DECIMAL;
    v_weight_g    DECIMAL;
    v_volume_ml   DECIMAL;
    v_effective_g DECIMAL;
    v_base        DECIMAL := 0;
    v_extra_total DECIMAL := 0;
    v_extras      JSONB   := '[]'::JSONB;
    v_extra       RECORD;
    v_zone_name   TEXT    := 'Default';
    v_method      TEXT    := 'slab';
    v_factor      DECIMAL;
BEGIN
    -- ══════════════════════════════════════════════════════════════
    -- STEP 1: Get highest priority active tariff for this company
    -- ══════════════════════════════════════════════════════════════
    SELECT * INTO v_tariff
    FROM public.shipping_tariffs
    WHERE company_id = p_company_id AND is_active = true
    ORDER BY priority ASC
    LIMIT 1;

    IF v_tariff IS NULL THEN
        RETURN jsonb_build_object(
            'shipping_charge', 0,
            'method', 'no_tariff',
            'zone', 'none',
            'free_shipping', false,
            'breakdown', '{}'::JSONB
        );
    END IF;

    v_factor := COALESCE(v_tariff.ml_to_g_factor, 1.0);

    -- ══════════════════════════════════════════════════════════════
    -- STEP 2: Compute effective weight (UNIFIED conversion)
    -- ══════════════════════════════════════════════════════════════
    -- For UNIFIED tariffs: p_weight_kg = grams, p_volume_cm3 = ml
    -- For legacy WEIGHT tariffs with uom=g: same interpretation
    -- For legacy WEIGHT tariffs with uom=kg: p_weight_kg is kg

    v_weight_g  := p_weight_kg;
    v_volume_ml := p_volume_cm3;

    CASE v_tariff.shipping_type
        WHEN 'UNIFIED' THEN
            v_effective_g := v_weight_g + (v_volume_ml * v_factor);
            v_calc_value  := v_effective_g;

        WHEN 'WEIGHT' THEN
            IF v_tariff.primary_uom = 'g' THEN
                v_effective_g := v_weight_g + (v_volume_ml * v_factor);
                v_calc_value  := v_effective_g;
            ELSE
                -- Legacy kg-based tariff
                v_calc_value := p_weight_kg;
            END IF;

        WHEN 'VOLUME' THEN
            v_calc_value := p_volume_cm3;

        WHEN 'QTY' THEN
            v_calc_value := p_qty;

        WHEN 'VALUE' THEN
            v_calc_value := p_order_value;

        ELSE
            v_effective_g := v_weight_g + (v_volume_ml * v_factor);
            v_calc_value  := v_effective_g;
    END CASE;

    -- Round per tariff rule
    IF v_tariff.rounding_rule = 'ROUND_UP' THEN
        v_calc_value := CEIL(v_calc_value);
    ELSIF v_tariff.rounding_rule = 'ROUND_DOWN' THEN
        v_calc_value := FLOOR(v_calc_value);
    ELSE
        v_calc_value := ROUND(v_calc_value);
    END IF;

    -- ══════════════════════════════════════════════════════════════
    -- STEP 3: Free shipping check
    -- ══════════════════════════════════════════════════════════════
    IF v_tariff.free_shipping_enabled THEN
        IF (v_tariff.free_shipping_condition = 'VALUE'  AND p_order_value >= v_tariff.free_shipping_min)
        OR (v_tariff.free_shipping_condition = 'WEIGHT' AND v_calc_value  >= v_tariff.free_shipping_min)
        OR (v_tariff.free_shipping_condition = 'QTY'    AND p_qty         >= v_tariff.free_shipping_min)
        THEN
            RETURN jsonb_build_object(
                'shipping_charge', 0,
                'method', 'free_shipping',
                'free_shipping', true,
                'zone', 'all',
                'tariff', v_tariff.tariff_name,
                'breakdown', jsonb_build_object(
                    'base', 0, 'extras', 0,
                    'effective_weight_g', v_calc_value,
                    'weight_g', v_weight_g,
                    'volume_ml', v_volume_ml,
                    'ml_to_g_factor', v_factor
                )
            );
        END IF;
    END IF;

    -- ══════════════════════════════════════════════════════════════
    -- STEP 4: Detect zone (pincode → state → fallback)
    -- ══════════════════════════════════════════════════════════════

    -- (a) Pincode match — only zones that define pincode ranges
    IF p_pincode != '' THEN
        SELECT * INTO v_zone
        FROM public.shipping_zones_v2
        WHERE tariff_id = v_tariff.id
          AND pincode_from IS NOT NULL
          AND p_pincode >= pincode_from
          AND p_pincode <= COALESCE(pincode_to, 'ZZZZZZ')
        ORDER BY display_order ASC
        LIMIT 1;
    END IF;

    -- (b) State match
    IF v_zone IS NULL AND p_state != '' THEN
        SELECT * INTO v_zone
        FROM public.shipping_zones_v2
        WHERE tariff_id = v_tariff.id
          AND p_state = ANY(states)
        ORDER BY display_order ASC
        LIMIT 1;
    END IF;

    -- (c) Catch-all zone (empty states, no pincode)
    IF v_zone IS NULL THEN
        SELECT * INTO v_zone
        FROM public.shipping_zones_v2
        WHERE tariff_id = v_tariff.id
          AND states = ARRAY[]::TEXT[]
          AND pincode_from IS NULL
        ORDER BY display_order
        LIMIT 1;
    END IF;

    IF v_zone IS NOT NULL THEN
        v_zone_name := v_zone.zone_name;

        -- Flat-rate zone → return immediately
        IF v_zone.charge_type = 'FLAT' THEN
            RETURN jsonb_build_object(
                'shipping_charge', CEIL(v_zone.flat_charge),
                'method', 'flat_zone',
                'zone', v_zone.zone_name,
                'tariff', v_tariff.tariff_name,
                'free_shipping', false,
                'breakdown', jsonb_build_object(
                    'base', v_zone.flat_charge,
                    'extras', 0,
                    'effective_weight_g', v_calc_value,
                    'weight_g', v_weight_g,
                    'volume_ml', v_volume_ml,
                    'ml_to_g_factor', v_factor
                )
            );
        END IF;
    END IF;

    -- ══════════════════════════════════════════════════════════════
    -- STEP 5: Match slab (zone-specific first, then global)
    -- Find smallest slab where calc_value falls within range
    -- ══════════════════════════════════════════════════════════════
    SELECT * INTO v_slab
    FROM public.shipping_slabs
    WHERE tariff_id = v_tariff.id
      AND range_from <= v_calc_value
      AND (range_to IS NULL OR range_to >= v_calc_value)
      AND (zone_id = v_zone.id OR zone_id IS NULL)
    ORDER BY
        CASE WHEN zone_id IS NOT NULL THEN 0 ELSE 1 END,
        range_from DESC
    LIMIT 1;

    -- Fallback: highest slab if nothing matched
    IF v_slab IS NULL THEN
        SELECT * INTO v_slab
        FROM public.shipping_slabs
        WHERE tariff_id = v_tariff.id
          AND (zone_id = v_zone.id OR zone_id IS NULL)
        ORDER BY range_from DESC
        LIMIT 1;
    END IF;

    IF v_slab IS NOT NULL THEN
        v_base := v_slab.base_charge;
        IF v_slab.has_per_unit AND v_slab.extra_charge_per_unit > 0
           AND v_calc_value > v_slab.range_from THEN
            v_base := v_base + ((v_calc_value - v_slab.range_from) * v_slab.extra_charge_per_unit);
        END IF;
    END IF;

    -- Price = 0 means FREE DELIVERY for that zone/slab
    IF v_base = 0 THEN
        RETURN jsonb_build_object(
            'shipping_charge', 0,
            'method', 'free_zone',
            'zone', v_zone_name,
            'tariff', v_tariff.tariff_name,
            'free_shipping', true,
            'breakdown', jsonb_build_object(
                'base', 0, 'extras', 0,
                'effective_weight_g', v_calc_value,
                'weight_g', v_weight_g,
                'volume_ml', v_volume_ml,
                'ml_to_g_factor', v_factor,
                'slab_from', v_slab.range_from,
                'slab_to', v_slab.range_to
            )
        );
    END IF;

    -- ══════════════════════════════════════════════════════════════
    -- STEP 6: Extra charges (COD, Express, Handling, etc.)
    -- ══════════════════════════════════════════════════════════════
    FOR v_extra IN
        SELECT * FROM public.shipping_extra_charges
        WHERE company_id = p_company_id AND is_active = true
          AND (tariff_id = v_tariff.id OR tariff_id IS NULL)
          AND (applies_to = 'ALL'
               OR (applies_to = 'COD_ONLY'     AND p_payment_method = 'cod')
               OR (applies_to = 'PREPAID_ONLY' AND p_payment_method != 'cod'))
          AND (min_order_value = 0 OR p_order_value >= min_order_value)
          AND (max_order_value = 0 OR p_order_value <= max_order_value)
    LOOP
        DECLARE v_amt DECIMAL;
        BEGIN
            IF v_extra.is_percentage THEN
                v_amt := ROUND(p_order_value * v_extra.amount / 100, 2);
            ELSE
                v_amt := v_extra.amount;
            END IF;
            v_extra_total := v_extra_total + v_amt;
            v_extras := v_extras || jsonb_build_object(
                'type', v_extra.charge_type,
                'name', v_extra.charge_name,
                'amount', v_amt
            );
        END;
    END LOOP;

    -- ══════════════════════════════════════════════════════════════
    -- STEP 7: Return final result
    -- ══════════════════════════════════════════════════════════════
    RETURN jsonb_build_object(
        'shipping_charge', CEIL(v_base + v_extra_total),
        'method', v_method,
        'zone', v_zone_name,
        'tariff', v_tariff.tariff_name,
        'free_shipping', false,
        'breakdown', jsonb_build_object(
            'base', CEIL(v_base),
            'extras', v_extra_total,
            'extra_items', v_extras,
            'effective_weight_g', v_calc_value,
            'weight_g', v_weight_g,
            'volume_ml', v_volume_ml,
            'ml_to_g_factor', v_factor,
            'shipping_type', v_tariff.shipping_type,
            'primary_uom', v_tariff.primary_uom,
            'slab_from', v_slab.range_from,
            'slab_to', v_slab.range_to
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Grants
GRANT EXECUTE ON FUNCTION public.calc_shipping(BIGINT, TEXT, TEXT, DECIMAL, INT, DECIMAL, DECIMAL, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.calc_shipping(BIGINT, TEXT, TEXT, DECIMAL, INT, DECIMAL, DECIMAL, TEXT) TO authenticated;
