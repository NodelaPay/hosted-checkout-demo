"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ensureGuestSession } from "@/infrastructure/http/client-session";

const ordersResponseSchema = z.object({
  orders: z.array(
    z.object({
      id: z.uuid(),
      status: z.enum(["pending_payment", "paid"]),
      total: z.number(),
      createdAt: z.string(),
      items: z.array(z.object({ name: z.string(), quantity: z.number() })),
    }),
  ),
});

type OrderSummary = z.infer<typeof ordersResponseSchema>["orders"][number];

export function OrdersView() {
  const [orders, setOrders] = useState<readonly OrderSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void ensureGuestSession()
      .then(() => fetch("/api/orders", { cache: "no-store" }))
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load orders");
        const data = ordersResponseSchema.parse(await response.json());
        setOrders(data.orders);
      })
      .catch(() => setError("Could not load your orders right now."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mx-auto max-w-[1120px] px-4 pb-24 lg:px-0">
      <h2 className="text-3xl font-light tracking-[-0.04em]">Your orders</h2>
      {loading && <p className="mt-6 text-sm text-[#777]">Loading orders…</p>}
      {error && (
        <p role="alert" className="mt-6 text-sm text-red-700">
          {error}
        </p>
      )}
      {!loading && !error && orders.length === 0 && (
        <div className="mt-6 rounded-2xl bg-[#f6f6f6] p-8">
          <Package size={30} strokeWidth={1.5} />
          <p className="mt-5 text-sm leading-7 text-[#666]">
            No orders yet. Find something you like and check out.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-block text-sm font-semibold underline"
          >
            Browse products
          </Link>
        </div>
      )}
      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-2xl border border-[#e4e4e4] p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">Order {order.id.slice(0, 8)}</p>
                <p className="mt-1 text-xs text-[#777]">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className="rounded-full bg-[#f6f6f6] px-3 py-2 text-xs">
                {order.status === "paid" ? "Paid" : "Pending payment"}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#666]">
              {order.items
                .map((item) => `${item.name} × ${item.quantity}`)
                .join(", ")}
            </p>
            <p className="mt-4 font-semibold">Total ${order.total}</p>
            {order.status === "pending_payment" && (
              <Link
                href={`/checkout/return?orderId=${order.id}`}
                className="mt-4 inline-block text-sm font-semibold underline"
              >
                Check payment status
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
