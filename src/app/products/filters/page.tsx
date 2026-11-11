import { catalogService } from "@/modules/catalog/service";
import { MobileFiltersView } from "@/modules/catalog/components/mobile-filters-view";

export default async function FiltersPage({
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
  const products = await catalogService.list();
  const query = await searchParams;

  return (
    <MobileFiltersView
      products={products}
      initialQuery={query.q}
      initialCategory={query.category}
      initialFilters={{
        brand: query.brand ?? "",
        memory: query.memory ?? "",
        minPrice: query.min ?? "",
        maxPrice: query.max ?? "",
      }}
    />
  );
}
