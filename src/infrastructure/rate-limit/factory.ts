import { getRedisEnvironment } from "@/config/environment";

import type { RateLimitProvider } from "./contract";
import { RedisRateLimitProvider } from "./providers/redis.provider";

export class RateLimitProviderFactory {
  static create(): RateLimitProvider {
    switch (getRedisEnvironment().RATE_LIMIT_PROVIDER) {
      case "redis":
        return new RedisRateLimitProvider();
    }
  }
}
