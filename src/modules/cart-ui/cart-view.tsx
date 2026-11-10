"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { catalogService } from "@/modules/catalog/service";
import { useCart } from "./cart-context";

export function CartView() {
  const { items, update, remove } = useCart();
  const [promo, setPromo] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(false);

  const lines = items.flatMap((item) => {
    const product = catalogService.getById(item.productId);
    return product ? [{ product, quantity: item.quantity }] : [];
  });
  const subtotal = lines.reduce(
    (total, line) => total + line.product.price * line.quantity,
    0,
  );
  const discount = appliedPromo ? Math.round(subtotal * 0.1) : 0;
  const estimatedTax = lines.length ? 50 : 0;
  const shipping = lines.length ? 29 : 0;
  const total = subtotal - discount + estimatedTax + shipping;

  return (
    <main className="mx-auto grid min-h-[1432px] max-w-[1120px] gap-12 px-4 pb-20 pt-16 md:min-h-[800px] md:grid-cols-[1.5fr_1fr] md:gap-12 lg:px-0">
      <section>
        <h1 className="mb-10 text-2xl font-semibold">Shopping Cart</h1>
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
          <input
            value={promo}
            onChange={(event) => setPromo(event.target.value)}
            placeholder="Code"
            className="mt-2 w-full rounded border border-[#ddd] px-4 py-3 outline-none focus:border-black"
          />
        </label>
        <label className="mt-6 block text-sm text-[#555]">
          Your bonus card number
          <span className="mt-2 flex rounded border border-[#ddd]">
            <input
              placeholder="Enter Card Number"
              className="min-w-0 flex-1 px-4 py-3 outline-none"
            />
            <button
              onClick={() =>
                setAppliedPromo(promo.trim().toUpperCase() === "CYBER10")
              }
              className="m-1 rounded border border-black px-4 text-xs"
            >
              Apply
            </button>
          </span>
        </label>
        {appliedPromo && (
          <p className="mt-2 text-xs text-green-700">
            CYBER10 discount applied
          </p>
        )}
        <div className="mt-8 space-y-4 text-sm">
          <div className="flex justify-between font-semibold">
            <span>Subtotal</span>
            <span>${subtotal}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Discount</span>
              <span>-${discount}</span>
            </div>
          )}
          <div className="flex justify-between text-[#666]">
            <span>Estimated Tax</span>
            <span>${estimatedTax}</span>
          </div>
          <div className="flex justify-between text-[#666]">
            <span>Estimated shipping &amp; Handling</span>
            <span>${shipping}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${total}</span>
          </div>
        </div>
        <Link
          href="/checkout/address"
          aria-disabled={lines.length === 0}
          className={`mt-10 flex h-14 items-center justify-center rounded-md bg-black text-sm text-white transition-transform hover:-translate-y-0.5 ${lines.length === 0 ? "pointer-events-none opacity-40" : ""}`}
        >
          Checkout
        </Link>
      </aside>
    </main>
  );
}
