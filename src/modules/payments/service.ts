import { ApiError } from "@/infrastructure/http/api-error";
import type { OrderDto } from "@/modules/checkout/checkout.dto";
import type { CheckoutServiceContract } from "@/modules/checkout/service";
import { checkoutService } from "@/modules/checkout/service";
import { DomainError } from "@/shared/domain-error";
import type { PaymentCustomerDto, PaymentDto } from "./payment.dto";
import { Payment } from "./payment.entity";
import { PaymentProviderFactory } from "./provider.factory";
import type { PaymentProvider } from "./provider.contract";
import type { PaymentRecord, PaymentRepository } from "./repository.contract";
import { PaymentRepositoryFactory } from "./repository.factory";

export interface PaymentServiceContract {
  start(
    guestId: string,
    idempotencyKey: string,
    customer: PaymentCustomerDto,
  ): Promise<PaymentDto>;
  retryForGuest(
    guestId: string,
    orderId: string,
    customer: PaymentCustomerDto,
  ): Promise<PaymentDto>;
  verifyForGuest(guestId: string, orderId: string): Promise<PaymentDto>;
  verifyForWebhook(invoiceId: string): Promise<void>;
}

function toDto(payment: PaymentRecord): PaymentDto {
  return {
    orderId: payment.orderId,
    invoiceId: payment.invoiceId,
    checkoutUrl: payment.checkoutUrl,
    status: payment.status,
  };
}

export class PaymentService implements PaymentServiceContract {
  constructor(
    private readonly repository: PaymentRepository,
    private readonly checkout: Pick<
      CheckoutServiceContract,
      "createOrder" | "getOrder" | "markOrderPaid"
    >,
    private readonly providerFactory: () => PaymentProvider,
  ) {}

  async start(
    guestId: string,
    idempotencyKey: string,
    customer: PaymentCustomerDto,
  ): Promise<PaymentDto> {
    const provider = this.providerFactory();
    const order = await this.checkout.createOrder(guestId, idempotencyKey);
    return this.startForOrder(guestId, order, customer, provider);
  }

  async retryForGuest(
    guestId: string,
    orderId: string,
    customer: PaymentCustomerDto,
  ): Promise<PaymentDto> {
    const provider = this.providerFactory();
    const order = await this.checkout.getOrder(guestId, orderId);
    if (!order) throw new DomainError("not_found", "Order not found");
    return this.startForOrder(guestId, order, customer, provider);
  }

  private async startForOrder(
    guestId: string,
    order: OrderDto,
    customer: PaymentCustomerDto,
    provider: PaymentProvider,
  ): Promise<PaymentDto> {
    if (order.status === "paid") {
      const existing = await this.repository.getByOrder(order.id);
      if (!existing)
        throw new DomainError("conflict", "Paid order has no payment record");
      return toDto(existing);
    }

    const candidate = Payment.forOrder(order.id, guestId).toRecord();
    const payment = await this.repository.claim(candidate);
    if (payment.status === "cancelled" || payment.status === "expired") {
      throw new DomainError("conflict", "This invoice is no longer active");
    }
    if (payment.status === "pending" || payment.status === "paid") {
      return toDto(payment);
    }

    const ownsCreation =
      payment.status === "failed"
        ? await this.repository.retryFailed(payment.id)
        : payment.id === candidate.id;
    if (!ownsCreation) {
      throw new DomainError(
        "conflict",
        "Payment creation is already in progress",
      );
    }

    try {
      const invoice = await provider.createInvoice({
        amount: order.total,
        reference: payment.reference,
        orderId: order.id,
        customer,
      });

      if (invoice.amount !== order.total || invoice.currency !== "USD") {
        throw new ApiError(502, "Nodela returned an unexpected invoice amount");
      }

      const saved = await this.repository.setInvoice(
        payment.id,
        invoice.invoiceId,
        invoice.checkoutUrl,
      );
      return toDto(saved);
    } catch (error) {
      await this.repository.setStatus(payment.id, "failed");
      throw error;
    }
  }

  async verifyForGuest(guestId: string, orderId: string): Promise<PaymentDto> {
    const order = await this.checkout.getOrder(guestId, orderId);
    if (!order) throw new DomainError("not_found", "Order not found");

    const payment = await this.repository.getByOrder(orderId);
    if (!payment || payment.guestId !== guestId) {
      throw new DomainError("not_found", "Payment not found");
    }

    if (order.status === "paid" && payment.status === "paid") {
      return toDto(payment);
    }

    if (!payment.invoiceId) return toDto(payment);

    return this.verify(payment, order.total);
  }

  async verifyForWebhook(invoiceId: string): Promise<void> {
    const payment = await this.repository.getByInvoice(invoiceId);
    if (!payment) throw new DomainError("not_found", "Payment not found");

    const order = await this.checkout.getOrder(
      payment.guestId,
      payment.orderId,
    );
    if (!order) throw new DomainError("not_found", "Order not found");

    await this.verify(payment, order.total);
  }

  private async verify(
    payment: PaymentRecord,
    expectedAmount: number,
  ): Promise<PaymentDto> {
    if (!payment.invoiceId) {
      throw new DomainError(
        "conflict",
        "Invoice creation is still in progress",
      );
    }

    const invoice = await this.providerFactory().verifyInvoice(
      payment.invoiceId,
    );
    if (
      invoice.invoiceId !== payment.invoiceId ||
      invoice.reference !== payment.reference ||
      invoice.amount !== expectedAmount ||
      invoice.currency !== "USD" ||
      invoice.paid !== (invoice.status === "paid")
    ) {
      throw new ApiError(502, "Nodela verification did not match this order");
    }

    if (payment.status === "paid" && !invoice.paid) {
      throw new ApiError(502, "Nodela returned a conflicting payment status");
    }

    if (invoice.paid) {
      await this.checkout.markOrderPaid(payment.orderId);
      await this.repository.setStatus(payment.id, "paid");
      return { ...toDto(payment), status: "paid" };
    }

    if (invoice.status === "cancelled" || invoice.status === "expired") {
      await this.repository.setStatus(payment.id, invoice.status);
      return { ...toDto(payment), status: invoice.status };
    }

    return {
      ...toDto(payment),
      status: payment.status === "paid" ? "paid" : "pending",
    };
  }
}

export const paymentService: PaymentServiceContract = new PaymentService(
  PaymentRepositoryFactory.create(),
  checkoutService,
  () => PaymentProviderFactory.create(),
);
