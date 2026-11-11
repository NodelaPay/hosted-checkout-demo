import { CartView } from "@/modules/cart-ui/cart-view";
import { catalogService } from "@/modules/catalog/service";
import { SiteFooter } from "@/modules/storefront/components/site-footer";
import { SiteHeader } from "@/modules/storefront/components/site-header";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const products = await catalogService.list();
  return (
    <>
      <SiteHeader />
      <CartView products={products} />
      <SiteFooter />
    </>
  );
}
