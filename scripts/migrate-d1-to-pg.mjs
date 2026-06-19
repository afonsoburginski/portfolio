// One-off data migration: Cloudflare D1 (SQLite) → Postgres.
//
// Prereqs (run locally, once):
//   1. Export the live D1 to a SQL dump:
//        npx wrangler d1 export portfolio-db --remote --output scratchpad/d1-dump.sql
//   2. Materialize it into a real SQLite file (better-sqlite3 needs a binary db):
//        sqlite3 scratchpad/d1-dump.sqlite < scratchpad/d1-dump.sql
//   3. Point the target Postgres via DATABASE_URL (a tunnel to the VPS or local),
//      run the schema migrations first (npm run db:migrate), then:
//        D1_SQLITE_FILE=scratchpad/d1-dump.sqlite npm run db:import
//
// Type conversions: SQLite 0/1 → Postgres boolean; SQLite unix-seconds (auth
// tables) → JS Date. App date columns stay text (ISO strings) and pass through.
// The status triggers on request_stages are disabled during load so imported
// statuses are preserved verbatim.

import Database from "better-sqlite3";
import postgres from "postgres";

const SQLITE_FILE = process.env.D1_SQLITE_FILE || "scratchpad/d1-dump.sqlite";
const PG_URL = process.env.DATABASE_URL;

if (!PG_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

// Insertion order respects foreign keys.
const TABLES = [
  "user",
  "account",
  "session",
  "verification",
  "projects",
  "requests",
  "request_comments",
  "request_attachments",
  "request_tasks",
  "request_stages",
  "notifications",
  "user_preferences",
];

// SQLite integer(0/1) columns that are Postgres booleans.
const BOOLEAN_COLUMNS = {
  user: ["emailVerified", "isAdmin"],
  request_comments: ["is_admin"],
  requests: ["paid_manually"],
  request_stages: ["is_extra"],
  notifications: ["read"],
  projects: ["featured"],
};

// SQLite integer(unix seconds) columns that are Postgres timestamps.
const TIMESTAMP_COLUMNS = {
  user: ["createdAt", "updatedAt"],
  session: ["expiresAt", "createdAt", "updatedAt"],
  account: ["accessTokenExpiresAt", "refreshTokenExpiresAt", "createdAt", "updatedAt"],
  verification: ["expiresAt", "createdAt", "updatedAt"],
};

const CHUNK = 500;

function transformRow(table, row) {
  const bools = new Set(BOOLEAN_COLUMNS[table] || []);
  const stamps = new Set(TIMESTAMP_COLUMNS[table] || []);
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    if (v === null || v === undefined) {
      out[k] = null;
    } else if (bools.has(k)) {
      out[k] = v === 1 || v === true || v === "1";
    } else if (stamps.has(k)) {
      // stored as unix seconds; tolerate already-ms values just in case
      const n = Number(v);
      out[k] = new Date(n > 1e12 ? n : n * 1000);
    } else {
      out[k] = v;
    }
  }
  return out;
}

async function main() {
  const sqlite = new Database(SQLITE_FILE, { readonly: true, fileMustExist: true });
  const sql = postgres(PG_URL, { max: 1 });

  try {
    console.log(`source : ${SQLITE_FILE}`);
    console.log(`target : ${PG_URL.replace(/:[^:@/]+@/, ":****@")}\n`);

    // Skip the status triggers so imported request statuses are preserved.
    await sql`ALTER TABLE request_stages DISABLE TRIGGER USER`;

    for (const table of TABLES) {
      const exists = sqlite
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
        .get(table);
      if (!exists) {
        console.log(`- ${table}: (não existe na origem, pulando)`);
        continue;
      }

      const rows = sqlite.prepare(`SELECT * FROM "${table}"`).all();
      if (rows.length === 0) {
        console.log(`- ${table}: 0 linhas`);
        continue;
      }

      const transformed = rows.map((r) => transformRow(table, r));
      for (let i = 0; i < transformed.length; i += CHUNK) {
        const batch = transformed.slice(i, i + CHUNK);
        await sql`INSERT INTO ${sql(table)} ${sql(batch)}`;
      }

      const [{ count }] = await sql`SELECT count(*)::int AS count FROM ${sql(table)}`;
      const ok = count === rows.length ? "✓" : "⚠";
      console.log(`${ok} ${table}: origem ${rows.length} → destino ${count}`);
    }

    await sql`ALTER TABLE request_stages ENABLE TRIGGER USER`;
    console.log("\nMigração de dados concluída.");
  } catch (err) {
    console.error("\nFalha na migração:", err);
    process.exitCode = 1;
  } finally {
    sqlite.close();
    await sql.end();
  }
}

main();
