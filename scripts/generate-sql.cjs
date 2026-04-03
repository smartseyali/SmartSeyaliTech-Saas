#!/usr/bin/env node
/**
 * SQL Migration Generator
 *
 * Reads all DocType definitions from src/registry/doctypes/
 * Compares against database/schema.sql
 * Generates ready-to-paste SQL for new tables, missing columns, indexes, and RLS policies
 *
 * Usage:
 *   node scripts/generate-sql.js              — show all changes
 *   node scripts/generate-sql.js --new-only   — only new tables (skip existing)
 *   node scripts/generate-sql.js --table web_groups  — specific table only
 *   node scripts/generate-sql.js --write      — write to database/generated_migration.sql
 */

const fs = require("fs");
const path = require("path");

const DOCTYPES_DIR = path.join(__dirname, "../src/registry/doctypes");
const SCHEMA_FILE = path.join(__dirname, "../database/schema.sql");
const OUTPUT_FILE = path.join(__dirname, "../database/generated_migration.sql");

// ── Field type → SQL type mapping ────────────────────────────────────────────
const TYPE_MAP = {
  text: "VARCHAR(255)",
  number: "DECIMAL(12,2)",
  date: "DATE",
  "datetime-local": "TIMESTAMP WITH TIME ZONE",
  select: "VARCHAR(100)",
  checkbox: "BOOLEAN DEFAULT false",
  textarea: "TEXT",
  email: "VARCHAR(255)",
  phone: "VARCHAR(100)",
  currency: "DECIMAL(12,2) DEFAULT 0",
  percentage: "DECIMAL(5,2) DEFAULT 0",
  readonly: "TEXT",
  image: "TEXT",
};

// Fields that map to specific SQL types (override from TYPE_MAP)
const FIELD_OVERRIDES = {
  // Common name patterns
  id: "UUID PRIMARY KEY DEFAULT uuid_generate_v4()",
  company_id: "BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE",
  user_id: "UUID REFERENCES public.users(id) ON DELETE SET NULL",
  created_at: "TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())",
  updated_at: "TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())",
  custom_fields: "JSONB DEFAULT '{}'::jsonb",
  // Name patterns
  sort_order: "INT DEFAULT 0",
  is_active: "BOOLEAN DEFAULT true",
  is_published: "BOOLEAN DEFAULT false",
  is_featured: "BOOLEAN DEFAULT false",
  is_visible: "BOOLEAN DEFAULT true",
  status: "VARCHAR(50) DEFAULT 'draft'",
  notes: "TEXT",
  description: "TEXT",
  tags: "JSONB DEFAULT '[]'::jsonb",
  config: "JSONB DEFAULT '{}'::jsonb",
  slug: "VARCHAR(500)",
  version: "INT DEFAULT 1",
};

// ── Parse a DocType .ts file ─────────────────────────────────────────────────
function parseDocTypeFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");

  // Extract export name
  const exportMatch = content.match(/export\s+const\s+(\w+)\s*:/);
  if (!exportMatch) return null;

  // Extract tableName
  const tableMatch = content.match(/tableName:\s*["']([^"']+)["']/);
  if (!tableMatch) return null;

  // Extract module
  const moduleMatch = content.match(/module:\s*["']([^"']+)["']/);

  // Extract itemTableName and itemForeignKey
  const itemTableMatch = content.match(/itemTableName:\s*["']([^"']+)["']/);
  const itemFKMatch = content.match(/itemForeignKey:\s*["']([^"']+)["']/);

  // Extract all field keys and their types from headerFields, tabFields, itemFields
  const fields = [];
  const fieldRegex = /\{\s*key:\s*["']([^"']+)["'][^}]*?(?:type:\s*["']([^"']+)["'])?[^}]*?(?:required:\s*(true))?[^}]*?(?:lookupTable:\s*["']([^"']+)["'])?[^}]*?\}/gs;

  let match;
  while ((match = fieldRegex.exec(content)) !== null) {
    const [, key, type, required, lookupTable] = match;
    // Skip __cf__ prefixed custom fields — they're stored in custom_fields JSONB
    if (key.startsWith("__cf__")) continue;
    fields.push({
      key,
      type: type || "text",
      required: !!required,
      lookupTable: lookupTable || null,
      isFK: !!lookupTable || key.endsWith("_id"),
    });
  }

  return {
    exportName: exportMatch[1],
    tableName: tableMatch[1],
    module: moduleMatch ? moduleMatch[1] : "unknown",
    itemTableName: itemTableMatch ? itemTableMatch[1] : null,
    itemForeignKey: itemFKMatch ? itemFKMatch[1] : null,
    fields,
    filePath: path.basename(filePath),
  };
}

