"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";
import type { ProductDto } from "@/modules/catalog/product.dto";
import { useCart } from "@/modules/cart-ui/cart-context";

export function ProductCard({ product }: { readonly product: ProductDto }) {
  const { add } = useCart();
  const [favorite, setFavorite] = useState(false);
  const [added, setAdded] = useState(false);
  const addToCart = () => {
    add(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="group relative flex min-w-0 flex-col items-center rounded-[9px] bg-[#f6f6f6] px-3 pb-4 pt-10 text-center transition-shadow duration-300 hover:shadow-lg md:px-4 md:pb-6 md:pt-12">
      <button
        aria-label={
          favorite
            ? `Remove ${product.shortName} from favorites`
            : `Add ${product.shortName} to favorites`
        }
        aria-pressed={favorite}
        onClick={() => setFavorite((value) => !value)}
        className="absolute right-4 top-4 z-10 text-[#b6b6b6] transition-colors hover:text-red-500"
      >
        <Heart
          size={24}
          fill={favorite ? "#ef4444" : "none"}
          className={favorite ? "text-red-500" : ""}
          strokeWidth={1.6}
        />
      </button>
      <Link
        href={`/products/${product.id}`}
        className="relative mb-4 block h-[130px] w-full md:h-[160px]"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 45vw, 220px"
          className="product-image object-contain"
        />
      </Link>
      <Link
        href={`/products/${product.id}`}
        className="line-clamp-2 min-h-10 text-[14px] leading-5 md:text-[15px]"
      >
        {product.shortName}
      </Link>
      <p className="my-3 text-[22px] font-semibold tracking-[-.02em] md:text-[24px]">
        ${product.price}
      </p>
      <button
        onClick={addToCart}
        className="w-full max-w-[188px] rounded-[7px] bg-black px-3 py-3 text-xs text-white transition-transform hover:-translate-y-0.5 hover:bg-[#252525] active:scale-95 md:text-sm"
      >
        {added ? "Added to Cart" : "Buy Now"}
      </button>
    </article>
  );
}
