#!/usr/bin/env node
/**
 * Multi-tenant build script.
 *
 * Usage:
 *   node scripts/build-tenant.mjs                    # build all tenants from TENANTS env
 *   node scripts/build-tenant.mjs pattikadai         # build a single tenant
 *   TENANTS=pattikadai,brandtwo node scripts/build-tenant.mjs
 *
 * Each tenant gets its own Next.js static export in out/<slug>/.
 * Deploy each folder to public_html/tenants/<slug>/ on Hostinger.
 */

import { execSync } from "node:child_process";
import { mkdirSync, renameSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(import.meta.url), "../../");

// Tenant list: CLI arg, or TENANTS env (comma-sep), or fallback
const cliSlug = process.argv[2];
const tenants = cliSlug
  ? [cliSlug]
  : (process.env.TENANTS ?? "pattikadai").split(",").map((s) => s.trim()).filter(Boolean);

console.log(`\n🏗  Building ${tenants.length} tenant(s): ${tenants.join(", ")}\n`);

const results = [];

for (const slug of tenants) {
  const outDir = join(ROOT, "out", slug);
  console.log(`\n─── ${slug} ─────────────────────────────────`);

  try {
    // Run Next.js build with TENANT_SLUG set
    execSync("npm run build", {
      cwd: ROOT,
      stdio: "inherit",
      env: {
        ...process.env,
        TENANT_SLUG: slug,
        // next build writes to <root>/out by default; we move it after
      },
    });

    // Move default `out/` → `out/<slug>/`
    const defaultOut = join(ROOT, "out");
    if (existsSync(defaultOut)) {
      mkdirSync(join(ROOT, "out"), { recursive: true });
      if (existsSync(outDir)) {
        execSync(`rm -rf "${outDir}"`);
      }
      renameSync(defaultOut, outDir);
    }

    console.log(`✅ ${slug} → out/${slug}/`);
    results.push({ slug, ok: true });
  } catch (err) {
    console.error(`❌ ${slug} failed:`, err.message);
    results.push({ slug, ok: false, error: err.message });
  }
}

// Summary
console.log("\n══════════════════════════════════════════");
console.log("Build Summary");
console.log("══════════════════════════════════════════");
results.forEach(({ slug, ok, error }) => {
  console.log(`  ${ok ? "✅" : "❌"} ${slug}${error ? ` — ${error}` : ""}`);
});

const failed = results.filter((r) => !r.ok).length;
if (failed) {
  console.error(`\n${failed} build(s) failed.`);
  process.exit(1);
}
console.log("\nAll builds completed successfully.\n");
