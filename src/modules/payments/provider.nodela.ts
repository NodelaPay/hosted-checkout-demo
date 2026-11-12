import { z } from "zod";
import { ApiError } from "@/infrastructure/http/api-error";
import type {
  CreateInvoiceInput,
  CreatedInvoice,
  PaymentProvider,
  VerifiedInvoice,
} from "./provider.contract";

const createResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    invoice_id: z.string().min(1),
    checkout_url: z.url(),
    original_amount: z.number().positive(),
    original_currency: z.literal("USD"),
  }),
});

const verifyResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    invoice_id: z.string().min(1),
    reference: z.string().min(1),
    original_amount: z.number().positive(),
    original_currency: z.string().min(1),
    status: z.enum(["pending", "paid", "cancelled", "expired"]),
    paid: z.boolean(),
  }),
});

const checkoutHosts = new Set(["checkout.nodela.co", "pay.nodela.co"]);
const sensitiveField =
  /(secret|api.?key|token|signature|email|name|address|cookie|authorization)/i;

function safeLogValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(safeLogValue);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      if (sensitiveField.test(key)) return [key, "[redacted]"];
      if (key === "checkout_url" && typeof entry === "string") {
        try {
          const url = new URL(entry);
          for (const name of url.searchParams.keys()) {
            if (sensitiveField.test(name))
              url.searchParams.set(name, "[redacted]");
          }
          return [key, url.toString()];
        } catch {
          return [key, "[invalid URL]"];
        }
      }
      return [key, safeLogValue(entry)];
    }),
  );
}

export class NodelaPaymentProvider implements PaymentProvider {
  constructor(
    private readonly apiKey: string,
    private readonly apiUrl: string,
    private readonly appBaseUrl: string,
    private readonly includeWebhook: boolean,
    private readonly debug = false,
  ) {}

  async createInvoice(input: CreateInvoiceInput): Promise<CreatedInvoice> {
    const successUrl = new URL("/checkout/return", this.appBaseUrl);
    successUrl.searchParams.set("orderId", input.orderId);
    const cancelUrl = new URL("/checkout/cancel", this.appBaseUrl);
    cancelUrl.searchParams.set("orderId", input.orderId);

    const body = {
      amount: input.amount,
      currency: "USD",
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
      ...(this.includeWebhook
        ? {
            webhook_url: new URL(
              "/api/payments/webhook",
              this.appBaseUrl,
            ).toString(),
          }
        : {}),
      reference: input.reference,
      customer: input.customer,
      title: "Cyber Store purchase",
      description: `Order ${input.orderId}`,
      fee_payer: "customer",
    };

    const response = await this.request("/v1/invoices", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const parsed = createResponseSchema.safeParse(response);
    if (!parsed.success) {
      throw new ApiError(502, "Nodela returned an invalid invoice response");
    }

    const checkoutUrl = new URL(parsed.data.data.checkout_url);
    if (
      checkoutUrl.protocol !== "https:" ||
      !checkoutHosts.has(checkoutUrl.hostname) ||
      checkoutUrl.username ||
      checkoutUrl.password ||
      checkoutUrl.port ||
      checkoutUrl.searchParams.get("invoice_id") !== parsed.data.data.invoice_id
    ) {
      throw new ApiError(502, "Nodela returned an invalid checkout URL");
    }

    return {
      invoiceId: parsed.data.data.invoice_id,
      checkoutUrl: checkoutUrl.toString(),
      reference: input.reference,
      amount: parsed.data.data.original_amount,
      currency: parsed.data.data.original_currency,
    };
  }

  async verifyInvoice(invoiceId: string): Promise<VerifiedInvoice> {
    const response = await this.request(
      `/v1/invoices/${encodeURIComponent(invoiceId)}/verify`,
      { method: "GET" },
    );
    const parsed = verifyResponseSchema.safeParse(response);
    if (!parsed.success) {
      throw new ApiError(
        502,
        "Nodela returned an invalid verification response",
      );
    }

    return {
      invoiceId: parsed.data.data.invoice_id,
      reference: parsed.data.data.reference,
      amount: parsed.data.data.original_amount,
      currency: parsed.data.data.original_currency,
      status: parsed.data.data.status,
      paid: parsed.data.data.paid,
    };
  }

  private async request(path: string, init: RequestInit): Promise<unknown> {
    let response: Response;

    if (this.debug) {
      const requestBody =
        typeof init.body === "string" ? JSON.parse(init.body) : undefined;
      console.info("Nodela request", {
        method: init.method,
        path,
        body: safeLogValue(requestBody),
      });
    }

    try {
      response = await fetch(new URL(path, this.apiUrl), {
        ...init,
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      if (this.debug) {
        console.info("Nodela transport error", {
          method: init.method,
          path,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
      throw new ApiError(502, "Nodela is temporarily unavailable");
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      if (this.debug) {
        console.info("Nodela response", {
          method: init.method,
          path,
          status: response.status,
          headers: safeLogValue(Object.fromEntries(response.headers)),
          body: "[non-JSON response]",
        });
      }
      throw new ApiError(502, "Nodela returned an invalid response");
    }

    if (this.debug) {
      console.info("Nodela response", {
        method: init.method,
        path,
        status: response.status,
        headers: safeLogValue(Object.fromEntries(response.headers)),
        body: safeLogValue(body),
      });
    }

    if (!response.ok) {
      if (response.status === 409) {
        throw new ApiError(
          409,
          "Nodela already has this invoice reference. Contact support with your order number.",
        );
      }
      throw new ApiError(
        response.status === 401 || response.status === 403 ? 503 : 502,
        "Nodela could not process the payment request",
      );
    }

    return body;
  }
}
