import { z } from "zod";

export const addressInputSchema = z.object({
  label: z.string().trim().min(1).max(80),
  tag: z.string().trim().min(1).max(30),
  street: z.string().trim().min(4).max(200),
  city: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(5).max(30),
});

export const shippingMethodSchema = z.enum(["free", "express", "schedule"]);

export interface AddressDto extends z.infer<typeof addressInputSchema> {
  readonly id: string;
}

export interface CheckoutDraftDto {
  readonly addressId: string | null;
  readonly shippingMethod: z.infer<typeof shippingMethodSchema>;
  readonly promoCode: string | null;
  readonly scheduledDate: string | null;
}

export interface OrderItemDto {
  readonly productId: string;
  readonly name: string;
  readonly unitPrice: number;
  readonly quantity: number;
}

export interface OrderQuoteDto {
  readonly subtotal: number;
  readonly discount: number;
  readonly tax: number;
  readonly shipping: number;
  readonly total: number;
}

export interface OrderDto {
  readonly id: string;
  readonly status: "pending_payment" | "paid";
  readonly address: AddressDto;
  readonly items: readonly OrderItemDto[];
  readonly shippingMethod: z.infer<typeof shippingMethodSchema>;
  readonly subtotal: number;
  readonly discount: number;
  readonly tax: number;
  readonly shipping: number;
  readonly total: number;
  readonly promoCode: string | null;
  readonly scheduledDate: string | null;
  readonly createdAt: string;
}
