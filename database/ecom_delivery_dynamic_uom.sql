-- ========================================================================================
-- DYNAMIC-UOM DELIVERY ENGINE v6
--
-- Replaces the fixed g+ml model with a dynamic one. Each shipping slab now carries
-- its own UoM (`slab_uom`) — merchants can add any number of slabs per zone, each
-- matching a different input dimension:
--
--   slab_uom = 'g'      → range matched against total weight  (grams)
--   slab_uom = 'ml'     → range matched against total volume  (ml)
--   slab_uom = 'qty'    → range matched against total quantity
--   slab_uom = 'value'  → range matched against order value   (₹)
--
-- For each *distinct* UoM configured for a zone, the engine picks the best-fit slab
-- and the zone charge = SUM of every matched slab's base_charge.
--
-- Example — Delhi Rest Zone with 3 rules:
--   g     slab 0–750      → ₹120
--   ml    slab 751–1700   → ₹220
--   qty   slab 10–∞       → ₹50 extra for bulk
--   Cart 500g + 1200ml + 12 pcs → base = 120 + 220 + 50 = ₹390
--
-- A dimension whose input is 0 (e.g. a pure-weight product with no volume) silently
-- contributes ₹0 — no slab matched, no error.
-- ========================================================================================

-- ─── 1. Schema: widen slab_uom, no enum constraint ─────────────────────────
ALTER TABLE public.shipping_slabs
  ALTER COLUMN slab_uom TYPE VARCHAR(20),
  ALTER COLUMN slab_uom SET DEFAULT 'g';

COMMENT ON COLUMN public.shipping_slabs.slab_uom
  IS 'Merchant-chosen UoM for this slab: g | ml | qty | value. One best-fit slab per UoM is matched; charges sum.';

-- ─── 2. Replace calc_shipping() ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.calc_shipping(
    p_company_id  BIGINT,
    p_state       TEXT    DEFAULT '',
    p_pincode     TEXT    DEFAULT '',
    p_weight_kg   DECIMAL DEFAULT 0,       -- treated as grams for UNIFIED/dynamic tariffs
    p_qty         INT     DEFAULT 1,
    p_order_value DECIMAL DEFAULT 0,
    p_volume_cm3  DECIMAL DEFAULT 0,       -- treated as ml for UNIFIED/dynamic tariffs
    p_payment_method TEXT DEFAULT 'prepaid'
)
RETURNS JSONB AS $$
DECLARE
    v_tariff      RECORD;
    v_zone        RECORD;
    v_slab        RECORD;
    v_uom         TEXT;
    v_input       DECIMAL;
    v_slab_charge DECIMAL;
    v_weight_g    DECIMAL;
    v_volume_ml   DECIMAL;
    v_base        DECIMAL := 0;
    v_extra_total DECIMAL := 0;
    v_extras      JSONB   := '[]'::JSONB;
    v_slabs       JSONB   := '[]'::JSONB;
    v_extra       RECORD;
    v_zone_name   TEXT    := 'Default';
