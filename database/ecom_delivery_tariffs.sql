-- ========================================================================================
-- SHIPPING ENGINE V3 — Universal tariff-based shipping for multi-tenant SaaS
-- No hardcoded zones. Everything dynamic per company.
-- ========================================================================================

-- 0. Drop ALL old shipping tables (old + new) so we start clean
DROP TABLE IF EXISTS public.shipping_extra_charges CASCADE;
DROP TABLE IF EXISTS public.shipping_slabs CASCADE;
DROP TABLE IF EXISTS public.shipping_zones_v2 CASCADE;
DROP TABLE IF EXISTS public.shipping_tariffs CASCADE;
DROP TABLE IF EXISTS public.delivery_tariffs CASCADE;
DROP TABLE IF EXISTS public.delivery_states CASCADE;
DROP TABLE IF EXISTS public.shipping_rules CASCADE;

-- 1. SHIPPING TARIFFS — Named tariff configs per company
CREATE TABLE public.shipping_tariffs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    tariff_name VARCHAR(255) NOT NULL DEFAULT 'Standard Shipping',
    shipping_type VARCHAR(20) NOT NULL DEFAULT 'WEIGHT',  -- WEIGHT | QTY | VALUE | VOLUME
    primary_uom VARCHAR(20) NOT NULL DEFAULT 'kg',  -- kg | units | ₹ | cm3
    priority INT NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    free_shipping_enabled BOOLEAN DEFAULT false,
    free_shipping_condition VARCHAR(20) DEFAULT 'VALUE',  -- VALUE | WEIGHT | QTY
    free_shipping_min DECIMAL(10,2) DEFAULT 0,
    free_shipping_zones UUID[] DEFAULT ARRAY[]::UUID[],  -- empty = all zones
    rounding_rule VARCHAR(20) DEFAULT 'ROUND_UP',  -- ROUND_UP | ROUND_DOWN | ROUND_NEAREST
    conflict_resolution VARCHAR(20) DEFAULT 'HIGHEST_PRIORITY',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SHIPPING ZONES — Company-defined zones (Local, Regional, National, International etc.)
CREATE TABLE public.shipping_zones_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    tariff_id UUID REFERENCES public.shipping_tariffs(id) ON DELETE CASCADE,
    zone_name VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    states TEXT[] DEFAULT ARRAY[]::TEXT[],
    pincode_from VARCHAR(10),
    pincode_to VARCHAR(10),
    charge_type VARCHAR(20) DEFAULT 'VARIABLE',  -- FLAT | VARIABLE
    flat_charge DECIMAL(10,2) DEFAULT 0,  -- if charge_type = FLAT
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. SHIPPING SLABS — Range-based pricing per tariff (optionally per zone)
CREATE TABLE public.shipping_slabs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    tariff_id UUID NOT NULL REFERENCES public.shipping_tariffs(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES public.shipping_zones_v2(id) ON DELETE SET NULL,  -- NULL = applies to all zones
    range_from DECIMAL(10,2) NOT NULL DEFAULT 0,
    range_to DECIMAL(10,2),  -- NULL = unlimited (∞)
    base_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
    extra_charge_per_unit DECIMAL(10,2) DEFAULT 0,  -- per kg/unit/₹ beyond range_from
    has_per_unit BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. SHIPPING EXTRA CHARGES — COD, Express, Handling, Packaging etc.
CREATE TABLE public.shipping_extra_charges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    tariff_id UUID REFERENCES public.shipping_tariffs(id) ON DELETE CASCADE,
    charge_type VARCHAR(50) NOT NULL,  -- COD | EXPRESS | HANDLING | PACKAGING | INSURANCE
    charge_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_percentage BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    applies_to VARCHAR(20) DEFAULT 'ALL',  -- ALL | COD_ONLY | PREPAID_ONLY
    min_order_value DECIMAL(10,2) DEFAULT 0,
    max_order_value DECIMAL(10,2) DEFAULT 0,  -- 0 = no limit
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. RLS
DO $$
DECLARE tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['shipping_tariffs', 'shipping_zones_v2', 'shipping_slabs', 'shipping_extra_charges']) LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
            EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation" ON public.%I', tbl);
            EXECUTE format('CREATE POLICY "tenant_isolation" ON public.%I FOR ALL TO authenticated USING (public.user_has_company_access(company_id)) WITH CHECK (public.user_has_company_access(company_id))', tbl);
            EXECUTE format('DROP POLICY IF EXISTS "service_role_bypass" ON public.%I', tbl);
            EXECUTE format('CREATE POLICY "service_role_bypass" ON public.%I FOR ALL USING (auth.role() = ''service_role'')', tbl);
            EXECUTE format('DROP POLICY IF EXISTS "anon_read" ON public.%I', tbl);
            EXECUTE format('CREATE POLICY "anon_read" ON public.%I FOR SELECT TO anon USING (true)', tbl);
            EXECUTE format('GRANT SELECT ON public.%I TO anon', tbl);
        END IF;
    END LOOP;
