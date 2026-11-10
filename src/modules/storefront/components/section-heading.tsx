import Link from "next/link";

export function SectionHeading({
  title,
  tabs,
}: {
  readonly title: string;
  readonly tabs?: readonly string[];
}) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-[-.03em] md:text-[26px]">
          {title}
        </h2>
        {tabs && (
          <div className="mt-3 flex flex-wrap gap-5 text-sm text-[#777]">
            {tabs.map((tab, index) => (
              <span
                className={
                  index === 0 ? "border-b-2 border-black pb-1 text-black" : ""
                }
                key={tab}
              >
                {tab}
              </span>
            ))}
          </div>
        )}
      </div>
      <Link
        href="/products"
        className="text-sm underline underline-offset-4 hover:text-[#777]"
      >
        View All
      </Link>
    </div>
  );
}
