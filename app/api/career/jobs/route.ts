import { NextRequest, NextResponse } from "next/server";
import { getOwnerState } from "@/lib/owner";
import { searchCareerJobs } from "@/lib/career/search";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const owner = await getOwnerState(request.headers);
  if (owner.state !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const query = request.nextUrl.searchParams.get("query") || "";
  const limit = Number(request.nextUrl.searchParams.get("limit") || "30");
  if (!query.trim() || query.length > 100 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    return NextResponse.json({ error: "Invalid query or limit" }, { status: 400 });
  }
  try {
    return NextResponse.json(await searchCareerJobs(query, limit), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Unable to search jobs" }, { status: 502 });
  }
}
