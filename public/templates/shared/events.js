/**
 * SmartSeyali Storefront — Unified Event Tracker
 *
 * Exposes window.trackEvent(name, params) which fans out to all active
 * analytics platforms in a single call. Mirrors Shopify's Enhanced
 * E-commerce event schema.
 *
 * Standard events:
 *   view_item        – product detail page viewed
 *   add_to_cart      – item added to cart
 *   remove_from_cart – item removed from cart
 *   begin_checkout   – checkout page loaded
 *   purchase         – order confirmed
 *
 * Usage (in template main.js / cart.js):
 *   window.trackEvent('add_to_cart', {
 *     currency: 'INR',
 *     value: 499,
 *     items: [{ item_id: 'SKU001', item_name: 'Product Name', price: 499, quantity: 1 }]
 *   });
 */
(function () {
  // Meta Pixel event name mapping (GA4 name → Meta standard event)
  var META_EVENT_MAP = {
    view_item:        'ViewContent',
    add_to_cart:      'AddToCart',
    remove_from_cart: null,
    begin_checkout:   'InitiateCheckout',
    purchase:         'Purchase',
  };

  window.trackEvent = function (name, params) {
    params = params || {};

    // ── Google Analytics 4 ──────────────────────────────────────────────
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params);
    }

    // ── Google Tag Manager (dataLayer push) ─────────────────────────────
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(Object.assign({ event: name }, params));
    }

    // ── Meta (Facebook) Pixel ───────────────────────────────────────────
    if (typeof window.fbq === 'function') {
      var metaEvent = META_EVENT_MAP[name];
      if (metaEvent) {
        var metaParams = {};
        if (params.value !== undefined)    metaParams.value = params.value;
        if (params.currency !== undefined) metaParams.currency = params.currency;
        if (name === 'view_item' && params.items && params.items[0]) {
          metaParams.content_ids  = [params.items[0].item_id];
          metaParams.content_name = params.items[0].item_name;
          metaParams.content_type = 'product';
        }
        if (name === 'add_to_cart' && params.items) {
          metaParams.content_ids  = params.items.map(function (i) { return i.item_id; });
          metaParams.content_type = 'product';
        }
        if (name === 'purchase' && params.transaction_id) {
          metaParams.order_id = params.transaction_id;
        }
        window.fbq('track', metaEvent, metaParams);
      }
    }
  };
})();
