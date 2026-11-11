import type { OrderItemDto } from "./checkout.dto";
import type { OrderQuoteDto, shippingMethodSchema } from "./checkout.dto";
import type { z } from "zod";

export function calculateQuote(
  items: readonly OrderItemDto[],
  shippingMethod: z.infer<typeof shippingMethodSchema>,
  promoCode: string | null,
): OrderQuoteDto {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const discount = promoCode === "CYBER10" ? Math.round(subtotal * 0.1) : 0;
  const tax = subtotal > 0 ? 50 : 0;
  const shipping = subtotal === 0 ? 0 : shippingMethod === "express" ? 9 : 0;

  return {
    subtotal,
    discount,
    tax,
    shipping,
    total: subtotal - discount + tax + shipping,
  };
}
