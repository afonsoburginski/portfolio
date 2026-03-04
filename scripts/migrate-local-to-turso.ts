
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../lib/schema";

// ——— Cliente LOCAL (dev.db) ———
const localClient = createClient({ url: "file:./dev.db" });
const localDb = drizzle(localClient, { schema });

// ——— Cliente TURSO (produção) ———
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN ?? process.env.TURSO_DATABASE_URL_TURSO_AUTH_TOKEN;

if (!tursoUrl || tursoUrl.startsWith("file:")) {
  console.error("❌  TURSO_DATABASE_URL não está apontando para o Turso remoto.");
  process.exit(1);
}

const tursoClient = createClient({ url: tursoUrl, authToken: tursoToken });
const tursoDb = drizzle(tursoClient, { schema });

async function main() {
  console.log("🔄  Iniciando migração dev.db → Turso...\n");

  // ── 1. Limpa o Turso (ordem inversa por FK) ──────────────────────────────
  console.log("🗑️   Limpando tabelas no Turso...");
  await tursoDb.delete(schema.notifications);
  await tursoDb.delete(schema.request_comments);
  await tursoDb.delete(schema.request_tasks);
  await tursoDb.delete(schema.requests);
  await tursoDb.delete(schema.verification);
  await tursoDb.delete(schema.session);
  await tursoDb.delete(schema.account);
  await tursoDb.delete(schema.user);
  console.log("   ✓ Tabelas limpas.\n");

  // ── 2. Lê dados do local ─────────────────────────────────────────────────
  const users        = await localDb.select().from(schema.user);
  const accounts     = await localDb.select().from(schema.account);
  const sessions     = await localDb.select().from(schema.session);
  const verifications = await localDb.select().from(schema.verification);
  const reqs         = await localDb.select().from(schema.requests);
  const comments     = await localDb.select().from(schema.request_comments);
  const tasks        = await localDb.select().from(schema.request_tasks);
  const notifs       = await localDb.select().from(schema.notifications);

  console.log(`📦  Dados locais encontrados:`);
  console.log(`    users: ${users.length}`);
  console.log(`    accounts: ${accounts.length}`);
  console.log(`    sessions: ${sessions.length}`);
  console.log(`    requests: ${reqs.length}`);
  console.log(`    comments: ${comments.length}`);
  console.log(`    tasks: ${tasks.length}`);
  console.log(`    notifications: ${notifs.length}\n`);

  // ── 3. Insere no Turso ───────────────────────────────────────────────────
  if (users.length) {
    await tursoDb.insert(schema.user).values(users);
    console.log(`✅  users inseridos: ${users.length}`);
  }

  if (accounts.length) {
    await tursoDb.insert(schema.account).values(accounts);
    console.log(`✅  accounts inseridos: ${accounts.length}`);
  }

  if (sessions.length) {
    await tursoDb.insert(schema.session).values(sessions);
    console.log(`✅  sessions inseridas: ${sessions.length}`);
  }

  if (verifications.length) {
    await tursoDb.insert(schema.verification).values(verifications);
    console.log(`✅  verifications inseridas: ${verifications.length}`);
  }

  if (reqs.length) {
    await tursoDb.insert(schema.requests).values(reqs);
    console.log(`✅  requests inseridos: ${reqs.length}`);
  }

  if (comments.length) {
    await tursoDb.insert(schema.request_comments).values(comments);
    console.log(`✅  comments inseridos: ${comments.length}`);
  }

  if (tasks.length) {
    await tursoDb.insert(schema.request_tasks).values(tasks);
    console.log(`✅  tasks inseridos: ${tasks.length}`);
  }

  if (notifs.length) {
    await tursoDb.insert(schema.notifications).values(notifs);
    console.log(`✅  notifications inseridas: ${notifs.length}`);
  }

  console.log("\n🎉  Migração concluída com sucesso!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌  Erro durante a migração:", err);
  process.exit(1);
});
