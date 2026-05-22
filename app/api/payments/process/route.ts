import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requests, request_stages } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { markPaymentApproved } from "@/lib/dashboard-data";
import { isAdminEmail } from "@/lib/admin-helpers";

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { requestId, stageId, formData } = body;

  if (!requestId || !formData)
    return NextResponse.json({ error: "requestId and formData required" }, { status: 400 });

  const [request] = await db
    .select()
    .from(requests)
    .where(eq(requests.id, requestId));

  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  const isAdmin = isAdminEmail(session.user.email) || (session.user as { isAdmin?: boolean }).isAdmin === true;
  if (!isAdmin && request.user_id !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Idempotência
  if (stageId) {
    const [stage] = await db
      .select()
      .from(request_stages)
      .where(and(eq(request_stages.id, stageId), eq(request_stages.request_id, requestId)));
    if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    if (stage.status === "paid") return NextResponse.json({ status: "approved", alreadyApproved: true });
  } else if (request.paid_at || request.status === "approved") {
    return NextResponse.json({ status: "approved", alreadyApproved: true });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const isPublicUrl = !appUrl.includes("localhost") && !appUrl.includes("127.0.0.1");
  const externalReference = stageId ? `${requestId}:${stageId}` : requestId;

  const payment = new Payment(mp);
  const paymentData = await payment.create({
    body: {
      ...formData,
      external_reference: externalReference,
      ...(isPublicUrl && {
        notification_url: `${appUrl}/api/payments/webhook`,
      }),
    },
  });

  const status = paymentData.status;
  const paymentId = String(paymentData.id);

  if (status === "approved") {
    await markPaymentApproved(externalReference, paymentId);
  } else if (status === "pending" || status === "in_process") {
    if (stageId) {
      await db
        .update(request_stages)
        .set({ mp_payment_id: paymentId, updated_at: new Date().toISOString() })
        .where(eq(request_stages.id, stageId));
    } else {
      await db
        .update(requests)
        .set({ mp_payment_id: paymentId, updated_at: new Date().toISOString() })
        .where(eq(requests.id, requestId));
    }
  }

  return NextResponse.json({
    status,
    paymentId,
    statusDetail: paymentData.status_detail,
  });
}
