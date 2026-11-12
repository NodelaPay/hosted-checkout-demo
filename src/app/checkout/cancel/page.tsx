import { z } from "zod";
import { PaymentResultView } from "@/modules/payments/payment-result-view";

export default async function PaymentCancelPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const parsed = z.uuid().safeParse(orderId);
  return (
    <PaymentResultView
      orderId={parsed.success ? parsed.data : null}
      cancelled
    />
  );
}
