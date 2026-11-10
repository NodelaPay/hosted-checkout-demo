"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  MapPin,
  Package,
  Pencil,
  Plus,
  Truck,
  X,
} from "lucide-react";
import { useState } from "react";
import { useCart } from "@/modules/cart-ui/cart-context";
import { catalogService } from "@/modules/catalog/service";

export type CheckoutStep = "address" | "shipping" | "payment";

interface Address {
  readonly id: number;
  readonly label: string;
  readonly tag: string;
  readonly street: string;
  readonly city: string;
  readonly phone: string;
}

const initialAddresses: readonly Address[] = [
  {
    id: 1,
    label: "2118 Thornridge",
    tag: "HOME",
    street: "2118 Thornridge Cir.",
    city: "Syracuse, Connecticut 35624",
    phone: "(209) 555-0104",
  },
  {
    id: 2,
    label: "Headoffice",
    tag: "OFFICE",
    street: "2715 Ash Dr. San Jose,",
    city: "South Dakota 83475",
    phone: "(704) 555-0127",
  },
];

const steps = [
  { key: "address", title: "Address", icon: MapPin, href: "/checkout/address" },
  {
    key: "shipping",
    title: "Shipping",
    icon: Truck,
    href: "/checkout/shipping",
  },
  {
    key: "payment",
    title: "Payment",
    icon: CreditCard,
    href: "/checkout/payment",
  },
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
              href={item.href}
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

function StepButtons({
  back,
  next,
  nextLabel = "Next",
  onNext,
}: {
  readonly back: string;
  readonly next?: string;
  readonly nextLabel?: string;
  readonly onNext?: () => void;
}) {
  return (
    <div className="mt-12 flex gap-5 md:justify-end">
      <Link
        href={back}
        className="flex h-16 flex-1 items-center justify-center rounded-md border border-black text-sm md:max-w-[208px]"
      >
        Back
      </Link>
      {next ? (
        <Link
          href={next}
          className="flex h-16 flex-1 items-center justify-center rounded-md bg-black text-sm text-white transition-transform hover:-translate-y-0.5 md:max-w-[208px]"
        >
          {nextLabel}
        </Link>
      ) : (
        <button
          onClick={onNext}
          className="flex h-16 flex-1 items-center justify-center rounded-md bg-black text-sm text-white transition-transform hover:-translate-y-0.5 md:max-w-[208px]"
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
}

function AddressStep() {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [selected, setSelected] = useState(1);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const router = useRouter();

  const addAddress = () => {
    if (!newLabel.trim()) return;
    const id = Date.now();
    setAddresses([
      ...addresses,
      {
        id,
        label: newLabel.trim(),
        tag: "HOME",
        street: "New address",
        city: "Add full address details later",
        phone: "",
      },
    ]);
    setSelected(id);
    setAdding(false);
    setNewLabel("");
  };

  return (
    <div className="mx-auto max-w-[1120px] px-4 pb-20 lg:px-0">
      <div className="max-w-[752px]">
        <h1 className="mb-8 text-lg font-semibold text-[#1b1b49]">
          Select Address
        </h1>
        <div className="space-y-3">
          {addresses.map((address) => (
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
                aria-label={`Edit ${address.label}`}
                onClick={() => {
                  setNewLabel(address.label);
                  setAdding(true);
                }}
              >
                <Pencil size={17} />
              </button>
              <button
                aria-label={`Remove ${address.label}`}
                onClick={() =>
                  setAddresses(
                    addresses.filter((item) => item.id !== address.id),
                  )
                }
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
        {adding ? (
          <div className="mt-6 flex gap-2">
            <input
              autoFocus
              value={newLabel}
              onChange={(event) => setNewLabel(event.target.value)}
              placeholder="Address label"
              className="min-w-0 flex-1 rounded border border-[#ddd] px-4 py-3"
            />
            <button
              onClick={addAddress}
              className="rounded bg-black px-5 text-white"
            >
              Save
            </button>
          </div>
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
      <StepButtons
        back="/cart"
        onNext={() => router.push("/checkout/shipping")}
        nextLabel="Next"
      />
    </div>
  );
}

function ShippingStep() {
  const [selected, setSelected] = useState("free");
  const methods = [
    {
      id: "free",
      price: "Free",
      description: "Regularly shipment",
      date: "17 Oct, 2023",
    },
    {
      id: "express",
      price: "$8.50",
      description: "Get your delivery as soon as possible",
      date: "1 Oct, 2023",
    },
    {
      id: "schedule",
      price: "Schedule",
      description: "Pick a date when you want to get your delivery",
      date: "Select Date",
    },
  ];

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
            <span className="text-right text-xs font-medium text-[#777]">
              {method.date}
            </span>
          </label>
        ))}
      </div>
      <StepButtons back="/checkout/address" next="/checkout/payment" />
    </div>
  );
}

function PaymentCard() {
  return (
    <div className="relative mb-8 flex h-[190px] w-[320px] max-w-full flex-col justify-between overflow-hidden rounded-2xl bg-black p-6 text-white shadow-xl">
      <div className="absolute -right-3 -top-10 h-72 w-8 rotate-30 bg-[#282828]" />
      <div className="absolute right-12 -top-10 h-72 w-5 rotate-30 bg-[#282828]" />
      <div className="relative text-xl text-[#d7bd62]">
        ▦ <span className="text-sm text-white">◖))</span>
      </div>
      <div className="relative">
        <p className="mb-5 font-mono tracking-[.08em]">
          4085&nbsp; 9536&nbsp; 8475&nbsp; 9530
        </p>
        <div className="flex justify-between text-xs text-[#aaa]">
          <span>Cardholder</span>
          <span className="text-xl text-[#ff8b00]">●●</span>
        </div>
      </div>
    </div>
  );
}

function PaymentStep() {
  const { items } = useCart();
  const [tab, setTab] = useState("Credit Card");
  const [message, setMessage] = useState("");
  const lines = items.flatMap((item) => {
    const product = catalogService.getById(item.productId);
    return product ? [{ product, quantity: item.quantity }] : [];
  });
  const subtotal = lines.reduce(
    (total, line) => total + line.product.price * line.quantity,
    0,
  );

  return (
    <div className="mx-auto grid max-w-[1120px] gap-12 px-4 pb-20 md:grid-cols-2 lg:px-0">
      <aside className="order-2 hidden rounded-lg border border-[#ddd] p-6 md:order-1 md:block md:p-8">
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
                {product.shortName}
              </span>
              <strong className="text-xs">${product.price * quantity}</strong>
            </div>
          ))}
        </div>
        <div className="mt-6 text-sm">
          <p className="text-[#666]">Address</p>
          <p className="mt-2">1131 Dusty Townline, Jacksonville, TX 40322</p>
        </div>
        <div className="mt-5 text-sm">
          <p className="text-[#666]">Shipment method</p>
          <p className="mt-2">Free</p>
        </div>
        <div className="mt-6 space-y-4 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <strong>${subtotal}</strong>
          </div>
          <div className="flex justify-between text-[#666]">
            <span>Estimated Tax</span>
            <span>$50</span>
          </div>
          <div className="flex justify-between text-[#666]">
            <span>Estimated shipping &amp; Handling</span>
            <span>$29</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${subtotal + 79}</span>
          </div>
        </div>
      </aside>
      <section className="order-1 md:order-2">
        <h1 className="mb-6 text-lg font-semibold">Payment</h1>
        <div className="mb-8 flex gap-8 border-b border-[#ddd] text-sm">
          {["Credit Card", "PayPal", "PayPal Credit"].map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`pb-3 ${tab === item ? "border-b-2 border-black text-black" : "text-[#888]"}`}
            >
              {item}
            </button>
          ))}
        </div>
        {tab === "Credit Card" ? (
          <>
            <PaymentCard />
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setMessage(
                  "This is a UI demo. Payment processing is not connected yet.",
                );
              }}
              className="space-y-4"
            >
              <input
                required
                aria-label="Cardholder name"
                placeholder="Cardholder Name"
                className="h-12 w-full rounded border border-[#ddd] px-4 text-sm outline-none focus:border-black"
              />
              <input
                required
                inputMode="numeric"
                aria-label="Card number"
                placeholder="Card Number"
                className="h-12 w-full rounded border border-[#ddd] px-4 text-sm outline-none focus:border-black"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  aria-label="Expiry date"
                  placeholder="Exp.Date"
                  className="h-12 min-w-0 rounded border border-[#ddd] px-4 text-sm outline-none focus:border-black"
                />
                <input
                  required
                  aria-label="CVV"
                  placeholder="CVV"
                  className="h-12 min-w-0 rounded border border-[#ddd] px-4 text-sm outline-none focus:border-black"
                />
              </div>
              <label className="flex items-center gap-2 pt-3 text-sm">
                <input
                  type="checkbox"
                  defaultChecked
                  className="accent-black"
                />
                Same as billing address
              </label>
              <div className="flex gap-5 pt-6">
                <Link
                  href="/checkout/shipping"
                  className="flex h-14 flex-1 items-center justify-center rounded-md border border-black text-sm"
                >
                  Back
                </Link>
                <button
                  type="submit"
                  className="h-14 flex-1 rounded-md bg-black text-sm text-white"
                >
                  Pay
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="rounded-lg border border-[#ddd] p-8 text-center">
            <Package size={36} className="mx-auto" />
            <p className="mt-4 text-sm">
              {tab} will be connected when the backend is implemented.
            </p>
            <StepButtons
              back="/checkout/shipping"
              nextLabel="Pay"
              onNext={() =>
                setMessage(
                  "This is a UI demo. Payment processing is not connected yet.",
                )
              }
            />
          </div>
        )}
        {message && (
          <p role="status" className="mt-5 rounded bg-[#f5f5f5] p-4 text-sm">
            {message}
          </p>
        )}
      </section>
    </div>
  );
}

export function CheckoutView({ step }: { readonly step: CheckoutStep }) {
  const minimumHeight =
    step === "address"
      ? "min-h-[864px] md:min-h-[872px]"
      : step === "shipping"
        ? "min-h-[872px] md:min-h-[872px]"
        : "min-h-[872px] md:min-h-[992px]";

  return (
    <main className={minimumHeight}>
      <StepProgress step={step} />
      {step === "address" && <AddressStep />}
      {step === "shipping" && <ShippingStep />}
      {step === "payment" && <PaymentStep />}
    </main>
  );
}
