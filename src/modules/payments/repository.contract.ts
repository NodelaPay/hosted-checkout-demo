import type { NewPayment } from "./payment.entity";
import type { PaymentDto } from "./payment.dto";

export interface PaymentRecord extends PaymentDto {
  readonly id: string;
  readonly guestId: string;
  readonly reference: string;
}

export interface PaymentRepository {
  claim(input: NewPayment): Promise<PaymentRecord>;
  getByOrder(orderId: string): Promise<PaymentRecord | undefined>;
  getByInvoice(invoiceId: string): Promise<PaymentRecord | undefined>;
  setInvoice(
    id: string,
    invoiceId: string,
    checkoutUrl: string,
  ): Promise<PaymentRecord>;
  setStatus(id: string, status: PaymentDto["status"]): Promise<void>;
  retryFailed(id: string): Promise<boolean>;
}