END $$;

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_shipping_tariffs_company ON shipping_tariffs(company_id);
CREATE INDEX IF NOT EXISTS idx_shipping_zones_v2_tariff ON shipping_zones_v2(tariff_id);
CREATE INDEX IF NOT EXISTS idx_shipping_slabs_tariff ON shipping_slabs(tariff_id, range_from);
CREATE INDEX IF NOT EXISTS idx_shipping_extras_tariff ON shipping_extra_charges(tariff_id);

-- 7. CALCULATE SHIPPING — Full pipeline
CREATE OR REPLACE FUNCTION public.calc_shipping(
    p_company_id BIGINT,
    p_state TEXT DEFAULT '',
    p_pincode TEXT DEFAULT '',
    p_weight_kg DECIMAL DEFAULT 0,
    p_qty INT DEFAULT 1,
    p_order_value DECIMAL DEFAULT 0,
    p_volume_cm3 DECIMAL DEFAULT 0,
    p_payment_method TEXT DEFAULT 'prepaid'
)
RETURNS JSONB AS $$
DECLARE
    v_tariff RECORD;
    v_zone RECORD;
    v_slab RECORD;
    v_calc_value DECIMAL;
    v_base DECIMAL := 0;
    v_zone_charge DECIMAL := 0;
    v_extra_total DECIMAL := 0;
    v_extras JSONB := '[]'::JSONB;
    v_extra RECORD;
    v_zone_name TEXT := 'Default';
    v_method TEXT := 'slab';
