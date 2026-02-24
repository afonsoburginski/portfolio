"use client";

import { useAuth } from "@/components/dashboard/auth-provider";
import { LoginOverlay } from "@/components/dashboard/login-overlay";
import { RequestsOverview } from "@/components/dashboard/requests-overview";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="size-5 animate-spin text-neutral-600" />
    </div>
  );

  if (!user) return <LoginOverlay />;
  return <RequestsOverview />;
}
