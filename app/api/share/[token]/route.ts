// Endpoint PÚBLICO (sem auth): GET por share_token.
// Retorna apenas a view sanitizada do orçamento.

import { NextResponse } from "next/server";
import { getPublicQuoteByToken, QuoteNotFoundError } from "@/lib/services/quotes";

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token || token.length < 8) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  try {
    const quote = await getPublicQuoteByToken(token);
    return NextResponse.json(quote, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    if (err instanceof QuoteNotFoundError) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }
    console.error("[share GET]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
