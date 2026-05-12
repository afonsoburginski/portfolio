import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isAdminEmail } from "@/lib/admin-helpers";

export const runtime = "edge";

const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "https://cdn.afonsodev.com";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !isAdminEmail(session.user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) ?? "projects";

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "png";
  const key = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { env } = getCloudflareContext({ async: false });

  await env.R2.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });

  return Response.json({
    url: `${R2_PUBLIC_URL}/${key}`,
    key,
  });
}

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !isAdminEmail(session.user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await req.json();
  if (!key) {
    return Response.json({ error: "No key provided" }, { status: 400 });
  }

  const { env } = getCloudflareContext({ async: false });
  await env.R2.delete(key);

  return Response.json({ success: true });
}
