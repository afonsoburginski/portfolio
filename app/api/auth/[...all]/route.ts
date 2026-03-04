import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const handler = toNextJsHandler(auth);
const isDev = process.env.NODE_ENV === "development";

async function withErrorLog(
  req: NextRequest,
  method: "GET" | "POST",
  fn: (req: NextRequest) => Promise<Response>
) {
  try {
    return await fn(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[auth]", method, message, err);
    if (isDev) {
      return NextResponse.json(
        { error: "Auth failed", message },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return withErrorLog(req, "GET", (r) => handler.GET(r));
}

export async function POST(req: NextRequest) {
  return withErrorLog(req, "POST", (r) => handler.POST(r));
}
