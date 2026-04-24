/**
 * Smartseyali — Content Loader Shim
 * ─────────────────────────────────
 *  A single ~3KB script every template can include. It:
 *
 *  1. Reads the tenant's runtime config from window.STORE_CONFIG
 *     (populated by the template's config.js — supabaseUrl, supabaseAnonKey/Key,
 *     companyId).
 *  2. Derives the current page slug from the URL path
 *     (e.g. /about.html → "about", / or /index.html → "home").
 *  3. Fetches the matching row from `web_pages` for that tenant.
 *  4. Replaces `innerHTML` on every element with `data-content="key"`
 *     where `key` matches a field in `custom_fields`.
 *  5. Updates <title> / <meta name="description"> if the row has them.
 *
 *  Templates keep working standalone: if Supabase is unreachable or the
 *  row is missing, elements retain their hard-coded defaults.
 *
 *  USAGE (at the bottom of <body>):
 *    <script src="/assets/js/config.js"></script>
 *    <script src="/assets/js/content-loader.js"></script>
 */

(function () {
    function getConfig() {
        // Support both STORE_CONFIG (ecommerce templates) and SPARKLE_CONFIG
        // (education templates). Prefer the first one defined.
        if (typeof window === "undefined") return null;
        return window.STORE_CONFIG || window.SPARKLE_CONFIG || null;
    }

    function pageSlugFromPath() {
        const path = (window.location.pathname || "/").split("/").filter(Boolean);
        const last = path.length ? path[path.length - 1] : "";
        if (!last || last === "index.html") return "home";
        return last.replace(/\.html?$/i, "");
    }

    function setText(el, value) {
        if (value == null) return;
        if (typeof value === "string") {
            el.innerHTML = value;
        } else {
            try { el.textContent = JSON.stringify(value); } catch (_) { /* noop */ }
        }
    }

    async function fetchPage(config, slug) {
        const url =
            `${config.supabaseUrl}/rest/v1/web_pages` +
            `?select=title,content,meta_title,meta_description,custom_fields,is_published` +
            `&company_id=eq.${encodeURIComponent(config.companyId)}` +
            `&slug=eq.${encodeURIComponent(slug)}` +
            `&limit=1`;
        const apiKey = config.supabaseAnonKey || config.supabaseKey;
        if (!apiKey) return null;
        try {
            const res = await fetch(url, {
                headers: {
                    apikey: apiKey,
                    Authorization: `Bearer ${apiKey}`,
                    Accept: "application/json",
                },
                cache: "no-store",
            });
            if (!res.ok) return null;
            const rows = await res.json();
            if (!rows || !rows.length) return null;
            const row = rows[0];
            if (row.is_published === false) return null;
            return row;
        } catch (_) {
            return null;
        }
    }

    function applyPage(row) {
        if (!row) return;
        if (row.meta_title) document.title = row.meta_title;
        if (row.meta_description) {
            let el = document.querySelector('meta[name="description"]');
            if (!el) {
                el = document.createElement("meta");
                el.setAttribute("name", "description");
                document.head.appendChild(el);
            }
            el.setAttribute("content", row.meta_description);
        }
        const fields = row.custom_fields || {};
        document.querySelectorAll("[data-content]").forEach((el) => {
            const key = el.getAttribute("data-content");
            if (!key) return;
            if (Object.prototype.hasOwnProperty.call(fields, key)) {
                setText(el, fields[key]);
            } else if (key === "title" && row.title) {
                setText(el, row.title);
            } else if (key === "content" && row.content) {
                setText(el, row.content);
            }
        });
    }

    async function init() {
        const config = getConfig();
        if (!config || !config.companyId || !config.supabaseUrl) return;

        const slug = pageSlugFromPath();
        const row = await fetchPage(config, slug);
        applyPage(row);
        // Expose for debugging
        window.__SS_PAGE__ = row;
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
