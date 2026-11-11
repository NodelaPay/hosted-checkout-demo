import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Headphones,
  Laptop,
  Smartphone,
  Watch,
} from "lucide-react";
import { catalogService } from "@/modules/catalog/service";
import { ProductCard } from "@/modules/storefront/components/product-card";
import { SectionHeading } from "@/modules/storefront/components/section-heading";
import { SiteFooter } from "@/modules/storefront/components/site-footer";
import { SiteHeader } from "@/modules/storefront/components/site-header";

export const dynamic = "force-dynamic";

const categories = [
  { name: "Phones", icon: Smartphone },
  { name: "Smart Watches", icon: Watch },
  { name: "Cameras", icon: Camera },
  { name: "Headphones", icon: Headphones },
  { name: "Computers", icon: Laptop },
  { name: "Gaming", icon: Gamepad2 },
];

function BannerCard({
  title,
  body,
  image,
  tone,
  className = "",
  imageSide = "right",
}: {
  title: string;
  body: string;
  image: string;
  tone: string;
  className?: string;
  imageSide?: "left" | "right";
}) {
  return (
    <div
      className={`relative min-h-[280px] overflow-hidden ${tone} ${className}`}
    >
      <div
        className={`relative z-10 flex h-full max-w-[560px] flex-col justify-center px-8 py-10 md:px-12 ${imageSide === "left" ? "ml-[45%]" : ""}`}
      >
        <h2 className="text-[32px] leading-[1.15] font-light tracking-[-.045em] md:text-[46px]">
          {title}
        </h2>
        <p className="mt-3 max-w-[340px] text-sm leading-6 text-[#777]">
          {body}
        </p>
        <Link
          href="/products"
          className="mt-5 w-fit rounded-md border border-current px-8 py-3 text-sm transition-colors hover:bg-black hover:text-white"
        >
          Shop Now
        </Link>
      </div>
      <div
        className={`pointer-events-none absolute bottom-0 h-[86%] w-[45%] md:w-[48%] ${imageSide === "left" ? "left-0" : "-right-4"}`}
      >
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 768px) 50vw, 400px"
          className="object-contain object-bottom"
        />
      </div>
    </div>
  );
}

