-- ========================================================================================
-- SEED: Regional Shipping with SEPARATE grams + ml slabs (80 slabs total)
--
-- Uses the existing `slab_uom` column the app already knows about ('g' | 'ml' | 'qty' | 'value').
-- The dynamic-UoM calc_shipping() matches ONE best-fit slab per distinct slab_uom per zone
-- and SUMS their charges, so a 500g + 1200ml item → grams slab + ml slab → summed.
--
-- Running this one file:
--   1. Ensures `slab_uom` column exists on shipping_slabs.
--   2. Replaces calc_shipping() with the dynamic-UoM version.
--   3. Wipes prior shipping rows for your company.
--   4. Seeds 1 tariff, 4 zones, 80 slabs (40 slab_uom='g' + 40 slab_uom='ml').
--
-- CHANGE v_company_id in the DO block before running.
-- ========================================================================================

-- ─── 1. Schema: ensure slab_uom column exists ─────────────────────────────────
ALTER TABLE public.shipping_slabs
  ADD COLUMN IF NOT EXISTS slab_uom VARCHAR(20) DEFAULT 'g';

ALTER TABLE public.shipping_slabs
  ALTER COLUMN slab_uom TYPE VARCHAR(20),
  ALTER COLUMN slab_uom SET DEFAULT 'g';

UPDATE public.shipping_slabs SET slab_uom = 'g' WHERE slab_uom IS NULL;

COMMENT ON COLUMN public.shipping_slabs.slab_uom
  IS 'UoM for this slab: g | ml | qty | value. One best-fit slab per UoM is matched per zone; charges sum.';

