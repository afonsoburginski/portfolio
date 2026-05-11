import { createClient } from "@libsql/client";

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN ?? process.env.TURSO_DATABASE_URL_TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
  throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required");
}

const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

// ─── 1. Criar tabela projects ──────────────────────────────────────────────

await client.execute(`
  CREATE TABLE IF NOT EXISTS projects (
    id            TEXT PRIMARY KEY,
    slug          TEXT NOT NULL UNIQUE,
    title         TEXT NOT NULL,
    description   TEXT NOT NULL,
    long_description TEXT,
    category      TEXT NOT NULL DEFAULT 'web',
    status        TEXT NOT NULL DEFAULT 'production',
    image         TEXT,
    link          TEXT,
    github        TEXT,
    tags          TEXT NOT NULL DEFAULT '[]',
    tech_stack    TEXT NOT NULL DEFAULT '[]',
    features_web  TEXT NOT NULL DEFAULT '[]',
    features_desktop TEXT NOT NULL DEFAULT '[]',
    requirements  TEXT,
    featured      INTEGER NOT NULL DEFAULT 0,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);
console.log("✅ Tabela projects criada/verificada.");

// ─── 2. Dados do Blue Karaoke ──────────────────────────────────────────────

const tags = JSON.stringify([
  "Next.js",
  "Tauri",
  "Rust",
  "React",
  "TypeScript",
  "SQLite",
  "Supabase",
  "Drizzle ORM",
  "Mercado Pago",
  "Desktop",
  "Full Stack",
]);

const techStack = JSON.stringify([
  // Web
  "Next.js 16 (App Router)",
  "React 19",
  "TypeScript",
  "Tailwind CSS v4",
  "shadcn/ui",
  "Radix UI",
  "Better Auth v1.4",
  "Drizzle ORM",
  "PostgreSQL (Supabase)",
  "Supabase Storage",
  "Supabase Realtime",
  "TanStack React Query v5",
  "Mercado Pago SDK",
  "OpenAI API",
  // Desktop
  "Tauri 2",
  "Rust",
  "Tokio",
  "rusqlite (SQLite)",
  "reqwest",
  "mpv (native video player)",
  "Win32 FFI (HWND embedding)",
  "React Router v7",
  "Vite",
  "lottie-react",
  "qrcode.react",
  "tauri-plugin-autostart",
  "tauri-plugin-updater",
]);

const featuresWeb = JSON.stringify([
  // Páginas públicas
  "Landing page responsiva (mobile + desktop variants)",
  "Página de preços com planos de assinatura",
  "Página de recursos/funcionalidades",
  "Catálogo público de músicas com busca",
  "Páginas de login e cadastro (variantes mobile/desktop)",
  "Checkout completo com Mercado Pago (cartão + PIX)",
  "Páginas de resultado de pagamento (sucesso, falha, pendente)",
  // Dashboard admin
  "Dashboard com cards de estatísticas em tempo real (Supabase Realtime)",
  "Total de usuários, músicas, GB de storage e receita mensal",
  "Tabela de músicas mais tocadas",
  "Tabela de novos usuários",
  "Gerenciador de catálogo de músicas (upload, editar, excluir em massa)",
  "Histórico de reproduções com filtros (hoje/semana/mês/todos)",
  "Ranking de músicas mais tocadas",
  "Gerenciamento de usuários (listar, criar, excluir)",
  "Gerenciamento de chaves de ativação (dois tipos: assinatura e máquina)",
  "Controle de chaves: criar, editar dias restantes, deletar, desbloquear máquina",
  "Personalização do app desktop (upload de banner customizado para a tela inicial)",
  "Perfil do usuário com status da assinatura",
  // API Routes
  "CRUD completo de músicas via API REST",
  "Upload de músicas com URL assinada (Supabase Storage)",
  "Integração Mercado Pago Bricks (cartão e PIX)",
  "Webhook de pagamento (IPN handler)",
  "Validação de chaves de ativação para o app desktop",
  "Endpoint de sincronização do histórico de reproduções",
  "Endpoint de catálogo para o app desktop baixar músicas",
  "Endpoint de latest-release para auto-atualização do desktop",
  "Sistema de notificações com Supabase Realtime",
  "Cache em memória (LRU) para reduzir hits no banco",
  "Detecção automática de gênero musical via OpenAI",
  "Parse de nome de arquivo para extrair artista e título",
]);

const featuresDesktop = JSON.stringify([
  // Telas
  "Tela inicial com entrada por código numérico",
  "Busca unificada (por código ou nome/artista)",
  "Efeito Spotlight animado na tela inicial",
  "Banner customizável na tela de fundo (configurado pelo admin web)",
  "QR Codes na tela inicial (link para catálogo e cadastro)",
  "Tela de reprodução de vídeo em tela cheia",
  "Tela de pontuação aleatória pós-música com transição automática",
  // Player
  "Player nativo mpv embutido via HWND Win32 (hardware-accelerated)",
  "Fallback para player HTML5 <video> quando mpv não disponível",
  "Controles: play, pausa, reiniciar, música aleatória",
  "Fila de próxima música (queue system)",
  "Detecção automática de fim de reprodução (polling 500ms)",
  "WebView2 sobreposta ao vídeo mpv como overlay de UI",
  // Ativação
  "Sistema de ativação com dois tipos de chave",
  "Chave tipo 'máquina': limite de dias + vinculação ao machine_id",
  "Chave tipo 'assinatura': expiração por data",
  "Validação online com fallback offline (SQLite local)",
  "Indicador de status de ativação na tela inicial",
  // Sincronização
  "Sincronização automática periódica do catálogo de músicas",
  "Download em lote de músicas (até 20 em paralelo)",
  "Reindexação de arquivos já presentes no disco",
  "Progresso de download em tempo real (eventos Tauri)",
  "Modo bloqueio de downloads (configurável)",
  "Status offline: total de músicas locais vs. remotas, storage usado",
  // Sistema
  "Banco de dados SQLite local (músicas, histórico, ativação, config)",
  "machine_id persistente para vinculação de chave",
  "Histórico de reproduções local sincronizado com o servidor",
  "Auto-start com o Windows (tauri-plugin-autostart)",
  "Auto-atualização do app (tauri-plugin-updater)",
  "Atalhos de teclado configuráveis (Ctrl+W, Ctrl+M, *, +, Delete, Home, Space, F12)",
  "Inicialização com evento backend-ready para setup assíncrono de rede",
  "Criação de janela Win32 nativa via FFI Rust direto (sem crate externo)",
]);

const requirements = `# Blue Karaoke — Requisitos Completos

## Visão Geral
Sistema completo de karaokê profissional composto por:
1. **App Web** (Next.js 16) — painel admin + site público de marketing e assinaturas
2. **App Desktop** (Tauri 2 + Rust) — player de karaokê com sincronização de catálogo offline

---

## App Web (web/)

### Stack Tecnológica
- **Framework**: Next.js 16 com App Router, React 19
- **Autenticação**: Better Auth v1.4 (email/senha + plugin username)
- **Banco de dados**: Drizzle ORM + PostgreSQL via Supabase
- **Storage**: Supabase Storage (compatível com S3)
- **Pagamentos**: Mercado Pago SDK (Bricks: cartão + PIX)
- **Estado**: TanStack React Query v5
- **UI**: Radix UI + Tailwind CSS v4 + shadcn/ui
- **Realtime**: Supabase Realtime (subscriptions)
- **AI**: OpenAI API (detecção de gênero musical)

### Páginas Públicas
| Rota | Descrição |
|------|-----------|
| / | Landing page — detecta mobile/desktop, renderiza variante correta |
| /preco | Planos de assinatura |
| /recursos | Funcionalidades do sistema |
| /catalogo | Catálogo público de músicas com busca |
| /login | Login com variantes mobile/desktop |
| /cadastro | Cadastro de usuário |
| /checkout | Checkout de assinatura (Mercado Pago Bricks) |
| /checkout/success | Confirmação de pagamento aprovado |
| /checkout/failure | Pagamento recusado |
| /checkout/pending | Pagamento pendente |

### Dashboard Administrativo (autenticado)
| Rota | Descrição |
|------|-----------|
| [slug]/ | Dashboard principal com estatísticas e Realtime |
| [slug]/musicas | Gerenciador do catálogo de músicas |
| [slug]/historico | Histórico de reproduções com filtros |
| [slug]/perfil | Perfil e status de assinatura |
| [slug]/admin/usuarios | Gerenciamento de usuários |
| [slug]/admin/chaves | Gerenciamento de chaves de ativação |
| [slug]/admin/aparencia | Personalização da tela do app desktop |

### Funcionalidades do Dashboard
- **Estatísticas em tempo real** via Supabase Realtime: total de usuários, músicas, GB de storage, receita mensal
- **Catálogo de músicas**: upload com URL assinada, edição inline (título/artista), exclusão em massa, detecção automática de gênero via OpenAI, parse de nome de arquivo para extrair metadados
- **Histórico de reproduções**: filtros por hoje/semana/mês/tudo, ranking de mais tocadas
- **Chaves de ativação**: dois tipos — \`maquina\` (limite de dias, vinculada a um machine_id) e \`assinatura\` (data de expiração, vinculada a usuário). Operações: criar, editar dias restantes, desbloquear vinculação de máquina, deletar, filtrar por tipo/status
- **Personalização desktop**: upload de imagem de banner para a tela inicial do app desktop (armazenada no Supabase Storage)

### API REST Completa
**Músicas**: GET/POST /api/musicas | GET/PATCH/DELETE /api/musicas/[id] | POST /api/musicas/bulk-delete | GET /api/musicas/parse | GET /api/musicas/top

**Upload**: POST /api/upload/sign (URL assinada S3) | POST /api/upload/confirm | GET /api/uploads/[...path]

**Pagamentos Mercado Pago**: GET /api/mercadopago/plans | POST /api/mercadopago/bricks/init-card | POST /api/mercadopago/bricks/process-card | POST /api/mercadopago/bricks/init-pix | POST /api/mercadopago/bricks/process-pix | POST /api/webhook/mercadopago (IPN)

**Ativação**: POST /api/ativacao/validar | GET/POST api/assinaturas/chave

**Admin**: GET/POST/PATCH/DELETE /api/admin/chaves | GET /api/admin/usuarios | POST /api/admin/banner/sign | GET/POST/DELETE /api/admin/banner

**Sync/Stats**: POST /api/sync | GET /api/catalogo (catálogo para desktop) | GET /api/historico | GET /api/dashboard | GET /api/estatisticas | GET /api/storage/usage | GET /api/latest-release

### Schema do Banco de Dados (PostgreSQL / Supabase)
| Tabela | Campos principais |
|--------|------------------|
| users | id (CUID), slug, name, email, role (user/admin/machine), userType (subscriber/machine), isActive |
| session | id, token, userId, expiresAt |
| account | id, accountId, providerId, userId, password |
| musicas | id (UUID), codigo (único), artista, titulo, genero, arquivo (URL), nomeArquivo, tamanho, duracao |
| historico | id, userId, musicaId, codigo, dataExecucao |
| assinaturas | id, userId, plano (mensal/trimestral/anual), status, dataInicio, dataFim, valor, renovacaoAutomatica |
| chaves_ativacao | id, chave (único), userId, tipo (assinatura/maquina), status, limiteTempo (dias), dataExpiracao, machineId |
| estatisticas | id, userId, totalUsuarios, totalMusicas, totalGb, receitaMensal, mesReferencia |
| sincronizacoes | id, userId, tipo, dados (JSON), status, dataSincronizacao |

---

## App Desktop (desktop/)

### Stack Tecnológica
- **Framework**: Tauri 2 (Rust backend + WebView2 frontend)
- **Frontend**: React 19 + Vite + React Router v7 + Tailwind CSS v4
- **Backend Rust**: Tokio (async), rusqlite (SQLite local), reqwest (HTTP)
- **Vídeo**: mpv (player nativo, embedado via Win32 HWND) + fallback HTML5 \`<video>\`
- **Plugins Tauri**: autostart, updater, shell, process

### Telas (Rotas)
| Rota | Arquivo | Descrição |
|------|---------|-----------|
| / | Home.tsx | Tela principal — entrada por código, busca Spotlight, banner, QR codes, indicador de ativação |
| /tocar | Tocar.tsx | Tela de reprodução — carrega música pelo código, exibe VideoPlayer em tela cheia |
| /nota | Nota.tsx | Tela de pontuação — exibe score aleatório pós-música e navega para a próxima da fila |

### Componentes Principais
- **VideoPlayer**: Detecta mpv disponível → usa embedding Win32; caso contrário, HTML5. Controles completos (play/pausa/reiniciar/aleatório/fila). Atalhos de teclado.
- **UnifiedSearch**: Busca combinada por código numérico (slots) ou texto livre (nome/artista)
- **AtivacaoDialog**: Entrada e validação de chave de ativação contra o servidor
- **ConfiguracoesDialog**: Status offline, toggle bloqueio de downloads, toggle QR codes, toggle autostart Windows
- **QRCode**: QR dinâmico linkando para o catálogo web / cadastro

### Sistema de Vídeo Nativo (Rust)
- Verifica disponibilidade do \`mpv.exe\` (pasta de recursos, ao lado do .exe, ou PATH)
- **Windows**: Cria janela Win32 bruta (\`BKVideoBg\`) via FFI direto (sem crate), define \`--wid=<HWND>\` no mpv para embutir o vídeo. Define a janela Tauri como \`HWND_TOPMOST\` para sobrepor a UI
- **Outros OS**: Usa \`--fullscreen --geometry=WxH+X+Y\`
- Polling de 500ms para detectar fim da reprodução (\`try_wait()\`)
- Stop: mata processo mpv, destrói janela Win32, remove always-on-top

### Sistema de Ativação
- Dois tipos de chave:
  - **maquina**: limite de dias de uso, vinculada a um \`machine_id\` (UUID gerado e persistido localmente). Impede uso em outra máquina.
  - **assinatura**: data de expiração vinculada ao usuário.
- Fluxo: validação online via API → fallback para SQLite local se offline
- Vinculação de \`machine_id\` ocorre na primeira ativação online

### Banco de Dados Local SQLite
| Tabela | Campos |
|--------|--------|
| config_local | key, value (par chave-valor persistente) |
| musicas_local | id, codigo, artista, titulo, genero, arquivo (caminho local), tamanho, duracao |
| historico_local | id, musicaId, codigo, dataExecucao (sincronizado com servidor) |
| ativacao_local | chave, tipo, diasRestantes/horasRestantes, dataExpiracao, dataValidacao |

### Sincronização de Catálogo
1. Busca lista remota de músicas via \`/api/catalogo\` (cache em memória no Rust)
2. Indexa arquivos já presentes no disco (sem re-download)
3. Baixa músicas faltantes em lotes paralelos de até 20 simultâneos
4. Emite evento \`download-progress\` por arquivo para o frontend
5. Sincroniza histórico local com o servidor via \`/api/sync\`

### Atalhos de Teclado Configuráveis
| Ação | Padrão |
|------|--------|
| Fechar app | Ctrl+W |
| Minimizar | Ctrl+M |
| Sincronizar catálogo | * |
| Música aleatória | + |
| Cancelar / Limpar código | Delete / NumpadDecimal |
| Reiniciar música atual | Home |
| Pausar/Retomar | Space |
| Abrir configurações | F12 |

### Auto-atualização
- Plugin \`tauri-plugin-updater\` consome \`/api/latest-release\` para verificar novas versões
- Download e instalação transparente no background

---

## Modelo de Negócios
- **Chaves Máquina**: Licença por equipamento físico de karaokê com limite de dias de uso
- **Chaves Assinatura**: Acesso por período (mensal/trimestral/anual) via Mercado Pago
- **Admin Web**: Controle total do catálogo, chaves, usuários e aparência do app desktop
`;

// ─── 3. Inserir Blue Karaoke ───────────────────────────────────────────────

const existing = await client.execute(
  "SELECT id FROM projects WHERE slug = 'blue-karaoke'"
);

if (existing.rows.length > 0) {
  await client.execute({
    sql: `UPDATE projects SET
      title = ?,
      description = ?,
      long_description = ?,
      category = ?,
      status = ?,
      tags = ?,
      tech_stack = ?,
      features_web = ?,
      features_desktop = ?,
      requirements = ?,
      featured = ?,
      sort_order = ?,
      updated_at = datetime('now')
    WHERE slug = 'blue-karaoke'`,
    args: [
      "Blue Karaoke",
      "Sistema completo de karaokê profissional — app web de gestão (Next.js 16 + Supabase) e app desktop nativo (Tauri 2 + Rust + mpv) com catálogo offline, ativação por chave, pagamentos via Mercado Pago e reprodução de vídeo nativa embedada via Win32.",
      "Plataforma de karaokê desenvolvida do zero, com dois produtos integrados: um painel web administrativo completo para gerenciar catálogo de músicas, chaves de ativação, usuários e assinaturas; e um app desktop para Windows construído com Tauri 2 e Rust que reproduz vídeos karaokê usando o player nativo mpv embedado diretamente em uma janela Win32, com sincronização offline do catálogo inteiro e sistema de ativação por chave vinculada à máquina.",
      "full_system",
      "production",
      tags,
      techStack,
      featuresWeb,
      featuresDesktop,
      requirements,
      1,
      1,
    ],
  });
  console.log("✅ Blue Karaoke atualizado no banco.");
} else {
  await client.execute({
    sql: `INSERT INTO projects (
      id, slug, title, description, long_description,
      category, status, tags, tech_stack,
      features_web, features_desktop, requirements,
      featured, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      crypto.randomUUID(),
      "blue-karaoke",
      "Blue Karaoke",
      "Sistema completo de karaokê profissional — app web de gestão (Next.js 16 + Supabase) e app desktop nativo (Tauri 2 + Rust + mpv) com catálogo offline, ativação por chave, pagamentos via Mercado Pago e reprodução de vídeo nativa embedada via Win32.",
      "Plataforma de karaokê desenvolvida do zero, com dois produtos integrados: um painel web administrativo completo para gerenciar catálogo de músicas, chaves de ativação, usuários e assinaturas; e um app desktop para Windows construído com Tauri 2 e Rust que reproduz vídeos karaokê usando o player nativo mpv embedado diretamente em uma janela Win32, com sincronização offline do catálogo inteiro e sistema de ativação por chave vinculada à máquina.",
      "full_system",
      "production",
      tags,
      techStack,
      featuresWeb,
      featuresDesktop,
      requirements,
      1,
      1,
    ],
  });
  console.log("✅ Blue Karaoke inserido no banco.");
}

// ─── 4. Confirmar ─────────────────────────────────────────────────────────

const row = await client.execute(
  "SELECT id, slug, title, category, featured, sort_order, created_at FROM projects WHERE slug = 'blue-karaoke'"
);
console.log("\n📦 Registro no banco:");
console.log(JSON.stringify(row.rows[0], null, 2));

const all = await client.execute("SELECT slug, title, category, featured FROM projects ORDER BY sort_order");
console.log(`\n📋 Total de projetos: ${all.rows.length}`);
all.rows.forEach((r) => console.log(`  - [${r[2]}] ${r[1]} (featured: ${r[3]})`));
