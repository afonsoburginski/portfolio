# Portfolio - Afonso Burginski

Portfolio pessoal desenvolvido com as mais modernas tecnologias web.

## 🚀 Tecnologias

- **[Next.js 15](https://nextjs.org/)** - Framework React com App Router
- **[React 19](https://react.dev/)** - Biblioteca JavaScript para interfaces
- **[TypeScript](https://www.typescriptlang.org/)** - Superset JavaScript com tipagem estática
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Framework CSS utility-first
- **[Aceternity UI](https://ui.aceternity.com/)** - Componentes UI modernos e animados
- **[Framer Motion](https://www.framer.com/motion/)** - Biblioteca de animações
- **[Turbopack](https://turbo.build/pack)** - Bundler de próxima geração

## 📦 Instalação

```bash
# Instalar dependências
bun install

# Rodar em desenvolvimento
bun dev

# Build para produção
bun build

# Rodar em produção
bun start
```

## 🏗️ Estrutura do Projeto

```
portfolio/
├── app/                    # App Router do Next.js
│   ├── globals.css        # Estilos globais e variáveis CSS
│   ├── layout.tsx         # Layout raiz da aplicação
│   └── page.tsx           # Página inicial
├── components/            # Componentes React reutilizáveis
├── lib/                   # Utilitários e funções auxiliares
│   └── utils.ts          # Função cn() para merge de classes
├── public/               # Arquivos estáticos
└── next.config.ts       # Configuração do Next.js
```

## 🎨 Sistema de Cores

O projeto utiliza um sistema de cores baseado em variáveis CSS que suporta dark mode automático:

- `--background` / `--foreground` - Cores de fundo e texto
- `--primary` / `--secondary` - Cores principais
- `--muted` / `--accent` - Cores complementares
- `--destructive` - Cores para ações destrutivas
- `--border` / `--input` / `--ring` - Cores de UI

## ⚡ Otimizações

- **Turbopack** - Compilação extremamente rápida
- **Optimização de Imagens** - Suporte para AVIF e WebP
- **Optimização de Pacotes** - Tree-shaking do Framer Motion
- **Font Optimization** - Carregamento otimizado da fonte Inter

## 📱 Contato

- **GitHub**: [afonsoburginski](https://github.com/afonsoburginski)
- **LinkedIn**: [afonsoburginski](https://www.linkedin.com/in/afonsoburginski/)
- **Instagram**: [@afonso_burginski](https://www.instagram.com/afonso_burginski)
- **Website**: [afonsodev.com](https://www.afonsodev.com/)

## 📄 Licença

Este projeto é de código aberto para fins educacionais.

## MCP

The portfolio exposes a stateless Streamable HTTP MCP endpoint at `https://afonsodev.com/api/mcp`. Send JSON-RPC requests with `Authorization: Bearer <PORTFOLIO_MCP_TOKEN>` and `Content-Type: application/json`. Set `PORTFOLIO_MCP_TOKEN` as a server runtime secret; the endpoint returns 401 when it is missing or incorrect. Only POST is supported.

Tools: `social_post_record`, `social_post_list`, `social_post_delete`, `project_upsert`, `project_list`, `article_upsert`, `article_list`, `article_get`, `article_publish`, and `article_export_linkedin`. After publishing on LinkedIn, call `social_post_record` with the public post URL and body, optionally including its URN, title, image, kind, and publication time. Older LinkedIn posts can be registered manually with their URL. The home page displays the six most recent recorded LinkedIn posts. `project_upsert` accepts public GitHub repository URLs and project images hosted on `cdn.afonsodev.com`.

### Articles

Articles live in the `articles` table (migration 0004), which is the single source of truth; `afonsodev.com/articles/<slug>` is `force-dynamic`, so MCP edits show up immediately. Drafts return 404 publicly. `content/articles/*.md` is only a read fallback for slugs missing from the database.

- `article_upsert` `{slug, title, subtitle?, description, body, tags?, status?, publishedAt?, linkedinUrl?, coverImage?}`: upsert by slug (`^[a-z0-9-]+$`, body ≤ 200 KB, Markdown with optional ```` ```diagram ```` blocks, `coverImage` only on `https://cdn.afonsodev.com/`, `linkedinUrl` only on `https://www.linkedin.com/`). Returns the public URL.
- `article_list` `{status?}` and `article_get` `{slug}` (full Markdown, any status).
- `article_publish` `{slug, linkedinUrl?}`: sets `published`, fills `published_at` if empty.
- `article_export_linkedin` `{slug}`: returns `{title, html, markdown, images}`. Tables and diagrams become `[Insert image: <name>.png]` placeholders; relative links become absolute.

Import the existing files once after the migration with `DATABASE_URL=... node scripts/seed-articles.mjs` (inserts missing slugs only; `--force` overwrites title, subtitle, description and body of existing rows).

**LinkedIn images.** `GET /articles/<slug>/export/capa` (1920×1080 cover) and `/articles/<slug>/export/table-<n>` (n-th table, 1-based) return PNGs and require `Authorization: Bearer <PORTFOLIO_MCP_TOKEN>`, e.g. `curl -H "Authorization: Bearer $PORTFOLIO_MCP_TOKEN" https://afonsodev.com/articles/delivery-path/export/capa -o capa.png`. Diagrams are not rasterized server-side (no SVG rasterizer in the repo): screenshot each diagram figure from the published page.

**Publishing flow.** `article_upsert` (draft) → review → `article_publish` → `article_export_linkedin` + download the images → create the LinkedIn post/article → `social_post_record` with the LinkedIn URL → `article_publish {slug, linkedinUrl}` to store the link on the article.

The `social_posts` table is created by migration 0003. The production container applies pending migrations through `migrate.mjs` before starting Next.js. For a local database, run `NODE_ENV=development npm run db:migrate`; do not use Drizzle's push command. To smoke test a local server after migration, run `PORTFOLIO_MCP_TOKEN=<token> node scripts/mcp-smoke.mjs` with the same token configured on the server. The smoke script rejects nonlocal URLs and removes its test post.
