"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { ensureGuestSession } from "@/infrastructure/http/client-session";

const responseSchema = z.object({
  payment: z.object({
    status: z.enum([
      "creating",
      "failed",
      "pending",
      "paid",
      "cancelled",
      "expired",
    ]),
    checkoutUrl: z.url().nullable(),
  }),
});

type PaymentState = z.infer<typeof responseSchema>["payment"];

export function PaymentResultView({
  orderId,
  cancelled,
}: {
  readonly orderId: string | null;
  readonly cancelled: boolean;
}) {
  const [payment, setPayment] = useState<PaymentState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState({ name: "", email: "" });
  const [retrying, setRetrying] = useState(false);

  const refresh = useCallback(async (): Promise<void> => {
    if (!orderId) return;
    setLoading(true);
    setError(null);

    try {
      await ensureGuestSession();
      const response = await fetch(`/api/payments/${orderId}`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Payment could not be verified");
      const result = responseSchema.parse(await response.json());
      setPayment(result.payment);
      sessionStorage.removeItem("checkout-payment-key");
    } catch {
      setError("We could not verify this payment. Please check again.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    queueMicrotask(() => void refresh());
  }, [refresh]);

  async function retry(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!orderId) return;
    setRetrying(true);
    setError(null);

    try {
      const input = z
        .object({ name: z.string().trim().min(1), email: z.email() })
        .parse(customer);
      const response = await fetch(`/api/payments/${orderId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const issue = z.object({ error: z.string() }).safeParse(body);
        throw new Error(
          issue.success ? issue.data.error : "Could not retry payment",
        );
      }

      const result = responseSchema.parse(body);
      if (!result.payment.checkoutUrl) {
        throw new Error("Nodela did not provide a checkout URL");
      }
      window.location.assign(result.payment.checkoutUrl);
    } catch (cause) {
      setError(
        cause instanceof z.ZodError
          ? "Enter your name and a valid email address."
          : cause instanceof Error
            ? cause.message
            : "Could not retry payment",
      );
      setRetrying(false);
    }
  }

  const paid = payment?.status === "paid";
  const failed = payment?.status === "failed";
  const stopped =
    payment?.status === "cancelled" || payment?.status === "expired";
  const Icon = paid ? CheckCircle2 : stopped || cancelled ? XCircle : Clock3;

  return (
    <main className="mx-auto flex min-h-[620px] max-w-[720px] flex-col items-center justify-center px-4 py-20 text-center">
      <Icon size={56} strokeWidth={1.3} />
      <h1 className="mt-7 text-4xl font-light tracking-[-0.05em]">
        {paid
          ? "Payment confirmed"
          : failed
            ? "Payment setup needs another try"
            : stopped || cancelled
              ? "Checkout was cancelled"
              : "Checking your payment"}
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-7 text-[#666]">
        {paid
          ? "Nodela confirmed your payment. Your order is now paid."
          : failed
            ? "The payment request did not complete. Retry this saved order below."
            : stopped || cancelled
              ? "Your order remains pending. You can check its status or return to your orders."
              : "Crypto payments can take a moment to settle. We will confirm your order after Nodela verifies it."}
      </p>
      {orderId && (
        <p className="mt-3 text-xs text-[#777]">Order {orderId.slice(0, 8)}</p>
      )}
      {loading && <p className="mt-5 text-sm text-[#777]">Verifying…</p>}
      {error && (
        <p role="alert" className="mt-5 text-sm text-red-700">
          {error}
        </p>
      )}
      {!orderId && (
        <p role="alert" className="mt-5 text-sm text-red-700">
          This payment link is missing its order reference.
        </p>
      )}
      {failed && (
        <form
          onSubmit={(event) => void retry(event)}
          className="mt-7 grid w-full max-w-md gap-3 text-left"
        >
          <label className="grid gap-1 text-sm">
            Full name
            <input
              required
              autoComplete="name"
              value={customer.name}
              onChange={(event) =>
                setCustomer({ ...customer, name: event.target.value })
              }
              className="h-12 rounded-md border border-[#ddd] px-4"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Email address
            <input
              required
              type="email"
              autoComplete="email"
              value={customer.email}
              onChange={(event) =>
                setCustomer({ ...customer, email: event.target.value })
              }
              className="h-12 rounded-md border border-[#ddd] px-4"
            />
          </label>
          <button
            type="submit"
            disabled={retrying}
            className="mt-2 rounded-md bg-black px-6 py-3 text-sm text-white disabled:opacity-50"
          >
            {retrying ? "Preparing checkout…" : "Retry payment"}
          </button>
        </form>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {orderId && !paid && !failed && (
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="rounded-md border border-black px-6 py-3 text-sm disabled:opacity-50"
          >
            Check again
          </button>
        )}
        {payment?.checkoutUrl && !paid && !stopped && (
          <a
            href={payment.checkoutUrl}
            className="rounded-md bg-black px-6 py-3 text-sm text-white"
          >
            Return to Nodela
          </a>
        )}
        <Link
          href="/account"
          className="rounded-md border border-black px-6 py-3 text-sm"
        >
          View orders
        </Link>
      </div>
    </main>
  );
}