export default async function HomePage() {
  const products = await catalogService.list();
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative min-h-[632px] overflow-hidden bg-[#211c24] text-white max-md:min-h-[769px]">
          <div className="mx-auto flex min-h-[632px] max-w-[1120px] items-center px-4 max-md:min-h-[769px] max-md:flex-col max-md:justify-start max-md:pt-[80px] lg:px-0">
            <div className="relative z-10 w-full animate-enter max-md:text-center md:w-1/2">
              <p className="mb-5 text-[25px] font-semibold text-[#909090]">
                Pro.Beyond.
              </p>
              <h1 className="text-[64px] leading-[1.03] font-thin tracking-[-.065em] max-md:text-[72px]">
                IPhone 14 <strong className="font-semibold">Pro</strong>
              </h1>
              <p className="mt-5 text-sm text-[#909090]">
                Created to change everything for the better. For everyone
              </p>
              <Link
                href="/products/iphone-14-pro-max"
                className="mt-7 inline-flex h-14 w-[190px] items-center justify-center rounded-md border border-white text-sm transition-all hover:bg-white hover:text-black"
              >
                Shop Now
              </Link>
            </div>
            <div className="animate-enter-right absolute bottom-0 right-[max(2%,calc((100vw-1280px)/2))] h-[92%] w-[49%] max-md:right-0 max-md:h-[46%] max-md:w-full">
              <Image
                src="/images/iphone-14-pro-max.png"
                alt="iPhone 14 Pro in deep purple"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain object-bottom"
              />
            </div>
          </div>
        </section>
        <section className="grid md:grid-cols-2">
          <div className="flex flex-col-reverse md:grid md:grid-rows-2">
            <BannerCard
              title="Playstation 5"
              body="Incredibly powerful CPU, GPU, and an SSD with integrated I/O will redefine your PlayStation experience."
              image="/images/playstation-5.png"
              tone="bg-white"
              imageSide="left"
              className="min-h-[500px] md:min-h-[328px]"
            />
            <div className="grid grid-cols-1 md:grid-cols-2">
              <BannerCard
                title="AirPods Max"
                body="Computational audio. Listen, it's powerful."
                image="/images/101.webp"
                tone="bg-[#ededed]"
                className="min-h-[286px] md:min-h-[272px] [&_h2]:!text-[28px] [&_p]:hidden [&_a]:hidden [&_div:first-child]:!px-5"
              />
              <BannerCard
                title="Apple Vision Pro"
                body="An immersive way to experience entertainment."
                image="/images/vision-pro.png"
                tone="bg-[#353535] text-white"
                className="min-h-[286px] md:min-h-[272px] [&_h2]:!text-[28px] [&_p]:hidden [&_a]:hidden [&_div:first-child]:!px-5"
              />
            </div>
          </div>
          <BannerCard
            title="Macbook Air"
            body="The new 15-inch MacBook Air makes room for more of what you love with a spacious Liquid Retina display."
            image="/images/78.webp"
            tone="bg-[#ededed]"
            className="min-h-[600px] [&_div:last-child]:!w-[55%]"
          />
        </section>
        <section className="bg-[#fafafa] py-36 md:py-20">
          <div className="mx-auto max-w-[1120px] px-4 lg:px-0">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-[26px] font-semibold">Browse By Category</h2>
              <div className="flex gap-3">
                <ChevronLeft size={24} />
                <ChevronRight size={24} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 md:grid-cols-6 md:gap-8">
              {categories.map(({ name, icon: Icon }) => (
                <Link
                  href={`/products?category=${encodeURIComponent(name)}`}
                  key={name}
                  className="flex h-32 flex-col items-center justify-center gap-3 rounded-2xl bg-[#ededed] text-center text-sm transition-all hover:-translate-y-1 hover:bg-[#e2e2e2]"
                >
                  <Icon size={32} strokeWidth={1.5} />
                  {name}
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-[1120px] px-4 py-14 md:py-20 lg:px-0">
          <SectionHeading
            title="New Arrival"
            tabs={["New Arrival", "Bestseller", "Featured Products"]}
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
        <section className="grid md:grid-cols-4">
          <BannerCard
            title="Popular Products"
            body="Discover all the latest tech favorites."
            image="/images/106.webp"
            tone="bg-white"
            className="min-h-[712px] md:min-h-[560px] [&_div:last-child]:!h-[48%] [&_div:last-child]:!w-[75%]"
          />
          <BannerCard
            title="iPad Pro"
            body="Unbelievably thin. Incredibly powerful."
            image="/images/123-2.webp"
            tone="bg-[#f8f8f8]"
            className="hidden min-h-[560px] md:block [&_div:last-child]:!h-[48%] [&_div:last-child]:!w-[75%]"
          />
          <BannerCard
            title="Samsung Galaxy"
            body="Power for every moment."
            image="/images/133.webp"
            tone="bg-[#eaeaea]"
            className="hidden min-h-[560px] md:block [&_div:last-child]:!h-[48%] [&_div:last-child]:!w-[75%]"
          />
          <BannerCard
            title="Macbook Pro"
            body="Supercharged for pros."
            image="/images/78.webp"
            tone="bg-[#2c2c2c] text-white"
            className="hidden min-h-[560px] md:block [&_div:last-child]:!h-[48%] [&_div:last-child]:!w-[75%]"
          />
        </section>
        <section className="mx-auto max-w-[1120px] px-4 py-11 md:py-20 lg:px-0">
          <SectionHeading title="Discounts up to -50%" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {products.slice(4, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
        <section className="relative flex min-h-[440px] items-center justify-center overflow-hidden bg-[#211c24] px-4 text-center text-white">
          <div className="absolute -left-20 top-2 h-72 w-72 rotate-[-25deg] opacity-80">
            <Image
              src="/images/123.webp"
              alt=""
              fill
              className="object-contain"
            />
          </div>
          <div className="relative z-10">
            <h2 className="text-[48px] font-light tracking-[-.05em] md:text-[72px]">
              Big Summer <strong>Sale</strong>
            </h2>
            <p className="mt-2 text-[#aaa]">
              Commodo fames vitae vitae leo mauris in. Eu consequat.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex h-14 w-48 items-center justify-center rounded-md border border-white text-sm transition-colors hover:bg-white hover:text-black"
            >
              Shop Now
            </Link>
          </div>
          <div className="absolute -right-20 bottom-0 h-72 w-72 rotate-[20deg] opacity-80">
            <Image
              src="/images/101.webp"
              alt=""
              fill
              className="object-contain"
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