// ── Parse schema.sql for existing tables and columns ─────────────────────────
function parseSchema(schemaPath) {
  if (!fs.existsSync(schemaPath)) return {};

  const content = fs.readFileSync(schemaPath, "utf-8");
  const tables = {};

  // Match CREATE TABLE blocks
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?public\.(\w+)\s*\(([\s\S]*?)\);/gi;
  let match;

  while ((match = tableRegex.exec(content)) !== null) {
    const tableName = match[1];
    const body = match[2];
    const columns = new Set();

    // Extract column names (skip constraints, indexes)
    const lines = body.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip constraints, checks, unique, primary key lines
      if (
        trimmed.startsWith("CONSTRAINT") ||
        trimmed.startsWith("UNIQUE") ||
        trimmed.startsWith("PRIMARY") ||
        trimmed.startsWith("CHECK") ||
        trimmed.startsWith("FOREIGN") ||
        trimmed.startsWith("--") ||
        trimmed === ""
      )
        continue;

      const colMatch = trimmed.match(/^(\w+)\s+/);
      if (colMatch) columns.add(colMatch[1].toLowerCase());
    }

    tables[tableName] = columns;
  }

  return tables;
}

// ── Determine SQL type for a field ───────────────────────────────────────────
function getSQLType(field) {
  // Check overrides first
  if (FIELD_OVERRIDES[field.key]) return FIELD_OVERRIDES[field.key];

  // FK fields
  if (field.lookupTable) {
    const refTable = field.lookupTable;
    const nullable = field.required ? "NOT NULL" : "";
    // Determine PK type of referenced table (UUID for most, BIGINT for some)
    const bigintTables = [
      "warehouses", "crm_pipelines", "crm_stages",
      "hrms_departments", "system_modules", "system_plans",
    ];
    const pkType = bigintTables.includes(refTable) ? "BIGINT" : "UUID";
    return `${pkType} ${nullable} REFERENCES public.${refTable}(id) ON DELETE ${field.required ? "CASCADE" : "SET NULL"}`.trim();
  }

  // _id suffix without lookup — generic UUID FK
  if (field.key.endsWith("_id") && !field.lookupTable) {
    return "UUID";
  }

  // Type-based mapping
  return TYPE_MAP[field.type] || "TEXT";
}

// ── Generate CREATE TABLE SQL ────────────────────────────────────────────────
function generateCreateTable(doctype) {
  const lines = [];
  lines.push(`-- ── ${doctype.tableName} (${doctype.module}) ──`);
  lines.push(`CREATE TABLE IF NOT EXISTS public.${doctype.tableName} (`);

  // Standard columns first
  const cols = [];
  cols.push("    id UUID PRIMARY KEY DEFAULT uuid_generate_v4()");
  cols.push("    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE");
  cols.push("    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL");

  // DocType fields
  const skipKeys = new Set(["id", "company_id", "user_id", "created_at", "updated_at", "custom_fields"]);
  for (const field of doctype.fields) {
    if (skipKeys.has(field.key)) continue;
    const sqlType = getSQLType(field);
    cols.push(`    ${field.key} ${sqlType}`);
  }

  // Standard trailing columns
  cols.push("    custom_fields JSONB DEFAULT '{}'::jsonb");
  cols.push("    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())");
  cols.push("    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())");

  lines.push(cols.join(",\n"));
  lines.push(");");

  return lines.join("\n");
}

// ── Generate ALTER TABLE for missing columns ─────────────────────────────────
function generateAlterTable(doctype, existingColumns) {
  const lines = [];
  const skipKeys = new Set(["id", "company_id", "user_id", "created_at", "updated_at"]);

  for (const field of doctype.fields) {
    if (skipKeys.has(field.key)) continue;
    if (existingColumns.has(field.key.toLowerCase())) continue;

    const sqlType = getSQLType(field);
    lines.push(
      `ALTER TABLE public.${doctype.tableName} ADD COLUMN IF NOT EXISTS ${field.key} ${sqlType};`
    );
  }

  // Always ensure custom_fields exists
  if (!existingColumns.has("custom_fields")) {
    lines.push(
      `ALTER TABLE public.${doctype.tableName} ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;`
    );
  }

  if (lines.length > 0) {
    return `-- ── ${doctype.tableName} — missing columns ──\n${lines.join("\n")}`;
  }
  return null;
}

