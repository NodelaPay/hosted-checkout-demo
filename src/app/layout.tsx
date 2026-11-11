import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CartProvider } from "@/modules/cart-ui/cart-context";
import { FavoritesProvider } from "@/modules/favorites-ui/favorites-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cyber — Technology Store",
  description: "Shop phones, computers, wearables, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <FavoritesProvider>{children}</FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}
