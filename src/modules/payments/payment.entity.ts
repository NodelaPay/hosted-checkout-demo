import { randomUUID } from "node:crypto";

export interface NewPayment {
  readonly id: string;
  readonly orderId: string;
  readonly guestId: string;
  readonly reference: string;
}

export class Payment {
  private constructor(private readonly record: NewPayment) {}

  static forOrder(orderId: string, guestId: string): Payment {
    const id = randomUUID();

    return new Payment({
      id,
      orderId,
      guestId,
      reference: `order-${orderId}-${id}`,
    });
  }

  toRecord(): NewPayment {
    return this.record;
  }
}
