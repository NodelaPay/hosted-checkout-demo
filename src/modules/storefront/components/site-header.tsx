"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  Camera,
  Gamepad2,
  Headphones,
  Heart,
  Laptop,
  Menu,
  Search,
  ShoppingCart,
  Smartphone,
  UserRound,
  Watch,
  X,
} from "lucide-react";
import { useCart } from "@/modules/cart-ui/cart-context";

const categories = [
  { label: "Phones", icon: Smartphone },
  { label: "Computers", icon: Laptop },
  { label: "Smart Watches", icon: Watch },
  { label: "Cameras", icon: Camera },
  { label: "Headphones", icon: Headphones },
  { label: "Gaming", icon: Gamepad2 },
];

const mobileLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Shopping Cart", href: "/cart" },
  { label: "Favorites", href: "/favorites" },
  { label: "Account", href: "/account" },
  { label: "About", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Blog", href: "/blog" },
];

export function Logo({ inverse = false }: { readonly inverse?: boolean }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-1 text-[27px] font-bold tracking-[-.08em] ${inverse ? "text-white" : "text-black"}`}
      aria-label="Cyber home"
    >
      <span className="relative -mr-1 inline-block origin-center -rotate-12 text-[35px] leading-none font-black italic">
        7
      </span>
      <span>cyber</span>
    </Link>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { count } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(
      `/products${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`,
    );
    setMenuOpen(false);
  };

  return (
    <header className="relative z-30 bg-white">
      <div className="mx-auto flex h-[88px] max-w-[1120px] items-center justify-between px-4 lg:px-0">
        <Logo />
        <form
          onSubmit={search}
          className="hidden h-14 w-[372px] items-center gap-2 rounded-lg bg-[#f5f5f5] px-4 lg:flex"
        >
          <Search size={19} className="text-[#989898]" />
          <input
            aria-label="Search products"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#989898]"
            placeholder="Search"
          />
        </form>
        <nav
          className="hidden items-center gap-11 text-sm lg:flex"
          aria-label="Main navigation"
        >
          <Link
            className={
              pathname === "/"
                ? "font-semibold"
                : "text-[#666] hover:text-black"
            }
            href="/"
          >
            Home
          </Link>
          <Link
            className={
              pathname.startsWith("/products")
                ? "font-semibold"
                : "text-[#666] hover:text-black"
            }
            href="/products"
          >
            Products
          </Link>
          <Link className="text-[#666] hover:text-black" href="/about">
            About
          </Link>
          <Link className="text-[#666] hover:text-black" href="/contact">
            Contact Us
          </Link>
          <Link className="text-[#666] hover:text-black" href="/blog">
            Blog
          </Link>
        </nav>
        <div className="hidden items-center gap-6 lg:flex">
          <Link href="/favorites" aria-label="Favorites">
            <Heart size={23} strokeWidth={1.6} />
          </Link>
          <Link
            href="/cart"
            className="relative"
            aria-label={`Shopping cart, ${count} items`}
          >
            <ShoppingCart size={23} strokeWidth={1.6} />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 rounded-full bg-black px-1 text-[9px] text-white">
                {count}
              </span>
            )}
          </Link>
          <Link href="/account" aria-label="Account">
            <UserRound size={23} strokeWidth={1.6} />
          </Link>
        </div>
        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="p-2 text-[#1b1b49] lg:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      <div className="hidden h-12 bg-[#2e2e2e] text-[#c7c7c7] lg:block">
        <nav
          aria-label="Product categories"
          className="mx-auto flex h-full max-w-[1120px] items-center justify-between"
        >
          {categories.map(({ label, icon: Icon }) => (
            <Link
              key={label}
              href={`/products?category=${encodeURIComponent(label)}`}
              className="flex items-center gap-2 text-sm transition-colors hover:text-white"
            >
              <Icon size={17} strokeWidth={1.5} />
              {label}
            </Link>
          ))}
        </nav>
      </div>
      {menuOpen && (
        <div className="animate-enter absolute left-0 right-0 top-[88px] border-t bg-white p-5 shadow-xl lg:hidden">
          <form
            onSubmit={search}
            className="mb-4 flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-4 py-3"
          >
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="w-full bg-transparent outline-none"
            />
          </form>
          <nav className="grid gap-1">
            {mobileLinks.map(({ label, href }) => (
              <Link
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-base hover:bg-gray-100"
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
