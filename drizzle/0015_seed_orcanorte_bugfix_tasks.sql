-- Adiciona mais 3 tasks ao request "Correção de bugs no Admin e Catálogo"
-- (id: 35e32508-fe59-4454-a9a6-29833eafb574).
-- Referências de código em saas-cotacoes/web/src/modules/explorar/components/.

INSERT OR IGNORE INTO "request_tasks" (
  "id", "request_id", "title", "position", "due_date", "status", "type", "priority", "value", "created_at", "updated_at"
) VALUES
  (
    'task-orca-bug-pagination',
    '35e32508-fe59-4454-a9a6-29833eafb574',
    'Paginação na lista de produtos/lojas em /explorar: implementar infinite scroll ou paginação clássica em use-products.ts e use-explorar-data.ts (hoje carrega tudo de uma vez, performance ruim em catálogos grandes)',
    1,
    NULL,
    'todo',
    'bug_fix',
    2,
    0,
    datetime('now'),
    datetime('now')
  ),
  (
    'task-orca-bug-image-filter',
    '35e32508-fe59-4454-a9a6-29833eafb574',
    'Filtro em /explorar para esconder produtos sem imagem: ajustar query (preferencial) ou filtro no front em product-card-adaptive / desktop|mobile/product-card para não renderizar quando imagemUrl é null/vazio',
    2,
    NULL,
    'todo',
    'bug_fix',
    2,
    0,
    datetime('now'),
    datetime('now')
  ),
  (
    'task-orca-bug-tabs-invert',
    '35e32508-fe59-4454-a9a6-29833eafb574',
    'Inverter ordem das tabs em /explorar: Marketplace (atualmente direita) → primeira posição, Produtos → segunda. Editar explorar-header.tsx (linhas 68-79) e refletir no default activeTab quando aplicável',
    3,
    NULL,
    'todo',
    'bug_fix',
    2,
    0,
    datetime('now'),
    datetime('now')
  );
