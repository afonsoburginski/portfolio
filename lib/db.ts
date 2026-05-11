import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import * as schema from "./schema";

type Database = ReturnType<typeof drizzleD1<typeof schema>>;

let _db: Database | null = null;

function getCloudflareD1(): unknown {
  try {
    // Imported lazily so the app still runs in normal Node/Next dev without OpenNext context.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    return getCloudflareContext({ async: false })?.env?.DB;
  } catch {
    return undefined;
  }
}

function getDb(): Database {
  if (_db) return _db;

  const d1 = getCloudflareD1();
  if (d1) {
    _db = drizzleD1(d1 as never, { schema });
    return _db;
  }

  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set and Cloudflare D1 binding DB was not found");
  const requireFn = eval("require") as NodeRequire;
  const { drizzle: drizzleLibsql } = requireFn("drizzle-orm/libsql");
  const { createClient } = requireFn("@libsql/client");
  const client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN || process.env.TURSO_DATABASE_URL_TURSO_AUTH_TOKEN || undefined,
  });
  _db = drizzleLibsql(client, { schema }) as unknown as Database;
  return _db;
}

export const db = new Proxy({} as Database, {
  get(_, prop) {
    return (getDb() as unknown as Record<string, unknown>)[prop as string];
  },
});
