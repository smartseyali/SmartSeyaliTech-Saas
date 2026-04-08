-- ═══════════════════════════════════════════════════════════
-- Seed: Professional Print Formats for Ecommerce Orders
-- Run AFTER print_formats.sql table creation
-- Replace COMPANY_ID with your actual company ID
-- ═══════════════════════════════════════════════════════════

-- ── 1. Tax Invoice ────────────────────────────────────────
INSERT INTO public.print_formats (company_id, name, doctype_key, format_type, is_default, html_template, css, paper_size, orientation)
VALUES (
  16, -- ← Replace with your company_id
  'Tax Invoice',
  'ecomOrder',
  'standard',
  true,
  '
<div class="invoice">
  <!-- Company Header -->
  <div class="header">
    <div class="company-info">
      <h1 class="company-name">{{company_name}}</h1>
      <p class="company-detail">{{company_address}}, {{company_city}}, {{company_state}}</p>
      <p class="company-detail">Phone: {{company_phone}} | Email: {{company_email}}</p>
      <p class="company-detail" style="font-weight:600;">GSTIN: {{company_gst}}</p>
    </div>
    <div class="doc-title">
      <h2>TAX INVOICE</h2>
    </div>
  </div>

  <!-- Order & Customer Info -->
  <div class="info-grid">
    <div class="info-box">
      <h4>Invoice Details</h4>
      <table class="info-table">
        <tr><td class="label">Order No</td><td class="value">{{order_number}}</td></tr>
        <tr><td class="label">Date</td><td class="value">{{created_at}}</td></tr>
        <tr><td class="label">Status</td><td class="value">{{status_label}}</td></tr>
        <tr><td class="label">Payment</td><td class="value">{{payment_method}} ({{payment_status}})</td></tr>
      </table>
    </div>
    <div class="info-box">
      <h4>Bill To</h4>
      <p class="customer-name">{{customer_name}}</p>
      <p class="customer-detail">{{customer_email}}</p>
      <p class="customer-detail">{{customer_phone}}</p>
      <p class="customer-detail">{{billing_address_line}}</p>
    </div>
    <div class="info-box">
      <h4>Ship To</h4>
      <p class="customer-name">{{customer_name}}</p>
      <p class="customer-detail">{{shipping_address_line}}</p>
      <p class="customer-detail" style="margin-top:8px;">
        Tracking: {{tracking_number}}
      </p>
      <p class="customer-detail">Courier: {{courier_name}}</p>
    </div>
  </div>

  <!-- Items Table -->
  <table class="items-table">
    <thead>
      <tr>
        <th class="col-sno">#</th>
        <th class="col-item">Item</th>
        <th class="col-variant">Variant</th>
        <th class="col-qty">Qty</th>
        <th class="col-rate">Rate</th>
        <th class="col-amount">Amount</th>
      </tr>
    </thead>
    <tbody>
      {% for item in items %}
      <tr>
        <td class="col-sno">{{item.index}}</td>
        <td class="col-item">{{item.product_name}}</td>
        <td class="col-variant">{{item.variant_name}}</td>
        <td class="col-qty">{{item.quantity}}</td>
        <td class="col-rate">₹{{item.unit_price}}</td>
        <td class="col-amount">₹{{item.amount}}</td>
      </tr>
      {% endfor %}
    </tbody>
  </table>

  <!-- Totals -->
  <div class="totals-section">
    <div class="totals-spacer"></div>
    <table class="totals-table">
      <tr><td class="label">Subtotal</td><td class="value">₹{{subtotal}}</td></tr>
      <tr><td class="label">Tax</td><td class="value">₹{{tax_amount}}</td></tr>
      <tr><td class="label">Shipping</td><td class="value">₹{{shipping_amount}}</td></tr>
      <tr><td class="label">Discount</td><td class="value">- ₹{{discount_amount}}</td></tr>
      <tr class="grand-total"><td class="label">Grand Total</td><td class="value">₹{{grand_total}}</td></tr>
    </table>
  </div>

  <!-- Notes -->
  <div class="notes-section">
    <p class="notes-label">Notes</p>
    <p class="notes-text">{{notes}}</p>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-left">
      <p>Thank you for your purchase!</p>
      <p class="footer-sub">This is a computer-generated invoice.</p>
    </div>
    <div class="footer-right">
      <p class="sign-line">Authorized Signatory</p>
      <p class="sign-company">{{company_name}}</p>
    </div>
  </div>
</div>
  ',
  '
  .invoice { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1f2937; line-height: 1.5; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 3px solid #2563eb; margin-bottom: 24px; }
  .company-name { font-size: 24px; font-weight: 800; color: #111827; margin: 0 0 4px; }
  .company-detail { font-size: 11px; color: #6b7280; margin: 2px 0; }
  .doc-title h2 { font-size: 28px; font-weight: 800; color: #2563eb; text-align: right; margin: 0; letter-spacing: -0.5px; }

  .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
  .info-box h4 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #2563eb; margin: 0 0 10px; }
  .info-table { width: 100%; }
  .info-table td { padding: 3px 0; font-size: 12px; }
  .info-table .label { color: #6b7280; width: 40%; font-weight: 600; }
  .info-table .value { color: #111827; font-weight: 500; }
  .customer-name { font-size: 13px; font-weight: 700; color: #111827; margin: 0 0 4px; }
  .customer-detail { font-size: 11px; color: #6b7280; margin: 2px 0; }

  .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .items-table thead tr { background: #1e293b; }
  .items-table th { padding: 10px 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #ffffff; text-align: left; }
  .items-table td { padding: 10px 12px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
  .items-table tbody tr:nth-child(even) { background: #f8fafc; }
  .col-sno { width: 5%; text-align: center; }
  .col-item { width: 35%; }
  .col-variant { width: 20%; }
  .col-qty { width: 10%; text-align: center; }
  .col-rate { width: 15%; text-align: right; }
  .col-amount { width: 15%; text-align: right; font-weight: 600; }

  .totals-section { display: flex; justify-content: flex-end; margin-bottom: 24px; }
  .totals-spacer { flex: 1; }
  .totals-table { width: 280px; }
  .totals-table td { padding: 6px 12px; font-size: 12px; }
  .totals-table .label { color: #6b7280; font-weight: 600; text-align: left; }
  .totals-table .value { color: #111827; font-weight: 600; text-align: right; }
  .totals-table .grand-total td { border-top: 2px solid #2563eb; font-size: 16px; font-weight: 800; color: #111827; padding-top: 10px; }

  .notes-section { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; margin-bottom: 32px; }
  .notes-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #92400e; margin: 0 0 4px; }
  .notes-text { font-size: 12px; color: #78350f; margin: 0; }

  .footer { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 24px; border-top: 1px solid #e5e7eb; }
  .footer-left p { font-size: 13px; font-weight: 600; color: #111827; margin: 0; }
  .footer-sub { font-size: 10px !important; color: #9ca3af !important; font-weight: 400 !important; margin-top: 2px !important; }
  .footer-right { text-align: right; }
  .sign-line { font-size: 11px; color: #6b7280; border-top: 1px solid #d1d5db; padding-top: 8px; margin: 0; }
  .sign-company { font-size: 12px; font-weight: 700; color: #111827; margin: 4px 0 0; }
  ',
  'A4',
  'portrait'
);

-- ── 2. Delivery Challan ───────────────────────────────────
INSERT INTO public.print_formats (company_id, name, doctype_key, format_type, is_default, html_template, css, paper_size)
VALUES (
  16, -- ← Replace with your company_id
  'Delivery Challan',
  'ecomOrder',
  'standard',
  false,
  '
<div class="challan">
  <div class="header">
    <div>
      <h1 class="company-name">{{company_name}}</h1>
      <p class="sub">{{company_address}}, {{company_city}}, {{company_state}}</p>
      <p class="sub">GSTIN: {{company_gst}}</p>
    </div>
    <div class="title-block">
      <h2>DELIVERY CHALLAN</h2>
      <p class="ref">{{order_number}}</p>
      <p class="date">Date: {{today}}</p>
    </div>
  </div>

  <div class="party-grid">
    <div class="party-box">
      <h4>Shipped To</h4>
      <p class="name">{{customer_name}}</p>
      <p>{{shipping_address_line}}</p>
      <p>Phone: {{customer_phone}}</p>
    </div>
    <div class="party-box">
      <h4>Shipping Details</h4>
      <p>Courier: <strong>{{courier_name}}</strong></p>
      <p>Tracking: <strong>{{tracking_number}}</strong></p>
      <p>Payment: {{payment_method}} ({{payment_status}})</p>
    </div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th style="width:8%;text-align:center;">#</th>
        <th style="width:45%;">Item Description</th>
        <th style="width:15%;">Variant</th>
        <th style="width:12%;text-align:center;">Qty</th>
        <th style="width:20%;text-align:right;">Value (₹)</th>
      </tr>
    </thead>
    <tbody>
      {% for item in items %}
      <tr>
        <td style="text-align:center;">{{item.index}}</td>
        <td>{{item.product_name}}</td>
        <td>{{item.variant_name}}</td>
        <td style="text-align:center;">{{item.quantity}}</td>
        <td style="text-align:right;">₹{{item.amount}}</td>
      </tr>
      {% endfor %}
    </tbody>
    <tfoot>
      <tr><td colspan="4" style="text-align:right;font-weight:700;">Total</td><td style="text-align:right;font-weight:700;font-size:14px;">₹{{grand_total}}</td></tr>
    </tfoot>
  </table>

  <div class="sign-section">
    <div class="sign-box"><p>Received By</p><div class="sign-line"></div><p class="hint">Name & Signature</p></div>
    <div class="sign-box"><p>Dispatched By</p><div class="sign-line"></div><p class="hint">{{company_name}}</p></div>
  </div>
</div>
  ',
  '
  .challan { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1f2937; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111827; padding-bottom: 16px; margin-bottom: 20px; }
  .company-name { font-size: 22px; font-weight: 800; margin: 0; }
  .sub { font-size: 11px; color: #6b7280; margin: 2px 0; }
  .title-block { text-align: right; }
  .title-block h2 { font-size: 20px; font-weight: 800; margin: 0; letter-spacing: 2px; }
  .title-block .ref { font-size: 14px; font-weight: 700; color: #2563eb; margin: 4px 0 0; }
  .title-block .date { font-size: 11px; color: #6b7280; }

  .party-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .party-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; }
  .party-box h4 { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; margin: 0 0 8px; }
  .party-box .name { font-weight: 700; font-size: 13px; margin: 0 0 4px; }
  .party-box p { font-size: 11px; color: #374151; margin: 2px 0; }

  .items { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
  .items th { background: #f1f5f9; padding: 8px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #374151; border-bottom: 2px solid #e5e7eb; }
  .items td { padding: 8px 10px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
  .items tfoot td { border-top: 2px solid #e5e7eb; padding-top: 10px; }

  .sign-section { display: flex; justify-content: space-between; margin-top: 40px; }
  .sign-box { text-align: center; width: 200px; }
  .sign-box p { font-size: 11px; font-weight: 600; color: #374151; margin: 0; }
  .sign-line { border-bottom: 1px solid #9ca3af; height: 50px; margin: 8px 0; }
  .sign-box .hint { font-size: 10px; color: #9ca3af; font-weight: 400; }
  ',
  'A4'
);

-- ── 3. Packing Slip ───────────────────────────────────────
INSERT INTO public.print_formats (company_id, name, doctype_key, format_type, is_default, html_template, css, paper_size)
VALUES (
  16, -- ← Replace with your company_id
  'Packing Slip',
  'ecomOrder',
  'standard',
  false,
  '
<div class="slip">
  <div class="header">
    <h1>PACKING SLIP</h1>
    <p class="order-no">{{order_number}}</p>
  </div>

  <div class="customer">
    <p><strong>{{customer_name}}</strong></p>
    <p>{{shipping_address_line}}</p>
    <p>{{customer_phone}}</p>
  </div>

  <table class="items">
    <thead>
      <tr><th>#</th><th>Item</th><th>Variant</th><th>Qty</th></tr>
    </thead>
    <tbody>
      {% for item in items %}
      <tr>
        <td style="text-align:center;">{{item.index}}</td>
        <td>{{item.product_name}}</td>
        <td>{{item.variant_name}}</td>
        <td style="text-align:center;font-weight:700;">{{item.quantity}}</td>
      </tr>
      {% endfor %}
    </tbody>
  </table>

  <div class="footer">
    <p>Packed by: _____________</p>
    <p>Checked by: _____________</p>
    <p class="date">{{today}} | {{company_name}}</p>
  </div>
</div>
  ',
  '
  .slip { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #111827; max-width: 400px; margin: 0 auto; }
  .header { text-align: center; border-bottom: 2px dashed #6b7280; padding-bottom: 12px; margin-bottom: 16px; }
  .header h1 { font-size: 18px; font-weight: 800; letter-spacing: 3px; margin: 0; }
  .header .order-no { font-size: 14px; font-weight: 700; color: #2563eb; margin: 4px 0 0; }
  .customer { margin-bottom: 16px; padding: 10px; background: #f9fafb; border-radius: 6px; }
  .customer p { font-size: 12px; margin: 2px 0; color: #374151; }
  .items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  .items th { background: #111827; color: white; padding: 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
  .items td { padding: 8px; font-size: 12px; border-bottom: 1px solid #e5e7eb; }
  .footer { border-top: 2px dashed #6b7280; padding-top: 16px; }
  .footer p { font-size: 11px; color: #6b7280; margin: 6px 0; }
  .footer .date { text-align: center; font-size: 10px; color: #9ca3af; margin-top: 12px; }
  ',
  'A5'
);
