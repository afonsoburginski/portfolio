// Admin gera contrato de prestação de serviços com IA + PDF + anexo.
// POST /api/requests/:id/contract
//
// Autorização: somente admin (não delegamos a clientes pelo custo + risco
// de prompt-injection vinda do próprio request.description).

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin-helpers";
import { ContractGenerationError, generateContractForRequest } from "@/lib/services/contracts";

export const maxDuration = 60;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin =
    isAdminEmail(session.user.email) || (session.user as { isAdmin?: boolean }).isAdmin === true;
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const result = await generateContractForRequest(id);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ContractGenerationError) {
      console.error(`[contract POST ${id}] step=${err.step}:`, err.message);
      return NextResponse.json(
        { error: err.message, step: err.step },
        { status: err.step === "load" ? 404 : 502 },
      );
    }
    console.error("[contract POST]", err);
    return NextResponse.json({ error: "Failed to generate contract" }, { status: 500 });
  }
}
