import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requests } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { markPaymentApproved } from "@/lib/dashboard-data";

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { requestId, formData } = body;

  if (!requestId || !formData)
    return NextResponse.json({ error: "requestId and formData required" }, { status: 400 });

  const [request] = await db
    .select()
    .from(requests)
    .where(eq(requests.id, requestId));

  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  if (request.status !== "quoted") return NextResponse.json({ error: "Request is not payable" }, { status: 400 });
  if (request.user_id !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const isPublicUrl = !appUrl.includes("localhost") && !appUrl.includes("127.0.0.1");

  const payment = new Payment(mp);
  const paymentData = await payment.create({
    body: {
      ...formData,
      external_reference: requestId,
      ...(isPublicUrl && {
        notification_url: `${appUrl}/api/payments/webhook`,
      }),
    },
  });

  const status = paymentData.status;
  const paymentId = String(paymentData.id);

  if (status === "approved") {
    await markPaymentApproved(requestId, paymentId);
  } else if (status === "pending" || status === "in_process") {
    await db
      .update(requests)
      .set({ mp_payment_id: paymentId, updated_at: new Date().toISOString() })
      .where(eq(requests.id, requestId));
  }

  return NextResponse.json({
    status,
    paymentId,
    statusDetail: paymentData.status_detail,
  });
}
