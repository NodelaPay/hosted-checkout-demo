import { getPaymentEnvironment } from "@/config/environment";
import { ApiError } from "@/infrastructure/http/api-error";
import type { PaymentProvider } from "./provider.contract";
import { NodelaPaymentProvider } from "./provider.nodela";

export class PaymentProviderFactory {
  static create(): PaymentProvider {
    let environment;
    try {
      environment = getPaymentEnvironment();
    } catch {
      throw new ApiError(503, "Payment provider is not configured");
    }

    return new NodelaPaymentProvider(
      environment.NODELA_API_KEY,
      environment.NODELA_API_URL,
      environment.APP_BASE_URL,
      Boolean(environment.NODELA_WEBHOOK_SECRET),
      environment.NODELA_DEBUG === "true",
    );
  }
}
