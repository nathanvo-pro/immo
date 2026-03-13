import { NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (works per server instance — for production, use Redis/Upstash)
const store = new Map<string, RateLimitEntry>();

// Clean old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  maxRequests: number;    // Max requests per window
  windowMs: number;       // Time window in milliseconds
}

export function rateLimit(config: RateLimitConfig = { maxRequests: 15, windowMs: 60 * 1000 }) {
  return function checkRateLimit(identifier: string): { success: boolean; remaining: number } {
    const now = Date.now();
    const entry = store.get(identifier);

    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      store.set(identifier, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return { success: true, remaining: config.maxRequests - 1 };
    }

    if (entry.count >= config.maxRequests) {
      return { success: false, remaining: 0 };
    }

    entry.count++;
    return { success: true, remaining: config.maxRequests - entry.count };
  };
}

// Pre-configured limiter for the chat API: 15 requests per minute per IP
export const chatRateLimiter = rateLimit({ maxRequests: 15, windowMs: 60 * 1000 });

export function getRateLimitResponse() {
  return NextResponse.json(
    { error: "Trop de requêtes. Veuillez patienter avant de réessayer." },
    { status: 429, headers: { "Retry-After": "60" } }
  );
}
