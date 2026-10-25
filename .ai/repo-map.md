| Serviço/domínio | Responsabilidade | Diretório | Entrypoint | Dependências principais | Relações |
|---|---|---|---|---|---|
| Portfolio web | Site Next.js, estudos de caso e dashboard | `app/`, `components/`, `lib/` | `app/` (App Router) | Next 15, React 19, Drizzle, Postgres | `projects` alimenta home e `app/case-study/[slug]` |
| Project data scripts | Seeds idempotentes para estudos de caso | `scripts/` | scripts `.mjs` / SQL via `psql` | `postgres`, `DATABASE_URL` | escreve somente a tabela `projects` quando executado |
| Article diagrams | Declarative ```diagram blocks (Zod schema, ELK layout, SVG components, export) | `lib/diagrams/`, `components/articles/diagrams/` | `components/articles/markdown-body.tsx` | `zod`, `elkjs`, `react-icons` | validated by `article_upsert` in `app/api/mcp/route.ts`; guide in `docs/diagrams.md`; tests: `npm run test:diagrams` |