BEGIN
    -- ───── STEP 1: Highest-priority active tariff ─────
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

    v_weight_g  := COALESCE(p_weight_kg, 0);
    v_volume_ml := COALESCE(p_volume_cm3, 0);

    -- ───── STEP 2: Free shipping override ─────
    IF v_tariff.free_shipping_enabled THEN
        IF (v_tariff.free_shipping_condition = 'VALUE'  AND p_order_value >= v_tariff.free_shipping_min)
        OR (v_tariff.free_shipping_condition = 'QTY'    AND p_qty         >= v_tariff.free_shipping_min)
        OR (v_tariff.free_shipping_condition = 'WEIGHT' AND v_weight_g    >= v_tariff.free_shipping_min)
        THEN
            RETURN jsonb_build_object(
                'shipping_charge', 0,
                'method', 'free_shipping',
                'free_shipping', true,
                'zone', 'all',
                'tariff', v_tariff.tariff_name,
                'breakdown', jsonb_build_object(
                    'base', 0, 'extras', 0,
                    'weight_g', v_weight_g,
                    'volume_ml', v_volume_ml,
                    'matched_slabs', '[]'::JSONB
                )
            );
        END IF;
    END IF;

    -- ───── STEP 3: Detect zone (pincode → state → catch-all) ─────
    IF p_pincode != '' THEN
        SELECT * INTO v_zone
        FROM public.shipping_zones_v2
        WHERE tariff_id = v_tariff.id
          AND pincode_from IS NOT NULL
          AND p_pincode >= pincode_from
          AND p_pincode <= COALESCE(pincode_to, 'ZZZZZZ')
        ORDER BY display_order ASC LIMIT 1;
    END IF;

    IF v_zone IS NULL AND p_state != '' THEN
        SELECT * INTO v_zone
        FROM public.shipping_zones_v2
        WHERE tariff_id = v_tariff.id
          AND p_state = ANY(states)
        ORDER BY display_order ASC LIMIT 1;
    END IF;

    IF v_zone IS NULL THEN
        SELECT * INTO v_zone
        FROM public.shipping_zones_v2
        WHERE tariff_id = v_tariff.id
          AND states = ARRAY[]::TEXT[]
          AND pincode_from IS NULL
        ORDER BY display_order LIMIT 1;
    END IF;

    IF v_zone IS NOT NULL THEN
        v_zone_name := v_zone.zone_name;

        -- Flat-rate zone → return immediately (ignores slabs)
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
                    'weight_g', v_weight_g,
                    'volume_ml', v_volume_ml,
                    'matched_slabs', '[]'::JSONB
                )
            );
        END IF;
    END IF;

    -- ───── STEP 4: Dynamic slab matching ─────
    -- For every distinct slab_uom configured for the matched zone (or global),
    -- find the best-fit slab and add its charge to the running total.
    FOR v_uom IN
        SELECT DISTINCT COALESCE(slab_uom, 'g') AS u
        FROM public.shipping_slabs
        WHERE tariff_id = v_tariff.id
          AND (zone_id = v_zone.id OR zone_id IS NULL)
    LOOP
        v_input := CASE v_uom
            WHEN 'g'     THEN v_weight_g
            WHEN 'ml'    THEN v_volume_ml
            WHEN 'qty'   THEN p_qty::DECIMAL
            WHEN 'value' THEN p_order_value
            ELSE 0
        END;

        -- Skip UoMs with no input (e.g. no weight on a liquid-only cart)
        IF v_input IS NULL OR v_input <= 0 THEN
            CONTINUE;
        END IF;

        -- Prefer zone-specific slab over global (zone_id IS NULL); tightest range wins
        SELECT * INTO v_slab
        FROM public.shipping_slabs
        WHERE tariff_id = v_tariff.id
          AND COALESCE(slab_uom, 'g') = v_uom
          AND range_from <= v_input
          AND (range_to IS NULL OR range_to >= v_input)
          AND (zone_id = v_zone.id OR zone_id IS NULL)
        ORDER BY
            CASE WHEN zone_id IS NOT NULL THEN 0 ELSE 1 END,
            range_from DESC
        LIMIT 1;

        IF v_slab IS NULL THEN
            CONTINUE;
        END IF;

        v_slab_charge := v_slab.base_charge;
        IF v_slab.has_per_unit AND v_slab.extra_charge_per_unit > 0
           AND v_input > v_slab.range_from THEN
            v_slab_charge := v_slab_charge + ((v_input - v_slab.range_from) * v_slab.extra_charge_per_unit);
        END IF;

        v_base := v_base + v_slab_charge;

        v_slabs := v_slabs || jsonb_build_object(
            'uom',    v_uom,
            'from',   v_slab.range_from,
            'to',     v_slab.range_to,
            'input',  v_input,
            'charge', v_slab_charge
        );
    END LOOP;

    -- Zero base → free delivery for this zone
    IF v_base = 0 THEN
        RETURN jsonb_build_object(
            'shipping_charge', 0,
            'method', 'free_zone',
            'zone', v_zone_name,
            'tariff', v_tariff.tariff_name,
            'free_shipping', true,
            'breakdown', jsonb_build_object(
                'base', 0, 'extras', 0,
                'weight_g', v_weight_g,
                'volume_ml', v_volume_ml,
                'matched_slabs', v_slabs
            )
        );
    END IF;

    -- ───── STEP 5: Extra charges ─────
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
                'type',   v_extra.charge_type,
                'name',   v_extra.charge_name,
                'amount', v_amt
            );
        END;
    END LOOP;

    -- ───── STEP 6: Final result ─────
    RETURN jsonb_build_object(
        'shipping_charge', CEIL(v_base + v_extra_total),
        'method', 'slab',
        'zone', v_zone_name,
        'tariff', v_tariff.tariff_name,
        'free_shipping', false,
        'breakdown', jsonb_build_object(
            'base',          CEIL(v_base),
            'extras',        v_extra_total,
            'extra_items',   v_extras,
            'weight_g',      v_weight_g,
            'volume_ml',     v_volume_ml,
            'matched_slabs', v_slabs
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

GRANT EXECUTE ON FUNCTION public.calc_shipping(BIGINT, TEXT, TEXT, DECIMAL, INT, DECIMAL, DECIMAL, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.calc_shipping(BIGINT, TEXT, TEXT, DECIMAL, INT, DECIMAL, DECIMAL, TEXT) TO authenticated;
