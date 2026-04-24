import JSZip from "jszip";
import { saveAs } from "file-saver";

import type { StorefrontTemplate, TemplateConfigOverrides } from "@/types/storefront";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || "";
const ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "";

type Manifest = {
    slug: string;
    category: string;
    entry: string | null;
    files: { path: string; size: number }[];
};

export type DeployContext = {
    template: StorefrontTemplate;
    companyId: number | string;
    companyName: string;
    overrides: TemplateConfigOverrides;
};

/**
 * File types that should be bundled as text (so we can patch them in-place)
 * vs binary (passed through untouched).
 */
const TEXT_EXT = new Set([
    "html", "htm", "css", "js", "mjs", "cjs", "json", "txt", "md", "xml",
    "svg", "webmanifest", "htaccess", "map",
]);

function extOf(p: string): string {
    if (p.endsWith(".htaccess")) return "htaccess";
    const m = p.toLowerCase().match(/\.([a-z0-9]+)$/);
    return m ? m[1] : "";
}

/** Root URL from which public/templates files are served. */
function publicBase(): string {
    // Vite serves public/ at /. entry_path starts with /templates/<cat>/<slug>/...
    // base = everything up to the trailing slash before filenames.
    return "";
}

function resolveAssetUrl(templateDirUrl: string, rel: string): string {
    // templateDirUrl ends without a trailing slash; rel is a relative path like "assets/js/config.js"
    return `${templateDirUrl}/${rel}`.replace(/\/{2,}/g, "/");
}

/**
 * From a template's entry_path ("/templates/ecommerce/pattikadai/index.html")
 * derive the template directory URL ("/templates/ecommerce/pattikadai").
 */
function templateDirUrlOf(entryPath: string): string {
    const p = entryPath.startsWith("/") ? entryPath : `/${entryPath}`;
    const idx = p.lastIndexOf("/");
    return idx > 0 ? p.slice(0, idx) : p;
}

async function fetchManifest(templateDirUrl: string): Promise<Manifest> {
    const url = `${publicBase()}${templateDirUrl}/manifest.json`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`manifest.json not found at ${url} — run \`npm run templates:manifests\``);
    return (await res.json()) as Manifest;
}

/**
 * Patch a config JS file so that its default values reflect the tenant's
 * selection. The template's config.js expects an object literal like:
 *
 *   const DEFAULTS = { ... };
 *
 * We replace that object's contents with the merged tenant config, keeping
 * the surrounding IIFE / window.STORE_CONFIG assignment intact. Any
 * query-param override logic stays too — harmless when served without params.
 */
function patchConfigJs(
    source: string,
    baked: Record<string, unknown>,
    configKey: "STORE_CONFIG" | "SPARKLE_CONFIG",
): string {
    const literal = JSON.stringify(baked, null, 2)
        // Slight prettification so the resulting file looks hand-written
        .replace(/^/gm, "  ")
        .trim();

    // Strategy: replace the first `const DEFAULTS = { ... };` block.
    // Tolerant regex — matches `const DEFAULTS = { ... };` allowing nested braces.
    const defaultsRegex = /const\s+DEFAULTS\s*=\s*\{[\s\S]*?\n\s*\}\s*;/;
    if (defaultsRegex.test(source)) {
        return source.replace(defaultsRegex, `const DEFAULTS = ${literal};`);
    }

    // Fallback (pre-runtime-config format): replace `window.STORE_CONFIG = { ... }`
    const assignRegex = new RegExp(
        `window\\.${configKey}\\s*=\\s*\\{[\\s\\S]*?\\};`,
    );
    if (assignRegex.test(source)) {
        return source.replace(assignRegex, `window.${configKey} = ${literal};`);
    }

    // Last-resort: append a post-load overwrite so baked values win.
    return `${source}\n;window.${configKey} = Object.assign({}, window.${configKey} || {}, ${literal});\n`;
}

function buildBakedConfig(ctx: DeployContext): {
    baked: Record<string, unknown>;
    configKey: "STORE_CONFIG" | "SPARKLE_CONFIG";
    configFile: string;
} {
    const tpl = ctx.template;
    const isSparkle = tpl.slug === "sparkleinstitute";
    const configKey = isSparkle ? "SPARKLE_CONFIG" : "STORE_CONFIG";

    // Keys written first, then overrides win
    const baked: Record<string, unknown> = {
        supabaseUrl: SUPABASE_URL,
        [isSparkle ? "supabaseKey" : "supabaseAnonKey"]: ANON_KEY,
        companyId: ctx.companyId,
        ...(isSparkle ? { subscriberId: String(ctx.companyId) } : {}),
        storeName: ctx.companyName,
        cartStorageKey: `ss_cart_${ctx.companyId}`,
        wishlistStorageKey: `ss_wishlist_${ctx.companyId}`,
        authStorageKey: `ss_auth_${ctx.companyId}`,
        ...ctx.overrides,
    };

    return {
        baked,
        configKey,
        configFile: isSparkle ? "assets/sparkle-config.js" : "assets/js/config.js",
    };
}

