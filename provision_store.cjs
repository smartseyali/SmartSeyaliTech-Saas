const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────
//  Recursive directory copy (native Node.js — zero dependencies)
// ─────────────────────────────────────────────────────────────
function copyDirSync(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        const stat = fs.statSync(srcPath);
        if (stat.isDirectory()) {
            copyDirSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// ─────────────────────────────────────────────────────────────
//  Provision a new merchant store from a template
//
//  Usage:
//    node provision_store.cjs <storeName> <companyId> [templateFolder] [supabaseUrl] [supabaseKey]
//
//  Example:
//    node provision_store.cjs sparkle-shop 5 modern-shop
//    node provision_store.cjs my-store 12 modern-shop https://db.supabase.co eyJhbGci...
// ─────────────────────────────────────────────────────────────
function provisionStore({
    storeName,
    companyId,
    templateFolder = 'modern-shop',
    supabaseUrl = 'http://localhost:54321',
    supabaseKey = 'your_anon_key'
}) {
    const rootDir = __dirname;
    const templateDir = path.join(rootDir, 'templates', templateFolder);
    const storesDir = path.join(rootDir, 'stores');
    const targetDir = path.join(storesDir, storeName);

    // ── Validate template exists ──────────────────────────────
    if (!fs.existsSync(templateDir)) {
        console.error(`❌  Template "${templateFolder}" not found at: ${templateDir}`);
        console.log(`    Available templates:`);
        if (fs.existsSync(path.join(rootDir, 'templates'))) {
            fs.readdirSync(path.join(rootDir, 'templates'))
                .forEach(f => console.log(`      - ${f}`));
        }
        process.exit(1);
    }

    // ── Warn if store already exists ──────────────────────────
    if (fs.existsSync(targetDir)) {
        console.warn(`⚠️   Store "${storeName}" already exists at /stores/${storeName}. Overwriting...`);
    }

    try {
        // 1. Copy template → stores/<storeName>
        console.log(`📋  Copying template "${templateFolder}" → stores/${storeName}...`);
        copyDirSync(templateDir, targetDir);

        // 2. Write finalized config.js (from template or fresh)
        const configTemplatePath = path.join(targetDir, 'js', 'config.js.template');
        const configFinalPath = path.join(targetDir, 'js', 'config.js');

        if (fs.existsSync(configTemplatePath)) {
            let tpl = fs.readFileSync(configTemplatePath, 'utf8');
            tpl = tpl
                .replace('{{SUPABASE_URL}}', supabaseUrl)
                .replace('{{SUPABASE_ANON_KEY}}', supabaseKey)
                .replace('{{COMPANY_ID}}', companyId);
            fs.writeFileSync(configFinalPath, tpl);
            fs.unlinkSync(configTemplatePath);           // remove template stub
        } else {
            // Write a fresh config.js directly
            fs.writeFileSync(configFinalPath, [
                `const SUPABASE_URL     = "${supabaseUrl}";`,
                `const SUPABASE_ANON_KEY= "${supabaseKey}";`,
                `const COMPANY_ID       = ${companyId};`,
                ``,
                `export { SUPABASE_URL, SUPABASE_ANON_KEY, COMPANY_ID };`
            ].join('\n'));
        }

        console.log(`✅  config.js written for company_id=${companyId}`);
        console.log(`\n🚀  Storefront ready!`);
        console.log(`    Location : stores/${storeName}/`);
        console.log(`    Template : ${templateFolder} (v${readTemplateVersion()})`);
        console.log(`    Company  : ${companyId}`);
        console.log(`\n📦  Upload the contents of stores/${storeName}/ to your Hostinger public_html folder.`);
    } catch (err) {
        console.error('❌  Provisioning failed:', err.message);
        process.exit(1);
    }
}

function readTemplateVersion() {
    return '1.0.0'; // Version is managed in ecom_templates Supabase table
}

// ─────────────────────────────────────────────────────────────
//  List available templates (scans /templates directory on disk)
// ─────────────────────────────────────────────────────────────
function listTemplates() {
    const templatesDir = path.join(__dirname, 'templates');
    if (!fs.existsSync(templatesDir)) {
        console.log('  No /templates directory found.');
        return;
    }
    const folders = fs.readdirSync(templatesDir)
        .filter(f => fs.statSync(path.join(templatesDir, f)).isDirectory());

    console.log('\nAvailable Templates (from /templates directory):');
    console.log('─'.repeat(50));
    folders.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
    console.log('─'.repeat(50));
    console.log('  Metadata (name, preview, tags) managed in ecom_templates Supabase table.\n');
}

// ─────────────────────────────────────────────────────────────
//  CLI Entry Point
// ─────────────────────────────────────────────────────────────
const [, , storeName, companyId, templateFolder, supabaseUrl, supabaseKey] = process.argv;

if (!storeName || !companyId) {
    console.log(`\nEcomSuite — Store Provisioner`);
    console.log(`Usage:\n  node provision_store.cjs <store-name> <company-id> [template] [supabase-url] [supabase-key]\n`);
    listTemplates();
    console.log(`\nExample:\n  node provision_store.cjs sparkle-shop 5 modern-shop\n`);
    process.exit(0);
}

provisionStore({
    storeName,
    companyId,
    templateFolder: templateFolder || 'modern-shop',
    supabaseUrl: supabaseUrl || 'http://localhost:54321',
    supabaseKey: supabaseKey || 'your_anon_key'
});
