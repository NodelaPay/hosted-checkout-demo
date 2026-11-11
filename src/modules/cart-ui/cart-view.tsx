"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ensureGuestSession } from "@/infrastructure/http/client-session";
import type { ProductDto } from "@/modules/catalog/product.dto";
import type { OrderQuoteDto } from "@/modules/checkout/checkout.dto";
import { useCart } from "./cart-context";

const quoteResponseSchema = z.object({
  quote: z.object({
    subtotal: z.number(),
    discount: z.number(),
    tax: z.number(),
    shipping: z.number(),
    total: z.number(),
  }),
});

export function CartView({
  products,
}: {
  readonly products: readonly ProductDto[];
}) {
  const { items, update, remove, error, waitForSync } = useCart();
  const [promo, setPromo] = useState("");
  const [quote, setQuote] = useState<OrderQuoteDto | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  useEffect(() => {
    void ensureGuestSession()
      .then(() => fetch("/api/checkout", { cache: "no-store" }))
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load promotion");
        const data = z
          .object({
            draft: z.object({
              promoCode: z.string().nullable(),
            }),
          })
          .parse(await response.json());
        setPromo(data.draft.promoCode ?? "");
      })
      .catch(() => setPromoMessage("Could not load saved promotion."));
  }, []);

  useEffect(() => {
    let active = true;

    void waitForSync()
      .then(() => ensureGuestSession())
      .then(() => fetch("/api/checkout/quote", { cache: "no-store" }))
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load quote");
        const data = quoteResponseSchema.parse(await response.json());
        if (active) {
          setQuote(data.quote);
          setQuoteError(null);
        }
      })
      .catch(() => {
        if (active) setQuoteError("Could not calculate the total.");
      });

    return () => {
      active = false;
    };
  }, [items, waitForSync]);

  const lines = items.flatMap((item) => {
    const product = products.find(
      (candidate) => candidate.id === item.productId,
    );
    return product ? [{ product, quantity: item.quantity }] : [];
  });
  async function applyPromo(): Promise<void> {
    setPromoMessage(null);
    try {
      await ensureGuestSession();
      const promoCode = promo.trim().toUpperCase() || null;
      const response = await fetch("/api/checkout/promo", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ promoCode }),
      });
      if (!response.ok) throw new Error("Invalid or unavailable promo code");
      const data = quoteResponseSchema.parse(await response.json());
      setQuote(data.quote);
      setPromoMessage(
        promoCode ? `${promoCode} discount applied` : "Code removed",
      );
    } catch {
      setPromoMessage("The code could not be applied. Check it and try again.");
    }
  }

  return (
    <main className="mx-auto grid min-h-[1432px] max-w-[1120px] gap-12 px-4 pb-20 pt-16 md:min-h-[800px] md:grid-cols-[1.5fr_1fr] md:gap-12 lg:px-0">
      <section>
        <h1 className="mb-10 text-2xl font-semibold">Shopping Cart</h1>
        {error && (
          <p role="alert" className="mb-4 text-sm text-red-700">
            {error}
          </p>
        )}
        {lines.length === 0 ? (
          <div className="rounded-lg bg-[#f6f6f6] p-10 text-center">
            <p>Your cart is empty.</p>
            <Link
              href="/products"
              className="mt-5 inline-flex rounded bg-black px-6 py-3 text-white"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div>
            {lines.map(({ product, quantity }) => (
              <article
                key={product.id}
                className="flex min-h-[175px] items-center gap-4 border-b border-[#ddd] py-6"
              >
                <Link
                  href={`/products/${product.id}`}
                  className="relative h-24 w-24 shrink-0 md:h-28 md:w-28"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="112px"
                    className="object-contain"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${product.id}`}
                    className="line-clamp-2 text-sm font-semibold hover:underline"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-2 text-xs text-[#555]">#25139526913984</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        aria-label={`Decrease ${product.shortName} quantity`}
                        onClick={() => update(product.id, quantity - 1)}
                        disabled={quantity <= 1}
                        className="p-1 disabled:opacity-30"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="min-w-9 rounded border border-[#ddd] px-2 py-1 text-center text-sm">
                        {quantity}
                      </span>
                      <button
                        aria-label={`Increase ${product.shortName} quantity`}
                        onClick={() => update(product.id, quantity + 1)}
                        className="p-1"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <strong className="text-base">
                      ${product.price * quantity}
                    </strong>
                    <button
                      aria-label={`Remove ${product.shortName}`}
                      onClick={() => remove(product.id)}
                      className="p-1 text-[#666] hover:text-black"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <aside className="h-fit rounded-lg border border-[#ddd] p-5 md:p-10">
        <h2 className="mb-10 text-xl font-semibold">Order Summary</h2>
        <label className="text-sm text-[#555]">
          Discount code / Promo code
          <span className="mt-2 flex rounded border border-[#ddd]">
            <input
              value={promo}
              onChange={(event) => setPromo(event.target.value)}
              placeholder="Code"
              className="min-w-0 flex-1 px-4 py-3 outline-none"
            />
            <button
              type="button"
              onClick={() => void applyPromo()}
              className="m-1 rounded border border-black px-4 text-xs"
            >
              Apply
            </button>
          </span>
        </label>
        {promoMessage && (
          <p role="status" className="mt-2 text-xs text-[#555]">
            {promoMessage}
          </p>
        )}
        {quoteError && (
          <p role="alert" className="mt-2 text-xs text-red-700">
            {quoteError}
          </p>
        )}
        <div className="mt-8 space-y-4 text-sm">
          <div className="flex justify-between font-semibold">
            <span>Subtotal</span>
            <span>{quote ? `$${quote.subtotal}` : "—"}</span>
          </div>
          {quote && quote.discount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Discount</span>
              <span>-${quote.discount}</span>
            </div>
          )}
          <div className="flex justify-between text-[#666]">
            <span>Estimated Tax</span>
            <span>{quote ? `$${quote.tax}` : "—"}</span>
          </div>
          <div className="flex justify-between text-[#666]">
            <span>Estimated shipping &amp; Handling</span>
            <span>{quote ? `$${quote.shipping}` : "—"}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{quote ? `$${quote.total}` : "—"}</span>
          </div>
        </div>
        <Link
          href="/checkout/address"
          aria-disabled={lines.length === 0 || !quote}
          className={`mt-10 flex h-14 items-center justify-center rounded-md bg-black text-sm text-white transition-transform hover:-translate-y-0.5 ${lines.length === 0 || !quote ? "pointer-events-none opacity-40" : ""}`}
        >
          Checkout
        </Link>
      </aside>
    </main>
  );
}
