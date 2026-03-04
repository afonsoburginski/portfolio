// Sync helpers that can be imported from both server and client code.
// Do NOT add "use server" here.

export const ADMIN_EMAIL = "afonsoburginski@gmail.com";

export const isAdminEmail = (email?: string | null) => email === ADMIN_EMAIL;

export function isAdmin(u: { email?: string | null; isAdmin?: boolean } | null) {
  if (!u) return false;
  return u.isAdmin === true || isAdminEmail(u.email);
}
