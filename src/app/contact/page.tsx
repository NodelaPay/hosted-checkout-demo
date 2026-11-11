import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Mail, MessageCircle, ShoppingBag } from "lucide-react";
import { ContactForm } from "@/modules/contact-ui/contact-form";
import { PageHeading } from "@/modules/storefront/components/page-heading";
import { SiteFooter } from "@/modules/storefront/components/site-footer";
import { SiteHeader } from "@/modules/storefront/components/site-header";

export const metadata: Metadata = {
  title: "Contact Us | Cyber",
  description: "Get in touch with the Cyber demo storefront.",
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHeading
          eyebrow="Get in touch"
          title="How can we help?"
          description="Have a question about the storefront or want to explore more? Choose a quick route below, or send us a message."
        />
        <section className="mx-auto grid max-w-[1120px] gap-12 px-4 py-20 md:grid-cols-[0.8fr_1.2fr] md:py-28 lg:px-0">
          <div>
            <h2 className="text-3xl font-light tracking-[-0.04em]">
              We are here for the conversation.
            </h2>
            <p className="mt-5 leading-8 text-[#666]">
              Your message is saved in the project database. The links below
              also lead to useful pages you can explore right now.
            </p>
            <div className="mt-10 space-y-3">
              <Link
                href="/products"
                className="flex items-center gap-4 rounded-xl border border-[#e4e4e4] p-5 transition-colors hover:bg-[#f7f7f7]"
              >
                <ShoppingBag size={23} strokeWidth={1.5} />
                <span className="flex-1 font-medium">Browse products</span>
                <ArrowUpRight size={19} />
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-4 rounded-xl border border-[#e4e4e4] p-5 transition-colors hover:bg-[#f7f7f7]"
              >
                <MessageCircle size={23} strokeWidth={1.5} />
                <span className="flex-1 font-medium">Our story</span>
                <ArrowUpRight size={19} />
              </Link>
            </div>
            <div className="mt-10 flex items-start gap-4 border-t border-[#e4e4e4] pt-8">
              <Mail size={23} strokeWidth={1.5} />
              <div>
                <h3 className="font-semibold">A note about this demo</h3>
                <p className="mt-2 text-sm leading-6 text-[#777]">
                  Contact requests are stored in the project database. Email
                  notifications are not configured yet.
                </p>
              </div>
            </div>
          </div>
          <ContactForm />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
