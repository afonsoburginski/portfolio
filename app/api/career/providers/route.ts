import { NextRequest, NextResponse } from "next/server";
import { getOwnerState } from "@/lib/owner";
import { jobProviders } from "@/lib/career/search";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const owner = await getOwnerState(request.headers);
  if (owner.state !== "owner") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ providers: jobProviders }, { headers: { "Cache-Control": "private, no-store" } });
}
