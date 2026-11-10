"use client";

import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { catalogService } from "../service";
import { emptyFilters, FilterPanel, type FilterState } from "./filter-panel";
import { ProductCard } from "@/modules/storefront/components/product-card";

export function ProductsView({
  initialQuery = "",
  initialCategory = "",
  initialFilters = emptyFilters,
}: {
  initialQuery?: string;
  initialCategory?: string;
  initialFilters?: FilterState;
}) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [sort, setSort] = useState("rating");
  const [showAll, setShowAll] = useState(false);
  const products = useMemo(() => {
    const matching = catalogService.list().filter((product) => {
      if (
        initialQuery &&
        !product.name.toLowerCase().includes(initialQuery.toLowerCase())
      )
        return false;
      if (initialCategory && product.category !== initialCategory) return false;
      if (filters.brand && product.brand !== filters.brand) return false;
      if (filters.memory && product.memory !== filters.memory) return false;
      if (filters.minPrice && product.price < Number(filters.minPrice))
        return false;
      if (filters.maxPrice && product.price > Number(filters.maxPrice))
        return false;
      return true;
    });
    return [...matching].sort((a, b) =>
      sort === "price-low"
        ? a.price - b.price
        : sort === "price-high"
          ? b.price - a.price
          : 0,
    );
  }, [filters, initialCategory, initialQuery, sort]);

  return (
    <main>
      <div className="mx-auto hidden max-w-[1120px] py-10 text-sm text-[#888] md:block">
        Home <span className="mx-3">›</span> Catalog{" "}
        <span className="mx-3">›</span>{" "}
        <span className="font-semibold text-black">
          {initialCategory || "Smartphones"}
        </span>
      </div>
      <div className="mx-auto flex max-w-[1120px] gap-8 px-4 pb-20 pt-10 md:pt-0 lg:px-0">
        <aside className="hidden w-[256px] shrink-0 md:block">
          <FilterPanel value={filters} onChange={setFilters} />
        </aside>
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex gap-4 md:items-center md:justify-between">
            <Link
              href="/products/filters"
              className="flex h-14 flex-1 items-center justify-between rounded-lg border border-[#ddd] px-4 md:hidden"
            >
              Filters
              <SlidersHorizontal size={18} />
            </Link>
            <p className="hidden text-sm text-[#888] md:block">
              Selected Products:{" "}
              <strong className="text-black">{products.length || 0}</strong>
            </p>
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-14 flex-1 rounded-lg border border-[#ddd] bg-white px-4 text-sm outline-none md:max-w-[250px]"
            >
              <option value="rating">By rating</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
          <p className="mb-4 text-sm text-[#777] md:hidden">
            Products Result: <strong>{products.length || 0}</strong>
          </p>
          {products.length ? (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className={
                      showAll
                        ? ""
                        : index >= 9
                          ? "hidden"
                          : index >= 8
                            ? "hidden md:block"
                            : ""
                    }
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              {products.length > 9 && !showAll && (
                <button
                  onClick={() => setShowAll(true)}
                  className="mx-auto mt-10 block rounded border border-[#aaa] px-8 py-3 text-sm transition-colors hover:border-black hover:bg-black hover:text-white"
                >
                  Load More
                </button>
              )}
            </>
          ) : (
            <div className="rounded-lg bg-[#f6f6f6] p-10 text-center">
              <h2 className="text-xl font-semibold">No products found</h2>
              <p className="mt-2 text-[#777]">
                Try changing your search or filters.
              </p>
              <button
                onClick={() => setFilters(emptyFilters)}
                className="mt-5 rounded bg-black px-6 py-3 text-white"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
