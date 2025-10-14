# Estrutura do Site - Portfolio Afonso Burginski

## 📋 Visão Geral

Site de portfólio completo inspirado no design do Portfolite, desenvolvido com Next.js 15, React 19, TypeScript e Tailwind CSS 4.

## 🎨 Seções do Site

### 1. **Header (Navegação)**
- **Arquivo**: `components/header.tsx`
- **Funcionalidades**:
  - Menu de navegação fixo com efeito glassmorphism
  - Links para todas as seções: Sobre, Serviços, Habilidades, Projetos e Contato
  - Botão CTA "Vamos Conversar"
  - Animação de entrada com Framer Motion

### 2. **Hero (Seção Principal)**
- **Arquivo**: `components/hero.tsx`
- **Funcionalidades**:
  - Introdução com nome e profissão
  - Descrição breve
  - Call-to-action buttons
  - Efeito Spotlight de fundo (3 feixes de luz)

### 3. **About (Sobre Mim)**
- **Arquivo**: `components/about-section.tsx`
- **Funcionalidades**:
  - Grid com imagem/avatar e conteúdo
  - Texto sobre o desenvolvedor
  - Lista de competências principais com ícones
  - Botões para contato e visualização de projetos
  - Animações de entrada ao scroll

### 4. **Services (Serviços)**
- **Arquivo**: `components/services-section.tsx`
- **Funcionalidades**:
  - Grid de 6 serviços oferecidos
  - Ícones SVG personalizados para cada serviço
  - Efeito hover com background gradient
  - Background com grid pattern
  - CTA "Vamos trabalhar juntos"

**Serviços incluídos**:
- Desenvolvimento Web
- Apps Mobile
- Backend & APIs
- UI/UX Design
- Performance
- Consultoria Tech

### 5. **Skills (Habilidades)**
- **Arquivo**: `components/skills-section.tsx`
- **Funcionalidades**:
  - 3 categorias de skills (Frontend, Backend, Ferramentas)
  - Barras de progresso animadas
  - Tech stack em formato de badges
  - Percentual de domínio de cada tecnologia

**Tecnologias destacadas**:
- Frontend: React, Next.js, TypeScript, Tailwind, HTML/CSS
- Backend: Node.js, Express, PostgreSQL, MongoDB, REST APIs
- Ferramentas: Git, Docker, Vercel, Figma, VS Code

### 6. **Experience (Experiência)**
- **Arquivo**: `components/experience-section.tsx`
- **Funcionalidades**:
  - Timeline vertical com linha central
  - Layout alternado (esquerda/direita)
  - Cards com cargo, empresa, período
  - Lista de conquistas por experiência
  - Animações ao scroll

### 7. **Projects (Projetos)**
- **Arquivo**: `components/projects-section.tsx`
- **Funcionalidades**:
  - Grid de projetos desenvolvidos
  - Cards com hover effects
  - Imagens/thumbnails dos projetos
  - Links para GitHub e demo

### 8. **Contact (Contato)**
- **Arquivo**: `components/contact-section.tsx`
- **Funcionalidades**:
  - Formulário de contato completo
  - Informações de contato (email, localização)
  - Links para redes sociais (GitHub, LinkedIn, Instagram)
  - Box de disponibilidade
  - Validação de campos

### 9. **Footer (Rodapé)**
- **Arquivo**: `components/footer.tsx`
- **Funcionalidades**:
  - Grid com 3 colunas (Brand, Links Rápidos, Contato)
  - Links para todas as seções
  - Informações de copyright
  - Botão "Scroll to Top" flutuante
  - Links para redes sociais

## 🎭 Componentes UI (Aceternity)

### Componentes já integrados:
- `spotlight-new.tsx` - Efeito de holofotes animados
- `card-hover-effect.tsx` - Cards com efeito hover
- `background-beams.tsx` - Efeito de feixes de luz
- `background-gradient.tsx` - Gradientes animados
- `text-generate-effect.tsx` - Animação de texto
- `meteors.tsx` - Efeito de meteoros
- `sparkles.tsx` - Partículas brilhantes
- `moving-border.tsx` - Borda animada
- `button.tsx` - Botões estilizados
- `grid-background.tsx` - Background em grid

## 🎨 Sistema de Cores

### Cores principais:
- **Background**: Preto (#000000)
- **Gradientes**: Blue (#3B82F6) → Purple (#A855F7)
- **Texto**: Branco (#FFFFFF) e tons de cinza
- **Bordas**: White/10 (rgba(255, 255, 255, 0.1))
- **Cards**: Black/40 com backdrop-blur

### Efeitos visuais:
- Glassmorphism (backdrop-blur)
- Gradientes radiais e lineares
- Box shadows com cores das gradientes
- Border glow effects

## 📱 Responsividade

Todas as seções são totalmente responsivas com breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

Grid layouts adaptam-se automaticamente:
- 1 coluna no mobile
- 2 colunas no tablet
- 3 colunas no desktop (quando aplicável)

## ✨ Animações

Utilizando **Framer Motion** para:
- Fade in/out
- Slide in (x/y axis)
- Scale effects
- Stagger animations
- Scroll-triggered animations
- Layout animations

## 🔗 Navegação

### Scroll suave:
- Todos os links internos utilizam âncoras (#about, #services, etc.)
- Scroll behavior: smooth (CSS)
- Botão "Scroll to Top" no footer

## 📊 Performance

### Otimizações implementadas:
- Lazy loading de imagens (Next.js Image)
- Code splitting automático (Next.js)
- Framer Motion com tree-shaking
- CSS in JS com Tailwind (purge automático)
- SSR/SSG com Next.js 15

## 🚀 Próximos Passos

### Sugestões de melhorias:
1. Adicionar mais projetos na seção Projects
2. Implementar modo claro/escuro (theme toggle)
3. Adicionar animações de scroll mais elaboradas
4. Integrar backend para formulário de contato
5. Adicionar blog/articles section
6. Implementar analytics (Google Analytics)
7. Adicionar mais efeitos Aceternity UI
8. Criar versão mobile do menu (hamburguer)
9. Adicionar página 404 customizada
10. Implementar i18n (multi-idioma)

## 📝 Informações Pessoais

Atualizar em cada seção com suas informações:
- **Email**: contato@afonsodev.com
- **GitHub**: https://github.com/afonsoburginski
- **LinkedIn**: https://www.linkedin.com/in/afonsoburginski/
- **Instagram**: https://www.instagram.com/afonso_burginski
- **Website**: https://www.afonsodev.com/

## 🎯 Objetivos do Site

1. ✅ Apresentar portfólio profissional
2. ✅ Demonstrar habilidades técnicas
3. ✅ Facilitar contato com clientes/recrutadores
4. ✅ Mostrar experiência e projetos
5. ✅ Design moderno e profissional
6. ✅ Performance e SEO otimizados

