-- Desconto opcional por request (admin define).
-- Distribuído proporcionalmente entre stages quando aplicado.
-- Afeta tudo: page do cliente, page pública compartilhada, MP checkout e charts.

ALTER TABLE "requests" ADD COLUMN "discount_amount" REAL NOT NULL DEFAULT 0;
ALTER TABLE "requests" ADD COLUMN "discount_reason" TEXT;