// ── Generate indexes ─────────────────────────────────────────────────────────
function generateIndexes(doctype) {
  const lines = [];
  const tn = doctype.tableName;
  const short = tn.replace(/^(web_|master_|crm_|hrms_|ecom_)/, "");

  // company_id index
  lines.push(
    `CREATE INDEX IF NOT EXISTS idx_${short}_company ON public.${tn}(company_id);`
  );

  // Status index
  const hasStatus = doctype.fields.some((f) => f.key === "status");
  if (hasStatus) {
    lines.push(
      `CREATE INDEX IF NOT EXISTS idx_${short}_status ON public.${tn}(company_id, status);`
    );
  }

  // FK indexes
  for (const field of doctype.fields) {
    if (field.key.endsWith("_id") && field.key !== "company_id" && field.key !== "user_id") {
      lines.push(
        `CREATE INDEX IF NOT EXISTS idx_${short}_${field.key.replace("_id", "")} ON public.${tn}(${field.key});`
      );
    }
  }

  // Slug index
  const hasSlug = doctype.fields.some((f) => f.key === "slug");
  if (hasSlug) {
    lines.push(
      `CREATE INDEX IF NOT EXISTS idx_${short}_slug ON public.${tn}(company_id, slug);`
    );
  }

  return `-- Indexes for ${tn}\n${lines.join("\n")}`;
}

