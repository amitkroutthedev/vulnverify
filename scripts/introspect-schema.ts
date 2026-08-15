import { Pool } from 'pg';

// Standalone connection (mirrors lib/db.ts) so this script has no dependency
// on Next.js path aliases and can run outside the app runtime.
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'cvechat',
      user: process.env.DB_USER || 'cvechat',
      password: process.env.DB_PASSWORD || 'your_password_here',
    });

interface ColumnRow {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

interface ConstraintRow {
  table_name: string;
  constraint_name: string;
  constraint_type: string;
  column_name: string | null;
  foreign_table_name: string | null;
  foreign_column_name: string | null;
}

interface IndexRow {
  tablename: string;
  indexname: string;
  indexdef: string;
}

async function main() {
  const columns = await pool.query<ColumnRow>(`
    SELECT table_name, column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `);

  const constraints = await pool.query<ConstraintRow>(`
    SELECT
      tc.table_name,
      tc.constraint_name,
      tc.constraint_type,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    LEFT JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
    WHERE tc.table_schema = 'public'
    ORDER BY tc.table_name, tc.constraint_name
  `);

  const indexes = await pool.query<IndexRow>(`
    SELECT tablename, indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname
  `);

  const tables: Record<string, {
    columns: ColumnRow[];
    constraints: ConstraintRow[];
    indexes: IndexRow[];
  }> = {};

  for (const row of columns.rows) {
    tables[row.table_name] ??= { columns: [], constraints: [], indexes: [] };
    tables[row.table_name].columns.push(row);
  }
  for (const row of constraints.rows) {
    tables[row.table_name] ??= { columns: [], constraints: [], indexes: [] };
    tables[row.table_name].constraints.push(row);
  }
  for (const row of indexes.rows) {
    tables[row.tablename] ??= { columns: [], constraints: [], indexes: [] };
    tables[row.tablename].indexes.push(row);
  }

  const tableNames = Object.keys(tables).sort();

  if (tableNames.length === 0) {
    console.log('No tables found in the public schema.');
  } else {
    console.log(`Found ${tableNames.length} table(s) in the public schema:\n`);
    for (const name of tableNames) {
      const t = tables[name];
      console.log(`## ${name}`);
      for (const c of t.columns) {
        const nullable = c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const def = c.column_default ? ` DEFAULT ${c.column_default}` : '';
        console.log(`  - ${c.column_name}: ${c.data_type} ${nullable}${def}`);
      }
      if (t.constraints.length) {
        console.log('  constraints:');
        for (const c of t.constraints) {
          const fk = c.foreign_table_name
            ? ` -> ${c.foreign_table_name}(${c.foreign_column_name})`
            : '';
          console.log(`    - [${c.constraint_type}] ${c.constraint_name} (${c.column_name ?? ''})${fk}`);
        }
      }
      if (t.indexes.length) {
        console.log('  indexes:');
        for (const i of t.indexes) {
          console.log(`    - ${i.indexname}: ${i.indexdef}`);
        }
      }
      console.log('');
    }
  }

  console.log('\n--- JSON snapshot (for diffing) ---');
  console.log(JSON.stringify(tables, null, 2));

  await pool.end();
}

main().catch((err) => {
  console.error('Schema introspection failed:', err);
  process.exit(1);
});
