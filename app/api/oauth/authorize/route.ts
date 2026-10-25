import { NextResponse } from "next/server";
import { baseUrl } from "@/lib/oauth/config";
import { redirectWithParams, validateAuthorizeRequest } from "@/lib/oauth/authorize-request";
import { clientIp, createLimiter } from "@/lib/oauth/rate-limit";
import { createCode, getClient } from "@/lib/oauth/store";
import { getOwnerState } from "@/lib/owner";

export const runtime = "nodejs";
const allow = createLimiter(60, 60_000);

const text = (message: string, status: number) => new Response(message, { status, headers: { "Cache-Control": "no-store" } });

// Entry point: validate, then hand the browser to the consent page (which needs the owner session).
export async function GET(request: Request) {
  if (!allow(clientIp(request))) return text("Too many requests.", 429);
  const params = new URL(request.url).searchParams;
  const clientId = params.get("client_id");
  const result = validateAuthorizeRequest(params, clientId ? await getClient(clientId) : null);
  if (!result.ok && result.fatal) return text(result.message, 400);
  if (!result.ok) return NextResponse.redirect(redirectWithParams(result.redirectUri, {
    error: result.error, error_description: result.description, state: result.state, iss: baseUrl(),
  }), 303);
  return NextResponse.redirect(`${baseUrl()}/oauth/authorize?${params.toString()}`, 303);
}

// Consent submission from the page's form. Re-validates everything: the hidden fields are untrusted.
export async function POST(request: Request) {
  if (request.headers.get("origin") !== baseUrl()) return text("Invalid origin.", 403);
  if (!allow(clientIp(request))) return text("Too many requests.", 429);
  const owner = await getOwnerState(request.headers);
  if (owner.state !== "owner") return text("Owner session required.", 403);

  const form = new URLSearchParams(await request.text());
  const clientId = form.get("client_id");
  const result = validateAuthorizeRequest(form, clientId ? await getClient(clientId) : null);
  if (!result.ok && result.fatal) return text(result.message, 400);
  if (!result.ok) return NextResponse.redirect(redirectWithParams(result.redirectUri, {
    error: result.error, error_description: result.description, state: result.state, iss: baseUrl(),
  }), 303);

  const { request: authz } = result;
  if (form.get("decision") !== "allow") {
    return NextResponse.redirect(redirectWithParams(authz.redirectUri, { error: "access_denied", state: authz.state, iss: baseUrl() }), 303);
  }
  const code = await createCode(authz);
  return NextResponse.redirect(redirectWithParams(authz.redirectUri, { code, state: authz.state, iss: baseUrl() }), 303);
}
