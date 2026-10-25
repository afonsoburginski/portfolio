import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { OAuthShell } from "@/components/oauth-shell";
import { validateAuthorizeRequest } from "@/lib/oauth/authorize-request";
import { SCOPE_READ, SCOPE_WRITE } from "@/lib/oauth/config";
import { getClient } from "@/lib/oauth/store";
import { getOwnerState } from "@/lib/owner";

export const dynamic = "force-dynamic";
export const metadata = { title: "Authorize access", robots: { index: false } };

const SCOPE_LABELS: Record<string, string> = {
  [SCOPE_READ]: "Read articles, projects and recorded posts",
  [SCOPE_WRITE]: "Create and edit articles and projects, publish, and post to LinkedIn",
  offline_access: "Stay connected without asking again",
};

export default async function AuthorizePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  const params = new URLSearchParams(Object.entries(query).filter((e): e is [string, string] => typeof e[1] === "string"));
  const client = query.client_id ? await getClient(query.client_id) : null;
  const result = validateAuthorizeRequest(params, client);
  if (!result.ok || !client) return <OAuthShell title="Invalid request"><p>This authorization request is not valid. Start again from the app.</p></OAuthShell>;

  const owner = await getOwnerState(await headers());
  if (owner.state === "none") redirect(`/oauth/login?next=${encodeURIComponent(`/oauth/authorize?${params.toString()}`)}`);
  if (owner.state === "forbidden") return <OAuthShell title="Not allowed"><p>Only the site owner can approve access.</p></OAuthShell>;

  const { request } = result;
  return (
    <OAuthShell title="Authorize access">
      <p><strong className="text-white">{client.client_name}</strong> wants to use your portfolio MCP server.</p>
      <p className="break-all text-xs text-white/50">Unverified app · returns to {new URL(request.redirectUri).host}</p>
      <ul className="space-y-2 rounded-2xl border border-white/10 bg-black/20 p-4">
        {request.scope.map(scope => (
          <li key={scope} className="flex gap-2"><span className="text-[#2dd4bf]">•</span><span><code className="text-white">{scope}</code> — {SCOPE_LABELS[scope]}</span></li>
        ))}
      </ul>
      <form method="post" action="/api/oauth/authorize" className="flex gap-3 pt-2">
        <input type="hidden" name="client_id" value={request.clientId} />
        <input type="hidden" name="redirect_uri" value={request.redirectUri} />
        <input type="hidden" name="response_type" value="code" />
        <input type="hidden" name="code_challenge" value={request.codeChallenge} />
        <input type="hidden" name="code_challenge_method" value="S256" />
        <input type="hidden" name="scope" value={request.scope.join(" ")} />
        <input type="hidden" name="resource" value={request.resource} />
        {request.state !== undefined && <input type="hidden" name="state" value={request.state} />}
        <button name="decision" value="deny" className="flex-1 rounded-xl border border-white/15 px-4 py-3 text-white/80 transition hover:bg-white/10">Deny</button>
        <button name="decision" value="allow" className="flex-1 rounded-xl bg-[#1f6feb] px-4 py-3 font-medium text-white transition hover:brightness-110">Allow</button>
      </form>
    </OAuthShell>
  );
}
