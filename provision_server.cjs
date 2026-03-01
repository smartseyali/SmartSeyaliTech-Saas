
const http = require('http');
const { exec } = require('child_process');

const PORT = 8000;

const server = http.createServer((req, res) => {
    // Enable CORS
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
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const { merchant_slug, template } = JSON.parse(body);

                // Sanitize input
                const slug = merchant_slug.replace(/[^a-z0-9]/gi, '').toLowerCase();
                const tmpl = template.replace(/[^a-z0-9]/gi, '').toLowerCase();

                console.log(`🚀 Provisioning request for: ${slug} (Template: ${tmpl})`);

                // Execute the provisioning script
                exec(`node provision_store.cjs ${slug} ${tmpl}`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`❌ Provisioning failed: ${error.message}`);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ status: 'error', message: error.message }));
                        return;
                    }

                    console.log(`✅ Store ${slug} provisioned successfully.`);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        status: 'success',
                        message: `Store created for ${slug}`,
                        store_url: `/stores/${slug}/index.html`
                    }));
                });
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', message: 'Invalid JSON' }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`
  🌐 SaaS Provisioning Backend (Node.js)
  --------------------------------------
  Ready to create stores on port ${PORT}
  Endpoint: http://localhost:${PORT}/api/provision
    `);
});
