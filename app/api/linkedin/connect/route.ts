import { NextResponse } from "next/server";
import { LINKEDIN_SCOPES, linkedinRedirectUri } from "@/lib/linkedin/client";
import { signState } from "@/lib/linkedin/crypto";
import { baseUrl } from "@/lib/oauth/config";
import { getOwnerState } from "@/lib/owner";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const owner = await getOwnerState(request.headers);
  if (owner.state === "none") return NextResponse.redirect(`${baseUrl()}/oauth/login?next=${encodeURIComponent("/api/linkedin/connect")}`, 303);
  if (owner.state !== "owner") return new Response("Forbidden", { status: 403 });
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) return new Response("LinkedIn app is not configured.", { status: 500 });

  const url = new URL("https://www.linkedin.com/oauth/v2/authorization");
  url.search = new URLSearchParams({
    response_type: "code", client_id: clientId, redirect_uri: linkedinRedirectUri(),
    scope: LINKEDIN_SCOPES, state: signState(owner.userId),
  }).toString();
  return NextResponse.redirect(url, 303);
}
