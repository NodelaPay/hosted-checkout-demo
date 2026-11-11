import type { NextRequest } from "next/server";
import { ApiError } from "./api-error";
import { RateLimitProviderFactory } from "@/infrastructure/rate-limit/factory";

const provider = RateLimitProviderFactory.create();

export async function enforceRateLimit(
  request: NextRequest,
  action: string,
  limit: number,
  windowSeconds: number,
): Promise<void> {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0];
  const key = `${action}:${forwarded?.trim() || "local"}`;
  const result = await provider.consume(key, limit, windowSeconds);

  if (!result.allowed) {
    throw new ApiError(429, "Too many requests. Please try again later.", {
      "Retry-After": String(result.retryAfterSeconds),
    });
  }
}
