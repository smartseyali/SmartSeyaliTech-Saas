-- ═══════════════════════════════════════════════════════════════════════════
--  Phase 1 — F3: Order Email Templates
--  Run once in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.ecom_email_templates (
  id           BIGSERIAL PRIMARY KEY,
  company_id   INTEGER NOT NULL,
  template_key VARCHAR(100) NOT NULL, -- 'order_confirmation','order_shipped','order_delivered','abandoned_cart','review_request'
  subject      VARCHAR(500),
  html_body    TEXT,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, template_key)
);

ALTER TABLE ecom_email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY ecom_email_templates_company ON ecom_email_templates
  FOR ALL USING (
    company_id IN (
      SELECT cu.company_id FROM company_users cu WHERE cu.user_id = auth.uid()
    )
  );

-- ── Default templates (seed for any company that hasn't customised) ──────
-- These are used as fallback by the Edge Function when company has no template.

CREATE TABLE IF NOT EXISTS public.ecom_email_template_defaults (
  template_key VARCHAR(100) PRIMARY KEY,
  subject      VARCHAR(500) NOT NULL,
  html_body    TEXT NOT NULL
);

INSERT INTO ecom_email_template_defaults (template_key, subject, html_body) VALUES
('order_confirmation',
 'Order Confirmed — {{order_number}}',
 '<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333">
<h2 style="color:#1a472a">Thank you for your order, {{customer_name}}!</h2>
<p>Your order <strong>{{order_number}}</strong> has been confirmed.</p>
<table style="width:100%;border-collapse:collapse;margin:20px 0">
<thead><tr style="background:#f5f5f5"><th style="padding:10px;text-align:left">Product</th><th style="padding:10px;text-align:right">Qty</th><th style="padding:10px;text-align:right">Amount</th></tr></thead>
<tbody>{{items_rows}}</tbody>
<tfoot>
<tr><td colspan="2" style="padding:10px;text-align:right;font-weight:bold">Subtotal</td><td style="padding:10px;text-align:right">{{subtotal}}</td></tr>
<tr><td colspan="2" style="padding:10px;text-align:right;font-weight:bold">Shipping</td><td style="padding:10px;text-align:right">{{shipping}}</td></tr>
<tr style="background:#1a472a;color:white"><td colspan="2" style="padding:10px;text-align:right;font-weight:bold">Total</td><td style="padding:10px;text-align:right;font-weight:bold">{{total}}</td></tr>
</tfoot>
</table>
<p><strong>Shipping to:</strong><br>{{shipping_address}}</p>
<p><strong>Payment:</strong> {{payment_method}}</p>
<p style="color:#666;font-size:13px">For any queries, reply to this email or WhatsApp us at {{whatsapp}}.</p>
<hr style="border:none;border-top:1px solid #eee;margin:20px 0">
<p style="color:#999;font-size:12px">{{store_name}} · {{store_address}}</p>
</body></html>'
),
('order_shipped',
 'Your Order {{order_number}} Has Been Shipped!',
 '<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333">
<h2 style="color:#1a472a">Your order is on the way, {{customer_name}}!</h2>
<p>Order <strong>{{order_number}}</strong> has been dispatched.</p>
<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0">
<p style="margin:0"><strong>Courier:</strong> {{courier_name}}</p>
<p style="margin:8px 0 0"><strong>Tracking:</strong> {{tracking_number}}</p>
{{tracking_link}}
</div>
<p>Estimated delivery: 3–7 business days.</p>
<p style="color:#999;font-size:12px">{{store_name}} · {{store_address}}</p>
</body></html>'
),
('order_delivered',
 'Order {{order_number}} Delivered!',
 '<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333">
<h2 style="color:#1a472a">Delivered! Hope you love it, {{customer_name}} 🎉</h2>
<p>Order <strong>{{order_number}}</strong> has been delivered.</p>
<p>If you have any issues, please contact us within 48 hours.</p>
<p>Enjoyed your order? <a href="{{review_url}}" style="color:#1a472a">Leave a review</a> and help other customers discover us!</p>
<p style="color:#999;font-size:12px">{{store_name}} · {{store_address}}</p>
</body></html>'
),
('abandoned_cart',
 'You left something behind! Your cart at {{store_name}}',
 '<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333">
<h2 style="color:#1a472a">Still thinking, {{customer_name}}?</h2>
<p>You left items in your cart at {{store_name}}. Complete your order before they sell out!</p>
<div style="text-align:center;margin:30px 0">
<a href="{{recovery_url}}" style="background:#1a472a;color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:bold;font-size:16px">Complete My Order</a>
</div>
{{coupon_section}}
<p style="color:#999;font-size:12px">{{store_name}}</p>
</body></html>'
)
ON CONFLICT (template_key) DO NOTHING;
