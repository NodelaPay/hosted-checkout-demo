import { createClient } from "redis";

import { getRedisEnvironment } from "@/config/environment";

let client: ReturnType<typeof createClient> | undefined;
let connection: Promise<ReturnType<typeof createClient>> | undefined;

export function getRedisClient(): Promise<ReturnType<typeof createClient>> {
  if (!connection) {
    const activeClient = createClient({ url: getRedisEnvironment().REDIS_URL });
    activeClient.on("error", (error: Error) => {
      console.error("Redis connection error", error);
    });
    client = activeClient;
    connection = activeClient
      .connect()
      .then(() => activeClient)
      .catch((error: unknown) => {
        connection = undefined;
        throw error;
      });
  }

  return connection;
}

export async function closeRedisClient(): Promise<void> {
  if (client?.isOpen) {
    await client.close();
  }
  client = undefined;
  connection = undefined;
}
