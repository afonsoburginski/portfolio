import { CaseStudy } from "./types";

export const orcanorte: CaseStudy = {
  title: "Orça Norte – Real‑time Quotes Marketplace",
  description:
    "B2B marketplace for the construction industry featuring real‑time quotes, product catalogs, and vendor profiles. I delivered high‑performance search and filters, item comparison, cart/lists, vendor pages, and subscription plans with zero selling fees.",
  image: "/projects/orcanorte.png",
  role: "Tech Lead & Full‑stack Engineer",
  timeline: "2023–2025",
  stack:
    "Next.js 14 (App Router), React 18, TypeScript, TailwindCSS 4, Radix UI, NextAuth + Prisma ORM (PostgreSQL), Zustand, TanStack React Query, Recharts, Sonner, Framer Motion",
  liveUrl: "https://www.orcanorte.com.br/",
  story:
    "The vision was to connect customers, suppliers, and contractors in a fast, frictionless quoting flow. In a few weeks I shipped a navigable MVP (explore, compare, cart and lists), SEO‑indexable vendor/product pages, and a merchant dashboard to manage catalogs and quotes—forming the base to scale acquisition and recurring revenue through subscriptions.",
  objectives: [
    "Ship a catalog with search, filters, and sorting with excellent UX on mobile and desktop.",
    "Enable product comparison, cart/lists, and PDF budget export for sharing.",
    "Create vendor profiles with highlights, photos, prices, and SEO‑ready pages.",
    "Launch subscriptions (Basic, Plus, Premium) with no selling fees and boosted ranking.",
    "Provide dashboards and reports tracking views, quotes, and conversions.",
  ],
  challenges: [
    {
      title: "SEO‑first and highly performant catalog",
      detail:
        "Static/SSR pages with caching and incremental hydration. Filters/sorts use stable React Query keys and local state via Zustand for fluid navigation while keeping shareable, indexable URLs.",
    },
    {
      title: "Quoting workflow and export",
      detail:
        "The quote flow uses explicit statuses and PDF export via jsPDF, enabling frictionless sharing outside the platform.",
    },
    {
      title: "Multi‑tenant vendors",
      detail:
        "With NextAuth + Prisma I modeled stores/users with roles (admin, operator) and audit trails; merchant screens support bulk product import, reports, and plan‑based highlighting.",
    },
  ],
  highlights: [
    "Explore with search/filters, item comparison, cart and saved lists.",
    "Vendor profiles with catalogs, variations, and visible ratings.",
    "Subscriptions with zero selling fees (Basic/Plus/Premium) and automatic boosting.",
    "Quote PDF (jsPDF) shareable via WhatsApp/email.",
    "Admin + reports: views, quotes received, and conversions.",
    "Modern UI with Radix UI, Tailwind 4, and Framer Motion animations.",
  ],
  outcomes: [
    "+500 active companies and contractors on the platform.",
    "4.9 rating and steady growth in daily quote volume.",
    "Growth driven by SEO‑indexable vendor/product pages and boosted plans.",
    "Zero selling fees: predictable revenue via subscriptions.",
  ],
  sections: [
    {
      title: "Architecture",
      body: [
        "App Router (Next.js 14) with SSR/ISR where needed; React 18 + strict TypeScript.",
        "Auth/authorization with NextAuth and Prisma (PostgreSQL), per‑store roles and auditing.",
        "Client state with Zustand; remote data with TanStack React Query and stable keys.",
        "UI with Radix UI and TailwindCSS 4; operational charts with Recharts; toasts via Sonner.",
      ],
    },
    {
      title: "Product",
      body: [
        "Explore: search, filters by category/price/relevance, and multiple sort orders.",
        "Compare: select multiple items with visual price/spec diffs.",
        "Cart/Lists: save items and generate branded PDF quotes with totals.",
        "Vendor: public pages with photos, descriptions, catalogs, and quote CTAs.",
      ],
    },
    {
      title: "Plans & Boosting",
      body: [
        "Basic/Plus/Premium subscriptions with no sales commission; automatic boosting in searches.",
        "Per‑plan metrics: views, quotes, conversions, and marketing campaigns.",
      ],
    },
  ],
};

