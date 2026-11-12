import { z } from "zod";

export const paymentCustomerSchema = z.object({
  email: z.email().max(254),
  name: z.string().trim().min(1).max(120),
});

export type PaymentCustomerDto = z.infer<typeof paymentCustomerSchema>;

export interface PaymentDto {
  readonly orderId: string;
  readonly invoiceId: string | null;
  readonly checkoutUrl: string | null;
  readonly status:
    "creating" | "failed" | "pending" | "paid" | "cancelled" | "expired";
}
