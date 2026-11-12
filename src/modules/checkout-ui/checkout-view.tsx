"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, MapPin, Pencil, Plus, Truck, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import { ensureGuestSession } from "@/infrastructure/http/client-session";
import { useCart } from "@/modules/cart-ui/cart-context";
import type { ProductDto } from "@/modules/catalog/product.dto";
import {
  addressInputSchema,
  shippingMethodSchema,
  type AddressDto,
  type CheckoutDraftDto,
  type OrderQuoteDto,
} from "@/modules/checkout/checkout.dto";

export type CheckoutStep = "address" | "shipping" | "payment";

const checkoutResponseSchema = z.object({
  addresses: z.array(addressInputSchema.extend({ id: z.uuid() })),
  draft: z.object({
    addressId: z.uuid().nullable(),
    shippingMethod: shippingMethodSchema,
    promoCode: z.string().nullable(),
    scheduledDate: z.string().nullable(),
  }),
});

const paymentResponseSchema = z.object({
  payment: z.object({
    orderId: z.uuid(),
    checkoutUrl: z.url().nullable(),
    status: z.enum([
      "creating",
      "failed",
      "pending",
      "paid",
      "cancelled",
      "expired",
    ]),
  }),
});

const quoteResponseSchema = z.object({
  quote: z.object({
    subtotal: z.number(),
    discount: z.number(),
    tax: z.number(),
    shipping: z.number(),
    total: z.number(),
  }),
});

const emptyAddress = {
  label: "",
  tag: "HOME",
  street: "",
  city: "",
  phone: "",
};

const steps = [
  { key: "address", title: "Address", icon: MapPin },
  { key: "shipping", title: "Shipping", icon: Truck },
  { key: "payment", title: "Payment", icon: CreditCard },
] as const;

