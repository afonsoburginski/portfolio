import { CaseStudy } from "./types";

export const gemJhonrob: CaseStudy = {
  title: "GEM Jhon Rob – Enterprise ERP System",
  description:
    "A comprehensive, full‑stack ERP system built for Jhon Rob industrial operations. Features production order management, Kanban task workflows, expedition tracking, real‑time collaboration, and a complete audit system. The platform handles complex manufacturing processes with enterprise‑grade reliability and performance.",
  image: "/projects/gem-jhonrob-1.png",
  image2: "/projects/gem-jhonrob-2.png",
  role: "Full‑stack Engineer & Technical Lead",
  timeline: "2024–2025",
  stack:
    "Next.js 15, React 19, TypeScript, Prisma ORM, Supabase (Auth/DB/Realtime), PostgreSQL, TanStack Query, Zustand, TailwindCSS, Framer Motion, Tauri (Desktop), Docker",
  liveUrl: "https://gem.jhonrob.com.br/",
  story:
    "I architected and built GEM as a mission‑critical ERP to digitize and optimize Jhon Rob's manufacturing operations. The system replaces legacy spreadsheet‑based workflows with a modern, real‑time platform that connects production planning, task management, expedition logistics, and team collaboration—all while maintaining sub‑second response times and 99.9% uptime.",
  objectives: [
    "Design a unified platform to manage production orders, tasks, expedition logistics, and team workflows in one cohesive system.",
    "Integrate seamlessly with existing Java/Spring Boot backend APIs (api.jhonrob.com.br) for production order data.",
    "Build a production‑grade Kanban system with drag‑and‑drop, real‑time updates, and granular permission controls.",
    "Implement comprehensive audit logging to track every change, ensuring accountability and compliance.",
    "Optimize for extreme performance with intelligent caching, query memoization, and real‑time sync guarantees.",
    "Deploy as both web and desktop (Tauri) applications with offline‑first capabilities.",
  ],
  challenges: [
    {
      title: "Real‑time Sync Across Multiple Users",
      detail:
        "With multiple teams editing orders, tasks, and shipments concurrently, maintaining data consistency was critical. I implemented Supabase Realtime subscriptions with optimistic UI updates, conflict resolution strategies, and automatic cache invalidation. Every user sees changes within 200ms, with zero race conditions.",
    },
    {
      title: "Intelligent Multi‑layer Caching",
      detail:
        "The system handles thousands of tasks and production orders. I built a sophisticated caching strategy using Zustand for global state, TanStack Query for server cache (15s TTL), and in‑memory Map caches for comments/attachments. Cache invalidation is triggered via Supabase Realtime, ensuring data freshness without sacrificing speed. F5 refreshes clear all caches safely.",
    },
    {
      title: "Complete Audit Trail System",
      detail:
        "Every field change, comment, assignment, and status update needed to be logged for compliance. I designed a centralized audit service that automatically detects and logs 20+ event types (title edits, priority changes, assignee updates, etc.) with full before/after snapshots. The audit system is asynchronous, never blocking the main workflow, and provides a timeline view for any entity.",
    },
    {
      title: "Complex Permission Model",
      detail:
        "Different roles (Admin, Manager, Expedition, Developer) require different access levels across projects, teams, and modules. I implemented a granular RBAC system with permission keys (manage_teams, view_audit, etc.) stored in PostgreSQL and checked server‑side on every API route. Permissions are cached client‑side but validated server‑side for security.",
    },
  ],
  highlights: [
    "Production order integration with external API (api.jhonrob.com.br) using JWT session tokens for secure communication.",
    "Advanced Kanban board with drag‑and‑drop (dnd‑kit), real‑time multi‑user updates, column customization, and task grouping.",
    "Comprehensive expedition module to track shipments, itens de embarque, and delivery deadlines.",
    "Full audit system logging 20+ event types with timeline view and permission‑based access.",
    "Desktop application built with Tauri for offline‑first workflows and native performance.",
    "Intelligent caching with cache invalidation via Supabase Realtime to guarantee data freshness.",
    "Sub‑second page loads using Next.js 15 App Router, React Server Components, and aggressive query optimization.",
    "Complete test suite with warmup scripts to preload critical paths and ensure fast cold starts.",
  ],
  outcomes: [
    "Successfully deployed to production with 50+ daily active users across multiple departments.",
    "Reduced production order lookup time from minutes (spreadsheets) to seconds (indexed search).",
    "Achieved sub‑200ms real‑time sync latency across all collaborative features.",
    "99.9% uptime maintained over 6 months with zero data loss incidents.",
    "Desktop app enables offline work in factory environments with poor connectivity.",
  ],
  sections: [
    {
      title: "System Architecture",
      body: [
        "Frontend: Next.js 15 (App Router, RSC, Turbopack), React 19, TypeScript, TailwindCSS, Framer Motion for animations.",
        "State Management: Zustand for global state, TanStack Query for server cache with automatic refetch and stale‑while‑revalidate.",
        "Backend: Next.js API routes connected to Supabase PostgreSQL via Prisma ORM (5,000+ lines of schema).",
        "Real‑time: Supabase Realtime (WebSocket) for live updates on tasks, comments, subtasks, and orders.",
        "External API: Integration with legacy Java/Spring Boot API (api.jhonrob.com.br) for production orders.",
        "Desktop: Tauri 2.x for Windows/Mac/Linux builds with native notifications and auto‑updates.",
        "Infrastructure: Docker containers, Nginx reverse proxy, PostgreSQL 15, deployed on dedicated VPS.",
      ],
    },
    {
      title: "Production Order Management",
      body: [
        "Real‑time search across 10,000+ production orders (OFs) with debounced queries and indexed lookups.",
        "Detailed order view showing items, shipments, deadlines, products, and linked tasks.",
        "Automatic sync with external API using JWT session tokens for authentication.",
        "Batch operations to update multiple orders (deadlines, locations, statuses) with optimistic UI updates.",
        "Export to Excel/PDF for offline reporting and archival.",
      ],
    },
    {
      title: "Kanban Task System",
      body: [
        "Drag‑and‑drop task management with dnd‑kit supporting keyboard navigation and touch gestures.",
        "Real‑time multi‑user updates: see changes from other users within 200ms without refresh.",
        "Custom columns, task grouping, filtering by assignee/priority/label, and saved views.",
        "Subtasks with time tracking, attachments (file uploads to Supabase Storage), and comments with mentions.",
        "Task dialog with tabbed interface showing details, comments, subtasks, attachments, and full audit history.",
        "Trash bin with soft delete and restore functionality to prevent accidental data loss.",
      ],
    },
    {
      title: "Expedition & Logistics Module",
      body: [
        "Track shipments (expedições) with status updates, delivery dates, and linked production orders.",
        "Itens de embarque management with real‑time API sync to external systems.",
        "Romaneio de obras for construction site deliveries with automated PDF generation.",
        "Batch status updates with progress toasts showing completion percentage.",
        "City/location tracking with autocomplete search for faster data entry.",
      ],
    },
    {
      title: "Audit & Compliance System",
      body: [
        "Centralized audit service (task-audit-service.ts) detecting 20+ event types automatically.",
        "Logs every field change with before/after values, user info, and timestamps.",
        "Immutable audit records stored in PostgreSQL with indexes for fast queries.",
        "Permission‑based access: only users with manage_teams permission can view audit logs.",
        "Timeline view in task dialog showing complete history with expandable details.",
        "Async logging to prevent blocking main workflow—audit failures don't break operations.",
      ],
    },
    {
      title: "Performance Engineering",
      body: [
        "Multi‑layer caching: Zustand (global state), TanStack Query (server cache, 15s TTL), in‑memory Map (comments, 15s TTL).",
        "Intelligent cache invalidation via Supabase Realtime—changes trigger automatic refetch.",
        "Query optimization: memoized selectors (ISSO_E_SO_MEMOIZACAO.md) and indexed database lookups.",
        "Warmup scripts (warmup-pages.js) preload critical paths on dev server start for instant page loads.",
        "React Server Components for zero‑JavaScript initial renders on static pages.",
        "Code splitting and dynamic imports to keep bundle sizes under 200KB.",
        "F5 refresh safety: all RAM caches (Map, Zustand) clear on refresh, forcing fresh data fetch.",
      ],
    },
    {
      title: "Desktop Application (Tauri)",
      body: [
        "Native Windows/Mac/Linux builds with ~50MB installer size (vs 200MB+ Electron).",
        "Auto‑updater with signed releases using RSA private keys for security.",
        "Native notifications for task assignments, comments, and deadline reminders.",
        "Offline‑first mode with local SQLite cache syncing to server when online.",
        "System tray integration with quick actions and status indicators.",
      ],
    },
    {
      title: "Lessons Learned",
      body: [
        "Real‑time sync is non‑negotiable for collaborative systems—Supabase Realtime was a game‑changer.",
        "Intelligent caching with aggressive invalidation is the key to both speed and correctness.",
        "Audit logging must be asynchronous and never block the main workflow.",
        "Granular permissions are complex but essential for enterprise adoption.",
        "Desktop apps (Tauri) provide 10x better performance than web in low‑connectivity environments.",
        "Memoization and query optimization can reduce API calls by 70% without sacrificing UX.",
      ],
    },
    {
      title: "Future Enhancements",
      body: [
        "Machine learning for task deadline predictions based on historical data.",
        "Mobile app (React Native) for field workers and delivery tracking.",
        "GraphQL API layer for more flexible querying and reduced over‑fetching.",
        "Advanced analytics dashboard with charts for production throughput, bottlenecks, and team productivity.",
        "Webhook system for external integrations (Slack, Teams, email notifications).",
      ],
    },
  ],
};

