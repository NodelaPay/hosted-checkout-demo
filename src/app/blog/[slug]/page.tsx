import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ChevronRight } from "lucide-react";
import { blogService } from "@/modules/blog/service";
import { SiteFooter } from "@/modules/storefront/components/site-footer";
import { SiteHeader } from "@/modules/storefront/components/site-header";

interface BlogArticlePageProps {
  readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await blogService.getBySlug(slug);

  return {
    title: post ? `${post.title} | Cyber Journal` : "Journal | Cyber",
    description: post?.summary,
  };
}

export default async function BlogArticlePage({
  params,
}: BlogArticlePageProps) {
  const { slug } = await params;
  const post = await blogService.getBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main>
        <article className="mx-auto max-w-[1120px] px-4 pb-24 pt-10 lg:px-0">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-[#777]"
          >
            <Link href="/" className="hover:text-black">
              Home
            </Link>
            <ChevronRight size={15} />
            <Link href="/blog" className="hover:text-black">
              Journal
            </Link>
            <ChevronRight size={15} />
            <span className="text-black">{post.category}</span>
          </nav>
          <header className="mx-auto max-w-[850px] py-16 text-center md:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#888]">
              {post.category} · {post.readTime}
            </p>
            <h1 className="mt-5 text-5xl font-light leading-tight tracking-[-0.06em] md:text-7xl">
              {post.title}
            </h1>
            <p className="mx-auto mt-6 max-w-[650px] text-lg leading-8 text-[#666]">
              {post.summary}
            </p>
          </header>
          <div className="relative h-[420px] overflow-hidden rounded-3xl bg-[#eaeaea] md:h-[620px]">
            <Image
              src={post.image}
              alt=""
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1120px"
              className="object-contain p-8 md:p-16"
            />
          </div>
          <div className="mx-auto max-w-[720px] space-y-8 py-16 text-lg leading-9 text-[#444] md:py-20">
            {post.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mx-auto flex max-w-[720px] flex-wrap justify-between gap-6 border-t border-[#ddd] pt-8 text-sm font-semibold">
            <Link href="/blog" className="inline-flex items-center gap-2">
              <ArrowLeft size={18} />
              All stories
            </Link>
            <Link href="/products" className="inline-flex items-center gap-2">
              Explore products
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
