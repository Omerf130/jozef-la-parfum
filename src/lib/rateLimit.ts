import { NextResponse } from "next/server";

/**
 * Simple in-memory sliding-window rate limiter.
 * Per Vercel instance — resets on cold start. Good enough for basic abuse
 * prevention; upgrade to Upstash or Redis for distributed enforcement.
 */

interface Entry {
  timestamps: number[];
}

const stores = new Map<string, Map<string, Entry>>();

const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup(store: Map<string, Entry>, windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  const cutoff = now - windowMs;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

interface RateLimitConfig {
  /** Unique name for this limiter (e.g. "auth", "orders") */
  name: string;
  /** Max requests allowed in the window */
  max: number;
  /** Window size in seconds */
  windowSec: number;
}

export function createRateLimiter(config: RateLimitConfig) {
  const { name, max, windowSec } = config;
  const windowMs = windowSec * 1000;

  if (!stores.has(name)) {
    stores.set(name, new Map());
  }
  const store = stores.get(name)!;

  return {
    check(request: Request): { limited: boolean; response?: NextResponse } {
      const forwarded = request.headers.get("x-forwarded-for");
      const ip = forwarded?.split(",")[0]?.trim() || "unknown";

      cleanup(store, windowMs);

      const now = Date.now();
      const cutoff = now - windowMs;

      let entry = store.get(ip);
      if (!entry) {
        entry = { timestamps: [] };
        store.set(ip, entry);
      }

      entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

      if (entry.timestamps.length >= max) {
        return {
          limited: true,
          response: NextResponse.json(
            { error: "יותר מדי בקשות, נסו שוב בעוד דקה" },
            {
              status: 429,
              headers: {
                "Retry-After": String(windowSec),
              },
            },
          ),
        };
      }

      entry.timestamps.push(now);
      return { limited: false };
    },
  };
}
