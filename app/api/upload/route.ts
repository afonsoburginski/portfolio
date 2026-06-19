import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isAdminEmail } from "@/lib/admin-helpers";
import { putObject, deleteObject, r2PublicUrl } from "@/lib/r2";

const R2_PUBLIC_URL = r2PublicUrl();
const USER_UPLOAD_FOLDERS = new Set(["requests", "comments"]);
const MAX_FILE_SIZE = 25 * 1024 * 1024;

function safeFileName(name: string) {
  const fallback = "arquivo";
  const cleaned = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
  return cleaned || fallback;
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) ?? "projects";
  const userIsAdmin =
    (session.user as { isAdmin?: boolean }).isAdmin === true ||
    isAdminEmail(session.user.email);

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }
  if (!userIsAdmin && !USER_UPLOAD_FOLDERS.has(folder)) {
    return Response.json({ error: "Folder not allowed" }, { status: 403 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return Response.json({ error: "Arquivo deve ter no máximo 25 MB" }, { status: 400 });
  }

  const originalName = safeFileName(file.name);
  const key = `${folder}/${crypto.randomUUID()}-${originalName}`;

  const body = Buffer.from(await file.arrayBuffer());
  await putObject(key, body, file.type, `inline; filename="${originalName}"`);

  return Response.json({
    url: `${R2_PUBLIC_URL}/${key}`,
    key,
    name: file.name,
    type: file.type,
    size: file.size,
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

  await deleteObject(key);

  return Response.json({ success: true });
}
