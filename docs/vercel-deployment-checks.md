# Passar nos checks da Vercel (Performance e Reliability)

Para **não precisar dar skip** nos checks "Performance: portfolio-nextjs" e "Reliability: portfolio-nextjs", você pode seguir uma destas abordagens.

---

## Opção 1: Deixar de exigir esses checks (recomendado se quiser deploy sem bloqueio)

Assim o deploy **não fica bloqueado** por Performance/Reliability e você não precisa mais usar "Force Promote" (skip):

1. Acesse o [Dashboard da Vercel](https://vercel.com) e abra o projeto **portfolio-nextjs**.
2. Vá em **Settings** → **Deployment Checks** (ou **Deployment Protection** / **Checks**, conforme o menu do seu projeto).
3. Na lista de **Required Checks**, remova ou desmarque:
   - **Performance: portfolio-nextjs**
   - **Reliability: portfolio-nextjs**
4. Salve. Os próximos deploys serão promovidos para produção assim que o build terminar, sem esperar esses checks.

Se a interface mostrar "Add Checks" e uma lista de checks selecionados, edite para **não** ter Performance e Reliability como obrigatórios.

---

## Opção 2: Fazer os checks passarem (manter os checks e melhorar o site)

### Já feito no projeto

- **Speed Insights**: o pacote `@vercel/speed-insights` foi adicionado e o componente `<SpeedInsights />` está no `app/layout.tsx`. A Vercel passa a coletar Core Web Vitals (LCP, CLS, INP); alguns checks de Performance usam esses dados.
- **Font**: uso de `display: "swap"` na fonte Inter para evitar FOIT e melhorar LCP.
- **Imagens**: uso de `next/image` com `priority` nas imagens acima da dobra (hero, projetos iniciais, about).

### O que conferir na Vercel

1. **Speed Insights**: em **Analytics** ou **Speed Insights** do projeto, ative o Speed Insights se ainda não estiver ativo.
2. **Reliability**: o check costuma fazer `GET` na URL do deploy e esperar **200**. Garanta que:
   - A rota `/` responde 200.
   - As rotas dinâmicas (ex.: `/case-study/[slug]`) não retornem 500 (trate slugs inexistente com `notFound()` ou equivalente).

### Boas práticas para Core Web Vitals

- **LCP**: manter `priority` nas imagens do hero e primeiras seções; evite JS pesado antes do primeiro paint.
- **CLS**: use `width`/`height` (ou `aspect-ratio`) em imagens e em containers que definem layout.
- **INP**: evite handlers que bloqueiam a thread por muito tempo; o projeto já usa componentes leves.

---

## Resumo

| Objetivo | Ação |
|----------|------|
| Não precisar dar skip nunca | **Opção 1**: remover Performance e Reliability dos Required Deployment Checks nas configurações do projeto. |
| Manter os checks e fazê-los passar | **Opção 2**: manter Speed Insights ativo, garantir 200 nas rotas e seguir as boas práticas de Core Web Vitals acima. |
