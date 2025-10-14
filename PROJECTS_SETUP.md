# Seção de Projetos - Setup

## ✅ Implementado

A seção de projetos foi criada com o design inspirado no Portfolite!

### Características:

1. **Grid Masonry/Bento** 
   - Layout responsivo em 3 colunas no desktop
   - 2 colunas no tablet
   - 1 coluna no mobile
   - Alguns cards ocupam mais espaço (row-span-2)

2. **Animações com Framer Motion**
   - Fade in ao entrar na viewport
   - Delays escalonados para efeito cascata
   - Hover effects nos cards
   - Efeito de shine ao passar o mouse

3. **Cada Card de Projeto Contém:**
   - Imagem de fundo (placeholder por enquanto)
   - Gradiente overlay de baixo para cima
   - Botão "View Casestudy" com ícone
   - Hover effect com transições suaves
   - Efeito de brilho ao passar o mouse

4. **Botões de Ação:**
   - "All Projects" - para ver todos os projetos
   - "Book a Free Call" - CTA principal

## 📸 Como Adicionar Imagens Reais

1. **Coloque suas imagens em:** `public/projects/`
2. **Nomeie como:**
   - `project-1.jpg`
   - `project-2.jpg`
   - `project-3.jpg`
   - `project-4.jpg`
   - `project-5.jpg`
   - `project-6.jpg`

3. **Recomendações:**
   - Formato: JPG ou PNG
   - Resolução: 1200x800px ou maior
   - Estilo: Preto e branco (para manter o tema)
   - Otimize as imagens para web

## 🎨 Personalização

### Para adicionar mais projetos:

Edite o arquivo `components/projects-section.tsx` e adicione mais objetos ao array `projects`:

```typescript
const projects = [
  // ... projetos existentes
  {
    id: 7,
    title: "Novo Projeto",
    image: "/projects/project-7.jpg",
    span: "col-span-1 row-span-1", // ou "row-span-2" para cards maiores
  },
];
```

### Para mudar o layout do grid:

```typescript
// Altere a classe do grid:
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
```

### Para ajustar a altura dos cards:

```typescript
// Altere auto-rows:
className="... auto-rows-[280px]" // Aumente ou diminua o valor
```

## 🎯 Próximos Passos

1. **Adicionar imagens reais** dos seus projetos
2. **Criar páginas de detalhes** para cada projeto (casestudy)
3. **Adicionar filtros** por categoria/tecnologia
4. **Implementar modal** para visualização rápida
5. **Conectar com CMS** (opcional) para gerenciar projetos

## 🔗 Links dos Projetos

Atualmente os cards são apenas visuais. Para torná-los clicáveis:

1. Transforme o `<motion.div>` em `<Link>` do Next.js
2. Adicione rotas como `/projects/[slug]`
3. Crie páginas de detalhes para cada projeto

## 💡 Dicas

- Use imagens em preto e branco para manter o visual minimalista
- Mantenha proporção 4:3 ou 16:9 nas imagens
- Adicione texto alternativo (alt) nas imagens para SEO
- Considere usar um serviço de otimização de imagens (ex: Cloudinary)

---

**Status:** ✅ Seção de Projetos implementada e funcionando!

