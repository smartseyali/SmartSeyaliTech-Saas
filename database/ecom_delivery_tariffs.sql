-- ========================================================================================
-- SHIPPING ENGINE — Modular, rule-based delivery charge system
-- Tables: delivery_tariffs, delivery_states, shipping_rules, shipping_extra_charges
-- Function: calculate_shipping_charge() — full pipeline
-- ========================================================================================


-- ========================================================================================
-- 1. DELIVERY TARIFF SLABS (weight/volume/value/qty based pricing per zone)
-- ========================================================================================

CREATE TABLE IF NOT EXISTS public.delivery_tariffs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    slab_type VARCHAR(20) NOT NULL DEFAULT 'WEIGHT',  -- WEIGHT | VOLUME | VALUE | QTY
    max_value INT NOT NULL,  -- max grams / ml / ₹ / qty depending on slab_type
    prices JSONB NOT NULL DEFAULT '{}',  -- {"TN": 40, "SOUTH": 70, "NE": 130, "REST": 120}
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_delivery_tariffs_lookup
    ON delivery_tariffs(company_id, slab_type, max_value);


-- ========================================================================================
-- 2. DELIVERY STATE-ZONE MAPPING
-- ========================================================================================

CREATE TABLE IF NOT EXISTS public.delivery_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    zone VARCHAR(50) NOT NULL DEFAULT 'REST',
    UNIQUE(company_id, name)
);

CREATE INDEX IF NOT EXISTS idx_delivery_states_lookup
    ON delivery_states(company_id, LOWER(name));


-- ========================================================================================
-- 3. SHIPPING RULES — Priority-based rule engine config per merchant
-- ========================================================================================

CREATE TABLE IF NOT EXISTS public.shipping_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    rule_name VARCHAR(100) NOT NULL,
    slab_basis VARCHAR(20) NOT NULL DEFAULT 'WEIGHT',  -- WEIGHT | VOLUME | VALUE | QTY
    priority INT NOT NULL DEFAULT 1,  -- Lower = higher priority
    is_active BOOLEAN DEFAULT true,
    free_shipping_above DECIMAL(10,2) DEFAULT 0,  -- Free shipping threshold for this rule
    conditions JSONB DEFAULT '{}',  -- Future: {"min_weight": 0, "max_weight": 99999, "categories": [...]}
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, slab_basis)
);


-- ========================================================================================
-- 4. SHIPPING EXTRA CHARGES — COD fee, express, handling, packaging etc.
-- ========================================================================================

CREATE TABLE IF NOT EXISTS public.shipping_extra_charges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    charge_type VARCHAR(50) NOT NULL,  -- COD | EXPRESS | HANDLING | PACKAGING | INSURANCE
    charge_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_percentage BOOLEAN DEFAULT false,  -- true = % of order value, false = flat ₹
    is_active BOOLEAN DEFAULT true,
    applies_to VARCHAR(20) DEFAULT 'ALL',  -- ALL | COD_ONLY | PREPAID_ONLY
    min_order_value DECIMAL(10,2) DEFAULT 0,  -- Only apply if order > this
    max_order_value DECIMAL(10,2) DEFAULT 0,  -- Only apply if order < this (0 = no limit)
    created_at TIMESTAMPTZ DEFAULT now()
);


-- ========================================================================================
-- 5. ECOM_SETTINGS — delivery preferences
-- ========================================================================================

ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS free_delivery_above DECIMAL(10,2) DEFAULT 0;
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS default_item_weight INT DEFAULT 500;
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS shipping_priority VARCHAR(20) DEFAULT 'WEIGHT';


-- ========================================================================================
-- 6. RLS — All tables
-- ========================================================================================

DO $$
DECLARE tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['delivery_tariffs', 'delivery_states', 'shipping_rules', 'shipping_extra_charges']) LOOP
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


-- ========================================================================================
-- 7. CALCULATE SHIPPING — Full pipeline function
-- ========================================================================================

