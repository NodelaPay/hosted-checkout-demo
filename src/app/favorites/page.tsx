import type { Metadata } from "next";
import { catalogService } from "@/modules/catalog/service";
import { FavoritesView } from "@/modules/favorites-ui/favorites-view";
import { PageHeading } from "@/modules/storefront/components/page-heading";
import { SiteFooter } from "@/modules/storefront/components/site-footer";
import { SiteHeader } from "@/modules/storefront/components/site-header";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Favorites | Cyber",
  description: "Your favorite products in the Cyber demo storefront.",
};

export default async function FavoritesPage() {
  const products = await catalogService.list();
  return (
    <>
      <SiteHeader />
      <main>
        <PageHeading
          eyebrow="Saved for later"
          title="Your favorites"
          description="Keep the products you like in one place while you explore."
        />
        <FavoritesView products={products} />
      </main>
      <SiteFooter />
    </>
  );
}
