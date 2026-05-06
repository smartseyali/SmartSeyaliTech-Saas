/**
 * Supabase Edge Function: hostinger-proxy
 *
 * Acts as a secure server-side proxy for the Hostinger API.
 * The API key NEVER reaches the browser — it stays in Deno.env.
 *
 * Deploy:
 *   supabase functions deploy hostinger-proxy --no-verify-jwt
 *
 * Required secrets:
 *   supabase secrets set HOSTINGER_API_KEY=<your-key>
 *   supabase secrets set SUPABASE_ANON_KEY=<your-anon-key>
 *
 * Supported actions (POST body: { action, payload }):
 *   check-availability    – POST /api/domains/v1/availability
 *   get-catalog           – GET  /api/billing/v1/catalog
 *   purchase-domain       – POST /api/domains/v1/portfolio
 *   list-domains          – GET  /api/domains/v1/portfolio
 *   get-dns               – GET  /api/dns/v1/zones/{domain}
 *   update-dns            – PUT  /api/dns/v1/zones/{domain}
 *   configure-store-dns   – PUT  CNAME records for a domain
 *   get-domain-info       – GET  /api/domains/v1/portfolio/{domain}
 *   get-hosting-accounts  – GET  /api/hosting/v1/virtual-hosts
 *   register-subdomain    – Create subdomain under Cloud Startup plan + DNS record
 *   deploy-template       – Fetch template files, inject config, upload ZIP to Hostinger
 *   add-external-domain   – Register an external domain on the hosting plan
 */

import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import { zipSync } from "npm:fflate@0.8.2";

const HOSTINGER_BASE    = "https://developers.hostinger.com";
const API_KEY           = Deno.env.get("HOSTINGER_API_KEY") ?? "";
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

// Known file manifests per template slug (HTML + JS + CSS files to deploy)
const TEMPLATE_FILES: Record<string, string[]> = {
    pattikadai: [
        "index.html", "shop.html", "product.html", "cart.html",
        "checkout.html", "login.html", "register.html", "my-orders.html",
        "my-addresses.html", "wishlist.html", "user-profile.html",
        "about.html", "contact.html", "faq.html", "privacy.html", "terms.html",
        "assets/js/config.js", "assets/js/main.js", "assets/js/cart.js",
        "components/header.html", "components/footer.html",
    ],
};

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

