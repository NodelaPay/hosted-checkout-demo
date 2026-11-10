"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { ProductDto } from "@/modules/catalog/product.dto";

interface CartItem {
  readonly productId: string;
  readonly quantity: number;
}
interface CartContextValue {
  readonly items: readonly CartItem[];
  readonly count: number;
  add(product: ProductDto): void;
  update(productId: string, quantity: number): void;
  remove(productId: string): void;
}

const STORAGE_KEY = "cyber-demo-cart";
const CartContext = createContext<CartContextValue | null>(null);
const initialItems: readonly CartItem[] = [
  { productId: "iphone-14-pro-max", quantity: 1 },
  { productId: "airpods-max", quantity: 1 },
  { productId: "watch-series-9", quantity: 1 },
];

function isCartItem(value: unknown): value is CartItem {
  return (
    typeof value === "object" &&
    value !== null &&
    "productId" in value &&
    typeof value.productId === "string" &&
    "quantity" in value &&
    typeof value.quantity === "number" &&
    Number.isInteger(value.quantity) &&
    value.quantity > 0
  );
}

export function CartProvider({ children }: { readonly children: ReactNode }) {
  const [items, setItems] = useState<readonly CartItem[]>(initialItems);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const validItems = parsed.filter(isCartItem);
          if (validItems.length === parsed.length) {
            queueMicrotask(() => setItems(validItems));
          }
        }
      }
    } catch {
      /* Keep demo defaults when storage is unavailable. */
    }
    queueMicrotask(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const add = (product: ProductDto) =>
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      return existing
        ? current.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [...current, { productId: product.id, quantity: 1 }];
    });
  const update = (productId: string, quantity: number) =>
    setItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item,
      ),
    );
  const remove = (productId: string) =>
    setItems((current) =>
      current.filter((item) => item.productId !== productId),
    );

  return (
    <CartContext.Provider
      value={{
        items,
        count: items.reduce((total, item) => total + item.quantity, 0),
        add,
        update,
        remove,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