function StepProgress({ step }: { readonly step: CheckoutStep }) {
  const currentIndex = steps.findIndex((item) => item.key === step);

  return (
    <nav
      aria-label="Checkout progress"
      className="mx-auto flex max-w-[1120px] items-center justify-between gap-3 px-4 py-11 lg:px-0"
    >
      {steps.map((item, index) => {
        const Icon = item.icon;
        const firstMobileStep = Math.min(currentIndex, 1);
        const visibleOnMobile =
          index >= firstMobileStep && index <= firstMobileStep + 1;

        return (
          <div
            key={item.key}
            className={`min-w-0 items-center gap-3 md:flex ${visibleOnMobile ? "flex" : "hidden"}`}
          >
            <Link
              href={`/checkout/${item.key}`}
              aria-current={step === item.key ? "step" : undefined}
              className={`flex items-center gap-3 ${index === currentIndex ? "text-black" : "text-[#bcbcbc]"}`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full ${index === currentIndex ? "bg-black text-white" : "bg-[#bcbcbc] text-white"}`}
              >
                <Icon size={16} />
              </span>
              <span className="leading-tight">
                <small className="block text-[11px]">Step {index + 1}</small>
                <strong className="text-sm md:text-base">{item.title}</strong>
              </span>
            </Link>
            {index < steps.length - 1 && (
              <span className="ml-4 hidden w-[120px] border-t border-dashed border-[#ddd] md:block lg:w-[210px]" />
            )}
          </div>
        );
      })}
    </nav>
  );
}

interface CheckoutData {
  readonly addresses: readonly AddressDto[];
  readonly draft: CheckoutDraftDto;
}

interface CheckoutStepProps {
  readonly data: CheckoutData;
  readonly reload: () => Promise<void>;
  readonly saveDraft: (draft: CheckoutDraftDto) => Promise<void>;
  readonly error: string | null;
  readonly setError: (message: string | null) => void;
}

function AddressStep({
  data,
  reload,
  saveDraft,
  error,
  setError,
}: CheckoutStepProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(data.addresses.length === 0);
  const [form, setForm] = useState(emptyAddress);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<string | null>(
    data.draft.addressId ?? data.addresses[0]?.id ?? null,
  );

  async function submitAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const input = addressInputSchema.parse(form);
      const response = await fetch(
        editingId
          ? `/api/checkout/addresses/${editingId}`
          : "/api/checkout/addresses",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
        },
      );
      if (!response.ok) throw new Error("Could not save address");
      const result = z
        .object({ address: addressInputSchema.extend({ id: z.uuid() }) })
        .parse(await response.json());

      setSelected(result.address.id);
      setEditingId(null);
      setAdding(false);
      setForm(emptyAddress);
      await reload();
    } catch {
      setError("Could not save this address. Check the details and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function removeAddress(id: string) {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/checkout/addresses/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Could not remove address");
      if (selected === id) setSelected(null);
      await reload();
    } catch {
      setError("Could not remove this address. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function next() {
    if (!selected) {
      setError("Add or select an address to continue.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await saveDraft({ ...data.draft, addressId: selected });
      router.push("/checkout/shipping");
    } catch {
      setError("Could not save your selection. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1120px] px-4 pb-20 lg:px-0">
      <div className="max-w-[752px]">
        <h1 className="mb-8 text-lg font-semibold text-[#1b1b49]">
          Select Address
        </h1>
        <div className="space-y-3">
          {data.addresses.map((address) => (
            <div
              key={address.id}
              className="flex items-start gap-4 rounded-lg bg-[#f6f6f6] p-6"
            >
              <input
                type="radio"
                name="address"
                checked={selected === address.id}
                onChange={() => setSelected(address.id)}
                className="mt-1 h-5 w-5 accent-black"
                aria-label={`Select ${address.label}`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <strong className="text-sm">{address.label}</strong>
                  <span className="rounded bg-black px-2 py-1 text-[10px] text-white">
                    {address.tag}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6">
                  {address.street}
                  <br />
                  {address.city}
                </p>
                <p className="mt-2 text-sm">{address.phone}</p>
              </div>
              <button
                type="button"
                aria-label={`Edit ${address.label}`}
                onClick={() => {
                  setEditingId(address.id);
                  setForm(address);
                  setAdding(true);
                }}
              >
                <Pencil size={17} />
              </button>
              <button
                type="button"
                aria-label={`Remove ${address.label}`}
                disabled={busy}
                onClick={() => void removeAddress(address.id)}
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>

        {adding ? (
          <form
            onSubmit={(event) => void submitAddress(event)}
            className="mt-6 grid gap-3 rounded-lg border border-[#ddd] p-5 md:grid-cols-2"
          >
            {(
              [
                ["label", "Address label"],
                ["tag", "Type (HOME or OFFICE)"],
                ["street", "Street address"],
                ["city", "City, state and postal code"],
                ["phone", "Phone number"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="grid gap-1 text-xs font-medium">
                {label}
                <input
                  required
                  value={form[key]}
                  onChange={(event) =>
                    setForm({ ...form, [key]: event.target.value })
                  }
                  className="h-12 rounded border border-[#ddd] px-3 text-sm outline-none focus:border-black"
                />
              </label>
            ))}
            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={busy}
                className="rounded bg-black px-6 py-3 text-sm text-white"
              >
                {busy ? "Saving…" : "Save address"}
              </button>
              {data.addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setAdding(false);
                    setEditingId(null);
                    setForm(emptyAddress);
                  }}
                  className="rounded border border-black px-6 py-3 text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="mt-8 flex w-full flex-col items-center gap-2 border-t border-dashed border-[#ddd] pt-4 text-xs"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white">
              <Plus size={17} />
            </span>
            Add New Address
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-6 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-12 flex gap-5 md:justify-end">
        <Link
          href="/cart"
          className="flex h-16 flex-1 items-center justify-center rounded-md border border-black text-sm md:max-w-[208px]"
        >
          Back
        </Link>
        <button
          onClick={() => void next()}
          disabled={busy}
          className="flex h-16 flex-1 items-center justify-center rounded-md bg-black text-sm text-white md:max-w-[208px]"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function ShippingStep({ data, saveDraft, error, setError }: CheckoutStepProps) {
  const router = useRouter();
  const [selected, setSelected] = useState(data.draft.shippingMethod);
  const [scheduledDate, setScheduledDate] = useState(
    data.draft.scheduledDate ?? "",
  );
  const [busy, setBusy] = useState(false);

  const methods = [
    { id: "free", price: "Free", description: "Regular shipment" },
    { id: "express", price: "$9", description: "Express shipment" },
    {
      id: "schedule",
      price: "Schedule",
      description: "Choose a delivery date",
    },
  ] as const;

  async function next() {
    setBusy(true);
    setError(null);
    try {
      await saveDraft({
        ...data.draft,
        shippingMethod: selected,
        scheduledDate: selected === "schedule" ? scheduledDate : null,
      });
      router.push("/checkout/payment");
    } catch {
      setError(
        "Choose a future date or try saving your shipping choice again.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1120px] px-4 pb-20 lg:px-0">
      <h1 className="mb-8 text-lg font-semibold text-[#1b1b49]">
        Shipment Method
      </h1>
      <div className="space-y-4">
        {methods.map((method) => (
          <label
            key={method.id}
            className="flex min-h-20 cursor-pointer items-center gap-4 rounded-lg border border-[#ddd] p-5 transition-colors hover:border-black"
          >
            <input
              type="radio"
              name="shipping"
              checked={selected === method.id}
              onChange={() => setSelected(method.id)}
              className="h-5 w-5 accent-black"
            />
            <strong className="w-24 shrink-0 text-sm">{method.price}</strong>
            <span className="flex-1 text-sm text-[#777]">
              {method.description}
            </span>
          </label>
        ))}
      </div>
      {selected === "schedule" && (
        <label className="mt-6 grid max-w-xs gap-2 text-sm">
          Delivery date
          <input
            type="date"
            value={scheduledDate}
            onChange={(event) => setScheduledDate(event.target.value)}
            className="h-12 rounded border border-[#ddd] px-3"
          />
        </label>
      )}
      {error && (
        <p role="alert" className="mt-6 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-12 flex gap-5 md:justify-end">
        <Link
          href="/checkout/address"
          className="flex h-16 flex-1 items-center justify-center rounded-md border border-black text-sm md:max-w-[208px]"
        >
          Back
        </Link>
        <button
          onClick={() => void next()}
          disabled={busy}
          className="flex h-16 flex-1 items-center justify-center rounded-md bg-black text-sm text-white md:max-w-[208px]"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function PaymentStep({
  data,
  products,
  error,
  setError,
}: CheckoutStepProps & { readonly products: readonly ProductDto[] }) {
  const router = useRouter();
  const { items } = useCart();
  const [busy, setBusy] = useState(false);
  const [customer, setCustomer] = useState({ name: "", email: "" });
  const [quote, setQuote] = useState<OrderQuoteDto | null>(null);
  const idempotencyKey = useRef<string | null>(null);
  const address = data.addresses.find(
    (candidate) => candidate.id === data.draft.addressId,
  );
  const lines = items.flatMap((item) => {
    const product = products.find(
      (candidate) => candidate.id === item.productId,
    );
    return product ? [{ product, quantity: item.quantity }] : [];
  });

  useEffect(() => {
    let active = true;

    void ensureGuestSession()
      .then(() => fetch("/api/checkout/quote", { cache: "no-store" }))
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load quote");
        const result = quoteResponseSchema.parse(await response.json());
        if (active) setQuote(result.quote);
      })
      .catch(() => {
        if (active) setError("Could not calculate the order total.");
      });

    return () => {
      active = false;
    };
  }, [setError]);

  async function startPayment() {
    setBusy(true);
    setError(null);
    idempotencyKey.current ??=
      sessionStorage.getItem("checkout-payment-key") ?? crypto.randomUUID();
    sessionStorage.setItem("checkout-payment-key", idempotencyKey.current);

    try {
      const validatedCustomer = z
        .object({ name: z.string().trim().min(1), email: z.email() })
        .parse(customer);
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          customer: validatedCustomer,
        }),
      });
      if (!response.ok) {
        const body = await response.json();
        const parsed = z.object({ error: z.string() }).safeParse(body);
        throw new Error(
          parsed.success ? parsed.data.error : "Payment could not be started",
        );
      }

      const result = paymentResponseSchema.parse(await response.json());
      if (result.payment.status === "paid") {
        router.push(`/checkout/return?orderId=${result.payment.orderId}`);
        return;
      }
      if (!result.payment.checkoutUrl) {
        throw new Error(
          "Invoice is still being created. Please try again shortly.",
        );
      }
      window.location.assign(result.payment.checkoutUrl);
    } catch (cause) {
      setError(
        cause instanceof z.ZodError
          ? "Enter your name and a valid email address."
          : cause instanceof Error
            ? cause.message
            : "Payment could not be started",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-[1120px] gap-12 px-4 pb-20 md:grid-cols-2 lg:px-0">
      <aside className="order-2 rounded-lg border border-[#ddd] p-6 md:order-1 md:p-8">
        <h2 className="mb-6 text-lg font-semibold">Summary</h2>
        <div className="space-y-3">
          {lines.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex items-center gap-3 rounded-lg bg-[#f6f6f6] p-3"
            >
              <div className="relative h-12 w-12 shrink-0">
                <Image
                  src={product.image}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <span className="line-clamp-2 flex-1 text-xs font-medium">
                {product.shortName} × {quantity}
              </span>
              <strong className="text-xs">${product.price * quantity}</strong>
            </div>
          ))}
        </div>
        <div className="mt-6 text-sm">
          <p className="text-[#666]">Address</p>
          <p className="mt-2">
            {address
              ? `${address.street}, ${address.city}`
              : "No address selected"}
          </p>
        </div>
        <div className="mt-5 text-sm">
          <p className="text-[#666]">Shipment method</p>
          <p className="mt-2 capitalize">{data.draft.shippingMethod}</p>
          {data.draft.scheduledDate && (
            <p className="mt-1 text-[#666]">{data.draft.scheduledDate}</p>
          )}
        </div>
        <div className="mt-6 space-y-4 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <strong>{quote ? `$${quote.subtotal}` : "—"}</strong>
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
            <span>Shipping</span>
            <span>{quote ? `$${quote.shipping}` : "—"}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{quote ? `$${quote.total}` : "—"}</span>
          </div>
        </div>
      </aside>
      <section className="order-1 md:order-2">
        <h1 className="mb-6 text-lg font-semibold">Payment</h1>
        <div className="rounded-lg bg-[#f6f6f6] p-8">
          <CreditCard size={34} strokeWidth={1.4} />
          <h2 className="mt-6 text-2xl font-light tracking-[-0.04em]">
            Pay securely with crypto
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#666]">
            Continue to Nodela to choose your network and cryptocurrency. Your
            order will be confirmed after payment is verified.
          </p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Full name
            <input
              autoComplete="name"
              value={customer.name}
              onChange={(event) =>
                setCustomer({ ...customer, name: event.target.value })
              }
              className="h-12 rounded-md border border-[#ddd] px-4 outline-none focus:border-black"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Email address
            <input
              type="email"
              autoComplete="email"
              value={customer.email}
              onChange={(event) =>
                setCustomer({ ...customer, email: event.target.value })
              }
              className="h-12 rounded-md border border-[#ddd] px-4 outline-none focus:border-black"
            />
          </label>
        </div>
        {error && (
          <p role="alert" className="mt-5 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="mt-8 flex gap-5">
          <Link
            href="/checkout/shipping"
            className="flex h-14 flex-1 items-center justify-center rounded-md border border-black text-sm"
          >
            Back
          </Link>
          <button
            onClick={() => void startPayment()}
            disabled={busy || lines.length === 0 || !address || !quote}
            className="h-14 flex-1 rounded-md bg-black text-sm text-white disabled:opacity-40"
          >
            {busy ? "Preparing checkout…" : "Pay with crypto"}
          </button>
        </div>
      </section>
    </div>
  );
}

export function CheckoutView({
  step,
  products,
}: {
  readonly step: CheckoutStep;
  readonly products: readonly ProductDto[];
}) {
  const [data, setData] = useState<CheckoutData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload(): Promise<void> {
    await ensureGuestSession();
    const response = await fetch("/api/checkout", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load checkout");
    setData(checkoutResponseSchema.parse(await response.json()));
  }

  useEffect(() => {
    queueMicrotask(() => {
      void reload().catch(() =>
        setError("Could not load checkout. Please refresh."),
      );
    });
  }, []);

  async function saveDraft(draft: CheckoutDraftDto): Promise<void> {
    const response = await fetch("/api/checkout", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (!response.ok) throw new Error("Could not save checkout");
    setData((current) => (current ? { ...current, draft } : current));
  }

  const minimumHeight =
    step === "address"
      ? "min-h-[864px] md:min-h-[872px]"
      : step === "shipping"
        ? "min-h-[872px] md:min-h-[872px]"
        : "min-h-[872px] md:min-h-[992px]";

  return (
    <main className={minimumHeight}>
      <StepProgress step={step} />
      {!data ? (
        <div className="mx-auto max-w-[1120px] px-4 py-16 text-sm text-[#666] lg:px-0">
          {error ?? "Loading checkout…"}
        </div>
      ) : (
        <>
          {step === "address" && (
            <AddressStep
              data={data}
              reload={reload}
              saveDraft={saveDraft}
              error={error}
              setError={setError}
            />
          )}
          {step === "shipping" && (
            <ShippingStep
              data={data}
              reload={reload}
              saveDraft={saveDraft}
              error={error}
              setError={setError}
            />
          )}
          {step === "payment" && (
            <PaymentStep
              data={data}
              reload={reload}
              saveDraft={saveDraft}
              error={error}
              setError={setError}
              products={products}
            />
          )}
        </>
      )}
    </main>
  );
}
