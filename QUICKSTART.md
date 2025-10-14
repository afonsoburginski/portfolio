# 🚀 Guia de Início Rápido

## Começando

### 1. Instalar dependências

```bash
bun install
```

### 2. Rodar em desenvolvimento

```bash
bun dev
```

O site estará disponível em: `http://localhost:3000`

### 3. Build para produção

```bash
bun build
```

### 4. Rodar em produção

```bash
bun start
```

## 📝 Personalizando o Conteúdo

### Informações Pessoais

Atualize suas informações nos seguintes componentes:

#### 1. **Seção Hero** (`components/hero.tsx`)
- Nome e título
- Descrição/bio
- Links de redes sociais

#### 2. **Seção About** (`components/about-section.tsx`)
- Texto sobre você
- Competências principais
- Avatar/foto

#### 3. **Seção Services** (`components/services-section.tsx`)
- Serviços que você oferece
- Descrições personalizadas

#### 4. **Seção Skills** (`components/skills-section.tsx`)
- Suas tecnologias
- Níveis de experiência (%)
- Tech stack

#### 5. **Seção Experience** (`components/experience-section.tsx`)
- Suas experiências profissionais
- Cargos e empresas
- Conquistas

#### 6. **Seção Projects** (`components/projects-section.tsx`)
- Seus projetos
- Imagens/screenshots
- Links para GitHub e demos

#### 7. **Seção Contact** (`components/contact-section.tsx`)
- Email de contato
- Localização
- Links de redes sociais

#### 8. **Footer** (`components/footer.tsx`)
- Links de contato
- Informações adicionais

### Metadados SEO

Edite `app/layout.tsx` para atualizar:
- Título do site
- Descrição
- Keywords
- Open Graph tags
- Twitter cards

```typescript
export const metadata: Metadata = {
  title: "Seu Nome - Seu Título",
  description: "Sua descrição aqui",
  // ... outras configurações
}
```

## 🎨 Personalizando Cores

As cores estão definidas em `app/globals.css`:

### Alterar gradientes principais

```css
/* Procure por */
from-blue-500 to-purple-500

/* E substitua por suas cores preferidas */
from-[cor1] to-[cor2]
```

### Cores mais usadas no projeto

- **Blue**: `#3B82F6` (blue-500)
- **Purple**: `#A855F7` (purple-500)
- **Background**: `#000000` (black)
- **Text**: `#FFFFFF` (white)

## 📸 Adicionando Imagens

### Projetos

1. Coloque as imagens em `public/projects/`
2. Atualize `components/projects-section.tsx`
3. Use Next.js Image component:

```tsx
import Image from "next/image";

<Image 
  src="/projects/seu-projeto.png"
  alt="Descrição"
  width={600}
  height={400}
/>
```

### Avatar/Foto de Perfil

Substitua o emoji em `components/about-section.tsx` por uma imagem:

```tsx
<Image 
  src="/avatar.jpg"
  alt="Afonso Burginski"
  width={400}
  height={400}
  className="rounded-3xl"
/>
```

## 🔧 Configurando Formulário de Contato

O formulário atual apenas loga no console. Para enviar emails:

### Opção 1: EmailJS

```bash
bun add @emailjs/browser
```

### Opção 2: API Route do Next.js

Crie `app/api/contact/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const data = await request.json();
  // Enviar email usando SendGrid, Resend, etc.
  return NextResponse.json({ success: true });
}
```

### Opção 3: Formspree / FormSubmit

Alternativas sem backend.

## 📱 Menu Mobile

O menu atual mostra apenas em desktop. Para adicionar menu mobile:

1. Criar componente `components/mobile-menu.tsx`
2. Adicionar ícone hamburguer
3. Usar Framer Motion para animações
4. Adicionar em `components/header.tsx`

## 🌐 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório GitHub
2. Vercel detecta Next.js automaticamente
3. Deploy com 1 clique

### Outras opções

- **Netlify**: Similar ao Vercel
- **Railway**: Para projetos full-stack
- **Docker**: Use o Dockerfile incluído

## ✅ Checklist de Lançamento

Antes de fazer deploy:

- [ ] Atualizar todas as informações pessoais
- [ ] Adicionar seus projetos reais
- [ ] Trocar email de contato
- [ ] Atualizar links de redes sociais
- [ ] Adicionar foto/avatar real
- [ ] Configurar formulário de contato
- [ ] Testar em mobile
- [ ] Verificar SEO (meta tags)
- [ ] Testar performance (Lighthouse)
- [ ] Adicionar favicon
- [ ] Configurar analytics (opcional)

## 🆘 Problemas Comuns

### Erro: "Module not found: Can't resolve 'framer-motion'"

```bash
bun add framer-motion
```

### Imagens não carregam

Certifique-se que estão em `public/` e use caminho absoluto:
```tsx
src="/imagem.jpg" // ✅
src="./imagem.jpg" // ❌
```

### Animações não funcionam

Componentes com Framer Motion precisam de `"use client"` no topo.

### Build falha

```bash
# Limpe cache e reinstale
rm -rf .next node_modules
bun install
bun build
```

## 📚 Recursos Úteis

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Aceternity UI](https://ui.aceternity.com/)
- [Lucide Icons](https://lucide.dev/)

## 💡 Dicas

1. **Performance**: Use Next.js Image para otimização automática
2. **SEO**: Adicione meta tags apropriadas
3. **Acessibilidade**: Teste com leitor de tela
4. **Mobile First**: Sempre teste em mobile primeiro
5. **Analytics**: Adicione Google Analytics ou Plausible
6. **Lighthouse**: Alcance 90+ em todas as métricas

## 🎯 Próximos Passos

1. Personalize todo o conteúdo
2. Adicione seus projetos reais
3. Configure o formulário de contato
4. Adicione mais animações se desejar
5. Teste em diferentes dispositivos
6. Faça o deploy!

---

**Desenvolvido com ❤️ usando Next.js 15 + Tailwind CSS 4 + Aceternity UI**

