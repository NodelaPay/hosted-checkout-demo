import type { PaymentCustomerDto } from "./payment.dto";

export interface CreateInvoiceInput {
  readonly amount: number;
  readonly reference: string;
  readonly orderId: string;
  readonly customer: PaymentCustomerDto;
}

export interface CreatedInvoice {
  readonly invoiceId: string;
  readonly checkoutUrl: string;
  readonly reference: string;
  readonly amount: number;
  readonly currency: "USD";
}

export interface VerifiedInvoice {
  readonly invoiceId: string;
  readonly reference: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: "pending" | "paid" | "cancelled" | "expired";
  readonly paid: boolean;
}

export interface PaymentProvider {
  createInvoice(input: CreateInvoiceInput): Promise<CreatedInvoice>;
  verifyInvoice(invoiceId: string): Promise<VerifiedInvoice>;
}
