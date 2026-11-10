"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Battery,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Cpu,
  Heart,
  PackageCheck,
  ShieldCheck,
  Smartphone,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { useCart } from "@/modules/cart-ui/cart-context";
import type { ProductDto } from "../product.dto";
import { catalogService } from "../service";
import { ProductCard } from "@/modules/storefront/components/product-card";

const colors = ["#111111", "#7430bc", "#ed1d24", "#f2bf16", "#e3e3e3"];
const memoryOptions = ["128GB", "256GB", "512GB", "1TB"];
const specs = [
  { label: "Screen size", value: "6.7”", icon: Smartphone },
  { label: "CPU", value: "Apple A16 Bionic", icon: Cpu },
  { label: "Number of Cores", value: "6", icon: Cpu },
  { label: "Main camera", value: "48-12-12 MP", icon: Camera },
  { label: "Front-camera", value: "12 MP", icon: Camera },
  { label: "Battery capacity", value: "4323 mAh", icon: Battery },
];

export function ProductDetail({ product }: { readonly product: ProductDto }) {
  const { add } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(1);
  const [selectedMemory, setSelectedMemory] = useState(product.memory ?? "1TB");
  const [favorite, setFavorite] = useState(false);
  const [added, setAdded] = useState(false);
  const gallery =
    product.id === "iphone-14-pro-max"
      ? [
          product.image,
          "/images/123-3.webp",
          "/images/123.webp",
          "/images/123-2.webp",
        ]
      : [product.image];
  const addToCart = () => {
    add(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };
  const related = catalogService
    .list()
    .filter((item) => item.id !== product.id)
    .slice(0, 4);

  return (
    <main>
      <div className="mx-auto hidden max-w-[1120px] items-center gap-3 py-10 text-sm text-[#999] md:flex">
        <Link href="/">Home</Link>
        <ChevronRight size={15} />
        <Link href="/products">Catalog</Link>
        <ChevronRight size={15} />
        <span>Smartphones</span>
        <ChevronRight size={15} />
        <span className="font-semibold text-black">{product.name}</span>
      </div>
      <section className="mx-auto grid max-w-[1120px] gap-10 px-4 pb-20 pt-10 md:min-h-[896px] md:grid-cols-2 md:items-center md:pt-0 lg:px-0">
        <div className="flex flex-col-reverse gap-4 md:flex-row md:items-center">
          <div className="flex justify-center gap-4 md:flex-col">
            {gallery.map((src, index) => (
              <button
                aria-label={`View product image ${index + 1}`}
                onClick={() => setSelectedImage(index)}
                key={`${src}-${index}`}
                className={`relative h-16 w-14 transition-opacity md:h-24 md:w-20 ${selectedImage === index ? "opacity-100" : "opacity-50 hover:opacity-80"}`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              </button>
            ))}
          </div>
          <div className="relative h-[426px] w-full flex-none md:h-[510px] md:flex-1">
            <Image
              src={gallery[selectedImage] ?? product.image}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 90vw, 460px"
              className="animate-enter object-contain"
            />
          </div>
        </div>
        <div>
          <h1 className="text-[38px] leading-[1.13] font-semibold tracking-[-.05em] md:text-[40px]">
            {product.name.replace(" 128GB Deep Purple", "")}
          </h1>
          <div className="mt-5 flex items-center gap-4">
            <strong className="text-[30px] font-semibold">
              ${product.price}
            </strong>
            {product.oldPrice && (
              <del className="text-[22px] text-[#aaa]">${product.oldPrice}</del>
            )}
          </div>
          <div className="mt-5 flex items-center gap-5">
            <span className="text-sm">Select color :</span>
            <div className="flex gap-2">
              {colors.map((color, index) => (
                <button
                  key={color}
                  aria-label={`Color option ${index + 1}`}
                  aria-pressed={selectedColor === index}
                  onClick={() => setSelectedColor(index)}
                  style={{ backgroundColor: color }}
                  className={`h-7 w-7 rounded-full ring-offset-2 transition-transform hover:scale-110 ${selectedColor === index ? "ring-2 ring-black" : ""}`}
                />
              ))}
            </div>
          </div>
          <div className="mt-6 grid grid-cols-4 gap-2">
            {memoryOptions.map((memory) => (
              <button
                key={memory}
                onClick={() => setSelectedMemory(memory)}
                className={`rounded-md border px-2 py-3 text-xs md:text-sm ${selectedMemory === memory ? "border-black text-black" : "border-[#ddd] text-[#888]"}`}
              >
                {memory}
              </button>
            ))}
          </div>
          <div className="mt-7 grid grid-cols-2 gap-2">
            {specs.map(({ label, value, icon: Icon }) => (
              <div
                className="flex min-h-[64px] items-center gap-2 rounded-md bg-[#f4f4f4] p-3"
                key={label}
              >
                <Icon size={22} className="shrink-0 text-[#555]" />
                <div>
                  <p className="text-xs text-[#999]">{label}</p>
                  <p className="text-xs font-medium md:text-sm">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm leading-6 text-[#777]">
            Enhanced capabilities thanks to an enlarged display of 6.7 inches
            and an incredible camera system. Capture more detail in any light,
            and enjoy long battery life.
          </p>
          <div className="mt-7 flex gap-3">
            <button
              onClick={() => setFavorite((value) => !value)}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-md border border-black text-sm"
            >
              <Heart size={18} fill={favorite ? "black" : "none"} />
              {favorite ? "Wishlisted" : "Add to Wishlist"}
            </button>
            <button
              onClick={addToCart}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-md bg-black text-sm text-white transition-transform hover:-translate-y-0.5"
            >
              {added ? (
                <>
                  <Check size={18} />
                  Added
                </>
              ) : (
                "Add to Cart"
              )}
            </button>
          </div>
          <div className="mt-7 grid grid-cols-3 gap-2">
            {[
              { Icon: Truck, label: "Free Delivery", value: "1-2 day" },
              { Icon: PackageCheck, label: "In Stock", value: "Today" },
              { Icon: ShieldCheck, label: "Guaranteed", value: "1 year" },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                <span className="rounded bg-[#f6f6f6] p-2">
                  <Icon size={20} />
                </span>
                <span>
                  <span className="text-[#999]">{label}</span>
                  <br />
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="min-h-[1280px] bg-[#fafafa] py-20 md:min-h-[1144px]">
        <div className="mx-auto max-w-[1120px] rounded-lg bg-white px-4 py-12 md:px-10">
          <h2 className="text-2xl font-semibold">Details</h2>
          <p className="mt-6 text-sm leading-7 text-[#777]">
            Just as a book is judged by its cover, the first thing you notice
            when you pick up a modern smartphone is its display. Nothing
            surprising, because advanced technologies allow you to practically
            level the display frames and cutouts for the front camera and
            speaker, leaving no room for bold design solutions.
          </p>
          <h3 className="mt-8 text-xl font-semibold">Screen</h3>
          {[
            ["Screen diagonal", '6.7"'],
            ["The screen resolution", "2796 × 1290"],
            ["The screen refresh rate", "120 Hz"],
            ["The pixel density", "460 ppi"],
            ["Screen type", "Super Retina XDR OLED"],
            ["Display brightness", "2000 nits"],
            ["Processor", "Apple A16 Bionic"],
            ["Main camera", "48 MP"],
            ["Front camera", "12 MP"],
            ["Battery capacity", "4323 mAh"],
          ].map(([label, value]) => (
            <div
              className="flex justify-between border-b border-[#eee] py-4 text-sm"
              key={label}
            >
              <span>{label}</span>
              <span>{value}</span>
            </div>
          ))}
          <button className="mt-8 flex w-full items-center justify-center gap-2 rounded border border-[#ddd] py-3 text-sm">
            View More
            <ChevronDown size={16} />
          </button>
        </div>
      </section>
      <section className="mx-auto min-h-[2446px] max-w-[1120px] px-4 py-20 md:min-h-[1448px] lg:px-0">
        <h2 className="text-2xl font-semibold">Reviews</h2>
        <div className="mt-8 rounded-lg bg-[#fafafa] p-7">
          <div className="flex items-center gap-6">
            <span className="text-[48px] font-semibold">4.8</span>
            <div>
              <p className="text-sm text-[#888]">of 125 reviews</p>
              <p className="text-[#ffb547]">★★★★★</p>
            </div>
          </div>
          {[5, 4, 3, 2, 1].map((stars) => (
            <div key={stars} className="mt-3 flex items-center gap-4 text-sm">
              <span className="w-14">{stars} stars</span>
              <span className="h-1 flex-1 overflow-hidden rounded bg-[#ddd]">
                <span
                  className="block h-full rounded bg-[#ffb547]"
                  style={{
                    width: `${stars === 5 ? 80 : stars === 4 ? 45 : stars === 3 ? 15 : 6}%`,
                  }}
                />
              </span>
            </div>
          ))}
        </div>
        <textarea
          aria-label="Write a review"
          placeholder="Leave a review"
          className="mt-8 w-full rounded-lg border border-[#ddd] p-4 outline-none focus:border-black"
          rows={3}
        />
        <div className="mt-8 space-y-4">
          {[
            "This phone is amazing. The camera and battery life are excellent.",
            "Beautiful display and a premium feel. Very happy with it.",
            "Excellent performance and fast delivery.",
            "I love the color and the screen is incredibly sharp.",
            "The photos look great even in low light.",
            "Everything feels fast and polished. Recommended.",
          ].map((review, index) => (
            <div className="rounded-lg bg-[#fafafa] p-6" key={review}>
              <div className="flex justify-between">
                <strong>
                  {
                    [
                      "Alex M.",
                      "Olivia R.",
                      "Sam K.",
                      "Taylor P.",
                      "Jordan L.",
                      "Casey D.",
                    ][index]
                  }
                </strong>
                <span className="text-[#ffb547]">★★★★★</span>
              </div>
              <p className="mt-3 text-sm text-[#555]">{review}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto min-h-[896px] max-w-[1120px] px-4 pb-20 md:min-h-[656px] lg:px-0">
        <h2 className="mb-8 text-2xl font-semibold">Related Products</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
