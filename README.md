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

Tools: `social_post_record`, `social_post_list`, `social_post_delete`, `project_upsert`, and `project_list`. After publishing on LinkedIn, call `social_post_record` with the public post URL and body, optionally including its URN, title, image, kind, and publication time. Older LinkedIn posts can be registered manually with their URL. The home page displays the six most recent recorded LinkedIn posts. `project_upsert` accepts public GitHub repository URLs and project images hosted on `cdn.afonsodev.com`.

The `social_posts` table is created by migration 0003. The production container applies pending migrations through `migrate.mjs` before starting Next.js. For a local database, run `NODE_ENV=development npm run db:migrate`; do not use Drizzle's push command. To smoke test a local server after migration, run `PORTFOLIO_MCP_TOKEN=<token> node scripts/mcp-smoke.mjs` with the same token configured on the server. The smoke script rejects nonlocal URLs and removes its test post.