-- ─── 2. Replace calc_shipping() with dynamic-UoM version ──────────────────────
CREATE OR REPLACE FUNCTION public.calc_shipping(
    p_company_id     BIGINT,
    p_state          TEXT    DEFAULT '',
    p_pincode        TEXT    DEFAULT '',
    p_weight_kg      DECIMAL DEFAULT 0,     -- grams
    p_qty            INT     DEFAULT 1,
    p_order_value    DECIMAL DEFAULT 0,
    p_volume_cm3     DECIMAL DEFAULT 0,     -- ml
    p_payment_method TEXT    DEFAULT 'prepaid'
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
    -- Highest-priority active tariff
    SELECT * INTO v_tariff FROM public.shipping_tariffs
    WHERE company_id = p_company_id AND is_active = true
    ORDER BY priority ASC LIMIT 1;

    IF v_tariff IS NULL THEN
        RETURN jsonb_build_object(
            'shipping_charge', 0, 'method', 'no_tariff', 'zone', 'none',
            'free_shipping', false, 'breakdown', '{}'::JSONB
        );
    END IF;

    v_weight_g  := COALESCE(p_weight_kg, 0);
    v_volume_ml := COALESCE(p_volume_cm3, 0);

    -- Free shipping override
    IF v_tariff.free_shipping_enabled THEN
        IF (v_tariff.free_shipping_condition = 'VALUE'  AND p_order_value >= v_tariff.free_shipping_min)
        OR (v_tariff.free_shipping_condition = 'QTY'    AND p_qty         >= v_tariff.free_shipping_min)
        OR (v_tariff.free_shipping_condition = 'WEIGHT' AND v_weight_g    >= v_tariff.free_shipping_min)
        THEN
            RETURN jsonb_build_object(
                'shipping_charge', 0, 'method', 'free_shipping', 'free_shipping', true,
                'zone', 'all', 'tariff', v_tariff.tariff_name,
                'breakdown', jsonb_build_object('base', 0, 'extras', 0,
                    'weight_g', v_weight_g, 'volume_ml', v_volume_ml, 'matched_slabs', '[]'::JSONB)
            );
        END IF;
    END IF;

    -- Zone resolution
    IF p_pincode != '' THEN
        SELECT * INTO v_zone FROM public.shipping_zones_v2
        WHERE tariff_id = v_tariff.id
          AND pincode_from IS NOT NULL
          AND p_pincode >= pincode_from
          AND p_pincode <= COALESCE(pincode_to, 'ZZZZZZ')
        ORDER BY display_order ASC LIMIT 1;
    END IF;

    IF v_zone IS NULL AND p_state != '' THEN
        SELECT * INTO v_zone FROM public.shipping_zones_v2
        WHERE tariff_id = v_tariff.id AND p_state = ANY(states)
        ORDER BY display_order ASC LIMIT 1;
    END IF;

    IF v_zone IS NULL THEN
        SELECT * INTO v_zone FROM public.shipping_zones_v2
        WHERE tariff_id = v_tariff.id
          AND (states IS NULL OR states = ARRAY[]::TEXT[])
          AND pincode_from IS NULL
        ORDER BY display_order LIMIT 1;
    END IF;

    IF v_zone IS NOT NULL THEN
        v_zone_name := v_zone.zone_name;
        IF v_zone.charge_type = 'FLAT' THEN
            RETURN jsonb_build_object(
                'shipping_charge', CEIL(v_zone.flat_charge),
                'method', 'flat_zone', 'zone', v_zone.zone_name,
                'tariff', v_tariff.tariff_name, 'free_shipping', false,
                'breakdown', jsonb_build_object('base', v_zone.flat_charge, 'extras', 0,
                    'weight_g', v_weight_g, 'volume_ml', v_volume_ml, 'matched_slabs', '[]'::JSONB)
            );
        END IF;
    END IF;

    -- Dynamic slab matching: one best-fit per UoM, summed
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

        IF v_input IS NULL OR v_input <= 0 THEN CONTINUE; END IF;

        SELECT * INTO v_slab FROM public.shipping_slabs
        WHERE tariff_id = v_tariff.id
          AND COALESCE(slab_uom, 'g') = v_uom
          AND range_from <= v_input
          AND (range_to IS NULL OR range_to >= v_input)
          AND (zone_id = v_zone.id OR zone_id IS NULL)
        ORDER BY
            CASE WHEN zone_id IS NOT NULL THEN 0 ELSE 1 END,
            range_from DESC
        LIMIT 1;

        IF v_slab IS NULL THEN CONTINUE; END IF;

        v_slab_charge := v_slab.base_charge;
        IF v_slab.has_per_unit AND v_slab.extra_charge_per_unit > 0
           AND v_input > v_slab.range_from THEN
            v_slab_charge := v_slab_charge + ((v_input - v_slab.range_from) * v_slab.extra_charge_per_unit);
        END IF;

        v_base := v_base + v_slab_charge;
        v_slabs := v_slabs || jsonb_build_object(
            'uom', v_uom, 'from', v_slab.range_from, 'to', v_slab.range_to,
            'input', v_input, 'charge', v_slab_charge
        );
    END LOOP;

    IF v_base = 0 THEN
        RETURN jsonb_build_object(
            'shipping_charge', 0, 'method', 'free_zone', 'zone', v_zone_name,
            'tariff', v_tariff.tariff_name, 'free_shipping', true,
            'breakdown', jsonb_build_object('base', 0, 'extras', 0,
                'weight_g', v_weight_g, 'volume_ml', v_volume_ml, 'matched_slabs', v_slabs)
        );
    END IF;

    -- Extras
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
            IF v_extra.is_percentage THEN v_amt := ROUND(p_order_value * v_extra.amount / 100, 2);
            ELSE v_amt := v_extra.amount; END IF;
            v_extra_total := v_extra_total + v_amt;
            v_extras := v_extras || jsonb_build_object('type', v_extra.charge_type, 'name', v_extra.charge_name, 'amount', v_amt);
        END;
    END LOOP;

    RETURN jsonb_build_object(
        'shipping_charge', CEIL(v_base + v_extra_total),
        'method', 'slab', 'zone', v_zone_name,
        'tariff', v_tariff.tariff_name, 'free_shipping', false,
        'breakdown', jsonb_build_object(
            'base', CEIL(v_base), 'extras', v_extra_total, 'extra_items', v_extras,
            'weight_g', v_weight_g, 'volume_ml', v_volume_ml,
            'matched_slabs', v_slabs
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

GRANT EXECUTE ON FUNCTION public.calc_shipping(BIGINT, TEXT, TEXT, DECIMAL, INT, DECIMAL, DECIMAL, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.calc_shipping(BIGINT, TEXT, TEXT, DECIMAL, INT, DECIMAL, DECIMAL, TEXT) TO authenticated;

-- ─── 3. Seed data  (change v_company_id below to your company) ────────────────
DO $$
DECLARE
    v_company_id BIGINT := 16;          -- ← CHANGE THIS to your company_id
    v_tariff_id  UUID;
    v_zone_tn    UUID;
    v_zone_south UUID;
    v_zone_ne    UUID;
    v_zone_rest  UUID;
BEGIN
    DELETE FROM public.shipping_extra_charges WHERE company_id = v_company_id;
    DELETE FROM public.shipping_slabs         WHERE company_id = v_company_id;
    DELETE FROM public.shipping_zones_v2      WHERE company_id = v_company_id;
    DELETE FROM public.shipping_tariffs       WHERE company_id = v_company_id;

    INSERT INTO public.shipping_tariffs
      (company_id, tariff_name, shipping_type, primary_uom, priority, is_active, rounding_rule, free_shipping_enabled)
    VALUES
      (v_company_id, 'Regional Shipping', 'UNIFIED', 'g', 1, true, 'ROUND_UP', false)
    RETURNING id INTO v_tariff_id;

    INSERT INTO public.shipping_zones_v2 (company_id, tariff_id, zone_name, country, states, charge_type, display_order)
    VALUES (v_company_id, v_tariff_id, 'TN', 'India', ARRAY['Tamil Nadu'], 'VARIABLE', 1) RETURNING id INTO v_zone_tn;

    INSERT INTO public.shipping_zones_v2 (company_id, tariff_id, zone_name, country, states, charge_type, display_order)
    VALUES (v_company_id, v_tariff_id, 'SOUTH', 'India',
            ARRAY['Andhra Pradesh','Karnataka','Kerala','Puducherry','Telangana'], 'VARIABLE', 2) RETURNING id INTO v_zone_south;

    INSERT INTO public.shipping_zones_v2 (company_id, tariff_id, zone_name, country, states, charge_type, display_order)
    VALUES (v_company_id, v_tariff_id, 'NE', 'India',
            ARRAY['Arunachal Pradesh','Assam','Manipur','Meghalaya','Mizoram','Nagaland','Sikkim','Tripura'], 'VARIABLE', 3) RETURNING id INTO v_zone_ne;

    INSERT INTO public.shipping_zones_v2 (company_id, tariff_id, zone_name, country, states, charge_type, display_order)
    VALUES (v_company_id, v_tariff_id, 'REST', 'India',
            ARRAY['Andaman and Nicobar Islands','Bihar','Chandigarh','Chhattisgarh',
                  'Dadra and Nagar Haveli and Daman and Diu','Delhi','Goa','Gujarat',
                  'Haryana','Himachal Pradesh','Jammu and Kashmir','Jharkhand','Ladakh',
                  'Lakshadweep','Madhya Pradesh','Maharashtra','Odisha','Punjab',
                  'Rajasthan','Uttar Pradesh','Uttarakhand','West Bengal'], 'VARIABLE', 4)
    RETURNING id INTO v_zone_rest;

    -- ════════════════════════════════════════════════════════════════════
    -- GRAMS slabs (slab_uom='g')  — 40 rows (10 per zone)
    -- ════════════════════════════════════════════════════════════════════
    -- Weight (g)      | TN  | SOUTH | NE   | REST
    -- --------------- | --- | ----- | ---- | -----
    -- 0    –  750     | ₹0  | ₹70   | ₹130 | ₹120
    -- 751  – 1700     | ₹0  | ₹140  | ₹0   | ₹240
    -- 1701 – 2700     | ₹0  | ₹210  | ₹0   | ₹360
    -- 2701 – 3700     | ₹0  | ₹280  | ₹0   | ₹480
    -- 3701 – 4700     | ₹0  | ₹350  | ₹0   | ₹600
    -- 4701 – 5700     | ₹0  | ₹420  | ₹0   | ₹720
    -- 5701 – 6700     | ₹0  | ₹490  | ₹0   | ₹840
    -- 6701 – 7700     | ₹0  | ₹560  | ₹0   | ₹960
    -- 7701 – 8700     | ₹0  | ₹630  | ₹0   | ₹1080
    -- 8701 – 9700     | ₹0  | ₹700  | ₹0   | ₹1200

    -- TN g
    INSERT INTO public.shipping_slabs (company_id, tariff_id, zone_id, slab_uom, range_from, range_to, base_charge, display_order) VALUES
      (v_company_id, v_tariff_id, v_zone_tn, 'g',    0,  750, 0,  1),
      (v_company_id, v_tariff_id, v_zone_tn, 'g',  751, 1700, 0,  2),
      (v_company_id, v_tariff_id, v_zone_tn, 'g', 1701, 2700, 0,  3),
      (v_company_id, v_tariff_id, v_zone_tn, 'g', 2701, 3700, 0,  4),
      (v_company_id, v_tariff_id, v_zone_tn, 'g', 3701, 4700, 0,  5),
      (v_company_id, v_tariff_id, v_zone_tn, 'g', 4701, 5700, 0,  6),
      (v_company_id, v_tariff_id, v_zone_tn, 'g', 5701, 6700, 0,  7),
      (v_company_id, v_tariff_id, v_zone_tn, 'g', 6701, 7700, 0,  8),
      (v_company_id, v_tariff_id, v_zone_tn, 'g', 7701, 8700, 0,  9),
      (v_company_id, v_tariff_id, v_zone_tn, 'g', 8701, 9700, 0, 10);

    -- SOUTH g
    INSERT INTO public.shipping_slabs (company_id, tariff_id, zone_id, slab_uom, range_from, range_to, base_charge, display_order) VALUES
      (v_company_id, v_tariff_id, v_zone_south, 'g',    0,  750,  70,  1),
      (v_company_id, v_tariff_id, v_zone_south, 'g',  751, 1700, 140,  2),
      (v_company_id, v_tariff_id, v_zone_south, 'g', 1701, 2700, 210,  3),
      (v_company_id, v_tariff_id, v_zone_south, 'g', 2701, 3700, 280,  4),
      (v_company_id, v_tariff_id, v_zone_south, 'g', 3701, 4700, 350,  5),
      (v_company_id, v_tariff_id, v_zone_south, 'g', 4701, 5700, 420,  6),
      (v_company_id, v_tariff_id, v_zone_south, 'g', 5701, 6700, 490,  7),
      (v_company_id, v_tariff_id, v_zone_south, 'g', 6701, 7700, 560,  8),
      (v_company_id, v_tariff_id, v_zone_south, 'g', 7701, 8700, 630,  9),
      (v_company_id, v_tariff_id, v_zone_south, 'g', 8701, 9700, 700, 10);

    -- NE g (only 0–750 chargeable)
    INSERT INTO public.shipping_slabs (company_id, tariff_id, zone_id, slab_uom, range_from, range_to, base_charge, display_order) VALUES
      (v_company_id, v_tariff_id, v_zone_ne, 'g',    0,  750, 130,  1),
      (v_company_id, v_tariff_id, v_zone_ne, 'g',  751, 1700,   0,  2),
      (v_company_id, v_tariff_id, v_zone_ne, 'g', 1701, 2700,   0,  3),
      (v_company_id, v_tariff_id, v_zone_ne, 'g', 2701, 3700,   0,  4),
      (v_company_id, v_tariff_id, v_zone_ne, 'g', 3701, 4700,   0,  5),
      (v_company_id, v_tariff_id, v_zone_ne, 'g', 4701, 5700,   0,  6),
      (v_company_id, v_tariff_id, v_zone_ne, 'g', 5701, 6700,   0,  7),
      (v_company_id, v_tariff_id, v_zone_ne, 'g', 6701, 7700,   0,  8),
      (v_company_id, v_tariff_id, v_zone_ne, 'g', 7701, 8700,   0,  9),
      (v_company_id, v_tariff_id, v_zone_ne, 'g', 8701, 9700,   0, 10);

    -- REST g
    INSERT INTO public.shipping_slabs (company_id, tariff_id, zone_id, slab_uom, range_from, range_to, base_charge, display_order) VALUES
      (v_company_id, v_tariff_id, v_zone_rest, 'g',    0,  750,  120,  1),
      (v_company_id, v_tariff_id, v_zone_rest, 'g',  751, 1700,  240,  2),
      (v_company_id, v_tariff_id, v_zone_rest, 'g', 1701, 2700,  360,  3),
      (v_company_id, v_tariff_id, v_zone_rest, 'g', 2701, 3700,  480,  4),
      (v_company_id, v_tariff_id, v_zone_rest, 'g', 3701, 4700,  600,  5),
      (v_company_id, v_tariff_id, v_zone_rest, 'g', 4701, 5700,  720,  6),
      (v_company_id, v_tariff_id, v_zone_rest, 'g', 5701, 6700,  840,  7),
      (v_company_id, v_tariff_id, v_zone_rest, 'g', 6701, 7700,  960,  8),
      (v_company_id, v_tariff_id, v_zone_rest, 'g', 7701, 8700, 1080,  9),
      (v_company_id, v_tariff_id, v_zone_rest, 'g', 8701, 9700, 1200, 10);

    -- ════════════════════════════════════════════════════════════════════
    -- ML slabs (slab_uom='ml')  — 40 rows (10 per zone)
    -- Same ranges & prices; edit later if ml pricing differs from grams.
    -- ════════════════════════════════════════════════════════════════════

    -- TN ml
    INSERT INTO public.shipping_slabs (company_id, tariff_id, zone_id, slab_uom, range_from, range_to, base_charge, display_order) VALUES
      (v_company_id, v_tariff_id, v_zone_tn, 'ml',    0,  750, 0,  1),
      (v_company_id, v_tariff_id, v_zone_tn, 'ml',  751, 1700, 0,  2),
      (v_company_id, v_tariff_id, v_zone_tn, 'ml', 1701, 2700, 0,  3),
      (v_company_id, v_tariff_id, v_zone_tn, 'ml', 2701, 3700, 0,  4),
      (v_company_id, v_tariff_id, v_zone_tn, 'ml', 3701, 4700, 0,  5),
      (v_company_id, v_tariff_id, v_zone_tn, 'ml', 4701, 5700, 0,  6),
      (v_company_id, v_tariff_id, v_zone_tn, 'ml', 5701, 6700, 0,  7),
      (v_company_id, v_tariff_id, v_zone_tn, 'ml', 6701, 7700, 0,  8),
      (v_company_id, v_tariff_id, v_zone_tn, 'ml', 7701, 8700, 0,  9),
      (v_company_id, v_tariff_id, v_zone_tn, 'ml', 8701, 9700, 0, 10);

    -- SOUTH ml
    INSERT INTO public.shipping_slabs (company_id, tariff_id, zone_id, slab_uom, range_from, range_to, base_charge, display_order) VALUES
      (v_company_id, v_tariff_id, v_zone_south, 'ml',    0,  750,  70,  1),
      (v_company_id, v_tariff_id, v_zone_south, 'ml',  751, 1700, 140,  2),
      (v_company_id, v_tariff_id, v_zone_south, 'ml', 1701, 2700, 210,  3),
      (v_company_id, v_tariff_id, v_zone_south, 'ml', 2701, 3700, 280,  4),
      (v_company_id, v_tariff_id, v_zone_south, 'ml', 3701, 4700, 350,  5),
      (v_company_id, v_tariff_id, v_zone_south, 'ml', 4701, 5700, 420,  6),
      (v_company_id, v_tariff_id, v_zone_south, 'ml', 5701, 6700, 490,  7),
      (v_company_id, v_tariff_id, v_zone_south, 'ml', 6701, 7700, 560,  8),
      (v_company_id, v_tariff_id, v_zone_south, 'ml', 7701, 8700, 630,  9),
      (v_company_id, v_tariff_id, v_zone_south, 'ml', 8701, 9700, 700, 10);

    -- NE ml
    INSERT INTO public.shipping_slabs (company_id, tariff_id, zone_id, slab_uom, range_from, range_to, base_charge, display_order) VALUES
      (v_company_id, v_tariff_id, v_zone_ne, 'ml',    0,  750, 130,  1),
      (v_company_id, v_tariff_id, v_zone_ne, 'ml',  751, 1700,   0,  2),
      (v_company_id, v_tariff_id, v_zone_ne, 'ml', 1701, 2700,   0,  3),
      (v_company_id, v_tariff_id, v_zone_ne, 'ml', 2701, 3700,   0,  4),
      (v_company_id, v_tariff_id, v_zone_ne, 'ml', 3701, 4700,   0,  5),
      (v_company_id, v_tariff_id, v_zone_ne, 'ml', 4701, 5700,   0,  6),
      (v_company_id, v_tariff_id, v_zone_ne, 'ml', 5701, 6700,   0,  7),
      (v_company_id, v_tariff_id, v_zone_ne, 'ml', 6701, 7700,   0,  8),
      (v_company_id, v_tariff_id, v_zone_ne, 'ml', 7701, 8700,   0,  9),
      (v_company_id, v_tariff_id, v_zone_ne, 'ml', 8701, 9700,   0, 10);

    -- REST ml
    INSERT INTO public.shipping_slabs (company_id, tariff_id, zone_id, slab_uom, range_from, range_to, base_charge, display_order) VALUES
      (v_company_id, v_tariff_id, v_zone_rest, 'ml',    0,  750,  120,  1),
      (v_company_id, v_tariff_id, v_zone_rest, 'ml',  751, 1700,  240,  2),
      (v_company_id, v_tariff_id, v_zone_rest, 'ml', 1701, 2700,  360,  3),
      (v_company_id, v_tariff_id, v_zone_rest, 'ml', 2701, 3700,  480,  4),
      (v_company_id, v_tariff_id, v_zone_rest, 'ml', 3701, 4700,  600,  5),
      (v_company_id, v_tariff_id, v_zone_rest, 'ml', 4701, 5700,  720,  6),
      (v_company_id, v_tariff_id, v_zone_rest, 'ml', 5701, 6700,  840,  7),
      (v_company_id, v_tariff_id, v_zone_rest, 'ml', 6701, 7700,  960,  8),
      (v_company_id, v_tariff_id, v_zone_rest, 'ml', 7701, 8700, 1080,  9),
      (v_company_id, v_tariff_id, v_zone_rest, 'ml', 8701, 9700, 1200, 10);

    RAISE NOTICE 'Seeded Regional Shipping for company_id=%: 1 tariff, 4 zones, 80 slabs (40 g + 40 ml).', v_company_id;
END $$;

-- ─── 4. Verify (change 16 to your company_id) ────────────────────────────────
-- SELECT 'tariffs' AS entity, COUNT(*) FROM shipping_tariffs WHERE company_id = 16
-- UNION ALL SELECT 'zones',    COUNT(*) FROM shipping_zones_v2 WHERE company_id = 16
-- UNION ALL SELECT 'slabs g',  COUNT(*) FROM shipping_slabs WHERE company_id = 16 AND slab_uom='g'
-- UNION ALL SELECT 'slabs ml', COUNT(*) FROM shipping_slabs WHERE company_id = 16 AND slab_uom='ml';
-- Expected: tariffs=1, zones=4, slabs g=40, slabs ml=40

-- ─── 5. Test cases ───────────────────────────────────────────────────────────
-- SELECT public.calc_shipping(16, 'Delhi',      '', 500,  1, 750, 0,    'prepaid'); -- 500g only  (REST)  → ₹120
-- SELECT public.calc_shipping(16, 'Delhi',      '', 0,    1, 750, 1200, 'prepaid'); -- 1200ml only (REST) → ₹240
-- SELECT public.calc_shipping(16, 'Delhi',      '', 500,  1, 750, 1200, 'prepaid'); -- both (REST)        → ₹120+₹240 = ₹360
-- SELECT public.calc_shipping(16, 'Karnataka',  '', 500,  1, 500, 1200, 'prepaid'); -- SOUTH: ₹70+₹140 = ₹210
-- SELECT public.calc_shipping(16, 'Tamil Nadu', '', 500,  1, 500, 1200, 'prepaid'); -- TN: ₹0+₹0 = ₹0
