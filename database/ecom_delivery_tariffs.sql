-- ========================================================================================
-- DELIVERY TARIFF SYSTEM — Dynamic weight/volume slabs + state zones
-- ========================================================================================

-- 1. Delivery Zones — merchant defines custom zones (TN, SOUTH, NE, REST etc.)
CREATE TABLE IF NOT EXISTS public.delivery_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    zone_code VARCHAR(20) NOT NULL,
    zone_name VARCHAR(100) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, zone_code)
);

-- 2. State-Zone Mapping — which state belongs to which zone
CREATE TABLE IF NOT EXISTS public.delivery_state_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    state_name VARCHAR(100) NOT NULL,
    zone_code VARCHAR(20) NOT NULL,
    UNIQUE(company_id, state_name)
);

-- 3. Delivery Tariff Slabs — weight/volume based pricing per zone
CREATE TABLE IF NOT EXISTS public.delivery_tariff_slabs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    tariff_type VARCHAR(20) NOT NULL DEFAULT 'weight',  -- 'weight' or 'volume'
    max_value INT NOT NULL,  -- max grams or max ml
    zone_prices JSONB NOT NULL DEFAULT '{}',  -- {"TN": 10, "SOUTH": 70, "NE": 130, "REST": 120}
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Delivery Settings (per company)
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS free_delivery_above DECIMAL(10,2) DEFAULT 0;
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS default_item_weight INT DEFAULT 500;
ALTER TABLE ecom_settings ADD COLUMN IF NOT EXISTS unserviceable_pincodes TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 5. RLS
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_state_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tariff_slabs ENABLE ROW LEVEL SECURITY;

-- Admin: tenant isolation
CREATE POLICY "tenant_isolation" ON public.delivery_zones FOR ALL TO authenticated
    USING (public.user_has_company_access(company_id)) WITH CHECK (public.user_has_company_access(company_id));
CREATE POLICY "tenant_isolation" ON public.delivery_state_zones FOR ALL TO authenticated
    USING (public.user_has_company_access(company_id)) WITH CHECK (public.user_has_company_access(company_id));
CREATE POLICY "tenant_isolation" ON public.delivery_tariff_slabs FOR ALL TO authenticated
    USING (public.user_has_company_access(company_id)) WITH CHECK (public.user_has_company_access(company_id));

-- Service role
CREATE POLICY "service_role_bypass" ON public.delivery_zones FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass" ON public.delivery_state_zones FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bypass" ON public.delivery_tariff_slabs FOR ALL USING (auth.role() = 'service_role');

-- Anon: storefront read (for delivery charge calculation)
CREATE POLICY "anon_read" ON public.delivery_zones FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read" ON public.delivery_state_zones FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read" ON public.delivery_tariff_slabs FOR SELECT TO anon USING (true);

GRANT SELECT ON public.delivery_zones TO anon;
GRANT SELECT ON public.delivery_state_zones TO anon;
GRANT SELECT ON public.delivery_tariff_slabs TO anon;

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_delivery_zones_company ON delivery_zones(company_id);
CREATE INDEX IF NOT EXISTS idx_delivery_state_zones_company ON delivery_state_zones(company_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tariff_slabs_company ON delivery_tariff_slabs(company_id);

-- 7. Calculate delivery charge function
CREATE OR REPLACE FUNCTION public.calculate_delivery_charge(
    p_company_id BIGINT,
    p_state TEXT,
    p_weight_grams INT,
    p_volume_ml INT DEFAULT 0
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    v_zone TEXT;
    v_weight_price DECIMAL(10,2) := 0;
    v_volume_price DECIMAL(10,2) := 0;
    v_free_above DECIMAL(10,2);
BEGIN
    -- Find the zone for this state
    SELECT zone_code INTO v_zone
    FROM public.delivery_state_zones
    WHERE company_id = p_company_id AND LOWER(state_name) = LOWER(p_state);

    IF v_zone IS NULL THEN
        v_zone := 'REST';  -- fallback
    END IF;

    -- Find weight-based price
    SELECT (zone_prices->>v_zone)::DECIMAL INTO v_weight_price
    FROM public.delivery_tariff_slabs
    WHERE company_id = p_company_id AND tariff_type = 'weight' AND max_value >= p_weight_grams
    ORDER BY max_value ASC
    LIMIT 1;

    -- Find volume-based price (if applicable)
    IF p_volume_ml > 0 THEN
        SELECT (zone_prices->>v_zone)::DECIMAL INTO v_volume_price
        FROM public.delivery_tariff_slabs
        WHERE company_id = p_company_id AND tariff_type = 'volume' AND max_value >= p_volume_ml
        ORDER BY max_value ASC
        LIMIT 1;
    END IF;

    -- Return the higher of weight/volume price
    RETURN GREATEST(COALESCE(v_weight_price, 0), COALESCE(v_volume_price, 0));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

GRANT EXECUTE ON FUNCTION public.calculate_delivery_charge(BIGINT, TEXT, INT, INT) TO anon;
GRANT EXECUTE ON FUNCTION public.calculate_delivery_charge(BIGINT, TEXT, INT, INT) TO authenticated;
