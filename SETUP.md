# Configuração do Projeto - Portfolio

## ✅ Concluído

### Tecnologias Instaladas

- ✅ **Next.js 15.5.4** - Framework React com App Router
- ✅ **React 19.1.0** - Última versão do React
- ✅ **TypeScript 5.9.3** - Tipagem estática
- ✅ **Tailwind CSS 4.1.14** - Framework CSS utility-first (última versão)
- ✅ **Turbopack** - Bundler de próxima geração para dev e build
- ✅ **ESLint** - Linter configurado e funcionando

### Dependências do Aceternity UI

- ✅ **Framer Motion 12.23.24** - Animações
- ✅ **clsx 2.1.1** - Utilitário de classes
- ✅ **tailwind-merge 3.3.1** - Merge de classes Tailwind

### Estrutura do Projeto

```
portfolio/
├── app/                           # App Router
│   ├── globals.css               # Estilos globais com tema dark/light
│   ├── layout.tsx                # Layout raiz com metadados SEO
│   └── page.tsx                  # Página inicial (vazia, pronta para desenvolvimento)
│
├── components/                    # Componentes React
│   └── ui/                       # Componentes UI do Aceternity
│       ├── background-gradient.tsx    # Gradiente animado de fundo
│       ├── card-hover-effect.tsx      # Cards com efeito hover
│       ├── floating-navbar.tsx        # Navbar flutuante que esconde ao scroll
│       ├── moving-border.tsx          # Botão com borda animada
│       ├── sparkles.tsx               # Efeito de partículas brilhantes
│       └── text-generate-effect.tsx   # Efeito de texto aparecendo gradualmente
│
├── lib/                           # Utilitários
│   ├── constants.ts              # Constantes do site (links sociais, navegação)
│   └── utils.ts                  # Função cn() para merge de classes
│
├── types/                         # Tipos TypeScript
│   └── index.ts                  # Tipos para Project, Experience, Skill, etc.
│
├── public/                        # Arquivos estáticos
├── .gitignore                    # Git ignore configurado
├── env.d.ts                      # Tipos para variáveis de ambiente
├── next.config.ts                # Configuração Next.js otimizada
├── package.json                  # Dependências
├── postcss.config.mjs            # Configuração PostCSS com Tailwind 4
├── tsconfig.json                 # Configuração TypeScript
└── README.md                     # Documentação
```

### Componentes UI Disponíveis

Todos os componentes estão em `components/ui/` e prontos para uso:

1. **TextGenerateEffect** - Texto que aparece palavra por palavra com efeito de blur
2. **MovingBorder (Button)** - Botão com borda animada que se move
3. **SparklesCore** - Efeito de partículas brilhantes no fundo
4. **HoverEffect** - Grade de cards com efeito hover suave
5. **BackgroundGradient** - Wrapper com gradiente animado
6. **FloatingNav** - Navbar flutuante que esconde ao scroll down

### Sistema de Cores

O projeto usa variáveis CSS que suportam dark mode automático:

**Cores principais:**
- `background` / `foreground` - Cores de fundo e texto
- `card` / `card-foreground` - Cores de cards
- `primary` / `primary-foreground` - Cor primária
- `secondary` / `secondary-foreground` - Cor secundária
- `muted` / `muted-foreground` - Cores suaves
- `accent` / `accent-foreground` - Cor de destaque
- `destructive` / `destructive-foreground` - Cores destrutivas
- `border` / `input` / `ring` - Cores de UI

### Configurações de Performance

✅ **Otimizações ativas:**
- Turbopack para compilação rápida
- Otimização de imagens (AVIF, WebP)
- Tree-shaking do Framer Motion
- Font optimization (Inter)
- Strict mode TypeScript

### Constantes Configuradas

Em `lib/constants.ts` você encontra:
- Links sociais (GitHub, LinkedIn, Instagram)
- Items de navegação
- Configurações do site

### Próximos Passos

1. ✅ Projeto configurado
2. ⏳ Desenvolver componentes de interface:
   - Hero section
   - Seção sobre mim
   - Grid de projetos
   - Timeline de experiência
   - Seção de contato
   - Footer

### Como Rodar

```bash
# Desenvolvimento
bun dev

# Build
bun build

# Produção
bun start

# Lint
bun run lint
```

### Informações do Desenvolvedor

Configuradas no layout e constantes:
- **Nome**: Afonso Burginski
- **GitHub**: https://github.com/afonsoburginski
- **LinkedIn**: https://www.linkedin.com/in/afonsoburginski/
- **Instagram**: @afonso_burginski
- **Site**: https://www.afonsodev.com/

---

**Status**: ✅ Projeto completamente configurado e pronto para desenvolvimento da interface!

