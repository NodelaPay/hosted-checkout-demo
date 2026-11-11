import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Headphones,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { PageHeading } from "@/modules/storefront/components/page-heading";
import { SiteFooter } from "@/modules/storefront/components/site-footer";
import { SiteHeader } from "@/modules/storefront/components/site-header";

export const metadata: Metadata = {
  title: "About Us | Cyber",
  description: "Meet the people and ideas behind the Cyber demo storefront.",
};

const values = [
  {
    icon: PackageCheck,
    title: "A considered selection",
    description:
      "A simpler way to explore the everyday devices and accessories you love.",
  },
  {
    icon: ShieldCheck,
    title: "Clear by design",
    description:
      "Useful details and straightforward choices at every step of the journey.",
  },
  {
    icon: Headphones,
    title: "Here to help",
    description:
      "Questions about a product or the demo? Our contact page is a good place to start.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHeading
          eyebrow="Our story"
          title="Technology, made easy to explore."
          description="Cyber is a concept storefront for discovering phones, computers, wearables, and the accessories that make every day better."
        />

        <section className="mx-auto grid max-w-[1120px] items-center gap-12 px-4 py-20 md:grid-cols-2 md:py-28 lg:px-0">
          <div className="relative min-h-[420px] overflow-hidden rounded-3xl bg-[#211c24] md:min-h-[550px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_55%,#6d617a_0%,#211c24_62%)]" />
            <Image
              src="/images/iphone-14-pro-max.png"
              alt="Deep purple smartphone"
              fill
              sizes="(max-width: 768px) 100vw, 550px"
              className="animate-float object-contain p-10"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#888]">
              The idea
            </p>
            <h2 className="mt-5 text-4xl font-light leading-tight tracking-[-0.05em] md:text-5xl">
              Good technology deserves a better browsing experience.
            </h2>
            <p className="mt-7 text-base leading-8 text-[#666]">
              We bring a clean, calm point of view to shopping for technology.
              Browse by category, compare the details that matter, and keep
              favorites close while you decide.
            </p>
            <p className="mt-4 text-sm leading-7 text-[#888]">
              This storefront is a frontend demo. Its products and interactions
              are examples, and no orders are processed.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-black px-7 py-4 text-sm text-white transition-transform hover:-translate-y-1"
            >
              Explore products
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </section>

        <section className="bg-[#f7f7f7] px-4 py-20 md:py-24">
          <div className="mx-auto max-w-[1120px]">
            <h2 className="text-3xl font-light tracking-[-0.04em] md:text-4xl">
              What guides us
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {values.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="rounded-2xl bg-white p-8 transition-transform hover:-translate-y-1"
                >
                  <Icon size={30} strokeWidth={1.4} />
                  <h3 className="mt-8 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#666]">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto flex max-w-[1120px] flex-col gap-6 px-4 py-20 md:flex-row md:items-center md:justify-between md:py-24 lg:px-0">
          <div>
            <h2 className="text-3xl font-light tracking-[-0.04em]">
              Curious about something?
            </h2>
            <p className="mt-3 text-[#666]">We would love to hear from you.</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex w-fit items-center gap-2 rounded-md border border-black px-7 py-4 text-sm transition-colors hover:bg-black hover:text-white"
          >
            Contact us
            <ArrowUpRight size={17} />
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
