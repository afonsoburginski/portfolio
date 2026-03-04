"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/dashboard/auth-provider";
import { isAdminEmail } from "@/lib/admin-helpers";
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarFooter,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarSeparator, SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard, ShieldCheck,
  LogOut, ChevronsUpDown, ExternalLink,
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationBadge } from "@/components/dashboard/notification-badge";

const CLIENT_NAV = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
];

const ADMIN_NAV = [
  { label: "All Requests", href: "/dashboard/admin", icon: ShieldCheck },
];

export function DashboardSidebar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const isAdmin = isAdminEmail(user?.email);

  const avatarUrl = user?.image ?? undefined;
  const fullName  = user?.name ?? user?.email ?? "User";
  const initials  = fullName.slice(0, 2).toUpperCase();
  const email     = user?.email ?? "";

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    /* --sidebar CSS var is neutral-950; no className override needed */
    <Sidebar collapsible="icon">
      {/* ── Header ───────────────────────────────────────── */}
      <SidebarHeader className="h-14 px-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent rounded-xl px-2">
              <Link href="/">
                {/* Logo — sem fundo nem borda */}
                <Image
                  src="/logo.png"
                  alt="Afonsodev"
                  width={32}
                  height={32}
                  className="size-8 rounded-lg object-cover flex-shrink-0"
                />
                <div className="grid flex-1 text-left leading-tight min-w-0">
                  <span className="font-semibold text-sidebar-foreground text-sm truncate">Afonsodev</span>
                  <span className="text-[10px] text-sidebar-foreground/40 truncate">Client Portal</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      {/* ── Content ──────────────────────────────────────── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/30">
            Client
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {CLIENT_NAV.map(item => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                      <NotificationBadge count={unreadCount} className="ml-auto" />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/30">
                Admin
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {ADMIN_NAV.map(item => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                          <NotificationBadge count={unreadCount} className="ml-auto" />
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* ── Footer ───────────────────────────────────────── */}
      <SidebarSeparator />
      <SidebarFooter className="py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="hover:bg-sidebar-accent rounded-xl px-2 data-[state=open]:bg-sidebar-accent"
                  suppressHydrationWarning
                >
                  <Avatar className="size-8 rounded-lg flex-shrink-0">
                    <AvatarImage src={avatarUrl} className="rounded-lg" />
                    <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-xs rounded-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left leading-tight min-w-0">
                    <span className="font-medium text-sidebar-foreground text-sm truncate">{fullName}</span>
                    <span className="text-[10px] text-sidebar-foreground/40 truncate">{email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/40 flex-shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-56 bg-neutral-900 border-neutral-800 rounded-xl p-1"
                side="top"
                align="start"
                sideOffset={4}
              >
                <div className="px-2 py-2 space-y-0.5">
                  <p className="text-xs font-medium text-neutral-200 truncate">{fullName}</p>
                  <p className="text-[10px] text-neutral-600 truncate">{email}</p>
                  {isAdmin && (
                    <span className="inline-block text-[9px] font-bold tracking-widest bg-white text-black rounded px-1.5 py-0.5 mt-1">
                      ADMIN
                    </span>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-neutral-800" />
                <DropdownMenuItem asChild
                  className="text-xs text-neutral-400 hover:text-white focus:text-white hover:bg-white/5 focus:bg-white/5 gap-2 rounded-lg cursor-pointer">
                  <Link href="/" target="_blank">
                    <ExternalLink className="size-3.5" />
                    View Portfolio
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-neutral-800" />
                <DropdownMenuItem
                  onClick={signOut}
                  className="text-xs text-red-400 hover:text-red-300 focus:text-red-300 hover:bg-red-950/40 focus:bg-red-950/40 gap-2 rounded-lg cursor-pointer"
                >
                  <LogOut className="size-3.5" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
