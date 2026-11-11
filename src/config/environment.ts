import { z } from "zod";

const databaseSchema = z.object({
  DATABASE_URL: z.url().startsWith("postgresql://"),
  DATABASE_PROVIDER: z.literal("postgresql").default("postgresql"),
});

const redisSchema = z.object({
  REDIS_URL: z
    .url()
    .refine(
      (value) => value.startsWith("redis://") || value.startsWith("rediss://"),
    ),
  CACHE_PROVIDER: z.literal("redis").default("redis"),
  RATE_LIMIT_PROVIDER: z.literal("redis").default("redis"),
});

const sessionSchema = z.object({
  SESSION_SECRET: z.string().min(32),
});

export type DatabaseEnvironment = z.infer<typeof databaseSchema>;
export type RedisEnvironment = z.infer<typeof redisSchema>;
export type SessionEnvironment = z.infer<typeof sessionSchema>;

export function getDatabaseEnvironment(): DatabaseEnvironment {
  return databaseSchema.parse(process.env);
}

export function getRedisEnvironment(): RedisEnvironment {
  return redisSchema.parse(process.env);
}

export function getSessionEnvironment(): SessionEnvironment {
  return sessionSchema.parse(process.env);
}
