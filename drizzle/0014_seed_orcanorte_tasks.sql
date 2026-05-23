-- Seed das tasks (checklist de entregas) do request OrçaNorte.
-- Derivadas do plano em orcanorte-marketplace-servicos-implementacao.md.
-- Etapa 1 (R$ 2.400): Marketplace de Serviços — 4 entregas.
-- Etapa 2 (R$ 2.400): Orçamento Inteligente + Contratação — 4 entregas.
-- Idempotente: INSERT OR IGNORE com IDs determinísticos.

INSERT OR IGNORE INTO "request_tasks" (
  "id", "request_id", "title", "position", "due_date", "status", "type", "priority", "value", "created_at", "updated_at"
) VALUES
  -- Etapa 1 — Marketplace de Serviços
  ('task-orcanorte-1-schema',     'req-orcanorte-marketplace-servicos',
   'Migração Drizzle + seed das 17 categorias de serviço (Pedreiro, Pintor, Marceneiro, …)',
   1, NULL, 'todo', 'feature', 2, 0, datetime('now'), datetime('now')),
  ('task-orcanorte-1-api',        'req-orcanorte-marketplace-servicos',
   'API: extensão catalog (filtros) + módulo service-quotes (POST /quotes/requests, propostas, aceitar)',
   2, NULL, 'todo', 'feature', 2, 0, datetime('now'), datetime('now')),
  ('task-orcanorte-1-web-landing','req-orcanorte-marketplace-servicos',
   'Web /servicos: grid de categorias + catálogo de profissionais com filtros, busca e cards',
   3, NULL, 'todo', 'feature', 2, 0, datetime('now'), datetime('now')),
  ('task-orcanorte-1-perfil',     'req-orcanorte-marketplace-servicos',
   'Perfil público do profissional (portfólio antes/depois, badges Verificado/Mais Contratado/Melhor Avaliado, disponibilidade) + extensão do service-form',
   4, NULL, 'todo', 'feature', 2, 0, datetime('now'), datetime('now')),

  -- Etapa 2 — Orçamento Inteligente + Contratação
  ('task-orcanorte-2-engine',     'req-orcanorte-marketplace-servicos',
   'API pricing-engine: POST /pricing/estimate + seed de presets para Pedreiro, Pintor, Calheiro, Telhado, Marceneiro, Vidraceiro',
   5, NULL, 'todo', 'feature', 2, 0, datetime('now'), datetime('now')),
  ('task-orcanorte-2-wizard',     'req-orcanorte-marketplace-servicos',
   'Wizard /orcamento-inteligente: 5 steps (Categoria → Serviço → Medidas → Acabamento → Resultado) com cálculo dinâmico em tempo real',
   6, NULL, 'todo', 'feature', 2, 0, datetime('now'), datetime('now')),
  ('task-orcanorte-2-quotes',     'req-orcanorte-marketplace-servicos',
   'Dialog Solicitar Orçamento (cliente) + dashboard de propostas (prestador) + fluxo aceitar/recusar + tela de contratações',
   7, NULL, 'todo', 'feature', 2, 0, datetime('now'), datetime('now')),
  ('task-orcanorte-2-pdf-share',  'req-orcanorte-marketplace-servicos',
   'Export PDF do orçamento + link compartilhável /orcamento/[id] + mobile pass + menu lateral com nova seção Serviços',
   8, NULL, 'todo', 'feature', 2, 0, datetime('now'), datetime('now'));
