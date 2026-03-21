const express = require('express');
const cors = require('cors');
const knex = require('knex');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Set LOCAL_DATABASE_URL="postgres://username:password@localhost:5432/ecommerce_db" in backend/.env
const db = knex({
  client: 'pg',
  connection: process.env.LOCAL_DATABASE_URL || 'postgres://postgres:password@127.0.0.1:5432/postgres',
});

// Primary Database Router (Intercepts simulated Supabase queries from db.ts)
app.post('/api/database', async (req, res) => {
    const { table, action, columns, filters, orders, payload } = req.body;
    let query;

    try {
        console.log(`[DB] Action: ${action.toUpperCase()} Table: ${table}`);
        
        // 1. Initialize Action Type
        if (action === 'select') {
            query = db(table).select(columns === '*' ? '*' : columns.split(','));
        } else if (action === 'insert') {
            query = db(table).insert(payload).returning('*');
        } else if (action === 'update') {
            query = db(table).update(payload).returning('*');
        } else if (action === 'delete') {
            query = db(table).del().returning('*');
        } else if (action === 'upsert') {
            query = db(table).insert(payload).onConflict('id').merge().returning('*');
        }

        // 2. Append Filters (.eq, .in, .ilike, .neq, .or)
        if (filters && Array.isArray(filters)) {
            filters.forEach(f => {
                if (f.type === 'eq') query = query.where(f.column, f.value);
                else if (f.type === 'neq') query = query.whereNot(f.column, f.value);
                else if (f.type === 'in') query = query.whereIn(f.column, f.values);
                else if (f.type === 'ilike') query = query.whereILike(f.column, f.value);
                else if (f.type === 'or') {
                    // Minimal parser for format strictly matching: "is_best_seller.eq.true,is_featured.eq.true"
                    query = query.where(function() {
                        f.query.split(',').forEach(cond => {
                            const [col, op, val] = cond.split('.');
                            const typedVal = val === 'true' ? true : val === 'false' ? false : val;
                            if (op === 'eq') {
                                this.orWhere(col, typedVal);
                            }
                        });
                    });
                }
            });
        }

        // 3. Append Sorting & Limits
        if (orders && Array.isArray(orders)) {
            orders.forEach(o => {
                if (o.limit) {
                    query = query.limit(o.limit);
                } else if (o.column) {
                    query = query.orderBy(o.column, o.ascending ? 'asc' : 'desc');
                }
            });
        }

        // 4. Execute Knex Promise against raw Postgres
        let result = await query;
        
        // 5. Post-process Single/MaybeSingle constraints
        if (action === 'select' && filters?.some(f => f.type === 'single')) {
            if (result.length === 0) throw new Error("Row not found (single constraint)");
            result = result[0];
        } else if (action === 'select' && filters?.some(f => f.type === 'maybeSingle')) {
            result = result.length > 0 ? result[0] : null;
        }

        // Simulated Supabase standard JSON response structure
        res.json({ data: result, error: null });

    } catch (error) {
        console.error("-> Query Error:", error.message);
        res.json({ data: null, error: { message: error.message } });
    }
});

// Authentication Mocks
app.get('/api/auth/session', (req, res) => {
    // Usually connects with JWT logic, mocking allowed sessions for local bypass
    res.json({ data: { session: { user: { id: "local-bypass-admin", email: "admin@local" } } }, error: null });
});

app.post('/api/auth/login', (req, res) => {
    res.json({ data: { session: { user: { id: "local-bypass-admin" } } }, error: null });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n✅ Local Database API Bridge Server Running`);
    console.log(`🌐 Endpoint: http://localhost:${PORT}/api/database`);
    console.log(`🔌 Connected to Postgres instance via Knex\n`);
});
