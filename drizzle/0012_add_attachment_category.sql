-- Coluna category opcional em request_attachments.
-- Usada hoje para diferenciar contratos gerados por IA dos anexos normais.
-- Valores conhecidos: NULL (anexo comum), 'contract' (contrato).

ALTER TABLE "request_attachments" ADD COLUMN "category" TEXT;
CREATE INDEX IF NOT EXISTS "request_attachments_category_idx"
  ON "request_attachments"("request_id", "category");
