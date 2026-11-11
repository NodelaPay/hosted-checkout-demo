"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import type { ProductDto } from "@/modules/catalog/product.dto";
import { ProductCard } from "@/modules/storefront/components/product-card";
import { useFavorites } from "./favorites-context";

export function FavoritesView({
  products: catalogProducts,
}: {
  readonly products: readonly ProductDto[];
}) {
  const { productIds, error } = useFavorites();
  const products = catalogProducts.filter((product) =>
    productIds.includes(product.id),
  );

  return (
    <section className="mx-auto min-h-[440px] max-w-[1120px] px-4 py-16 md:py-24 lg:px-0">
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-700">
          {error}
        </p>
      )}
      {products.length > 0 ? (
        <>
          <p className="mb-8 text-sm text-[#777]">
            {products.length} saved{" "}
            {products.length === 1 ? "product" : "products"}
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Heart size={46} strokeWidth={1.2} />
          <h2 className="mt-6 text-3xl font-light tracking-[-0.04em]">
            Your list is ready when you are.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-7 text-[#666]">
            Tap the heart on any product to save it here for later. Favorites
            stay in this browser for the demo.
          </p>
          <Link
            href="/products"
            className="mt-8 rounded-md bg-black px-8 py-4 text-sm text-white transition-transform hover:-translate-y-0.5"
          >
            Browse products
          </Link>
        </div>
      )}
    </section>
  );
}
