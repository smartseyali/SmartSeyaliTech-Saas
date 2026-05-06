/**
 * Hostinger Domain & Hosting Service
 *
 * All calls go through the `hostinger-proxy` Supabase Edge Function —
 * the API key never touches the browser.
 */

import { supabase } from "@/lib/supabase";

const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hostinger-proxy`;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DomainAvailability {
    domain: string;
    available: boolean;
    price?: number;
    currency?: string;
    period?: number;
}

export interface CatalogItem {
    id: string;
    name: string;
    price: number;
    currency: string;
    period?: number;
    setup_fee?: number;
}

export interface HostingerDomain {
    id?: string;
    domain: string;
    status: "active" | "pending" | "expired" | "failed" | "cancelled";
    expires_at?: string;
    dns_configured: boolean;
    purchased_at?: string;
    deployment_id?: number | null;
    company_id: number;
}

export interface DnsRecord {
    type: string;
    name: string;
    content: string;
    ttl?: number;
}

// ── Edge Function caller ──────────────────────────────────────────────────────

async function callProxy<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(EDGE_FN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ action, payload }),
    });

    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || `Proxy error ${res.status}`);
    return json.data as T;
}

// ── Domain search ─────────────────────────────────────────────────────────────

const DEFAULT_TLDS = [".com", ".in", ".net", ".org", ".co.in", ".store", ".shop"];

/**
 * Check domain availability across common TLDs.
 * Pass `tlds` to override the defaults.
 */
export async function checkDomainAvailability(
    name: string,
    tlds: string[] = DEFAULT_TLDS,
): Promise<DomainAvailability[]> {
    // Strip any existing TLD so we only send the SLD
    const sld = name.replace(/\.[a-z.]+$/i, "").toLowerCase().replace(/\s+/g, "-");
    const domains = tlds.map(t => `${sld}${t}`);

    const raw = await callProxy<unknown[]>("check-availability", { domains });

    return (raw ?? []).map((item: any) => ({
        domain:    item.domain ?? "",
        available: item.available === true,
        price:     item.price ?? item.pricing?.registration ?? null,
        currency:  item.currency ?? "USD",
        period:    item.period ?? 1,
    }));
}

// ── Domain catalog ────────────────────────────────────────────────────────────

export async function getDomainCatalog(): Promise<CatalogItem[]> {
    const raw = await callProxy<unknown[]>("get-catalog", { category: "domain" });
    return (raw ?? []).map((item: any) => ({
        id:        item.id ?? item.name ?? "",
        name:      item.name ?? "",
        price:     item.price ?? 0,
        currency:  item.currency ?? "USD",
        period:    item.period ?? 12,
        setup_fee: item.setup_fee ?? 0,
    }));
}

// ── Domain purchase ───────────────────────────────────────────────────────────

export async function purchaseDomain(
    domain: string,
    companyId: number,
    period = 1,
): Promise<{ success: boolean; order?: unknown }> {
    const order = await callProxy<unknown>("purchase-domain", {
        domain,
        period,
        company_id: companyId,
    });
    return { success: true, order };
}

// ── List owned domains ────────────────────────────────────────────────────────

export async function listHostingerPortfolio(): Promise<unknown[]> {
    return callProxy<unknown[]>("list-domains");
}

/** Domains purchased for a specific company — from local DB (fast). */
export async function listCompanyDomains(companyId: number): Promise<HostingerDomain[]> {
    const { data, error } = await supabase
        .from("hostinger_domains")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as HostingerDomain[];
}

// ── DNS management ────────────────────────────────────────────────────────────

export async function getDnsRecords(domain: string): Promise<DnsRecord[]> {
    return callProxy<DnsRecord[]>("get-dns", { domain });
}

export async function updateDnsRecords(
    domain: string,
    records: DnsRecord[],
    overwrite = false,
): Promise<DnsRecord[]> {
    return callProxy<DnsRecord[]>("update-dns", { domain, records, overwrite });
}

/**
 * Auto-configure DNS: point the domain's CNAME records to the SmartSeyali platform.
 * Reads platform_cname from platform_settings if not provided.
 */
export async function configureStoreDns(domain: string, platformCname?: string): Promise<void> {
    let cname = platformCname;
    if (!cname) {
        const { data } = await supabase
            .from("platform_settings")
            .select("hostinger_platform_cname")
            .eq("id", 1)
            .maybeSingle();
        cname = data?.hostinger_platform_cname ?? window.location.hostname;
    }
    await callProxy("configure-store-dns", { domain, platform_cname: cname });
}

// ── Hosting accounts ─────────────────────────────────────────────────────────

export interface HostingAccount {
    id: string;
    domain: string;
    status: string;
    plan?: string;
}

export async function getHostingAccounts(): Promise<HostingAccount[]> {
    const raw = await callProxy<unknown[]>("get-hosting-accounts");
    return (raw ?? []).map((item: any) => ({
        id:     String(item.id ?? ""),
        domain: item.domain ?? item.hostname ?? "",
        status: item.status ?? "unknown",
        plan:   item.plan ?? item.subscription?.name ?? undefined,
    }));
}

// ── Subdomain registration ────────────────────────────────────────────────────

export interface SubdomainResult {
    subdomain: string;
    url: string;
}

const PLATFORM_BASE_DOMAIN =
    (typeof import.meta !== "undefined" && (import.meta.env.VITE_PLATFORM_BASE_DOMAIN as string)) ||
    "smartseyali.com";

/**
 * Register a subdomain on the platform's Cloud Startup plan via Hostinger API.
 * Updates companies.subdomain in the DB as a side effect.
 */
export async function registerSubdomain(
    brandName: string,
    companyId: number,
): Promise<SubdomainResult> {
    await callProxy("register-subdomain", { subdomain: brandName, company_id: companyId });
    return { subdomain: brandName, url: `https://${brandName}.${PLATFORM_BASE_DOMAIN}` };
}

