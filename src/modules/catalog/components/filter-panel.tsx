"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import type { ProductDto } from "../product.dto";

export interface FilterState {
  readonly brand: string;
  readonly memory: string;
  readonly minPrice: string;
  readonly maxPrice: string;
}

export const emptyFilters: FilterState = {
  brand: "",
  memory: "",
  minPrice: "",
  maxPrice: "",
};

interface FilterPanelProps {
  readonly products: readonly ProductDto[];
  readonly value: FilterState;
  readonly onChange: (value: FilterState) => void;
}

export function FilterPanel({ products, value, onChange }: FilterPanelProps) {
  const [brandSearch, setBrandSearch] = useState("");
  const [memorySearch, setMemorySearch] = useState("");
  const brands = [...new Set(products.map((product) => product.brand))]
    .filter((brand) => brand.toLowerCase().includes(brandSearch.toLowerCase()))
    .sort();
  const memories = [
    ...new Set(
      products.flatMap((product) => (product.memory ? [product.memory] : [])),
    ),
  ]
    .filter((memory) =>
      memory.toLowerCase().includes(memorySearch.toLowerCase()),
    )
    .sort();
  const update = (key: keyof FilterState, next: string) =>
    onChange({ ...value, [key]: next });

  return (
    <div className="space-y-6 text-sm">
      <details open className="border-b border-[#ddd] pb-6">
        <summary className="mb-6 cursor-pointer text-base font-semibold">
          Price
        </summary>
        <div className="flex items-center gap-3">
          <label className="flex-1 text-xs text-[#999]">
            From
            <input
              aria-label="Minimum price"
              type="number"
              min="0"
              placeholder="0"
              value={value.minPrice}
              onChange={(event) => update("minPrice", event.target.value)}
              className="mt-2 w-full rounded border border-[#ddd] px-2 py-3 text-sm text-black outline-none focus:border-black"
            />
          </label>
          <span className="mt-5 text-[#aaa]">—</span>
          <label className="flex-1 text-xs text-[#999]">
            To
            <input
              aria-label="Maximum price"
              type="number"
              min="0"
              placeholder="2000"
              value={value.maxPrice}
              onChange={(event) => update("maxPrice", event.target.value)}
              className="mt-2 w-full rounded border border-[#ddd] px-2 py-3 text-sm text-black outline-none focus:border-black"
            />
          </label>
        </div>
        <input
          aria-label="Maximum price slider"
          type="range"
          min="100"
          max="2500"
          value={value.maxPrice || "2000"}
          onChange={(event) => update("maxPrice", event.target.value)}
          className="mt-5 w-full accent-black"
        />
      </details>
      <details open className="border-b border-[#ddd] pb-6">
        <summary className="mb-5 cursor-pointer text-base font-semibold">
          Brand
        </summary>
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-3 py-2 text-[#aaa]">
          <Search size={16} />
          <input
            aria-label="Search brands"
            placeholder="Search"
            value={brandSearch}
            onChange={(event) => setBrandSearch(event.target.value)}
            className="w-full bg-transparent outline-none"
          />
        </div>
        <div className="max-h-56 space-y-3 overflow-auto">
          {brands.map((brand) => (
            <label
              className="flex cursor-pointer items-center gap-2"
              key={brand}
            >
              <input
                type="checkbox"
                checked={value.brand === brand}
                onChange={() =>
                  update("brand", value.brand === brand ? "" : brand)
                }
                className="accent-black"
              />
              <span>{brand}</span>
              <small className="text-[#aaa]">
                {products.filter((product) => product.brand === brand).length}
              </small>
            </label>
          ))}
        </div>
      </details>
      <details open className="border-b border-[#ddd] pb-6">
        <summary className="mb-5 cursor-pointer text-base font-semibold">
          Built-in memory
        </summary>
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-3 py-2 text-[#aaa]">
          <Search size={16} />
          <input
            aria-label="Search memory sizes"
            placeholder="Search"
            value={memorySearch}
            onChange={(event) => setMemorySearch(event.target.value)}
            className="w-full bg-transparent outline-none"
          />
        </div>
        <div className="max-h-48 space-y-3 overflow-auto">
          {memories.map((memory) => (
            <label
              className="flex cursor-pointer items-center gap-2"
              key={memory}
            >
              <input
                type="checkbox"
                checked={value.memory === memory}
                onChange={() =>
                  update("memory", value.memory === memory ? "" : memory)
                }
                className="accent-black"
              />
              <span>{memory}</span>
            </label>
          ))}
        </div>
      </details>
    </div>
  );
}
