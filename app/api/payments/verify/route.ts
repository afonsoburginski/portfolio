import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requests, request_stages } from "@/lib/schema";
import { and, eq } from "drizzle-orm";

// Webhook é a única fonte de verdade do estado de pagamento.
// Esta rota apenas LÊ o D1; o polling do front bate aqui a cada 5s
// e a webhook do MP que atualiza o D1 quando aprova.
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requestId = req.nextUrl.searchParams.get("requestId");
  const stageId = req.nextUrl.searchParams.get("stageId");
  if (!requestId) return NextResponse.json({ error: "requestId required" }, { status: 400 });

  if (stageId) {
    const [stage] = await db
      .select()
      .from(request_stages)
      .where(and(eq(request_stages.id, stageId), eq(request_stages.request_id, requestId)));
    if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    if (stage.status === "paid") return NextResponse.json({ status: "approved" });
    return NextResponse.json({ status: "pending" });
  }

  const [request] = await db
    .select()
    .from(requests)
    .where(eq(requests.id, requestId));
  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  if (request.paid_at || request.status === "approved") {
    return NextResponse.json({ status: "approved" });
  }
  return NextResponse.json({ status: request.status });
}