CREATE OR REPLACE FUNCTION public.calculate_shipping_charge(
    p_company_id BIGINT,
    p_state TEXT,
    p_total_grams INT DEFAULT 0,
    p_total_ml INT DEFAULT 0,
    p_total_qty INT DEFAULT 1,
    p_order_value DECIMAL DEFAULT 0,
    p_payment_method TEXT DEFAULT 'prepaid'
)
RETURNS JSONB AS $$
DECLARE
    v_zone TEXT;
    v_base_charge DECIMAL(10,2) := 0;
    v_weight_charge DECIMAL(10,2) := 0;
    v_volume_charge DECIMAL(10,2) := 0;
    v_value_charge DECIMAL(10,2) := 0;
    v_qty_charge DECIMAL(10,2) := 0;
    v_extra_total DECIMAL(10,2) := 0;
    v_free_above DECIMAL(10,2) := 0;
    v_priority TEXT;
    v_prices JSONB;
    v_rule RECORD;
    v_extra RECORD;
    v_extras JSONB := '[]'::JSONB;
    v_method TEXT;
BEGIN
    -- 1. RESOLVE ZONE
    SELECT zone INTO v_zone
    FROM public.delivery_states
    WHERE company_id = p_company_id AND LOWER(name) = LOWER(p_state);
    IF v_zone IS NULL THEN v_zone := 'REST'; END IF;

    -- 2. CHECK FREE SHIPPING (global threshold)
    SELECT free_delivery_above, shipping_priority INTO v_free_above, v_priority
    FROM public.ecom_settings WHERE company_id = p_company_id;

    IF v_free_above > 0 AND p_order_value >= v_free_above THEN
        RETURN jsonb_build_object(
            'shipping_charge', 0, 'zone', v_zone, 'method', 'free_shipping',
            'breakdown', jsonb_build_object('base', 0, 'extras', 0),
            'free_shipping', true, 'free_threshold', v_free_above
        );
    END IF;

    -- 3. CALCULATE BY EACH ACTIVE RULE (slab matching)

    -- Weight slabs
    SELECT prices INTO v_prices FROM public.delivery_tariffs
    WHERE company_id = p_company_id AND slab_type = 'WEIGHT' AND max_value >= p_total_grams
    ORDER BY max_value ASC LIMIT 1;
    IF v_prices IS NULL THEN
        SELECT prices INTO v_prices FROM public.delivery_tariffs
        WHERE company_id = p_company_id AND slab_type = 'WEIGHT' ORDER BY max_value DESC LIMIT 1;
    END IF;
    IF v_prices IS NOT NULL THEN
        v_weight_charge := COALESCE((v_prices->>v_zone)::DECIMAL, (v_prices->>'REST')::DECIMAL, 0);
    END IF;

    -- Volume slabs
    IF p_total_ml > 0 THEN
        v_prices := NULL;
        SELECT prices INTO v_prices FROM public.delivery_tariffs
        WHERE company_id = p_company_id AND slab_type = 'VOLUME' AND max_value >= p_total_ml
        ORDER BY max_value ASC LIMIT 1;
        IF v_prices IS NULL THEN
            SELECT prices INTO v_prices FROM public.delivery_tariffs
            WHERE company_id = p_company_id AND slab_type = 'VOLUME' ORDER BY max_value DESC LIMIT 1;
        END IF;
        IF v_prices IS NOT NULL THEN
            v_volume_charge := COALESCE((v_prices->>v_zone)::DECIMAL, (v_prices->>'REST')::DECIMAL, 0);
        END IF;
    END IF;

    -- Value-based slabs
    v_prices := NULL;
    SELECT prices INTO v_prices FROM public.delivery_tariffs
    WHERE company_id = p_company_id AND slab_type = 'VALUE' AND max_value >= p_order_value
    ORDER BY max_value ASC LIMIT 1;
    IF v_prices IS NOT NULL THEN
        v_value_charge := COALESCE((v_prices->>v_zone)::DECIMAL, (v_prices->>'REST')::DECIMAL, 0);
    END IF;

    -- Qty-based slabs
    v_prices := NULL;
    SELECT prices INTO v_prices FROM public.delivery_tariffs
    WHERE company_id = p_company_id AND slab_type = 'QTY' AND max_value >= p_total_qty
    ORDER BY max_value ASC LIMIT 1;
    IF v_prices IS NOT NULL THEN
        v_qty_charge := COALESCE((v_prices->>v_zone)::DECIMAL, (v_prices->>'REST')::DECIMAL, 0);
    END IF;

    -- 4. DETERMINE BASE CHARGE BY PRIORITY
    v_priority := COALESCE(v_priority, 'WEIGHT');
    v_method := 'slab_' || LOWER(v_priority);

    CASE v_priority
        WHEN 'WEIGHT' THEN v_base_charge := GREATEST(v_weight_charge, v_volume_charge);
        WHEN 'VOLUME' THEN v_base_charge := GREATEST(v_volume_charge, v_weight_charge);
        WHEN 'VALUE' THEN v_base_charge := v_value_charge;
        WHEN 'QTY' THEN v_base_charge := v_qty_charge;
        ELSE v_base_charge := GREATEST(v_weight_charge, v_volume_charge);
    END CASE;

    -- Fallback: if primary has 0, use the highest from any method
    IF v_base_charge = 0 THEN
        v_base_charge := GREATEST(v_weight_charge, v_volume_charge, v_value_charge, v_qty_charge);
        IF v_base_charge > 0 THEN v_method := 'fallback_highest'; END IF;
    END IF;

    -- 5. ADD EXTRA CHARGES (COD, express, handling etc.)
    FOR v_extra IN
        SELECT * FROM public.shipping_extra_charges
        WHERE company_id = p_company_id AND is_active = true
        AND (applies_to = 'ALL'
            OR (applies_to = 'COD_ONLY' AND p_payment_method = 'cod')
            OR (applies_to = 'PREPAID_ONLY' AND p_payment_method != 'cod'))
        AND (min_order_value = 0 OR p_order_value >= min_order_value)
        AND (max_order_value = 0 OR p_order_value <= max_order_value)
    LOOP
        IF v_extra.is_percentage THEN
            v_extra_total := v_extra_total + (p_order_value * v_extra.amount / 100);
        ELSE
            v_extra_total := v_extra_total + v_extra.amount;
        END IF;
        v_extras := v_extras || jsonb_build_object(
            'type', v_extra.charge_type,
            'name', v_extra.charge_name,
            'amount', CASE WHEN v_extra.is_percentage THEN ROUND(p_order_value * v_extra.amount / 100, 2) ELSE v_extra.amount END
        );
    END LOOP;

    -- 6. RETURN FULL BREAKDOWN
    RETURN jsonb_build_object(
        'shipping_charge', CEIL(v_base_charge + v_extra_total),
        'zone', v_zone,
        'method', v_method,
        'free_shipping', false,
        'breakdown', jsonb_build_object(
            'base', CEIL(v_base_charge),
            'weight_charge', v_weight_charge,
            'volume_charge', v_volume_charge,
            'value_charge', v_value_charge,
            'qty_charge', v_qty_charge,
            'extras', v_extra_total,
            'extra_items', v_extras
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

GRANT EXECUTE ON FUNCTION public.calculate_shipping_charge(BIGINT, TEXT, INT, INT, INT, DECIMAL, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.calculate_shipping_charge(BIGINT, TEXT, INT, INT, INT, DECIMAL, TEXT) TO authenticated;


-- ========================================================================================
-- 8. CLEANUP old tables from previous version
-- ========================================================================================

DROP TABLE IF EXISTS public.delivery_zones CASCADE;
DROP TABLE IF EXISTS public.delivery_state_zones CASCADE;
DROP TABLE IF EXISTS public.delivery_tariff_slabs CASCADE;
