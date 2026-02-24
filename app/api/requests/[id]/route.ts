import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";

async function verifyToken(token: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = auth.slice(7);
  const user = await verifyToken(token);
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const supabase = createServerSupabase();
  const body = await req.json();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const isAdmin = (profileData as { is_admin?: boolean } | null)?.is_admin === true;
  const hasAdminSecret = body.admin_secret === process.env.DASHBOARD_ADMIN_SECRET;

  if (isAdmin || hasAdminSecret) {
    // Admin actions: quote, mark in_progress, deliver
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { admin_secret: _adminSecret, ...updates } = body;
    const patch: Record<string, unknown> = { ...updates };
    if (updates.status === "quoted") patch.quoted_at = new Date().toISOString();
    if (updates.status === "delivered") patch.delivered_at = new Date().toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("requests")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: (error as { message: string }).message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Client actions: approve or reject
  const { data: existing } = await supabase
    .from("requests")
    .select("user_id, status")
    .eq("id", id)
    .single();

  if (!existing || existing.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (existing.status !== "quoted") {
    return NextResponse.json({ error: "Can only respond to quoted requests" }, { status: 400 });
  }

  const allowedStatuses = ["approved", "rejected"];
  if (!allowedStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const patch: Record<string, unknown> = { status: body.status };
  if (body.client_notes) patch.client_notes = body.client_notes;
  if (body.status === "approved") patch.approved_at = new Date().toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("requests")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: (error as { message: string }).message }, { status: 500 });
  return NextResponse.json(data);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = auth.slice(7);
  const user = await verifyToken(token);
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("requests")
    .select("*, profiles(id, full_name, email, avatar_url, company), request_comments(*, profiles(id, full_name, avatar_url, is_admin))")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  const isOwner = data.user_id === user.id;
  const { data: profileRow } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  const isAdmin = (profileRow as { is_admin?: boolean } | null)?.is_admin;

  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(data);
}
