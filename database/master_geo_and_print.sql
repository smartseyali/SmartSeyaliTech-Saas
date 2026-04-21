-- ═══════════════════════════════════════════════════════════
-- Global Master Tables — Countries, States, Districts, Print Formats
-- Managed by Super Admin. Read-only for merchants.
-- ═══════════════════════════════════════════════════════════

-- ── master_countries ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.master_countries (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    iso2 VARCHAR(2) UNIQUE,
    iso3 VARCHAR(3) UNIQUE,
    phone_code VARCHAR(10),
    currency_code VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_master_countries_active
  ON public.master_countries(is_active, name);

-- ── master_states ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.master_states (
    id BIGSERIAL PRIMARY KEY,
    country_id BIGINT NOT NULL REFERENCES public.master_countries(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    code VARCHAR(10),
    gst_code VARCHAR(4),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (country_id, name)
);

CREATE INDEX IF NOT EXISTS idx_master_states_country
  ON public.master_states(country_id, is_active);

-- ── master_districts ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.master_districts (
    id BIGSERIAL PRIMARY KEY,
    state_id BIGINT NOT NULL REFERENCES public.master_states(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    code VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (state_id, name)
);

CREATE INDEX IF NOT EXISTS idx_master_districts_state
  ON public.master_districts(state_id, is_active);

-- ── master_print_formats (GLOBAL, managed by super admin) ──
-- Separate from per-tenant `print_formats` table.
-- Merchants read these as read-only library; can clone into
-- their own print_formats for customization.
CREATE TABLE IF NOT EXISTS public.master_print_formats (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    purpose VARCHAR(40) NOT NULL,
        -- quotation | sales_order | sales_invoice | delivery_challan
        -- | purchase_order | purchase_bill | receipt | payment
        -- | ecom_invoice | credit_note | debit_note | generic
    doctype_key VARCHAR(100),
        -- optional registry key pin (e.g. "salesQuotation")
    format_type VARCHAR(30) DEFAULT 'standard', -- standard | custom
    description TEXT,
    html_template TEXT NOT NULL,
    css TEXT,
    header_html TEXT,
    footer_html TEXT,
    paper_size VARCHAR(20) DEFAULT 'A4',
    orientation VARCHAR(20) DEFAULT 'portrait',
    margin_top INTEGER DEFAULT 20,
    margin_bottom INTEGER DEFAULT 20,
    margin_left INTEGER DEFAULT 15,
    margin_right INTEGER DEFAULT 15,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_master_print_formats_purpose
  ON public.master_print_formats(purpose, is_active);

-- ═══════════════════════════════════════════════════════════
-- Row Level Security
--   - All authenticated users can SELECT (read-only library)
--   - Only super admins can INSERT/UPDATE/DELETE
--   - service_role bypasses everything
-- ═══════════════════════════════════════════════════════════

-- Helper policy block — applied identically to all four tables
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
      'master_countries',
      'master_states',
      'master_districts',
      'master_print_formats'
  ])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);

    EXECUTE format('DROP POLICY IF EXISTS "read_all_authenticated" ON public.%I;', t);
    EXECUTE format($p$
      CREATE POLICY "read_all_authenticated" ON public.%I
        FOR SELECT TO authenticated
        USING (true);
    $p$, t);

    EXECUTE format('DROP POLICY IF EXISTS "write_super_admin_only" ON public.%I;', t);
    EXECUTE format($p$
      CREATE POLICY "write_super_admin_only" ON public.%I
        FOR ALL TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.is_super_admin = true
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.is_super_admin = true
          )
        );
    $p$, t);

    EXECUTE format('DROP POLICY IF EXISTS "service_role_bypass" ON public.%I;', t);
    EXECUTE format($p$
      CREATE POLICY "service_role_bypass" ON public.%I
        FOR ALL USING (auth.role() = 'service_role');
    $p$, t);

    EXECUTE format('GRANT SELECT ON public.%I TO authenticated;', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role;', t);
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════
-- Seed — Countries
-- ═══════════════════════════════════════════════════════════

INSERT INTO public.master_countries (name, iso2, iso3, phone_code, currency_code, sort_order)
VALUES
  ('India',          'IN', 'IND', '+91',  'INR', 1),
  ('United States',  'US', 'USA', '+1',   'USD', 10),
  ('United Kingdom', 'GB', 'GBR', '+44',  'GBP', 20),
  ('United Arab Emirates','AE','ARE','+971','AED', 30),
  ('Australia',      'AU', 'AUS', '+61',  'AUD', 40),
  ('Canada',         'CA', 'CAN', '+1',   'CAD', 50),
  ('Singapore',      'SG', 'SGP', '+65',  'SGD', 60)
ON CONFLICT (name) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- Seed — Indian States + Union Territories (with GST codes)
-- ═══════════════════════════════════════════════════════════

WITH india AS (SELECT id FROM public.master_countries WHERE iso2 = 'IN')
INSERT INTO public.master_states (country_id, name, code, gst_code, sort_order)
SELECT india.id, s.name, s.code, s.gst_code, s.sort
FROM india, (VALUES
  ('Andhra Pradesh',              'AP', '37', 1),
  ('Arunachal Pradesh',           'AR', '12', 2),
  ('Assam',                       'AS', '18', 3),
  ('Bihar',                       'BR', '10', 4),
  ('Chhattisgarh',                'CG', '22', 5),
  ('Goa',                         'GA', '30', 6),
  ('Gujarat',                     'GJ', '24', 7),
  ('Haryana',                     'HR', '06', 8),
  ('Himachal Pradesh',            'HP', '02', 9),
  ('Jharkhand',                   'JH', '20', 10),
  ('Karnataka',                   'KA', '29', 11),
  ('Kerala',                      'KL', '32', 12),
  ('Madhya Pradesh',              'MP', '23', 13),
  ('Maharashtra',                 'MH', '27', 14),
  ('Manipur',                     'MN', '14', 15),
  ('Meghalaya',                   'ML', '17', 16),
  ('Mizoram',                     'MZ', '15', 17),
  ('Nagaland',                    'NL', '13', 18),
  ('Odisha',                      'OD', '21', 19),
  ('Punjab',                      'PB', '03', 20),
  ('Rajasthan',                   'RJ', '08', 21),
  ('Sikkim',                      'SK', '11', 22),
  ('Tamil Nadu',                  'TN', '33', 23),
  ('Telangana',                   'TS', '36', 24),
  ('Tripura',                     'TR', '16', 25),
  ('Uttar Pradesh',               'UP', '09', 26),
  ('Uttarakhand',                 'UK', '05', 27),
  ('West Bengal',                 'WB', '19', 28),
  -- Union Territories
  ('Andaman and Nicobar Islands', 'AN', '35', 29),
  ('Chandigarh',                  'CH', '04', 30),
  ('Dadra and Nagar Haveli and Daman and Diu', 'DH', '26', 31),
  ('Delhi',                       'DL', '07', 32),
  ('Jammu and Kashmir',           'JK', '01', 33),
  ('Ladakh',                      'LA', '38', 34),
  ('Lakshadweep',                 'LD', '31', 35),
  ('Puducherry',                  'PY', '34', 36)
) AS s(name, code, gst_code, sort)
ON CONFLICT (country_id, name) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- Seed — Tamil Nadu districts (full list) — sample for other states
-- Super admin can add more via the UI.
-- ═══════════════════════════════════════════════════════════

WITH tn AS (
  SELECT s.id FROM public.master_states s
  JOIN public.master_countries c ON c.id = s.country_id
  WHERE c.iso2 = 'IN' AND s.name = 'Tamil Nadu'
)
INSERT INTO public.master_districts (state_id, name, sort_order)
SELECT tn.id, d.name, d.sort
FROM tn, (VALUES
  ('Ariyalur', 1), ('Chengalpattu', 2), ('Chennai', 3), ('Coimbatore', 4),
  ('Cuddalore', 5), ('Dharmapuri', 6), ('Dindigul', 7), ('Erode', 8),
  ('Kallakurichi', 9), ('Kanchipuram', 10), ('Kanyakumari', 11), ('Karur', 12),
  ('Krishnagiri', 13), ('Madurai', 14), ('Mayiladuthurai', 15), ('Nagapattinam', 16),
  ('Namakkal', 17), ('Nilgiris', 18), ('Perambalur', 19), ('Pudukkottai', 20),
  ('Ramanathapuram', 21), ('Ranipet', 22), ('Salem', 23), ('Sivaganga', 24),
  ('Tenkasi', 25), ('Thanjavur', 26), ('Theni', 27), ('Thoothukudi', 28),
  ('Tiruchirappalli', 29), ('Tirunelveli', 30), ('Tirupathur', 31), ('Tiruppur', 32),
  ('Tiruvallur', 33), ('Tiruvannamalai', 34), ('Tiruvarur', 35), ('Vellore', 36),
  ('Viluppuram', 37), ('Virudhunagar', 38)
) AS d(name, sort)
ON CONFLICT (state_id, name) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- Seed — Starter print format templates per purpose
-- Minimal HTML; super admins can edit/extend via UI.
-- ═══════════════════════════════════════════════════════════

INSERT INTO public.master_print_formats
  (name, purpose, doctype_key, format_type, description, html_template, is_default, sort_order)
VALUES
(
  'Standard Quotation',
  'quotation',
  'salesQuotation',
  'standard',
  'Default quotation template with line items and totals.',
$HTML$
<div style="font-family:Arial,sans-serif;padding:20px;">
  <h2 style="margin:0;">Quotation #{{reference_no}}</h2>
  <p style="color:#666;margin:4px 0 16px;">{{today}}</p>
  <div><strong>To:</strong> {{customer_name}}<br>{{customer_address}}</div>
  <hr>
  <table style="width:100%;border-collapse:collapse;margin-top:12px;">
    <thead><tr style="background:#f4f4f4;">
      <th style="text-align:left;padding:6px;">Item</th>
      <th style="text-align:right;padding:6px;">Qty</th>
      <th style="text-align:right;padding:6px;">Rate</th>
      <th style="text-align:right;padding:6px;">Amount</th>
    </tr></thead>
    <tbody>
      {% for item in items %}
      <tr>
        <td style="padding:6px;border-bottom:1px solid #eee;">{{item.name}}</td>
        <td style="padding:6px;text-align:right;border-bottom:1px solid #eee;">{{item.qty}}</td>
        <td style="padding:6px;text-align:right;border-bottom:1px solid #eee;">{{item.rate}}</td>
        <td style="padding:6px;text-align:right;border-bottom:1px solid #eee;">{{item.amount}}</td>
      </tr>
      {% endfor %}
    </tbody>
  </table>
  <p style="text-align:right;margin-top:16px;"><strong>Total: {{grand_total}}</strong></p>
</div>
$HTML$,
  true, 1
),
(
  'Standard Sales Invoice',
  'sales_invoice',
  'salesInvoice',
  'standard',
  'Default GST invoice template.',
$HTML$<div style="font-family:Arial,sans-serif;padding:20px;"><h2>Invoice #{{reference_no}}</h2><p>{{customer_name}}</p><p>{{today}}</p><p>Total: {{grand_total}}</p></div>$HTML$,
  true, 2
),
(
  'Standard Delivery Challan',
  'delivery_challan',
  'deliveryChallan',
  'standard',
  'Goods movement document without prices.',
$HTML$<div style="font-family:Arial,sans-serif;padding:20px;"><h2>Delivery Challan #{{reference_no}}</h2><p>To: {{customer_name}}</p><p>Date: {{today}}</p></div>$HTML$,
  true, 3
),
(
  'Standard Purchase Order',
  'purchase_order',
  'purchaseOrder',
  'standard',
  'Default PO template issued to vendors.',
$HTML$<div style="font-family:Arial,sans-serif;padding:20px;"><h2>Purchase Order #{{reference_no}}</h2><p>Vendor: {{vendor_name}}</p><p>{{today}}</p></div>$HTML$,
  true, 4
),
(
  'Standard Receipt Voucher',
  'receipt',
  'receiptVoucher',
  'standard',
  'Payment receipt acknowledgement.',
$HTML$<div style="font-family:Arial,sans-serif;padding:20px;"><h2>Receipt #{{reference_no}}</h2><p>Received From: {{customer_name}}</p><p>Amount: {{amount}}</p><p>{{today}}</p></div>$HTML$,
  true, 5
)
ON CONFLICT DO NOTHING;
