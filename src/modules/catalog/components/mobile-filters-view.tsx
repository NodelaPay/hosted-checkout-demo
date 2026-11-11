"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import type { ProductDto } from "../product.dto";
import {
  emptyFilters,
  FilterPanel,
  type FilterState,
} from "@/modules/catalog/components/filter-panel";
import { SiteFooter } from "@/modules/storefront/components/site-footer";
import { SiteHeader } from "@/modules/storefront/components/site-header";

export function MobileFiltersView({
  products,
  initialQuery = "",
  initialCategory = "",
  initialFilters = emptyFilters,
}: {
  readonly products: readonly ProductDto[];
  readonly initialQuery?: string;
  readonly initialCategory?: string;
  readonly initialFilters?: FilterState;
}) {
  const router = useRouter();
  const [filters, setFilters] = useState(initialFilters);
  const apply = () => {
    const query = new URLSearchParams();
    if (initialQuery) query.set("q", initialQuery);
    if (initialCategory) query.set("category", initialCategory);
    if (filters.brand) query.set("brand", filters.brand);
    if (filters.memory) query.set("memory", filters.memory);
    if (filters.minPrice) query.set("min", filters.minPrice);
    if (filters.maxPrice) query.set("max", filters.maxPrice);
    router.push(`/products?${query.toString()}`);
  };
  return (
    <>
      <SiteHeader />
      <main className="mx-auto min-h-[1456px] max-w-[1120px] px-4 py-10">
        <button
          onClick={() => router.back()}
          className="mb-7 flex items-center gap-3 text-2xl font-semibold"
        >
          <ChevronLeft />
          Filters
        </button>
        <FilterPanel
          products={products}
          value={filters}
          onChange={setFilters}
        />
        <button
          onClick={apply}
          className="mt-10 w-full rounded-lg bg-black py-4 text-white"
        >
          Apply
        </button>
      </main>
      <SiteFooter />
    </>
  );
}
