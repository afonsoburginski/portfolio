import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { OAuthShell } from "@/components/oauth-shell";
import { getOwnerState, safeNext } from "@/lib/owner";
import { SignInButton } from "./sign-in-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Owner sign-in", robots: { index: false } };

export default async function OwnerLogin({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  const owner = await getOwnerState(await headers());
  if (owner.state === "owner") redirect(next);
  return (
    <OAuthShell title="Owner sign-in">
      {owner.state === "forbidden"
        ? <p>This account is not the site owner, so it cannot approve access.</p>
        : <><p>Sign in with the owner account to continue.</p><SignInButton next={next} /></>}
    </OAuthShell>
  );
}
