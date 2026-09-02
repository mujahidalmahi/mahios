// =========================================================
// MahiOS Security Subsystem: In-Memory Sliding Window Rate Limiter
// =========================================================

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory store for IP rate limiting
const ipRequestStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipRequestStore.entries()) {
      // Remove timestamps older than 1 hour
      const filtered = record.timestamps.filter((ts) => now - ts < 3600000);
      if (filtered.length === 0) {
        ipRequestStore.delete(ip);
      } else {
        record.timestamps = filtered;
      }
    }
  }, 300000);
}

export interface RateLimitConfig {
  maxRequests: number; // Max allowed requests in the window
  windowSeconds: number; // Window duration in seconds
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 30, windowSeconds: 60 }
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const cutoff = now - windowMs;

  let record = ipRequestStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    ipRequestStore.set(identifier, record);
  }

  // Filter timestamps to only those within the current sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > cutoff);

  if (record.timestamps.length >= config.maxRequests) {
    // Exceeded limit
    const oldestTimestamp = record.timestamps[0];
    const resetSeconds = Math.ceil((oldestTimestamp + windowMs - now) / 1000);

    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetSeconds: Math.max(1, resetSeconds),
    };
  }

  // Append current request
  record.timestamps.push(now);

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - record.timestamps.length,
    resetSeconds: config.windowSeconds,
  };
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return headers.get('x-real-ip') || '127.0.0.1';
}
