import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { blogService } from "@/modules/blog/service";
import { PageHeading } from "@/modules/storefront/components/page-heading";
import { SiteFooter } from "@/modules/storefront/components/site-footer";
import { SiteHeader } from "@/modules/storefront/components/site-header";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Journal | Cyber",
  description: "Ideas, guides, and inspiration from the Cyber demo storefront.",
};

export default async function BlogPage() {
  const [featured, ...otherPosts] = await blogService.list();

  return (
    <>
      <SiteHeader />
      <main>
        <PageHeading
          eyebrow="The journal"
          title="Ideas for life with tech."
          description="Simple guides and thoughtful inspiration for the devices that are part of your everyday life."
        />
        {featured && (
          <section className="mx-auto grid max-w-[1120px] gap-8 px-4 py-16 md:grid-cols-2 md:items-center md:py-24 lg:px-0">
            <Link
              href={`/blog/${featured.slug}`}
              className="relative block min-h-[380px] overflow-hidden rounded-3xl bg-[#211c24] md:min-h-[510px]"
            >
              <Image
                src={featured.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 550px"
                className="object-contain p-10 transition-transform duration-500 hover:scale-105"
              />
            </Link>
            <div className="md:px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#888]">
                Featured story · {featured.category}
              </p>
              <h2 className="mt-5 text-4xl font-light leading-tight tracking-[-0.05em] md:text-5xl">
                {featured.title}
              </h2>
              <p className="mt-6 leading-8 text-[#666]">{featured.summary}</p>
              <p className="mt-4 text-sm text-[#888]">{featured.readTime}</p>
              <Link
                href={`/blog/${featured.slug}`}
                className="mt-8 inline-flex items-center gap-2 border-b border-black pb-2 text-sm font-semibold"
              >
                Read story
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </section>
        )}
        <section className="bg-[#f7f7f7] px-4 py-20 md:py-24">
          <div className="mx-auto max-w-[1120px]">
            <h2 className="text-3xl font-light tracking-[-0.04em]">
              More from the journal
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {otherPosts.map((post) => (
                <article
                  key={post.slug}
                  className="overflow-hidden rounded-2xl bg-white"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="relative block h-64 bg-[#eaeaea] md:h-72"
                  >
                    <Image
                      src={post.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 550px"
                      className="object-contain p-8 transition-transform duration-500 hover:scale-105"
                    />
                  </Link>
                  <div className="p-7 md:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#888]">
                      {post.category} · {post.readTime}
                    </p>
                    <h3 className="mt-4 text-2xl font-medium tracking-[-0.04em]">
                      {post.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#666]">
                      {post.summary}
                    </p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold"
                    >
                      Read story
                      <ArrowUpRight size={17} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
