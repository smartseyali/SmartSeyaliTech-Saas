/**
 * SmartSeyali Storefront — Shared Analytics Injector
 *
 * Reads window.STORE_CONFIG.analyticsConfig (populated by config.js via the
 * overrides query param from Storefront.tsx) and dynamically injects tracking
 * scripts into the document head/body.
 *
 * Supported platforms (Shopify / WooCommerce parity):
 *   - Google Tag Manager  (gtm_container_id)
 *   - Google Analytics 4  (ga4_measurement_id) — skipped when GTM is present
 *   - Meta (Facebook) Pixel (meta_pixel_id)
 *   - Microsoft Clarity    (clarity_project_id)
 *   - Custom <head> scripts (custom_head_scripts)
 *   - Custom <body> scripts (custom_body_scripts)
 */
(function () {
  var cfg = ((window.STORE_CONFIG || {}).analyticsConfig) || {};

  // ── helpers ──────────────────────────────────────────────────────────────
  function injectHead(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    Array.prototype.forEach.call(tmp.childNodes, function (node) {
      if (node.nodeName === 'SCRIPT') {
        var s = document.createElement('script');
        if (node.src) { s.src = node.src; s.async = true; }
        else { s.textContent = node.textContent; }
        Array.prototype.forEach.call(node.attributes, function (a) {
          if (a.name !== 'src') s.setAttribute(a.name, a.value);
        });
        document.head.appendChild(s);
      } else if (node.nodeType === 1) {
        document.head.appendChild(node.cloneNode(true));
      }
    });
  }

  function injectBody(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    Array.prototype.forEach.call(tmp.childNodes, function (node) {
      if (node.nodeName === 'SCRIPT') {
        var s = document.createElement('script');
        if (node.src) { s.src = node.src; s.async = true; }
        else { s.textContent = node.textContent; }
        Array.prototype.forEach.call(node.attributes, function (a) {
          if (a.name !== 'src') s.setAttribute(a.name, a.value);
        });
        document.body.appendChild(s);
      } else {
        document.body.appendChild(node.cloneNode(true));
      }
    });
  }

  // ── Google Tag Manager ───────────────────────────────────────────────────
  if (cfg.gtm_container_id) {
    var gtmId = cfg.gtm_container_id;

    // dataLayer init
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

    // GTM head script
    var gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = 'https://www.googletagmanager.com/gtm.js?id=' + gtmId;
    document.head.appendChild(gtmScript);

    // GTM noscript iframe (body)
    document.addEventListener('DOMContentLoaded', function () {
      var ns = document.createElement('noscript');
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.googletagmanager.com/ns.html?id=' + gtmId;
      iframe.height = '0';
      iframe.width = '0';
      iframe.style.display = 'none';
      iframe.style.visibility = 'hidden';
      ns.appendChild(iframe);
      if (document.body.firstChild) {
        document.body.insertBefore(ns, document.body.firstChild);
      } else {
        document.body.appendChild(ns);
      }
    });
  }

  // ── Google Analytics 4 ──────────────────────────────────────────────────
  // Only inject standalone GA4 when GTM is not present (GTM handles it otherwise)
  if (cfg.ga4_measurement_id && !cfg.gtm_container_id) {
    var gaId = cfg.ga4_measurement_id;
    var gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId;
    document.head.appendChild(gaScript);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', gaId, { send_page_view: true });
  }

  // ── Meta (Facebook) Pixel ────────────────────────────────────────────────
  if (cfg.meta_pixel_id) {
    var pixelId = cfg.meta_pixel_id;

    // Official Meta Pixel base code (minified pattern)
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');

    // noscript pixel image
    document.addEventListener('DOMContentLoaded', function () {
      var ns = document.createElement('noscript');
      var img = document.createElement('img');
      img.height = 1;
      img.width = 1;
      img.style.display = 'none';
      img.src = 'https://www.facebook.com/tr?id=' + pixelId + '&ev=PageView&noscript=1';
      ns.appendChild(img);
      document.body.insertBefore(ns, document.body.firstChild);
    });
  }

  // ── Microsoft Clarity ────────────────────────────────────────────────────
  if (cfg.clarity_project_id) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r);
      t.async = 1;
      t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', cfg.clarity_project_id);
  }

  // ── Custom <head> scripts ────────────────────────────────────────────────
  if (cfg.custom_head_scripts) {
    injectHead(cfg.custom_head_scripts);
  }

  // ── Custom <body> scripts ────────────────────────────────────────────────
  if (cfg.custom_body_scripts) {
    document.addEventListener('DOMContentLoaded', function () {
      injectBody(cfg.custom_body_scripts);
    });
  }

  // Expose config for events.js
  window.SS_ANALYTICS = cfg;
})();
