
const fs = require('fs');
const path = require('path');

// Colors for terminal
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    fgGreen: "\x1b[32m",
    fgCyan: "\x1b[36m",
    fgYellow: "\x1b[33m",
    fgRed: "\x1b[31m"
};

/**
 * Provision a new store instance for a merchant
 */
function provisionStore(merchantSlug, templateName = 'organic') {
    const templatesDir = path.join(__dirname, 'templates', templateName);
    const storeDir = path.join(__dirname, 'stores', merchantSlug);

    console.log(`${colors.fgCyan}🚀 Provisioning Store: ${colors.bright}${merchantSlug}${colors.reset}`);
    console.log(`${colors.fgCyan}📦 Template: ${colors.bright}${templateName}${colors.reset}`);

    // 1. Check if template exists
    if (!fs.existsSync(templatesDir)) {
        console.error(`${colors.fgRed}❌ Template '${templateName}' not found in /templates folder.${colors.reset}`);
        return;
    }

    // 2. Check if store already exists
    if (fs.existsSync(storeDir)) {
        console.warn(`${colors.fgYellow}⚠️ Store '${merchantSlug}' already exists. Overwriting...${colors.reset}`);
    } else {
        fs.mkdirSync(storeDir, { recursive: true });
    }

    // 3. Copy files recursively
    function copyFolderSync(from, to) {
        if (!fs.existsSync(to)) fs.mkdirSync(to);
        fs.readdirSync(from).forEach(element => {
            const stat = fs.lstatSync(path.join(from, element));
            if (stat.isFile()) {
                fs.copyFileSync(path.join(from, element), path.join(to, element));
            } else if (stat.isDirectory()) {
                copyFolderSync(path.join(from, element), path.join(to, element));
            }
        });
    }

    copyFolderSync(templatesDir, storeDir);

    // 4. Injected "Zero-Config" - Update main.js to hardcode this tenant
    let mainJsPath = path.join(storeDir, 'js', 'main.js');
    if (!fs.existsSync(mainJsPath)) {
        mainJsPath = path.join(storeDir, 'assets', 'js', 'main.js');
    }

    if (fs.existsSync(mainJsPath)) {
        let content = fs.readFileSync(mainJsPath, 'utf8');
        // Replace dynamic slug detection or previous hardcoded slug
        content = content.replace(
            /const slug = "[^"]*";/g,
            `const slug = "${merchantSlug}";`
        );
        fs.writeFileSync(mainJsPath, content);
    }

    console.log(`${colors.fgGreen}✅ Success! Store deployed to: ${colors.bright}/stores/${merchantSlug}${colors.reset}`);
    console.log(`${colors.fgYellow}🔗 Now you can open /stores/${merchantSlug}/index.html to view the dedicated store.${colors.reset}`);
}

// CLI Support
const args = process.argv.slice(2);
if (args.length < 1) {
    console.log(`${colors.bright}Usage:${colors.reset} node provision_store.js <merchant_slug> [template_name]`);
} else {
    provisionStore(args[0], args[1] || 'organic');
}
