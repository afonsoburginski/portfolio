"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function trackablePath(path: string) {
  return !(
    path.startsWith("/dashboard") ||
    path.startsWith("/api/") ||
    path.startsWith("/oauth/") ||
    path.startsWith("/_next/") ||
    path === "/robots.txt" ||
    path === "/sitemap.xml"
  );
}

function externalReferrer() {
  try {
    const referrer = new URL(document.referrer);
    if (referrer.hostname === window.location.hostname) return "internal";
    return referrer.hostname.replace(/^www\./, "").slice(0, 253) || "direct";
  } catch {
    return "direct";
  }
}

export function PageviewTracker() {
  const pathname = usePathname();
  const firstPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || !trackablePath(pathname)) return;
    if (!firstPath.current) firstPath.current = pathname;

    void fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer: pathname === firstPath.current ? externalReferrer() : "internal" }),
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
