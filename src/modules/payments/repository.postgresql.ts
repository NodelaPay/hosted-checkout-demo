import { and, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { NewPayment } from "./payment.entity";
import { paymentsTable } from "./payment.table";
import type { PaymentRecord, PaymentRepository } from "./repository.contract";

function toRecord(row: typeof paymentsTable.$inferSelect): PaymentRecord {
  return {
    id: row.id,
    orderId: row.orderId,
    guestId: row.guestId,
    reference: row.reference,
    invoiceId: row.invoiceId,
    checkoutUrl: row.checkoutUrl,
    status: row.status,
  };
}

export class PostgreSqlPaymentRepository implements PaymentRepository {
  constructor(private readonly database: NodePgDatabase) {}

  async claim(input: NewPayment): Promise<PaymentRecord> {
    await this.database
      .insert(paymentsTable)
      .values(input)
      .onConflictDoNothing();
    const payment = await this.getByOrder(input.orderId);
    if (!payment) throw new Error("Payment record was not saved");
    return payment;
  }

  async getByOrder(orderId: string): Promise<PaymentRecord | undefined> {
    const [row] = await this.database
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.orderId, orderId))
      .limit(1);

    return row ? toRecord(row) : undefined;
  }

  async getByInvoice(invoiceId: string): Promise<PaymentRecord | undefined> {
    const [row] = await this.database
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.invoiceId, invoiceId))
      .limit(1);

    return row ? toRecord(row) : undefined;
  }

  async setInvoice(
    id: string,
    invoiceId: string,
    checkoutUrl: string,
  ): Promise<PaymentRecord> {
    const [row] = await this.database
      .update(paymentsTable)
      .set({ invoiceId, checkoutUrl, status: "pending" })
      .where(eq(paymentsTable.id, id))
      .returning();

    if (!row) throw new Error("Payment record was not found");
    return toRecord(row);
  }

  async setStatus(id: string, status: PaymentRecord["status"]): Promise<void> {
    await this.database
      .update(paymentsTable)
      .set({ status })
      .where(eq(paymentsTable.id, id));
  }

  async retryFailed(id: string): Promise<boolean> {
    const [row] = await this.database
      .update(paymentsTable)
      .set({ status: "creating" })
      .where(and(eq(paymentsTable.id, id), eq(paymentsTable.status, "failed")))
      .returning({ id: paymentsTable.id });

    return Boolean(row);
  }
}
