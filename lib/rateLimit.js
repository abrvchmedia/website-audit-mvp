// In-memory rate limiter — 5 requests per minute per IP
// Note: resets per serverless instance; use Redis for strict global limiting
const store = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 5;

export function rateLimit(ip) {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const timestamps = (store.get(ip) || []).filter((t) => t > windowStart);

  if (timestamps.length >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  timestamps.push(now);
  store.set(ip, timestamps);
  return { allowed: true, remaining: MAX_REQUESTS - timestamps.length };
}
