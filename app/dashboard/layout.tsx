"use client";

import { AuthProvider } from "@/components/dashboard/auth-provider";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { LoginOverlay } from "@/components/dashboard/login-overlay";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAuth } from "@/components/dashboard/auth-provider";
import { usePathname } from "next/navigation";

function getBreadcrumbs(pathname: string) {
  const crumbs: { label: string; href?: string }[] = [
    { label: "Dashboard", href: "/dashboard" },
  ];

  if (pathname === "/dashboard") {
    crumbs[0] = { label: "Overview" };
    return crumbs.slice(0, 1);
  }
  if (pathname.startsWith("/dashboard/requests/") && pathname !== "/dashboard/requests") {
    crumbs.push({ label: "Pedido", href: "/dashboard" });
    crumbs.push({ label: "Detalhes" });
  } else if (pathname.startsWith("/dashboard/admin")) {
    crumbs.push({ label: "Admin Panel" });
  }
  return crumbs;
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {(loading || !user) && <LoginOverlay loading={loading} />}

      <SidebarProvider>
        <DashboardSidebar />

        <SidebarInset className="bg-background">
          {/* ── Sticky topbar ─────────────────────────────── */}
          <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-sidebar-border bg-background/80 backdrop-blur-sm px-4">
            <SidebarTrigger className="text-neutral-500 hover:text-white hover:bg-white/5 -ml-1" />
            <Separator orientation="vertical" className="h-4 bg-neutral-800" />
            <Breadcrumb>
              <BreadcrumbList>
                {crumbs.map((crumb, i) => {
                  const isLast = i === crumbs.length - 1;
                  return (
                    <BreadcrumbItem key={i}>
                      {isLast ? (
                        <BreadcrumbPage className="text-neutral-200 text-sm font-medium">
                          {crumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <>
                          <BreadcrumbLink
                            href={crumb.href}
                            className="text-neutral-500 hover:text-neutral-200 text-sm transition-colors"
                          >
                            {crumb.label}
                          </BreadcrumbLink>
                          <BreadcrumbSeparator className="text-neutral-700" />
                        </>
                      )}
                    </BreadcrumbItem>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          {/* ── Page content ──────────────────────────────── */}
          <main className="flex flex-1 flex-col p-6">
            <div className="mx-auto w-full max-w-7xl flex flex-1 flex-col gap-4">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
