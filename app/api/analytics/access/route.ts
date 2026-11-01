import { NextRequest, NextResponse } from "next/server";
import { getOwnerState } from "@/lib/owner";

export async function GET(request: NextRequest) {
  const owner = await getOwnerState(request.headers);
  return NextResponse.json({ allowed: owner.state === "owner" }, { headers: { "Cache-Control": "no-store" } });
}
