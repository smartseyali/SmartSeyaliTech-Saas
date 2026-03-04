
const http = require('http');
const { exec } = require('child_process');
const path = require('path');

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
                const cmd = `node "${scriptPath}" ${store_name} ${company_id} ${template || 'modern-shop'} https://vxwjfonhadjjbdmkdrjc.supabase.co eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4d2pmb25oYWRqamJkbWtkcmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NTg0OTIsImV4cCI6MjA4NzIzNDQ5Mn0.lKrOXOLQtHDBhRgH6kz_t8admjaA_WR1bs_pIIwq0wM`;

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
