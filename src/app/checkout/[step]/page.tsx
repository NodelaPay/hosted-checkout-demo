import { notFound } from "next/navigation";
import { CheckoutView } from "@/modules/checkout-ui/checkout-view";
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

  return (
    <>
      <SiteHeader />
      <CheckoutView step={step} />
      <SiteFooter />
    </>
  );
}
