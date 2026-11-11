import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PageHeadingProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
}

export function PageHeading({ eyebrow, title, description }: PageHeadingProps) {
  return (
    <section className="bg-[#f5f5f5] px-4 py-16 md:py-24">
      <div className="mx-auto max-w-[1120px] animate-enter">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-2 text-sm text-[#777]"
        >
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <ChevronRight size={15} />
          <span className="text-black">{title}</span>
        </nav>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#777]">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-[850px] text-5xl font-light tracking-[-0.06em] md:text-7xl">
          {title}
        </h1>
        <p className="mt-6 max-w-[630px] text-base leading-7 text-[#666] md:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}
