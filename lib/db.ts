import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

// Lazily resolved so DATABASE_URL is only needed at request time, not at module
// import / `next build` time. Cached on globalThis so Next.js dev HMR doesn't
// open a new pool on every reload (which would exhaust Postgres connections).
const globalForDb = globalThis as unknown as {
  _pgClient?: ReturnType<typeof postgres>;
  _db?: Database;
};

function getDb(): Database {
  if (globalForDb._db) return globalForDb._db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  const client = globalForDb._pgClient ?? postgres(url, { prepare: false });
  globalForDb._pgClient = client;
  globalForDb._db = drizzle(client, { schema });
  return globalForDb._db;
}

export const db = new Proxy({} as Database, {
  get(_, prop) {
    return (getDb() as unknown as Record<string, unknown>)[prop as string];
  },
});
