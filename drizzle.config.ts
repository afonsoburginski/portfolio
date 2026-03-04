import { defineConfig } from "drizzle-kit";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Load .env manually (drizzle-kit runs outside Next.js)
const envPath = join(process.cwd(), ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

const url = process.env.TURSO_DATABASE_URL!;
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;
const isLocal = url?.startsWith("file:");

export default defineConfig({
  out: "./drizzle",
  schema: "./lib/schema.ts",
  dialect: isLocal ? "sqlite" : "turso",
  dbCredentials: isLocal
    ? { url }
    : { url, authToken },
});
