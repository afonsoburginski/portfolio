import { auth } from "@/lib/auth";

export type OwnerState =
  | { state: "none" }
  | { state: "forbidden"; email: string }
  | { state: "owner"; userId: string; email: string };

// The site has one owner: the verified account whose email equals OWNER_EMAIL.
export async function getOwnerState(headers: Headers): Promise<OwnerState> {
  const session = await auth.api.getSession({ headers });
  if (!session) return { state: "none" };
  const owner = process.env.OWNER_EMAIL?.trim().toLowerCase();
  const { email, emailVerified, id } = session.user;
  if (!owner || !emailVerified || email.toLowerCase() !== owner) return { state: "forbidden", email };
  return { state: "owner", userId: id, email };
}

// Same-site `next` targets only, so the login page cannot be used as an open redirect.
export function safeNext(value: string | null | undefined, fallback = "/"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}
