import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Heart,
  ShoppingBag,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { PageHeading } from "@/modules/storefront/components/page-heading";
import { OrdersView } from "@/modules/checkout-ui/orders-view";
import { SiteFooter } from "@/modules/storefront/components/site-footer";
import { SiteHeader } from "@/modules/storefront/components/site-header";

export const metadata: Metadata = {
  title: "Account | Cyber",
  description: "Explore your Cyber demo account shortcuts.",
};

const shortcuts = [
  {
    href: "/favorites",
    icon: Heart,
    title: "Favorites",
    description: "Pick up where you left off with products you saved.",
  },
  {
    href: "/cart",
    icon: ShoppingCart,
    title: "Shopping cart",
    description: "Review the products in your current demo cart.",
  },
  {
    href: "/products",
    icon: ShoppingBag,
    title: "Explore products",
    description: "Discover something new across the catalog.",
  },
] as const;

export default function AccountPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHeading
          eyebrow="Your space"
          title="Account preview"
          description="A home for the things you are exploring. Your cart, favorites, and pending orders are linked to this browser's guest session."
        />
        <section className="mx-auto grid max-w-[1120px] gap-8 px-4 py-20 md:grid-cols-[0.8fr_1.2fr] md:py-28 lg:px-0">
          <div className="flex min-h-[330px] flex-col justify-between rounded-2xl bg-[#211c24] p-8 text-white md:p-10">
            <UserRound size={38} strokeWidth={1.2} />
            <div>
              <p className="text-sm text-[#aaa]">Welcome to Cyber</p>
              <h2 className="mt-2 text-3xl font-light tracking-[-0.04em]">
                Make yourself at home.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#aaa]">
                Browse, save favorites, and try the checkout journey. Your
                selections and pending orders are saved for this guest session.
              </p>
            </div>
          </div>
          <div className="grid gap-4">
            {shortcuts.map(({ href, icon: Icon, title, description }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-5 rounded-2xl border border-[#e4e4e4] p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-[#f4f4f4]">
                  <Icon size={24} strokeWidth={1.5} />
                </span>
                <span className="flex-1">
                  <strong className="block text-lg">{title}</strong>
                  <span className="mt-1 block text-sm leading-6 text-[#777]">
                    {description}
                  </span>
                </span>
                <ArrowUpRight
                  size={20}
                  className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>
            ))}
          </div>
        </section>
        <OrdersView />
      </main>
      <SiteFooter />
    </>
  );
}
