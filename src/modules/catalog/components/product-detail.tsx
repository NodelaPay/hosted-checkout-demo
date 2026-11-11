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
  Smartphone,
  Truck,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { useCart } from "@/modules/cart-ui/cart-context";
import { useFavorites } from "@/modules/favorites-ui/favorites-context";
import type { ProductDto } from "../product.dto";
import type { ReviewDto } from "../review.dto";
import { ProductCard } from "@/modules/storefront/components/product-card";

const featuredPhoneSpecs = [
  { label: "Screen size", value: "6.7”", icon: Smartphone },
  { label: "CPU", value: "Apple A16 Bionic", icon: Cpu },
  { label: "Number of Cores", value: "6", icon: Cpu },
  { label: "Main camera", value: "48-12-12 MP", icon: Camera },
  { label: "Front-camera", value: "12 MP", icon: Camera },
  { label: "Battery capacity", value: "4323 mAh", icon: Battery },
];

const colorValues: Readonly<Record<string, string>> = {
  "Deep Purple": "#7430bc",
  Gold: "#c7a66c",
  White: "#e3e3e3",
  Blue: "#52769d",
  Silver: "#c3c5c8",
  Black: "#111111",
};

const reviewsResponseSchema = z.object({
  reviews: z.array(
    z.object({
      id: z.uuid(),
      productId: z.string(),
      authorName: z.string(),
      rating: z.number().int().min(1).max(5),
      body: z.string(),
      createdAt: z.string(),
    }),
  ),
});