// ── External domain ───────────────────────────────────────────────────────────

/**
 * Register an externally-owned domain on the hosting plan and record it
 * in `hostinger_domains` with status "pending" (DNS not yet verified).
 */
export async function addExternalDomain(
    domain: string,
    companyId: number,
): Promise<void> {
    await callProxy("add-external-domain", { domain, company_id: companyId });
}

// ── Template deployment ───────────────────────────────────────────────────────

export interface DeployTemplateParams {
    domain: string;
    templateSlug: string;
    configOverrides?: Record<string, unknown>;
    companyId: number;
    platformBaseUrl?: string;
}

export interface DeployTemplateResult {
    deployed_url: string;
    document_root: string;
}

/**
 * Fetch template files from the platform's public URL, patch config.js with
 * tenant values, zip them, and upload to Hostinger File Manager under the
 * given domain's document root.
 */
export async function deployTemplateFiles(
    params: DeployTemplateParams,
): Promise<DeployTemplateResult> {
    const platformBaseUrl =
        params.platformBaseUrl ??
        (typeof window !== "undefined" ? window.location.origin : "");

    return callProxy<DeployTemplateResult>("deploy-template", {
        domain:           params.domain,
        template_slug:    params.templateSlug,
        config_overrides: params.configOverrides ?? {},
        company_id:       params.companyId,
        platform_base_url: platformBaseUrl,
    });
}

// ── Full domain onboarding flow ───────────────────────────────────────────────

/**
 * One-shot: purchase domain → configure DNS → record deployment link.
 * Returns when domain is registered and DNS is pointed to SmartSeyali.
 */
export async function onboardDomain(
    domain: string,
    companyId: number,
    deploymentId?: number,
): Promise<HostingerDomain> {
    // 1. Purchase
    await purchaseDomain(domain, companyId);

    // 2. Auto-configure DNS
    await configureStoreDns(domain);

    // 3. Update local record with deployment link
    const { data, error } = await supabase
        .from("hostinger_domains")
        .upsert({
            company_id:    companyId,
            domain,
            status:        "active",
            dns_configured: true,
            deployment_id: deploymentId ?? null,
            purchased_at:  new Date().toISOString(),
            updated_at:    new Date().toISOString(),
        }, { onConflict: "company_id,domain" })
        .select()
        .single();
    if (error) throw error;
    return data as HostingerDomain;
}
