// Fixed-window in-memory limiter. Single instance only, which fits this deployment.
export function createLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (key: string, now = Date.now()): boolean => {
    if (hits.size > 5_000) for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) { hits.set(key, { count: 1, resetAt: now + windowMs }); return true; }
    return ++entry.count <= limit;
  };
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "";
  return forwarded.split(",")[0].trim().slice(0, 64) || "unknown";
}
