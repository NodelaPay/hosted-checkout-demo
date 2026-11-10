import { ProductsView } from "@/modules/catalog/components/products-view";
import { SiteFooter } from "@/modules/storefront/components/site-footer";
import { SiteHeader } from "@/modules/storefront/components/site-header";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    brand?: string;
    memory?: string;
    min?: string;
    max?: string;
  }>;
}) {
  const { q, category, brand, memory, min, max } = await searchParams;
  return (
    <>
      <SiteHeader />
      <ProductsView
        initialQuery={q}
        initialCategory={category}
        initialFilters={{
          brand: brand ?? "",
          memory: memory ?? "",
          minPrice: min ?? "",
          maxPrice: max ?? "",
        }}
      />
      <SiteFooter />
    </>
  );
}
