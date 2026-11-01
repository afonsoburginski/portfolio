# Portfolio

- Estudos de caso: `app/case-study/[slug]/page.tsx` e `app/case-study/[slug]/case-study-view.tsx`.
- Analytics agregado do site: `app/api/analytics/`, `components/analytics/` e `app/dashboard/analytics/`; exige sessão do owner. O banco guarda contagens diárias independentes por página, origem, país e classe de dispositivo, sem relacionar as dimensões nem persistir IP, cookie, identificador ou user-agent bruto.
- Schema de `projects`: `lib/schema.ts:175`.
- Conversão para a view: `lib/project-to-case-study.ts`.
- Dados e ordenação: `lib/dashboard-data.ts:440`.
- Validação TypeScript: `npx tsc --noEmit`.
- Seeds de case study: `scripts/seed-*.mjs` e SQL equivalente para `psql`.