// ── Generate RLS policies ────────────────────────────────────────────────────
function generateRLS(doctype) {
  const tn = doctype.tableName;
  const lines = [];

  lines.push(`-- RLS for ${tn}`);
  lines.push(`ALTER TABLE public.${tn} ENABLE ROW LEVEL SECURITY;`);
  lines.push("");

  // Tenant isolation
  lines.push(`DROP POLICY IF EXISTS "tenant_isolation" ON public.${tn};`);
  lines.push(
    `CREATE POLICY "tenant_isolation" ON public.${tn}\n    USING (public.user_has_company_access(company_id))\n    WITH CHECK (public.user_has_company_access(company_id));`
  );
  lines.push("");

  // Service role bypass
  lines.push(`DROP POLICY IF EXISTS "service_role_bypass" ON public.${tn};`);
  lines.push(
    `CREATE POLICY "service_role_bypass" ON public.${tn}\n    FOR ALL USING (auth.role() = 'service_role');`
  );

  // Public read for published content
  const hasPublished = doctype.fields.some((f) => f.key === "is_published");
  if (hasPublished) {
    lines.push("");
    lines.push(`-- Public can read published content`);
    lines.push(`DROP POLICY IF EXISTS "public_read_published" ON public.${tn};`);
    lines.push(
      `CREATE POLICY "public_read_published" ON public.${tn}\n    FOR SELECT USING (is_published = true);`
    );
  }

  return lines.join("\n");
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  const args = process.argv.slice(2);
  const newOnly = args.includes("--new-only");
  const writeFile = args.includes("--write");
  const tableFilter = args.includes("--table")
    ? args[args.indexOf("--table") + 1]
    : null;

  // 1. Parse all DocType files
  const files = fs.readdirSync(DOCTYPES_DIR).filter((f) => f.endsWith(".ts"));
  const doctypes = files
    .map((f) => parseDocTypeFile(path.join(DOCTYPES_DIR, f)))
    .filter(Boolean);

  // 2. Parse existing schema
  const existingTables = parseSchema(SCHEMA_FILE);
  const existingTableNames = new Set(Object.keys(existingTables));

  // 3. Filter if requested
  const filtered = tableFilter
    ? doctypes.filter((d) => d.tableName === tableFilter)
    : doctypes;

  // 4. Generate SQL
  const output = [];
  const newTables = [];
  const alteredTables = [];
  const timestamp = new Date().toISOString().split("T")[0];

  output.push("-- ========================================================================================");
  output.push(`-- AUTO-GENERATED MIGRATION — ${timestamp}`);
  output.push("-- Generated by: node scripts/generate-sql.js");
  output.push("-- Safe to re-run: uses IF NOT EXISTS / IF EXISTS guards");
  output.push("-- ========================================================================================");
  output.push("");

  // Ensure RLS helper function exists
  output.push("-- ── RLS Helper Function ───────────────────────────────────────────────────");
  output.push(`CREATE OR REPLACE FUNCTION public.user_has_company_access(check_company_id BIGINT)`);
  output.push(`RETURNS BOOLEAN AS $$`);
  output.push(`BEGIN`);
  output.push(`  RETURN EXISTS (`);
  output.push(`    SELECT 1 FROM public.company_users WHERE user_id = auth.uid() AND company_id = check_company_id`);
  output.push(`  ) OR EXISTS (`);
  output.push(`    SELECT 1 FROM public.companies WHERE user_id = auth.uid() AND id = check_company_id`);
  output.push(`  );`);
  output.push(`END;`);
  output.push(`$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;`);
  output.push("");

  // Section: New tables
  const newTableDoctypes = filtered.filter(
    (d) => !existingTableNames.has(d.tableName)
  );
  if (newTableDoctypes.length > 0) {
    output.push("");
    output.push("-- ════════════════════════════════════════════════════════════════════════════");
    output.push("-- NEW TABLES");
    output.push("-- ════════════════════════════════════════════════════════════════════════════");
    output.push("");

    for (const dt of newTableDoctypes) {
      output.push(generateCreateTable(dt));
      output.push("");
      newTables.push(dt.tableName);

      // Generate child table if exists
      if (dt.itemTableName && !existingTableNames.has(dt.itemTableName)) {
        output.push(`-- Child table for ${dt.tableName}`);
        output.push(`CREATE TABLE IF NOT EXISTS public.${dt.itemTableName} (`);
        output.push("    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),");
        output.push(
          "    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,"
        );
        output.push(
          `    ${dt.itemForeignKey} UUID NOT NULL REFERENCES public.${dt.tableName}(id) ON DELETE CASCADE,`
        );
        output.push(
          "    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())"
        );
        output.push(");");
        output.push("");
        newTables.push(dt.itemTableName);
      }
    }
  }

  // Section: Altered tables (missing columns)
  if (!newOnly) {
    const existingDoctypes = filtered.filter((d) =>
      existingTableNames.has(d.tableName)
    );
    const alterStatements = [];

    for (const dt of existingDoctypes) {
      const existingCols = existingTables[dt.tableName];
      const alter = generateAlterTable(dt, existingCols);
      if (alter) {
        alterStatements.push(alter);
        alteredTables.push(dt.tableName);
      }
    }

    if (alterStatements.length > 0) {
      output.push("");
      output.push("-- ════════════════════════════════════════════════════════════════════════════");
      output.push("-- ALTER EXISTING TABLES — ADD MISSING COLUMNS");
      output.push("-- ════════════════════════════════════════════════════════════════════════════");
      output.push("");
      output.push(alterStatements.join("\n\n"));
    }
  }

  // Section: Indexes for new tables
  if (newTableDoctypes.length > 0) {
    output.push("");
    output.push("-- ════════════════════════════════════════════════════════════════════════════");
    output.push("-- INDEXES");
    output.push("-- ════════════════════════════════════════════════════════════════════════════");
    output.push("");

    for (const dt of newTableDoctypes) {
      output.push(generateIndexes(dt));
      output.push("");
    }
  }

  // Section: RLS for new tables
  if (newTableDoctypes.length > 0) {
    output.push("");
    output.push("-- ════════════════════════════════════════════════════════════════════════════");
    output.push("-- ROW LEVEL SECURITY");
    output.push("-- ════════════════════════════════════════════════════════════════════════════");
    output.push("");

    for (const dt of newTableDoctypes) {
      output.push(generateRLS(dt));
      output.push("");
    }
  }

  // Summary comment
  output.push("");
  output.push("-- ════════════════════════════════════════════════════════════════════════════");
  output.push(`-- SUMMARY: ${newTables.length} new tables, ${alteredTables.length} altered tables`);
  if (newTables.length > 0) output.push(`-- New: ${newTables.join(", ")}`);
  if (alteredTables.length > 0) output.push(`-- Altered: ${alteredTables.join(", ")}`);
  output.push("-- ════════════════════════════════════════════════════════════════════════════");

  const sql = output.join("\n");

  // Output
  if (writeFile) {
    fs.writeFileSync(OUTPUT_FILE, sql);
    console.log(`\n✅ Written to: database/generated_migration.sql`);
  } else {
    console.log(sql);
  }

  // Console summary
  console.log(`\n📊 Summary:`);
  console.log(`   DocTypes scanned: ${filtered.length}`);
  console.log(`   Existing tables:  ${existingTableNames.size}`);
  console.log(`   New tables:       ${newTables.length}${newTables.length > 0 ? ` (${newTables.join(", ")})` : ""}`);
  console.log(`   Altered tables:   ${alteredTables.length}${alteredTables.length > 0 ? ` (${alteredTables.join(", ")})` : ""}`);
  console.log(`   No changes:       ${filtered.length - newTableDoctypes.length - alteredTables.length}`);
}

main();
