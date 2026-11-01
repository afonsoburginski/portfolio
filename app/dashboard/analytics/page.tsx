import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getOwnerState } from "@/lib/owner";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const owner = await getOwnerState(await headers());
  if (owner.state === "none") redirect("/oauth/login?next=%2Fdashboard%2Fanalytics");
  if (owner.state !== "owner") redirect("/dashboard");
  return <AnalyticsDashboard />;
}
