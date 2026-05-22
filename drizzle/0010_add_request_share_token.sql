-- Adiciona share_token em requests pra link público de orçamento.
-- Token único, não expirável, rotacionável manualmente pelo admin.

ALTER TABLE "requests" ADD COLUMN "share_token" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "requests_share_token_unique" ON "requests"("share_token");
