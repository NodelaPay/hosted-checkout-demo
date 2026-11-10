import { getRedisEnvironment } from "@/config/environment";

import type { CacheProvider } from "./contract";
import { RedisCacheProvider } from "./providers/redis.provider";

export class CacheProviderFactory {
  static create(): CacheProvider {
    switch (getRedisEnvironment().CACHE_PROVIDER) {
      case "redis":
        return new RedisCacheProvider();
    }
  }
}
