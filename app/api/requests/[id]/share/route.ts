// Admin/Owner: gera ou revoga o token público de um orçamento.
//
// POST   /api/requests/:id/share          → gera (ou retorna o existente)
// POST   /api/requests/:id/share?rotate=1 → força novo token (invalida o anterior)
// DELETE /api/requests/:id/share          → revoga o link público
// GET    /api/requests/:id/share          → devolve o link atual (se houver)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin-helpers";
import { findRequestById } from "@/lib/repos/quotes";
import {
  buildPublicQuoteUrl,
  ensureShareToken,
  QuoteNotFoundError,
  revokeShareToken,
  rotateShareToken,
} from "@/lib/services/quotes";

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function authorize(req: NextRequest, requestId: string) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const target = await findRequestById(requestId);
  if (!target) return { error: NextResponse.json({ error: "Request not found" }, { status: 404 }) };

  const isAdmin =
    isAdminEmail(session.user.email) || (session.user as { isAdmin?: boolean }).isAdmin === true;
  if (!isAdmin && target.user_id !== session.user.id) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session, target };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorize(req, id);
  if ("error" in auth) return auth.error;

  if (!auth.target.share_token) {
    return NextResponse.json({ token: null, url: null });
  }
  return NextResponse.json({
    token: auth.target.share_token,
    url: buildPublicQuoteUrl(auth.target.share_token, getAppUrl()),
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await authorize(req, id);
  if ("error" in authResult) return authResult.error;

  const rotate = req.nextUrl.searchParams.get("rotate") === "1";

  try {
    const token = rotate ? await rotateShareToken(id) : await ensureShareToken(id);
    return NextResponse.json({
      token,
      url: buildPublicQuoteUrl(token, getAppUrl()),
      rotated: rotate,
    });
  } catch (err) {
    if (err instanceof QuoteNotFoundError) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    console.error("[share POST]", err);
    return NextResponse.json({ error: "Failed to generate share token" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await authorize(req, id);
  if ("error" in authResult) return authResult.error;

  try {
    await revokeShareToken(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof QuoteNotFoundError) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    console.error("[share DELETE]", err);
    return NextResponse.json({ error: "Failed to revoke share token" }, { status: 500 });
  }
}
