import { getDatabaseEnvironment } from "@/config/environment";

import { PostgreSqlProvider } from "./providers/postgresql.provider";

export class DatabaseProviderFactory {
  static create(): PostgreSqlProvider {
    const environment = getDatabaseEnvironment();

    switch (environment.DATABASE_PROVIDER) {
      case "postgresql":
        return new PostgreSqlProvider(environment.DATABASE_URL);
    }
  }
}

let provider: PostgreSqlProvider | undefined;

export function getDatabaseProvider(): PostgreSqlProvider {
  provider ??= DatabaseProviderFactory.create();
  return provider;
}
