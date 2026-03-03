/**
 * provision_server.cjs
 * Lightweight HTTP server that receives onboarding webhook
 * from Onboarding.tsx and runs provision_store.cjs automatically.
 *
 * Start this BEFORE npm run dev:
 *   node provision_server.cjs
 *
 * Runs on port 8000 → called by Onboarding.tsx at:
 *   POST http://localhost:8000/api/provision
 *
 * Request body (sent by Onboarding.tsx):
 *   { store_name, company_id, template }
 */

const http = require('http');
const { exec } = require('child_process');
const path = require('path');

const PORT = 8000;

// ── Read Supabase credentials from .env ──────────────────────
// Simple manual parser — no dotenv dependency needed
const fs = require('fs');
let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';

try {
    const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, ...rest] = line.split('=');
        const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
        if (key?.trim() === 'VITE_SUPABASE_URL') SUPABASE_URL = val;
        if (key?.trim() === 'VITE_SUPABASE_ANON_KEY') SUPABASE_ANON_KEY = val;
    });
    console.log('✅  Supabase credentials loaded from .env');
} catch {
    console.warn('⚠️   Could not read .env — using fallback credentials');
    SUPABASE_URL = 'http://localhost:54321';
    SUPABASE_ANON_KEY = 'your_anon_key';
}

// ── HTTP Server ───────────────────────────────────────────────
const server = http.createServer((req, res) => {
    // CORS headers — needed because Vite dev server is on :8080
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/api/provision') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);

                // Accept both field naming conventions:
                //   Onboarding.tsx sends:  { store_name, company_id, template }
                //   Legacy sends:          { merchant_slug, template }
                const storeName = (payload.store_name || payload.merchant_slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
                const companyId = payload.company_id || '0';
                const template = (payload.template || 'modern-shop').replace(/[^a-z0-9-]/g, '').toLowerCase();

                if (!storeName) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'error', message: 'store_name is required' }));
                    return;
                }

                console.log(`\n🚀  Provisioning: ${storeName}  (company_id=${companyId}, template=${template})`);

                // Build the full CLI command with all 5 args
                const cmd = [
                    'node provision_store.cjs',
                    `"${storeName}"`,
                    `"${companyId}"`,
                    `"${template}"`,
                    `"${SUPABASE_URL}"`,
                    `"${SUPABASE_ANON_KEY}"`
                ].join(' ');

                console.log(`    Running: node provision_store.cjs ${storeName} ${companyId} ${template} <url> <key>`);

                exec(cmd, { cwd: __dirname }, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`❌  Failed: ${error.message}`);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: 'error', message: error.message, stderr }));
                        return;
                    }

                    console.log(stdout);
                    console.log(`✅  Store ready → stores/${storeName}/`);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        status: 'success',
                        message: `Store "${storeName}" created for company #${companyId}`,
                        store_path: `stores/${storeName}/`,
                        store_url: `/stores/${storeName}/index.html`
                    }));
                });

            } catch (err) {
                console.error('❌  Invalid request body:', err.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', message: 'Invalid JSON body' }));
            }
        });

    } else if (req.method === 'GET' && req.url === '/health') {
        // Health check endpoint
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', port: PORT, supabaseUrl: SUPABASE_URL }));

    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found. Use POST /api/provision' }));
    }
});

server.listen(PORT, () => {
    console.log(`
  ┌─────────────────────────────────────────────────────┐
  │  🌐  EcomSuite Provisioning Server                   │
  │  Port    : ${PORT}                                      │
  │  Endpoint: http://localhost:${PORT}/api/provision       │
  │  Health  : http://localhost:${PORT}/health              │
  │                                                     │
  │  Accepts: POST { store_name, company_id, template } │
  │  Creates: stores/<store_name>/ with config.js       │
  └─────────────────────────────────────────────────────┘
    `);
});
