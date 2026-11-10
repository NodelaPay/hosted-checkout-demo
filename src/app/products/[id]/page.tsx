import { notFound } from "next/navigation";
import { catalogService } from "@/modules/catalog/service";
import { ProductDetail } from "@/modules/catalog/components/product-detail";
import { SiteFooter } from "@/modules/storefront/components/site-footer";
import { SiteHeader } from "@/modules/storefront/components/site-header";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = catalogService.getById(id);
  if (!product) notFound();
  return (
    <>
      <SiteHeader />
      <ProductDetail product={product} />
      <SiteFooter />
    </>
  );
}
