# Arquitetura

- Next.js App Router renderiza estudos de caso em `app/case-study/[slug]`.
- `lib/dashboard-data.ts` lê e atualiza projetos; `lib/project-to-case-study.ts` converte a linha de `projects` para o view-model.
- Postgres é acessado via Drizzle em `lib/db.ts`; scripts de seed usam `postgres` diretamente.
