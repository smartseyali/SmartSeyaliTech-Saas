-- ========================================================================================
-- DELIVERY TARIFF SYSTEM — Weight/Volume slabs + State-Zone mapping
-- Replicates thandatti delivery logic in Supabase
-- ========================================================================================

-- 1. Delivery Tariff Slabs
CREATE TABLE IF NOT EXISTS public.delivery_tariffs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    max_weight INT NOT NULL,
    tariff_type VARCHAR(20) NOT NULL DEFAULT 'WEIGHT',
    prices JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_delivery_tariffs_lookup
    ON delivery_tariffs(company_id, tariff_type, max_weight);

-- 2. Delivery State Zones
CREATE TABLE IF NOT EXISTS public.delivery_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    zone VARCHAR(50) NOT NULL DEFAULT 'REST',
    UNIQUE(company_id, name)
);

CREATE INDEX IF NOT EXISTS idx_delivery_states_lookup
    ON delivery_states(company_id, LOWER(name));

-- 3. Delivery settings on ecom_settings
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS free_delivery_above DECIMAL(10,2) DEFAULT 0;
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS default_item_weight INT DEFAULT 500;

-- 4. RLS
ALTER TABLE public.delivery_tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_states ENABLE ROW LEVEL SECURITY;

-- Admin
DROP POLICY IF EXISTS "tenant_isolation" ON public.delivery_tariffs;
CREATE POLICY "tenant_isolation" ON public.delivery_tariffs FOR ALL TO authenticated
    USING (public.user_has_company_access(company_id)) WITH CHECK (public.user_has_company_access(company_id));
DROP POLICY IF EXISTS "tenant_isolation" ON public.delivery_states;
CREATE POLICY "tenant_isolation" ON public.delivery_states FOR ALL TO authenticated
    USING (public.user_has_company_access(company_id)) WITH CHECK (public.user_has_company_access(company_id));

-- Service role
DROP POLICY IF EXISTS "service_role_bypass" ON public.delivery_tariffs;
CREATE POLICY "service_role_bypass" ON public.delivery_tariffs FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "service_role_bypass" ON public.delivery_states;
CREATE POLICY "service_role_bypass" ON public.delivery_states FOR ALL USING (auth.role() = 'service_role');

-- Anon (storefront checkout needs to calculate delivery)
DROP POLICY IF EXISTS "anon_read" ON public.delivery_tariffs;
CREATE POLICY "anon_read" ON public.delivery_tariffs FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "anon_read" ON public.delivery_states;
CREATE POLICY "anon_read" ON public.delivery_states FOR SELECT TO anon USING (true);

GRANT SELECT ON public.delivery_tariffs TO anon;
GRANT SELECT ON public.delivery_states TO anon;

-- 5. Calculate delivery charge (weight + volume mixed)
CREATE OR REPLACE FUNCTION public.calculate_delivery_charge(
    p_company_id BIGINT,
    p_state TEXT,
    p_total_grams INT,
    p_total_ml INT DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
    v_zone TEXT;
    v_weight_charge DECIMAL(10,2) := 0;
    v_volume_charge DECIMAL(10,2) := 0;
    v_free_above DECIMAL(10,2) := 0;
    v_prices JSONB;
BEGIN
    -- Resolve zone from state
    SELECT zone INTO v_zone
    FROM public.delivery_states
    WHERE company_id = p_company_id AND LOWER(name) = LOWER(p_state);
    IF v_zone IS NULL THEN v_zone := 'REST'; END IF;

    -- Weight-based charge
    IF p_total_grams > 0 THEN
        SELECT prices INTO v_prices
        FROM public.delivery_tariffs
        WHERE company_id = p_company_id AND tariff_type = 'WEIGHT' AND max_weight >= p_total_grams
        ORDER BY max_weight ASC LIMIT 1;

        -- Fallback to highest slab if weight exceeds all
        IF v_prices IS NULL THEN
            SELECT prices INTO v_prices
            FROM public.delivery_tariffs
            WHERE company_id = p_company_id AND tariff_type = 'WEIGHT'
            ORDER BY max_weight DESC LIMIT 1;
        END IF;

        IF v_prices IS NOT NULL THEN
            v_weight_charge := COALESCE((v_prices->>v_zone)::DECIMAL, (v_prices->>'REST')::DECIMAL, 0);
        END IF;
    END IF;

    -- Volume-based charge
    IF p_total_ml > 0 THEN
        SELECT prices INTO v_prices
        FROM public.delivery_tariffs
        WHERE company_id = p_company_id AND tariff_type = 'VOLUME' AND max_weight >= p_total_ml
        ORDER BY max_weight ASC LIMIT 1;

        IF v_prices IS NULL THEN
            SELECT prices INTO v_prices
            FROM public.delivery_tariffs
            WHERE company_id = p_company_id AND tariff_type = 'VOLUME'
            ORDER BY max_weight DESC LIMIT 1;
        END IF;

        IF v_prices IS NOT NULL THEN
            v_volume_charge := COALESCE((v_prices->>v_zone)::DECIMAL, (v_prices->>'REST')::DECIMAL, 0);
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'delivery_charge', CEIL(v_weight_charge + v_volume_charge),
        'zone', v_zone,
        'weight_charge', v_weight_charge,
        'volume_charge', v_volume_charge,
        'total_grams', p_total_grams,
        'total_ml', p_total_ml
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

GRANT EXECUTE ON FUNCTION public.calculate_delivery_charge(BIGINT, TEXT, INT, INT) TO anon;
GRANT EXECUTE ON FUNCTION public.calculate_delivery_charge(BIGINT, TEXT, INT, INT) TO authenticated;

-- Drop old tables if they conflict (from previous version)
DROP TABLE IF EXISTS public.delivery_zones CASCADE;
DROP TABLE IF EXISTS public.delivery_state_zones CASCADE;
DROP TABLE IF EXISTS public.delivery_tariff_slabs CASCADE;
