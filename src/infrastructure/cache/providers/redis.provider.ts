import { getRedisClient } from "@/infrastructure/redis/client";

import type { CacheProvider } from "../contract";

export class RedisCacheProvider implements CacheProvider {
  async get(key: string): Promise<string | null> {
    return (await getRedisClient()).get(key);
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (!Number.isInteger(ttlSeconds) || ttlSeconds < 1) {
      throw new RangeError("ttlSeconds must be a positive integer");
    }
    await (await getRedisClient()).set(key, value, { EX: ttlSeconds });
  }

  async delete(key: string): Promise<void> {
    await (await getRedisClient()).del(key);
  }
}