BEGIN
    -- 1. Get highest priority active tariff
    SELECT * INTO v_tariff FROM public.shipping_tariffs
    WHERE company_id = p_company_id AND is_active = true
    ORDER BY priority ASC LIMIT 1;

    IF v_tariff IS NULL THEN
        RETURN jsonb_build_object('shipping_charge', 0, 'method', 'no_tariff', 'zone', 'none', 'breakdown', '{}'::JSONB);
    END IF;

    -- 2. Free shipping check
    IF v_tariff.free_shipping_enabled THEN
        IF (v_tariff.free_shipping_condition = 'VALUE' AND p_order_value >= v_tariff.free_shipping_min)
        OR (v_tariff.free_shipping_condition = 'WEIGHT' AND p_weight_kg >= v_tariff.free_shipping_min)
        OR (v_tariff.free_shipping_condition = 'QTY' AND p_qty >= v_tariff.free_shipping_min) THEN
            RETURN jsonb_build_object(
                'shipping_charge', 0, 'method', 'free_shipping', 'free_shipping', true,
                'zone', 'all', 'tariff', v_tariff.tariff_name,
                'breakdown', jsonb_build_object('base', 0, 'zone_charge', 0, 'extras', 0)
            );
        END IF;
    END IF;

    -- 3. Resolve zone (by pincode first, then state)
    SELECT * INTO v_zone FROM public.shipping_zones_v2
    WHERE tariff_id = v_tariff.id
    AND (
        (p_pincode != '' AND p_pincode >= COALESCE(pincode_from, '') AND p_pincode <= COALESCE(pincode_to, 'ZZZZZZ'))
        OR (p_state != '' AND p_state = ANY(states))
    )
    ORDER BY
        CASE WHEN p_pincode != '' AND pincode_from IS NOT NULL THEN 0 ELSE 1 END,
        display_order ASC
    LIMIT 1;

    -- Fallback: first zone with no state/pincode restriction
    IF v_zone IS NULL THEN
        SELECT * INTO v_zone FROM public.shipping_zones_v2
        WHERE tariff_id = v_tariff.id AND states = ARRAY[]::TEXT[] AND pincode_from IS NULL
        ORDER BY display_order LIMIT 1;
    END IF;

    IF v_zone IS NOT NULL THEN
        v_zone_name := v_zone.zone_name;
        -- Flat zone charge
        IF v_zone.charge_type = 'FLAT' THEN
            RETURN jsonb_build_object(
                'shipping_charge', CEIL(v_zone.flat_charge), 'method', 'flat_zone',
                'zone', v_zone.zone_name, 'tariff', v_tariff.tariff_name, 'free_shipping', false,
                'breakdown', jsonb_build_object('base', v_zone.flat_charge, 'zone_charge', 0, 'extras', 0)
            );
        END IF;
    END IF;

    -- 4. Determine calculation value based on shipping_type
    CASE v_tariff.shipping_type
        WHEN 'WEIGHT' THEN v_calc_value := p_weight_kg;
        WHEN 'QTY'    THEN v_calc_value := p_qty;
        WHEN 'VALUE'  THEN v_calc_value := p_order_value;
        WHEN 'VOLUME' THEN v_calc_value := p_volume_cm3;
        ELSE v_calc_value := p_weight_kg;
    END CASE;

    -- Round
    IF v_tariff.rounding_rule = 'ROUND_UP' THEN v_calc_value := CEIL(v_calc_value);
    ELSIF v_tariff.rounding_rule = 'ROUND_DOWN' THEN v_calc_value := FLOOR(v_calc_value);
    ELSE v_calc_value := ROUND(v_calc_value);
    END IF;

    -- 5. Match slab (zone-specific first, then global)
    SELECT * INTO v_slab FROM public.shipping_slabs
    WHERE tariff_id = v_tariff.id
    AND range_from <= v_calc_value
    AND (range_to IS NULL OR range_to >= v_calc_value)
    AND (zone_id = v_zone.id OR zone_id IS NULL)
    ORDER BY
        CASE WHEN zone_id IS NOT NULL THEN 0 ELSE 1 END,
        range_from DESC
    LIMIT 1;

    IF v_slab IS NULL THEN
        -- Fallback: highest slab
        SELECT * INTO v_slab FROM public.shipping_slabs
        WHERE tariff_id = v_tariff.id AND (zone_id = v_zone.id OR zone_id IS NULL)
        ORDER BY range_from DESC LIMIT 1;
    END IF;

    IF v_slab IS NOT NULL THEN
        v_base := v_slab.base_charge;
        IF v_slab.has_per_unit AND v_slab.extra_charge_per_unit > 0 AND v_calc_value > v_slab.range_from THEN
            v_base := v_base + ((v_calc_value - v_slab.range_from) * v_slab.extra_charge_per_unit);
        END IF;
    END IF;

    -- 6. Extra charges
    FOR v_extra IN
        SELECT * FROM public.shipping_extra_charges
        WHERE company_id = p_company_id AND is_active = true
        AND (tariff_id = v_tariff.id OR tariff_id IS NULL)
        AND (applies_to = 'ALL'
            OR (applies_to = 'COD_ONLY' AND p_payment_method = 'cod')
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
        'method', v_method,
        'zone', v_zone_name,
        'tariff', v_tariff.tariff_name,
        'free_shipping', false,
        'breakdown', jsonb_build_object(
            'base', CEIL(v_base),
            'zone_charge', v_zone_charge,
            'extras', v_extra_total,
            'extra_items', v_extras,
            'calc_value', v_calc_value,
            'shipping_type', v_tariff.shipping_type,
            'slab_from', v_slab.range_from,
            'slab_to', v_slab.range_to
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

GRANT EXECUTE ON FUNCTION public.calc_shipping(BIGINT, TEXT, TEXT, DECIMAL, INT, DECIMAL, DECIMAL, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.calc_shipping(BIGINT, TEXT, TEXT, DECIMAL, INT, DECIMAL, DECIMAL, TEXT) TO authenticated;
