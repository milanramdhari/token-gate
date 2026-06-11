const WINDOW_MS = 60_000; // 1 minute
const LIMIT = 10;

// key → timestamps of requests within the current window
const store = new Map<string, number[]>();

// Prune keys that have had no requests in the last window to prevent unbounded growth
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS;
  for (const [key, timestamps] of store) {
    if (timestamps.every((t) => t < cutoff)) {
      store.delete(key);
    }
  }
}, WINDOW_MS);

/**
 * Returns null if the request is allowed, or a { retryAfter } object (seconds
 * until the oldest request falls out of the window) if the limit is exceeded.
 */
export function checkRateLimit(key: string): { retryAfter: number } | null {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const timestamps = (store.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= LIMIT) {
    const oldest = Math.min(...timestamps);
    const retryAfter = Math.ceil((oldest + WINDOW_MS - now) / 1000);
    store.set(key, timestamps);
    return { retryAfter };
  }

  timestamps.push(now);
  store.set(key, timestamps);
  return null;
}
