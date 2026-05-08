-- ═══════════════════════════════════════════════════════════════════════════
--  Phase 1 — F1: Product Variants + F2: Inventory Tracking
--  Run once in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ── product_variants: add slug + attributes JSONB + sort_order ───────────
ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS sort_order      INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS weight_grams    INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS allow_oversell  BOOLEAN DEFAULT false;

-- ── master_items: inventory tracking ────────────────────────────────────
ALTER TABLE master_items
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS allow_oversell      BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS price_updated_at    TIMESTAMPTZ;

-- Trigger: stamp price_updated_at whenever selling price changes
CREATE OR REPLACE FUNCTION trg_price_updated_fn()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rate IS DISTINCT FROM OLD.rate THEN
    NEW.price_updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_price_updated ON master_items;
CREATE TRIGGER trg_price_updated
  BEFORE UPDATE ON master_items
  FOR EACH ROW EXECUTE FUNCTION trg_price_updated_fn();

-- ── stock_movements: full audit trail ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id             BIGSERIAL PRIMARY KEY,
  company_id     INTEGER NOT NULL,
  item_id        INTEGER,
  variant_id     INTEGER,
  movement_type  VARCHAR(50) NOT NULL, -- 'sale','return','adjustment','restock'
  quantity       DECIMAL(15,2) NOT NULL,
  reference_id   TEXT,
  note           TEXT,
  created_by     VARCHAR(255),
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_item    ON stock_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_variant ON stock_movements(variant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_company ON stock_movements(company_id);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY stock_movements_company ON stock_movements
  FOR ALL USING (
    company_id IN (
      SELECT cu.company_id FROM company_users cu WHERE cu.user_id = auth.uid()
    )
  );

-- ── decrement_stock_on_order: atomic stock guard ──────────────────────
-- Called by the validate-stock Edge Function (service role).
-- Returns {success: bool, failures: [{product, available}]}
CREATE OR REPLACE FUNCTION public.decrement_stock_on_order(
  p_order_id     BIGINT,
  p_company_id   INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item       RECORD;
  v_current    DECIMAL;
  v_failures   JSONB := '[]'::jsonb;
BEGIN
  FOR v_item IN
    SELECT oi.product_id::INTEGER AS product_id,
           oi.variant_id::INTEGER AS variant_id,
           oi.quantity,
           oi.product_name
    FROM ecom_order_items oi
    WHERE oi.order_id = p_order_id
      AND oi.company_id = p_company_id
  LOOP
    IF v_item.variant_id IS NOT NULL THEN
      -- Variant-level stock
      SELECT stock_qty INTO v_current
      FROM product_variants
      WHERE id = v_item.variant_id FOR UPDATE;

      v_current := COALESCE(v_current, 0);

      IF v_current < v_item.quantity THEN
        v_failures := v_failures || jsonb_build_object(
          'product', v_item.product_name, 'available', v_current
        );
      ELSE
        UPDATE product_variants
        SET stock_qty = stock_qty - v_item.quantity
        WHERE id = v_item.variant_id;

        INSERT INTO stock_movements(company_id, variant_id, movement_type, quantity, reference_id, note)
        VALUES(p_company_id, v_item.variant_id, 'sale', -v_item.quantity,
               p_order_id::TEXT, 'Storefront order #' || p_order_id);
      END IF;
    ELSE
      -- Item-level stock
      SELECT current_stock INTO v_current
      FROM master_items
      WHERE id = v_item.product_id FOR UPDATE;

      v_current := COALESCE(v_current, 0);

      IF v_current < v_item.quantity THEN
        SELECT allow_oversell INTO v_current
        FROM master_items WHERE id = v_item.product_id;
        IF NOT COALESCE(v_current::BOOLEAN, false) THEN
          v_failures := v_failures || jsonb_build_object(
            'product', v_item.product_name, 'available', 0
          );
          CONTINUE;
        END IF;
      END IF;

      UPDATE master_items
      SET current_stock = current_stock - v_item.quantity,
          total_sold    = COALESCE(total_sold, 0) + v_item.quantity
      WHERE id = v_item.product_id;

      INSERT INTO stock_movements(company_id, item_id, movement_type, quantity, reference_id, note)
      VALUES(p_company_id, v_item.product_id, 'sale', -v_item.quantity,
             p_order_id::TEXT, 'Storefront order #' || p_order_id);
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success',  jsonb_array_length(v_failures) = 0,
    'failures', v_failures
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrement_stock_on_order TO service_role;
