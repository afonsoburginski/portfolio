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

Auth: either the static `PORTFOLIO_MCP_TOKEN` bearer (Codex, ChatGPT desktop) or an OAuth 2.1 access token (ChatGPT web), see [Remote access](#remote-access-chatgpt-and-codex). Tools: `social_post_record`, `social_post_list`, `social_post_delete`, `project_upsert`, `project_list`, `article_upsert`, `article_list`, `article_get`, `article_publish`, `article_export_linkedin`, `linkedin_status`, `linkedin_create_post`, `linkedin_delete_post`, and `linkedin_list_my_posts`. After publishing on LinkedIn, call `social_post_record` with the public post URL and body, optionally including its URN, title, image, kind, and publication time. Older LinkedIn posts can be registered manually with their URL. The home page displays the six most recent recorded LinkedIn posts. `project_upsert` accepts public GitHub repository URLs and project images hosted on `cdn.afonsodev.com`.

### Remote access (ChatGPT and Codex)

Connector URL: `https://afonsodev.com/api/mcp`.

**Codex (CLI/desktop).** Export the token and point the server at it in `~/.codex/config.toml`:

```toml
[mcp_servers.portfolio]
url = "https://afonsodev.com/api/mcp"
bearer_token_env_var = "PORTFOLIO_MCP_TOKEN"
```

**ChatGPT web.** Developer mode apps only accept OAuth, so the site is its own OAuth 2.1 authorization server (PKCE S256, Dynamic Client Registration, refresh-token rotation). In ChatGPT: Settings → Apps (Plugins) → Advanced → Developer mode → Create app, set the MCP URL above and Authentication = OAuth. ChatGPT registers itself, opens `/oauth/authorize`, and you sign in with the owner Google account and press Allow. Scopes: `mcp:read` and `mcp:write` (write tools: every `*_upsert`, `*_record`, `*_delete`, `*_publish` and `linkedin_create_post`). Access tokens last 1 hour, refresh tokens 30 days; only SHA-256 hashes are stored. Endpoints: `/.well-known/oauth-protected-resource`, `/.well-known/oauth-authorization-server`, `POST /api/oauth/register`, `GET|POST /api/oauth/authorize`, `POST /api/oauth/token`, `POST /api/oauth/revoke`. Redirect URIs are limited to `https://chatgpt.com`, `https://*.openai.com` and `http://localhost`/`127.0.0.1`; Client ID Metadata Documents are not supported. To revoke everything, delete the rows of `oauth_clients` (cascades to codes and tokens).

Env: `OWNER_EMAIL` (the only account that can approve; must be a verified Google email), `PORTFOLIO_MCP_TOKEN`, plus `OAUTH_ISSUER` only for local dev (e.g. `http://localhost:3000`).

**Safety.** `linkedin_create_post`, `linkedin_delete_post`, `article_publish` and `article_upsert` with `status: "published"` refuse to run unless the call carries `confirm: true`, on top of the scope. Show the final text to the user first: LinkedIn posts publish immediately and cannot be drafted.

### LinkedIn posting

Migration 0005 creates `linkedin_tokens` (token stored AES-256-GCM encrypted), `oauth_clients`, `oauth_codes` and `oauth_tokens`. Env: `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_TOKEN_KEY` (`openssl rand -base64 32`), optionally `LINKEDIN_API_VERSION` (YYYYMM, defaults to the current month).

1. In the LinkedIn developer app, add `https://afonsodev.com/api/linkedin/callback` under Authorized redirect URLs (products: Sign In with LinkedIn using OpenID Connect and Share on LinkedIn).
2. Signed in as the owner, open `https://afonsodev.com/api/linkedin/connect` and approve. The token lasts about 60 days (no refresh token for this app type): reconnect when `linkedin_status` reports it expired.
3. Alternative for an existing token: `printf '%s' "$TOKEN" | LINKEDIN_TOKEN_KEY=... DATABASE_URL=... node scripts/linkedin-import-token.mjs [expires_in_seconds]`.

- `linkedin_status`: connected or expired, expiry, scopes; never the token.
- `linkedin_create_post` `{text ≤ 3000, visibility?, articleUrl?, articleTitle?, articleDescription?, imageUrl?, articleSlug?, confirm: true}`: publishes through the Posts API, uploads `imageUrl` (only `https://cdn.afonsodev.com/`) through the Images API, records the post in `social_posts` and, with `articleSlug`, stores its URL as the article's `linkedin_url`.
- `linkedin_delete_post` `{urn, confirm: true}` and `linkedin_list_my_posts` `{limit?}`. LinkedIn's API cannot read older posts, so the list shows only posts created here or recorded with `social_post_record`.

Checks without a database: `bun scripts/oauth-smoke.mjs` (PKCE, redirect URIs, request validation, scopes, rate limiter, encryption, state). `scripts/mcp-smoke.mjs` additionally checks the metadata endpoints, the 401 challenge and the `confirm` guard against a local server.

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
