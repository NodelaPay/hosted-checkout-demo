import { notFound } from "next/navigation";
import { CheckoutView } from "@/modules/checkout-ui/checkout-view";
import { catalogService } from "@/modules/catalog/service";
import { SiteFooter } from "@/modules/storefront/components/site-footer";
import { SiteHeader } from "@/modules/storefront/components/site-header";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;

  if (step !== "address" && step !== "shipping" && step !== "payment") {
    notFound();
  }
  const products = await catalogService.list();

  return (
    <>
      <SiteHeader />
      <CheckoutView step={step} products={products} />
      <SiteFooter />
    </>
  );
}
