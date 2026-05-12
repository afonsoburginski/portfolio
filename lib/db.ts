import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

let _db: Database | null = null;

function getDb(): Database {
  if (_db) return _db;
  const d1 = getCloudflareContext({ async: false }).env.DB;
  if (!d1) throw new Error("Cloudflare D1 binding 'DB' not found. Run via `wrangler dev` or `next dev` with initOpenNextCloudflareForDev().");
  _db = drizzle(d1, { schema });
  return _db;
}

export const db = new Proxy({} as Database, {
  get(_, prop) {
    return (getDb() as unknown as Record<string, unknown>)[prop as string];
  },
});
