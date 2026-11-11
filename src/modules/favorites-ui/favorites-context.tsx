"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { z } from "zod";
import { ensureGuestSession } from "@/infrastructure/http/client-session";

interface FavoritesContextValue {
  readonly productIds: readonly string[];
  readonly error: string | null;
  has(productId: string): boolean;
  toggle(productId: string): void;
}

const responseSchema = z.object({ productIds: z.array(z.string()) });
const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [productIds, setProductIds] = useState<readonly string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const current = useRef<readonly string[]>([]);
  const pending = useRef<Promise<void>>(Promise.resolve());

  async function refresh(): Promise<void> {
    await ensureGuestSession();
    const response = await fetch("/api/favorites", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load favorites");
    const data = responseSchema.parse(await response.json());
    current.current = data.productIds;
    setProductIds(data.productIds);
    setError(null);
  }

  useEffect(() => {
    queueMicrotask(() => {
      void refresh().catch(() => setError("Could not load your favorites."));
    });
  }, []);

  function toggle(productId: string): void {
    const favorite = !current.current.includes(productId);
    const next = favorite
      ? [...current.current, productId]
      : current.current.filter((id) => id !== productId);
    current.current = next;
    setProductIds(next);
    setError(null);

    pending.current = pending.current
      .catch(() => undefined)
      .then(async () => {
        await ensureGuestSession();
        const response = await fetch("/api/favorites", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ productId, favorite }),
        });
        if (!response.ok) throw new Error("Could not save favorite");
      })
      .catch(async () => {
        setError("Could not save your favorite. Please try again.");
        try {
          await refresh();
        } catch {
          // Keep the visible error when the server cannot be reached.
        }
      });
  }

  return (
    <FavoritesContext.Provider
      value={{
        productIds,
        error,
        has: (productId) => productIds.includes(productId),
        toggle,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }
  return context;
}