export function ProductDetail({
  product,
  related,
  initialReviews,
}: {
  readonly product: ProductDto;
  readonly related: readonly ProductDto[];
  readonly initialReviews: readonly ReviewDto[];
}) {
  const { add } = useCart();
  const { has, toggle } = useFavorites();
  const [selectedImage, setSelectedImage] = useState(0);
  const favorite = has(product.id);
  const [added, setAdded] = useState(false);
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [reviews, setReviews] = useState(initialReviews);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBody, setReviewBody] = useState("");
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [reviewBusy, setReviewBusy] = useState(false);
  const averageRating = reviews.length
    ? (
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      ).toFixed(1)
    : "0.0";
  const featuredPhone = product.id === "iphone-14-pro-max";
  const specs = featuredPhone
    ? featuredPhoneSpecs
    : [
        { label: "Category", value: product.category, icon: PackageCheck },
        { label: "Brand", value: product.brand, icon: PackageCheck },
        { label: "Color", value: product.color, icon: PackageCheck },
        ...(product.memory
          ? [{ label: "Capacity", value: product.memory, icon: PackageCheck }]
          : []),
      ];
  const detailRows = featuredPhone
    ? [
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
      ]
    : [
        ["Category", product.category],
        ["Brand", product.brand],
        ["Color", product.color],
        ...(product.memory ? [["Capacity", product.memory]] : []),
      ];

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReviewBusy(true);
    setReviewMessage(null);

    try {
      const response = await fetch(`/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          authorName: reviewName,
          rating: reviewRating,
          body: reviewBody,
        }),
      });
      if (!response.ok) throw new Error("Could not save review");
      const refreshed = await fetch(`/api/products/${product.id}/reviews`, {
        cache: "no-store",
      });
      if (!refreshed.ok) throw new Error("Could not reload reviews");
      const data: unknown = await refreshed.json();
      const parsed = reviewsResponseSchema.parse(data);
      setReviews(parsed.reviews);
      setReviewBody("");
      setReviewMessage("Your review has been saved.");
    } catch {
      setReviewMessage("Your review could not be saved. Please try again.");
    } finally {
      setReviewBusy(false);
    }
  }
  const gallery = featuredPhone
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

  return (
    <main>
      <div className="mx-auto hidden max-w-[1120px] items-center gap-3 py-10 text-sm text-[#999] md:flex">
        <Link href="/">Home</Link>
        <ChevronRight size={15} />
        <Link href="/products">Catalog</Link>
        <ChevronRight size={15} />
        <span>{product.category}</span>
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
            {featuredPhone
              ? product.name.replace(" 128GB Deep Purple", "")
              : product.name}
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
            <span className="text-sm">Color: {product.color}</span>
            <span
              aria-hidden="true"
              style={{ backgroundColor: colorValues[product.color] ?? "#888" }}
              className="h-7 w-7 rounded-full ring-2 ring-black ring-offset-2"
            />
          </div>
          {product.memory && (
            <div className="mt-6">
              <span className="inline-flex rounded-md border border-black px-5 py-3 text-xs md:text-sm">
                {product.memory}
              </span>
            </div>
          )}
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
            {featuredPhone
              ? "Enhanced capabilities thanks to an enlarged display of 6.7 inches and an incredible camera system. Capture more detail in any light, and enjoy long battery life."
              : `Explore the ${product.name}. Review its available details, save it to your favorites, or add it to your cart.`}
          </p>
          <div className="mt-7 flex gap-3">
            <button
              onClick={() => toggle(product.id)}
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
              { Icon: Truck, label: "Delivery", value: "At checkout" },
              { Icon: PackageCheck, label: "Order", value: "Pending payment" },
              { Icon: Heart, label: "Favorites", value: "Save for later" },
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
            {featuredPhone
              ? "The iPhone 14 Pro Max combines a large display, advanced camera system, and everyday performance in a distinctive Deep Purple finish."
              : `Available product information for the ${product.name}.`}
          </p>
          <h3 className="mt-8 text-xl font-semibold">
            {featuredPhone ? "Screen" : "Specifications"}
          </h3>
          {detailRows
            .slice(0, showAllDetails ? undefined : 6)
            .map(([label, value]) => (
              <div
                className="flex justify-between border-b border-[#eee] py-4 text-sm"
                key={label}
              >
                <span>{label}</span>
                <span>{value}</span>
              </div>
            ))}
          {detailRows.length > 6 && (
            <button
              onClick={() => setShowAllDetails((current) => !current)}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded border border-[#ddd] py-3 text-sm"
            >
              {showAllDetails ? "View Less" : "View More"}
              <ChevronDown size={16} />
            </button>
          )}
        </div>
      </section>
      <section className="mx-auto min-h-[2446px] max-w-[1120px] px-4 py-20 md:min-h-[1448px] lg:px-0">
        <h2 className="text-2xl font-semibold">Reviews</h2>
        <div className="mt-8 rounded-lg bg-[#fafafa] p-7">
          <div className="flex items-center gap-6">
            <span className="text-[48px] font-semibold">{averageRating}</span>
            <div>
              <p className="text-sm text-[#888]">
                of {reviews.length}{" "}
                {reviews.length === 1 ? "review" : "reviews"}
              </p>
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
                    width: `${reviews.length ? (reviews.filter((review) => review.rating === stars).length / reviews.length) * 100 : 0}%`,
                  }}
                />
              </span>
            </div>
          ))}
        </div>
        <form
          onSubmit={(event) => void submitReview(event)}
          className="mt-8 grid gap-3"
        >
          <div className="flex flex-wrap gap-3">
            <input
              required
              minLength={2}
              maxLength={80}
              aria-label="Your name"
              placeholder="Your name"
              value={reviewName}
              onChange={(event) => setReviewName(event.target.value)}
              className="h-12 flex-1 rounded-lg border border-[#ddd] px-4 outline-none focus:border-black"
            />
            <select
              aria-label="Rating"
              value={reviewRating}
              onChange={(event) => setReviewRating(Number(event.target.value))}
              className="h-12 rounded-lg border border-[#ddd] px-4"
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} stars
                </option>
              ))}
            </select>
          </div>
          <textarea
            required
            minLength={10}
            maxLength={2000}
            aria-label="Write a review"
            placeholder="Leave a review"
            value={reviewBody}
            onChange={(event) => setReviewBody(event.target.value)}
            className="w-full rounded-lg border border-[#ddd] p-4 outline-none focus:border-black"
            rows={3}
          />
          <button
            type="submit"
            disabled={reviewBusy}
            className="justify-self-start rounded-lg bg-black px-6 py-3 text-sm text-white disabled:opacity-40"
          >
            {reviewBusy ? "Saving…" : "Post review"}
          </button>
          {reviewMessage && (
            <p role="status" className="text-sm">
              {reviewMessage}
            </p>
          )}
        </form>
        <div className="mt-8 space-y-4">
          {reviews.map((review) => (
            <div className="rounded-lg bg-[#fafafa] p-6" key={review.id}>
              <div className="flex justify-between">
                <strong>{review.authorName}</strong>
                <span className="text-[#ffb547]">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </span>
              </div>
              <p className="mt-3 text-sm text-[#555]">{review.body}</p>
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
