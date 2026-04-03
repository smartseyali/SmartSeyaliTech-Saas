
const http = require('http');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            process.env[key] = value.trim();
        }
    });
}

const PORT = 8000;

const server = http.createServer((req, res) => {
    // Set CORS headers
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
                const { store_name, company_id, template } = JSON.parse(body);
                console.log(`🚀 Provisioning requested: ${store_name} (ID: ${company_id})`);

                const scriptPath = path.join(__dirname, 'provision_store.cjs');
                const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
                const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your_anon_key';
                const cmd = `node "${scriptPath}" ${store_name} ${company_id} ${template || 'modern-shop'} ${supabaseUrl} ${supabaseKey}`;

                exec(cmd, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error: ${error.message}`);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: error.message }));
                        return;
                    }
                    console.log(stdout);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'Store provisioned successfully' }));
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON body' }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`\n✅ Provisioning Server running at http://localhost:${PORT}`);
    console.log(`Ready to create physical storefronts for new merchants.\n`);
});
