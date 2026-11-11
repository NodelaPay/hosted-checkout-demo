"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { z } from "zod";
import { ensureGuestSession } from "@/infrastructure/http/client-session";
import type { ProductDto } from "@/modules/catalog/product.dto";

const responseSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    }),
  ),
});

interface CartItem {
  readonly productId: string;
  readonly quantity: number;
}

interface CartContextValue {
  readonly items: readonly CartItem[];
  readonly count: number;
  readonly error: string | null;
  add(product: ProductDto): void;
  update(productId: string, quantity: number): void;
  remove(productId: string): void;
  refresh(): Promise<void>;
  waitForSync(): Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { readonly children: ReactNode }) {
  const [items, setItems] = useState<readonly CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const currentItems = useRef<readonly CartItem[]>([]);
  const pending = useRef<Promise<void>>(Promise.resolve());
  const waitForSync = useCallback(() => pending.current, []);

  async function refresh(): Promise<void> {
    await ensureGuestSession();
    const response = await fetch("/api/cart", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load cart");
    const data = responseSchema.parse(await response.json());
    currentItems.current = data.items;
    setItems(data.items);
    setError(null);
  }

  useEffect(() => {
    queueMicrotask(() => {
      void refresh().catch(() => setError("Could not load your cart."));
    });
  }, []);

  function persist(productId: string, quantity: number): void {
    pending.current = pending.current
      .catch(() => undefined)
      .then(async () => {
        await ensureGuestSession();
        const response = await fetch("/api/cart", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });

        if (!response.ok) throw new Error("Could not update cart");
      })
      .catch(async () => {
        setError("Could not save your cart change. Please try again.");
        try {
          await refresh();
        } catch {
          // Keep the visible error when the server cannot be reached.
        }
      });
  }

  function change(productId: string, quantity: number): void {
    const safeQuantity = Math.min(99, Math.max(0, quantity));
    const next = currentItems.current.filter(
      (item) => item.productId !== productId,
    );

    if (safeQuantity > 0) {
      next.push({ productId, quantity: safeQuantity });
    }

    currentItems.current = next;
    setItems(next);
    setError(null);
    persist(productId, safeQuantity);
  }

  return (
    <CartContext.Provider
      value={{
        items,
        count: items.reduce((total, item) => total + item.quantity, 0),
        error,
        add(product) {
          const existing = currentItems.current.find(
            (item) => item.productId === product.id,
          );
          change(product.id, (existing?.quantity ?? 0) + 1);
        },
        update: change,
        remove(productId) {
          change(productId, 0);
        },
        refresh,
        waitForSync,
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
