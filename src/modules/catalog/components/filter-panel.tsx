"use client";

import { Search } from "lucide-react";

const brands = [
  "Apple",
  "Samsung",
  "Xiaomi",
  "Poco",
  "OPPO",
  "Honor",
  "Motorola",
  "Nokia",
  "Realme",
];
const memories = ["16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB"];

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
  readonly value: FilterState;
  readonly onChange: (value: FilterState) => void;
}

export function FilterPanel({ value, onChange }: FilterPanelProps) {
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
          <span>Search</span>
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
                {brand === "Apple" ? "110" : brand === "Samsung" ? "125" : "68"}
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
          <span>Search</span>
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
      {[
        "Protection class",
        "Screen diagonal",
        "Screen type",
        "Battery capacity",
      ].map((name) => (
        <details className="border-b border-[#ddd] pb-5" key={name}>
          <summary className="cursor-pointer text-base font-semibold">
            {name}
          </summary>
          <p className="pt-4 text-[#777]">More options coming soon.</p>
        </details>
      ))}
    </div>
  );
}
