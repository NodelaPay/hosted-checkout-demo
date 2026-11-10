import { getRedisClient } from "@/infrastructure/redis/client";

import type { RateLimitProvider, RateLimitResult } from "../contract";

const CONSUME_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
local ttl = redis.call('TTL', KEYS[1])
return {count, ttl}
`;

export class RedisRateLimitProvider implements RateLimitProvider {
  async consume(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult> {
    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      !Number.isInteger(windowSeconds) ||
      windowSeconds < 1
    ) {
      throw new RangeError("limit and windowSeconds must be positive integers");
    }

    const result = await (
      await getRedisClient()
    ).eval(CONSUME_SCRIPT, {
      keys: [`rate-limit:${key}`],
      arguments: [String(windowSeconds)],
    });
    if (!Array.isArray(result) || result.length !== 2) {
      throw new Error("Invalid Redis rate limit response");
    }
    const [rawCount, rawTtl] = result;
    const count = Number(rawCount);
    const ttl = Number(rawTtl);
    if (!Number.isInteger(count) || !Number.isInteger(ttl)) {
      throw new Error("Invalid Redis rate limit response");
    }

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds: count > limit ? Math.max(1, ttl) : 0,
    };
  }
}
