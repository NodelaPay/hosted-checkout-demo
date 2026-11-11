import { notFound } from "next/navigation";
import { catalogService } from "@/modules/catalog/service";
import { ProductDetail } from "@/modules/catalog/components/product-detail";
import { reviewService } from "@/modules/catalog/review.service";
import { SiteFooter } from "@/modules/storefront/components/site-footer";
import { SiteHeader } from "@/modules/storefront/components/site-header";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await catalogService.getById(id);
  if (!product) notFound();
  const related = (await catalogService.list())
    .filter((item) => item.id !== product.id)
    .slice(0, 4);
  const reviews = await reviewService.list(product.id);
  return (
    <>
      <SiteHeader />
      <ProductDetail
        product={product}
        related={related}
        initialReviews={reviews}
      />
      <SiteFooter />
    </>
  );
}
