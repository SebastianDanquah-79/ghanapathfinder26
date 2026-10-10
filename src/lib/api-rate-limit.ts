/**
 * Best-effort per-instance rate limiting for public AI endpoints.
 *
 * This is intentionally a first layer, not a distributed quota system:
 * serverless instances do not share memory. For stronger enforcement, put
 * requests behind a shared durable limiter before scaling paid AI traffic.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

function clientKey(request: Request) {
  // Vercel supplies x-forwarded-for. Use the last hop to reduce spoofing
  // through a client-supplied leading value.
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",").map((value) => value.trim()).filter(Boolean).at(-1)
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
  return ip.slice(0, 100);
}

export function checkApiRateLimit(request: Request, namespace: string, limit: number, windowMs: number) {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  if (buckets.size >= MAX_BUCKETS) {
    const oldest = buckets.keys().next().value;
    if (oldest) buckets.delete(oldest);
  }

  const key = `${namespace}:${clientKey(request)}`;
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }
  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }
  current.count += 1;
  return { allowed: true, remaining: limit - current.count, retryAfterSeconds: 0 };
}

export async function readJsonBody(request: Request, maxBytes: number): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new Error("BODY_TOO_LARGE");
  }
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) {
    throw new Error("BODY_TOO_LARGE");
  }
  return JSON.parse(raw) as unknown;
}

export function rateLimitResponse(retryAfterSeconds: number) {
  return Response.json(
    { error: "Too many requests. Please wait a moment and try again." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
        "Cache-Control": "no-store",
      },
    },
  );
}
