import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const dbName = "portfolio-db";
const dumpPath = "backups/turso-export-2026-05-10T23-17-26-488Z/dump.d1.sql";
const wranglerPath = "wrangler.jsonc";

function run(args, options = {}) {
  return execFileSync("npx", ["wrangler", ...args], {
    encoding: "utf8",
    stdio: options.stdio ?? ["ignore", "pipe", "inherit"],
  });
}

function getDatabaseId() {
  const list = JSON.parse(run(["d1", "list", "--json"]));
  const existing = list.find((db) => db.name === dbName);
  if (existing?.uuid) return existing.uuid;

  const output = run(["d1", "create", dbName]);
  const match = output.match(/database_id\s*=\s*"([^"]+)"/);
  if (!match) {
    throw new Error(`Could not parse database_id from wrangler output:\n${output}`);
  }
  return match[1];
}

function patchWrangler(databaseId) {
  const config = readFileSync(wranglerPath, "utf8");
  if (config.includes('"d1_databases"')) {
    const patched = config.replace(
      /"database_id"\s*:\s*"[^"]+"/,
      `"database_id": "${databaseId}"`,
    );
    writeFileSync(wranglerPath, patched);
    return;
  }

  const block = `,\n  "d1_databases": [\n    {\n      "binding": "DB",\n      "database_name": "${dbName}",\n      "database_id": "${databaseId}"\n    }\n  ]\n`;
  writeFileSync(wranglerPath, config.replace(/\n}\s*$/, `${block}}\n`));
}

if (!existsSync(dumpPath)) {
  throw new Error(`Missing D1 dump at ${dumpPath}`);
}

console.log(`Creating/finding D1 database "${dbName}"...`);
let databaseId;
try {
  databaseId = getDatabaseId();
} catch (error) {
  console.error("\nCould not access Cloudflare D1.");
  console.error("Run `npx wrangler login` in your terminal, or set CLOUDFLARE_API_TOKEN, then try again.\n");
  throw error;
}
console.log(`Using database_id: ${databaseId}`);

console.log("Updating wrangler.jsonc...");
patchWrangler(databaseId);

console.log("Importing D1 data...");
run(["d1", "execute", dbName, "--remote", "--file", dumpPath], { stdio: "inherit" });

console.log("Done. Run `npm run build` and redeploy.");
