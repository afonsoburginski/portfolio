import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { request_comments, user } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function fetchComments(requestId: string) {
  const rows = await db
    .select({ comment: request_comments, user })
    .from(request_comments)
    .leftJoin(user, eq(request_comments.user_id, user.id))
    .where(eq(request_comments.request_id, requestId))
    .orderBy(request_comments.created_at);
  return rows.map((r) => ({ ...r.comment, user: r.user }));
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const requestId = req.nextUrl.searchParams.get("requestId");
  if (!requestId) return new Response("requestId required", { status: 400 });

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      // Envia estado inicial imediatamente
      try {
        const initial = await fetchComments(requestId);
        send(initial);
      } catch {
        send([]);
      }

      let lastCount = -1;
      let lastLatestId = "";

      // Poll interno a cada 4s — só envia evento se houver mudança
      const interval = setInterval(async () => {
        if (closed) {
          clearInterval(interval);
          return;
        }
        try {
          const comments = await fetchComments(requestId);
          const count = comments.length;
          const latestId = comments.at(-1)?.id ?? "";

          if (count !== lastCount || latestId !== lastLatestId) {
            lastCount = count;
            lastLatestId = latestId;
            send(comments);
          }
        } catch {
          // ignore transient errors
        }
      }, 4_000);

      // Limpa quando o cliente desconectar
      req.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(interval);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
