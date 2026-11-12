import { getDatabaseProvider } from "@/infrastructure/database/factory";
import type { PaymentRepository } from "./repository.contract";
import { PostgreSqlPaymentRepository } from "./repository.postgresql";

export class PaymentRepositoryFactory {
  static create(): PaymentRepository {
    return new PostgreSqlPaymentRepository(getDatabaseProvider().client);
  }
}
