-- Seed: request "OrçaNorte — Marketplace de Serviços + Orçamento Inteligente"
-- Valor: R$ 4.800 (40h dev × R$ 120). Testes/QA inclusos sem cobrança extra.
-- Stages: 2 × R$ 2.400 (kickoff 50% + entrega final 50%).
-- Plano detalhado em /orcanorte-marketplace-servicos-implementacao.md
--
-- ATENÇÃO: ajuste o e-mail do cliente OrçaNorte abaixo (procurar `CLIENT_EMAIL_AQUI`).
-- Pra descobrir:
--   wrangler d1 execute portfolio-db --remote --command "SELECT id, email, name FROM user;"
--
-- Idempotente: usa INSERT OR IGNORE com IDs fixos.

-- 1. Request principal (vinculado ao usuário do cliente via subquery por e-mail)
INSERT OR IGNORE INTO "requests" (
  "id", "user_id", "title", "description", "type", "priority", "status", "budget",
  "image_url", "admin_notes", "quoted_at", "created_at", "updated_at"
)
SELECT
  'req-orcanorte-marketplace-servicos',
  "id",
  'OrçaNorte — Marketplace de Serviços + Orçamento Inteligente',
  'Novo módulo dentro da plataforma OrçaNorte (saas-cotacoes) para prestadores de serviços da construção civil. Duas frentes:

(1) MARKETPLACE DE SERVIÇOS — catálogo de profissionais por categoria (Pedreiro, Pintor, Marceneiro, Vidraceiro, Calheiro, Eletricista, Encanador, Gesseiro, Montador de Móveis, Serralheiro, Jardineiro, Instalador de Piso, Azulejista, Servente, Soldador, Técnico em Refrigeração, Limpeza Pós-Obra). Cards com foto, rating, valor inicial, badges (Verificado / Mais Contratado / Melhor Avaliado). Perfil público do profissional com portfólio (antes/depois), avaliações, disponibilidade e CTA de Solicitar Orçamento.

(2) ORÇAMENTO INTELIGENTE AUTOMÁTICO — wizard de 5 steps (Categoria → Serviço → Medidas → Acabamento → Resultado) que calcula faixa de preço, tempo estimado, materiais e profissionais disponíveis com base em presets regionais. Inclui export PDF e link compartilhável.

Esforço (desenvolvimento): 40h × R$ 120 = R$ 4.800. Testes (mobile pass, a11y, Cypress e2e, QA) inclusos sem cobrança extra.

Stack reaproveitada do saas-cotacoes: Next.js 15, Postgres + Drizzle, Hono API, react-hook-form, zod, react-query, Tailwind. ~60% da fundação (tabelas services, categories, reviews, favorites, orders, stores) já existe.

Plano completo: /orcanorte-marketplace-servicos-implementacao.md',
  'full_system',
  2,
  'quoted',
  'R$ 4.800,00',
  'https://cdn.afonsodev.com/requests/orcanorte-marketplace-servicos.jpeg',
  'Cobrança apenas das horas de desenvolvimento. Testes (mobile pass, a11y, Cypress e2e, QA) são executados pelo dev e estão inclusos sem cobrança extra.

Quebra (40h):
- Schema + migrações + seeds (3h)
- API service-quotes + catalog (6h)
- API pricing-engine + presets (5h)
- Web /servicos landing + categorias + catálogo (7h)
- Web perfil profissional + cadastro estendido (5h)
- Web solicitação de orçamento (6h)
- Web wizard orçamento inteligente + PDF + share (8h)',
  datetime('now'),
  datetime('now'),
  datetime('now')
FROM "user"
WHERE "email" = 'orcanorte28@gmail.com'
LIMIT 1;

-- 2. Anexo (mockup da UI)
INSERT OR IGNORE INTO "request_attachments" (
  "id", "request_id", "url", "name", "mime_type", "size", "kind", "position", "created_at"
) VALUES (
  'att-orcanorte-mockup',
  'req-orcanorte-marketplace-servicos',
  'https://cdn.afonsodev.com/requests/orcanorte-marketplace-servicos.jpeg',
  'orcanorte-marketplace-servicos.jpeg',
  'image/jpeg',
  156218,
  'image',
  0,
  datetime('now')
);

-- 3. Stages (50% kickoff + 50% entrega final)
INSERT OR IGNORE INTO "request_stages" (
  "id", "request_id", "title", "amount", "position", "is_extra",
  "status", "work_status", "created_at", "updated_at"
) VALUES
  (
    'stg-orcanorte-kickoff',
    'req-orcanorte-marketplace-servicos',
    'Etapa 1 — Marketplace de Serviços (R$ 2.400): schema + 17 categorias; API catalog/service-quotes; página /servicos com grid de categorias + catálogo de profissionais; perfil público do profissional com portfólio, badges e disponibilidade',
    2400.00,
    1,
    0,
    'pending',
    'not_started',
    datetime('now'),
    datetime('now')
  ),
  (
    'stg-orcanorte-entrega',
    'req-orcanorte-marketplace-servicos',
    'Etapa 2 — Orçamento Inteligente + Contratação (R$ 2.400): API pricing-engine + presets; wizard de orçamento em 5 steps (categoria → serviço → medidas → acabamento → resultado); dialog Solicitar Orçamento + dashboard de propostas do prestador; export PDF + link compartilhável + mobile pass',
    2400.00,
    2,
    0,
    'pending',
    'not_started',
    datetime('now'),
    datetime('now')
  );
