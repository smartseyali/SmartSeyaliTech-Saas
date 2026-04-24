#!/usr/bin/env node
/**
 * Walks every folder under public/templates/<category>/<slug>/ and writes a
 * manifest.json at its root listing all its files with relative paths.
 *
 * The manifest powers the client-side deploy bundler:
 *   fetch(manifest) → fetch(each file) → patch config.js → zip → download
 *
 * Files skipped:
 *   - manifest.json itself (avoid circular)
 *   - .git/* and any file whose any path segment starts with '.' (except .htaccess)
 *   - *Zone.Identifier* (Windows/WSL clutter)
 *
 * Usage:
 *   node scripts/generate-template-manifests.js
 *   node scripts/generate-template-manifests.js --template ecommerce/pattikadai
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "public", "templates");

function isHidden(name) {
    return name.startsWith(".") && name !== ".htaccess";
}

function walk(dir, base) {
    const out = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        const rel = path.relative(base, full).replace(/\\/g, "/");
        if (entry.isDirectory()) {
            if (entry.name === ".git" || isHidden(entry.name)) continue;
            out.push(...walk(full, base));
        } else {
            if (entry.name === "manifest.json") continue;
            if (entry.name.includes("Zone.Identifier")) continue;
            if (isHidden(entry.name)) continue;
            const stat = fs.statSync(full);
            out.push({ path: rel, size: stat.size });
        }
    }
    return out;
}

function writeManifest(templateDir) {
    const category = path.basename(path.dirname(templateDir));
    const slug = path.basename(templateDir);
    const entry = fs.existsSync(path.join(templateDir, "index.html"))
        ? "index.html"
        : null;
    const files = walk(templateDir, templateDir);
    const manifest = {
        slug,
        category,
        entry,
        generated_at: new Date().toISOString(),
        file_count: files.length,
        files: files.sort((a, b) => a.path.localeCompare(b.path)),
    };
    const out = path.join(templateDir, "manifest.json");
    fs.writeFileSync(out, JSON.stringify(manifest, null, 2) + "\n");
    console.log(`  ✓ ${category}/${slug} — ${files.length} files → ${path.relative(process.cwd(), out)}`);
}

function main() {
    const argIdx = process.argv.indexOf("--template");
    const onlyOne = argIdx > -1 ? process.argv[argIdx + 1] : null;

    if (!fs.existsSync(ROOT)) {
        console.error(`templates root not found: ${ROOT}`);
        process.exit(1);
    }

    console.log("Generating template manifests…");
    const categories = fs.readdirSync(ROOT, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);

    let total = 0;
    for (const category of categories) {
        const categoryDir = path.join(ROOT, category);
        const slugs = fs.readdirSync(categoryDir, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name);
        for (const slug of slugs) {
            const combined = `${category}/${slug}`;
            if (onlyOne && onlyOne !== combined && onlyOne !== slug) continue;
            writeManifest(path.join(categoryDir, slug));
            total += 1;
        }
    }
    console.log(`\nDone — ${total} manifest${total === 1 ? "" : "s"} written.`);
}

main();