function hostingerReadme(ctx: DeployContext): string {
    const lines = [
        `# ${ctx.template.name} — Hostinger Deploy Guide`,
        ``,
        `Company: ${ctx.companyName} (id: ${ctx.companyId})`,
        `Generated: ${new Date().toISOString()}`,
        ``,
        `---`,
        ``,
        `## 1. Upload files`,
        ``,
        `1. Log in to **hPanel** on Hostinger.`,
        `2. Go to **Websites → Your domain → File Manager** (or open **public_html** directly).`,
        `3. Drag-drop this entire ZIP into \`public_html/\` and extract it there.`,
        `   Or unzip locally first and upload the resulting files/folders.`,
        ``,
        `## 2. Domain / subdomain`,
        ``,
        `- **Root domain** (e.g. \`yourstore.com\`): extract at the root of \`public_html\`.`,
        `- **Subdomain** (e.g. \`shop.yourstore.com\`): in hPanel → **Subdomains**, create it`,
        `  pointing to a new folder, then extract there.`,
        ``,
        `## 3. SSL`,
        ``,
        `In hPanel → **Security → SSL** enable **Force HTTPS**.`,
        `Your storefront is already configured to talk to Supabase over HTTPS.`,
        ``,
        `## 4. Verify`,
        ``,
        `- Open your domain in a browser — the homepage should load.`,
        `- Open the DevTools → Network tab and check that requests to \`${SUPABASE_URL}\``,
        `  return data scoped to company_id \`${ctx.companyId}\`.`,
        ``,
        `## 5. Future updates`,
        ``,
        `When you change settings in the Smartseyali admin, **re-download** the package`,
        `from _Apps → ${ctx.template.module_id ?? "Your module"} → Storefront → Re-deploy_`,
        `and replace the files in \`public_html\`. A configured \`.htaccess\` is included.`,
        ``,
        `## 6. Support`,
        ``,
        `- Smartseyali admin: https://smartseyali.com`,
        `- Hostinger help: https://support.hostinger.com`,
        ``,
    ];
    return lines.join("\n");
}

/**
 * Core: fetch every file listed in the manifest, patch config.js with baked
 * values, add deploy-info.md, and return a ZIP blob.
 */
export async function buildBundle(ctx: DeployContext): Promise<Blob> {
    const tpl = ctx.template;
    const dirUrl = templateDirUrlOf(tpl.entry_path);
    const manifest = await fetchManifest(dirUrl);
    const { baked, configKey, configFile } = buildBakedConfig(ctx);

    const zip = new JSZip();

    // Fetch all files in parallel (limited concurrency)
    const BATCH = 12;
    for (let i = 0; i < manifest.files.length; i += BATCH) {
        const slice = manifest.files.slice(i, i + BATCH);
        await Promise.all(
            slice.map(async (f) => {
                const assetUrl = resolveAssetUrl(dirUrl, f.path);
                const res = await fetch(assetUrl, { cache: "no-store" });
                if (!res.ok) throw new Error(`Failed to fetch ${assetUrl} (${res.status})`);

                const isTextFile = TEXT_EXT.has(extOf(f.path));
                const isConfig = f.path === configFile;

                if (isConfig) {
                    const text = await res.text();
                    const patched = patchConfigJs(text, baked, configKey);
                    zip.file(f.path, patched);
                } else if (isTextFile) {
                    const text = await res.text();
                    zip.file(f.path, text);
                } else {
                    const buf = await res.arrayBuffer();
                    zip.file(f.path, buf);
                }
            }),
        );
    }

    // Include the shared content-loader.js so the template can dynamically
    // pull per-page content from web_pages at runtime. Placed at the common
    // path templates include: /assets/js/content-loader.js
    try {
        const loaderRes = await fetch("/templates/shared/content-loader.js", { cache: "no-store" });
        if (loaderRes.ok) {
            const loaderSrc = await loaderRes.text();
            // Don't overwrite if the template already ships its own loader
            if (!zip.file("assets/js/content-loader.js")) {
                zip.file("assets/js/content-loader.js", loaderSrc);
            }
        }
    } catch {
        // Non-fatal — template still works without the loader
    }

    // deploy-info.md at the root
    zip.file("deploy-info.md", hostingerReadme(ctx));

    return zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
    });
}

/**
 * Public: build the bundle and trigger a browser download.
 */
export async function downloadDeployBundle(ctx: DeployContext): Promise<{ fileName: string; sizeBytes: number }> {
    const blob = await buildBundle(ctx);
    const safeCompany = (ctx.companyName || "store").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const fileName = `${ctx.template.slug}-${safeCompany}-${Date.now()}.zip`;
    saveAs(blob, fileName);
    return { fileName, sizeBytes: blob.size };
}