async function hostingerFetch(path: string, method = "GET", body?: unknown) {
    if (!API_KEY) throw new Error("HOSTINGER_API_KEY secret not configured");
    const res = await fetch(`${HOSTINGER_BASE}${path}`, {
        method,
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    if (!res.ok) throw new Error(`Hostinger API error ${res.status}: ${JSON.stringify(data)}`);
    return data;
}

/** Fetch and cache the platform's main virtual host ID from platform_settings. */
async function getVirtualHostId(db: ReturnType<typeof createClient>): Promise<string> {
    const { data: settings } = await db
        .from("platform_settings")
        .select("hostinger_virtual_host_id")
        .eq("id", 1)
        .maybeSingle();

    if (settings?.hostinger_virtual_host_id) {
        return settings.hostinger_virtual_host_id as string;
    }

    // Fetch from Hostinger and cache
    const vhList = await hostingerFetch("/api/hosting/v1/virtual-hosts") as any[];
    if (!vhList?.length) throw new Error("No hosting accounts found on Hostinger");
    const id = String(vhList[0].id);

    await db.from("platform_settings")
        .update({ hostinger_virtual_host_id: id })
        .eq("id", 1);

    return id;
}

/** Build a patched config.js string with the tenant's runtime values baked in. */
function buildConfigJs(overrides: Record<string, unknown>, companyId: number): string {
    return `/**
 * SmartSeyali Store — Runtime Config (auto-generated)
 * Do not edit manually — regenerated on each deployment.
 */
(function () {
  const DEFAULTS = {
    supabaseUrl:      ${JSON.stringify(SUPABASE_URL)},
    supabaseAnonKey:  ${JSON.stringify(SUPABASE_ANON_KEY)},
    companyId:        ${companyId},
    razorpayKey:      ${JSON.stringify(overrides.razorpayKey ?? "")},

    storeName:        ${JSON.stringify(overrides.storeName ?? "My Store")},
    storeTagline:     ${JSON.stringify(overrides.storeTagline ?? "")},
    logoUrl:          ${JSON.stringify(overrides.logoUrl ?? "")},
    currency:         "₹",

    contactPhone:     ${JSON.stringify(overrides.contactPhone ?? "")},
    contactEmail:     ${JSON.stringify(overrides.contactEmail ?? "")},
    contactAddress:   ${JSON.stringify(overrides.contactAddress ?? "")},
    whatsappNumber:   ${JSON.stringify(overrides.whatsappNumber ?? "")},

    facebookUrl:      ${JSON.stringify(overrides.facebookUrl ?? "#")},
    youtubeUrl:       ${JSON.stringify(overrides.youtubeUrl ?? "#")},
    instagramUrl:     ${JSON.stringify(overrides.instagramUrl ?? "#")},

    delivery: {
      freeDeliveryAbove:      999,
      defaultItemWeight:      250,
      unserviceablePincodes:  [],
    },

    productsPerPage:      12,
    cartStorageKey:       \`ss_cart_${companyId}\`,
    wishlistStorageKey:   \`ss_wishlist_${companyId}\`,
    authStorageKey:       \`ss_auth_${companyId}\`,
  };

  window.STORE_CONFIG = DEFAULTS;
  if (typeof globalThis !== "undefined") globalThis.STORE_CONFIG = DEFAULTS;
})();
`;
}

/**
 * Fetch template files from the platform's public URL and build a ZIP.
 * Returns { [relativePath]: Uint8Array }
 */
async function buildTemplateZip(
    templateSlug: string,
    platformBaseUrl: string,
    configJs: string,
): Promise<Uint8Array> {
    const files = TEMPLATE_FILES[templateSlug];
    if (!files?.length) throw new Error(`Unknown template slug: ${templateSlug}`);

    const templateRoot = `${platformBaseUrl.replace(/\/$/, "")}/templates/ecommerce/${templateSlug}`;
    const zipInput: Record<string, Uint8Array> = {};

    await Promise.all(files.map(async (file) => {
        try {
            if (file === "assets/js/config.js") {
                // Inject tenant config
                zipInput[file] = new TextEncoder().encode(configJs);
            } else {
                const res = await fetch(`${templateRoot}/${file}`);
                if (!res.ok) {
                    console.warn(`Skipping ${file}: HTTP ${res.status}`);
                    return;
                }
                const buf = await res.arrayBuffer();
                zipInput[file] = new Uint8Array(buf);
            }
        } catch (err) {
            console.warn(`Skipping ${file}: ${err}`);
        }
    }));

    if (Object.keys(zipInput).length === 0) {
        throw new Error("No template files could be fetched");
    }

    return zipSync(zipInput, { level: 6 });
}

/** Upload a ZIP to Hostinger File Manager and extract it at the given path. */
async function uploadZipToHostinger(
    virtualHostId: string,
    zipData: Uint8Array,
    extractPath: string,
): Promise<void> {
    if (!API_KEY) throw new Error("HOSTINGER_API_KEY secret not configured");

    const form = new FormData();
    form.append("file", new Blob([zipData], { type: "application/zip" }), "template.zip");
    form.append("extract_path", extractPath);
    form.append("overwrite", "true");

    const res = await fetch(
        `${HOSTINGER_BASE}/api/hosting/v1/virtual-hosts/${virtualHostId}/files/extract`,
        {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}` },
            body: form,
        },
    );

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Hostinger file upload failed (${res.status}): ${errText}`);
    }
}

// ─────────────────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    let body: { action: string; payload?: Record<string, unknown> };
    try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

    const { action, payload = {} } = body;
    if (!action) return json({ error: "Missing action" }, 400);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    try {
        switch (action) {

            // ── Domain availability ───────────────────────────────────
            case "check-availability": {
                const { domains } = payload as { domains: string[] };
                if (!domains?.length) return json({ error: "Missing domains array" }, 400);
                const data = await hostingerFetch("/api/domains/v1/availability", "POST", { domains });
                return json({ data });
            }

            // ── Billing catalog ──────────────────────────────────────
            case "get-catalog": {
                const { category = "domain" } = payload as { category?: string };
                const data = await hostingerFetch(`/api/billing/v1/catalog?category=${encodeURIComponent(category)}`);
                return json({ data });
            }

            // ── Purchase / register a domain ─────────────────────────
            case "purchase-domain": {
                const { domain, period = 1, company_id, registrant } = payload as {
                    domain: string; period?: number;
                    company_id?: number; registrant?: Record<string, unknown>;
                };
                if (!domain) return json({ error: "Missing domain" }, 400);

                let reg = registrant;
                if (!reg && company_id && SUPABASE_URL && SUPABASE_SERVICE_KEY) {
                    const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
                    const { data: co } = await db.from("companies")
                        .select("name,contact_email,contact_phone,address,city,state,country,pincode")
                        .eq("id", company_id).maybeSingle();
                    if (co) {
                        reg = {
                            first_name: co.name?.split(" ")[0] ?? "Admin",
                            last_name:  co.name?.split(" ").slice(1).join(" ") || "User",
                            email: co.contact_email ?? "",
                            phone: co.contact_phone?.replace(/\D/g, "") ?? "",
                            address1: co.address ?? "", city: co.city ?? "",
                            state: co.state ?? "", country: co.country ?? "IN",
                            zip: co.pincode ?? "",
                        };
                    }
                }

                const purchaseBody: Record<string, unknown> = { domain, period };
                if (reg) purchaseBody.registrant = reg;
                const data = await hostingerFetch("/api/domains/v1/portfolio", "POST", purchaseBody);

                if (company_id && SUPABASE_URL && SUPABASE_SERVICE_KEY) {
                    const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
                    await db.from("hostinger_domains").upsert({
                        company_id, domain, status: "active",
                        purchased_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }, { onConflict: "company_id,domain" });
                }
                return json({ data });
            }

            // ── List domains ─────────────────────────────────────────
            case "list-domains": {
                const data = await hostingerFetch("/api/domains/v1/portfolio");
                return json({ data });
            }

            // ── Get single domain info ────────────────────────────────
            case "get-domain-info": {
                const { domain } = payload as { domain: string };
                if (!domain) return json({ error: "Missing domain" }, 400);
                const data = await hostingerFetch(`/api/domains/v1/portfolio/${encodeURIComponent(domain)}`);
                return json({ data });
            }

            // ── Get DNS zone ──────────────────────────────────────────
            case "get-dns": {
                const { domain } = payload as { domain: string };
                if (!domain) return json({ error: "Missing domain" }, 400);
                const data = await hostingerFetch(`/api/dns/v1/zones/${encodeURIComponent(domain)}`);
                return json({ data });
            }

            // ── Update DNS records ────────────────────────────────────
            case "update-dns": {
                const { domain, records, overwrite = false } = payload as {
                    domain: string; records: unknown[]; overwrite?: boolean;
                };
                if (!domain || !records) return json({ error: "Missing domain or records" }, 400);
                const path = `/api/dns/v1/zones/${encodeURIComponent(domain)}${overwrite ? "?overwrite=true" : ""}`;
                const data = await hostingerFetch(path, "PUT", records);
                if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
                    const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
                    await db.from("hostinger_domains")
                        .update({ dns_configured: true, updated_at: new Date().toISOString() })
                        .eq("domain", domain);
                }
                return json({ data });
            }

            // ── Auto-configure store DNS ──────────────────────────────
            case "configure-store-dns": {
                const { domain, platform_cname } = payload as { domain: string; platform_cname: string };
                if (!domain || !platform_cname) return json({ error: "Missing domain or platform_cname" }, 400);
                const records = [
                    { type: "CNAME", name: "@",   content: platform_cname, ttl: 3600 },
                    { type: "CNAME", name: "www", content: platform_cname, ttl: 3600 },
                ];
                const data = await hostingerFetch(
                    `/api/dns/v1/zones/${encodeURIComponent(domain)}`, "PUT", records,
                );
                if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
                    const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
                    await db.from("hostinger_domains")
                        .update({ dns_configured: true, updated_at: new Date().toISOString() })
                        .eq("domain", domain);
                }
                return json({ data });
            }

            // ── List hosting virtual hosts ────────────────────────────
            case "get-hosting-accounts": {
                const data = await hostingerFetch("/api/hosting/v1/virtual-hosts");
                return json({ data });
            }

            // ── Create subdomain on Cloud Startup plan ────────────────
            case "register-subdomain": {
                const { subdomain, company_id } = payload as {
                    subdomain: string; company_id: number;
                };
                if (!subdomain || !company_id) {
                    return json({ error: "Missing subdomain or company_id" }, 400);
                }

                const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

                // 1. Get or auto-detect virtual host
                const virtualHostId = await getVirtualHostId(db);

                // 2. Create the subdomain entry under the hosting plan
                let subdomainData: unknown;
                try {
                    subdomainData = await hostingerFetch(
                        `/api/hosting/v1/virtual-hosts/${virtualHostId}/subdomains`,
                        "POST",
                        {
                            subdomain,
                            document_root: `/public_html/${subdomain}`,
                        },
                    );
                } catch (subErr: any) {
                    // Some plans use a different format — try with full subdomain object
                    subdomainData = await hostingerFetch(
                        `/api/hosting/v1/virtual-hosts/${virtualHostId}/subdomains`,
                        "POST",
                        { name: subdomain, path: `/public_html/${subdomain}` },
                    );
                }

                // 3. Add DNS record: subdomain.smartseyali.com → @
                const { data: settings } = await db
                    .from("platform_settings")
                    .select("hostinger_platform_cname")
                    .eq("id", 1)
                    .maybeSingle();

                const platformCname = (settings?.hostinger_platform_cname as string) ?? "";
                // Extract root domain from CNAME (e.g. "app.smartseyali.com" → "smartseyali.com")
                const rootDomain = platformCname.includes(".")
                    ? platformCname.split(".").slice(-2).join(".")
                    : "smartseyali.com";

                try {
                    await hostingerFetch(
                        `/api/dns/v1/zones/${encodeURIComponent(rootDomain)}`,
                        "PUT",
                        [{ type: "CNAME", name: subdomain, content: rootDomain, ttl: 3600 }],
                    );
                } catch (dnsErr) {
                    // DNS record creation is best-effort; subdomain may already resolve via wildcard
                    console.warn("[register-subdomain] DNS record creation non-fatal:", dnsErr);
                }

                // 4. Update companies.subdomain in DB
                await db.from("companies")
                    .update({ subdomain, updated_at: new Date().toISOString() })
                    .eq("id", company_id);

                return json({ data: subdomainData });
            }

            // ── Deploy template files to Hostinger hosting ────────────
            case "deploy-template": {
                const {
                    domain, template_slug, config_overrides,
                    company_id, platform_base_url,
                } = payload as {
                    domain: string;
                    template_slug: string;
                    config_overrides: Record<string, unknown>;
                    company_id: number;
                    platform_base_url: string;
                };

                if (!domain || !template_slug || !platform_base_url) {
                    return json({ error: "Missing domain, template_slug, or platform_base_url" }, 400);
                }

                const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

                // 1. Get virtual host ID
                const virtualHostId = await getVirtualHostId(db);

                // 2. Determine the document root for this domain/subdomain
                //    For subdomains: /public_html/{subdomain}
                //    For custom domains: /public_html/{domain_sanitized}
                const rootDomain = (await db.from("platform_settings")
                    .select("hostinger_platform_cname")
                    .eq("id", 1)
                    .maybeSingle()
                ).data?.hostinger_platform_cname?.split(".").slice(-2).join(".") ?? "smartseyali.com";

                const isSubdomain = domain.endsWith(`.${rootDomain}`);
                const subdomain = isSubdomain ? domain.replace(`.${rootDomain}`, "") : null;
                const docRoot = subdomain
                    ? `/public_html/${subdomain}`
                    : `/public_html/${domain.replace(/\./g, "_")}`;

                // 3. Build patched config.js
                const configJs = buildConfigJs(config_overrides, Number(company_id));

                // 4. Fetch template files and build ZIP
                const zipData = await buildTemplateZip(template_slug, platform_base_url, configJs);

                // 5. Upload ZIP to Hostinger File Manager
                await uploadZipToHostinger(virtualHostId, zipData, docRoot);

                // 6. Mark template_deployment as deployed
                const deployedUrl = `https://${domain}`;
                await db.from("template_deployments")
                    .update({
                        status: "deployed",
                        deployed_url: deployedUrl,
                        deployed_at: new Date().toISOString(),
                        notes: `Auto-deployed to ${docRoot} via Hostinger API`,
                    })
                    .eq("company_id", Number(company_id))
                    .eq("module_id", "ecommerce")
                    .neq("status", "cancelled");

                // 7. Update ecom_settings.storefront_url
                await db.from("ecom_settings")
                    .update({ storefront_url: deployedUrl })
                    .eq("company_id", Number(company_id));

                return json({ data: { deployed_url: deployedUrl, document_root: docRoot } });
            }

            // ── Add external domain to hosting plan ───────────────────
            case "add-external-domain": {
                const { domain, company_id } = payload as { domain: string; company_id: number };
                if (!domain || !company_id) return json({ error: "Missing domain or company_id" }, 400);

                const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
                const virtualHostId = await getVirtualHostId(db);

                // Register the domain as an addon/parked domain on the hosting plan
                let hostingData: unknown;
                try {
                    hostingData = await hostingerFetch(
                        `/api/hosting/v1/virtual-hosts/${virtualHostId}/subdomains`,
                        "POST",
                        {
                            subdomain: domain,
                            document_root: `/public_html/${domain.replace(/\./g, "_")}`,
                        },
                    );
                } catch (err: any) {
                    // Log and continue — DNS setup can still proceed
                    console.warn("[add-external-domain] Hosting registration non-fatal:", err?.message);
                    hostingData = { warning: err?.message, domain };
                }

                // Record in hostinger_domains
                await db.from("hostinger_domains").upsert({
                    company_id: Number(company_id),
                    domain,
                    status: "pending",
                    dns_configured: false,
                    updated_at: new Date().toISOString(),
                }, { onConflict: "company_id,domain" });

                return json({ data: hostingData });
            }

            default:
                return json({ error: `Unknown action: ${action}` }, 400);
        }
    } catch (err: any) {
        console.error("[hostinger-proxy]", err?.message, err?.stack);
        return json({ error: err?.message || String(err) }, 500);
    }
});
