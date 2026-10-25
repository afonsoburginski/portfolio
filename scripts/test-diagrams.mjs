// Runs lib/diagrams/**/*.test.ts with node:test. Bundles with esbuild (ships with drizzle-kit) so the "@/" alias,
// TSX and elkjs all resolve the way they do in the app. No browser involved.
import { build } from "esbuild";
import { spawnSync } from "node:child_process";
import { globSync, rmSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "node_modules/.cache/diagram-tests");
const only = process.argv[2];
const entries = globSync("lib/diagrams/**/*.test.{ts,tsx}", { cwd: root }).filter((f) => !only || f.includes(only));
if (!entries.length) { console.error("no tests found"); process.exit(1); }

rmSync(out, { recursive: true, force: true });
await build({
  entryPoints: entries.map((e) => path.join(root, e)),
  outdir: out, bundle: true, platform: "node", format: "esm", outExtension: { ".js": ".mjs" },
  jsx: "automatic", alias: { "@": root }, logLevel: "warning",
  packages: "external", // node_modules stay external; only app code is bundled
});
const files = globSync("**/*.mjs", { cwd: out }).map((f) => path.join(out, f));
const run = spawnSync(process.execPath, ["--test", "--test-force-exit", ...files], { stdio: "inherit", cwd: root });
process.exit(run.status ?? 1);
