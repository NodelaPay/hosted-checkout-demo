import { CartView } from "@/modules/cart-ui/cart-view";
import { SiteFooter } from "@/modules/storefront/components/site-footer";
import { SiteHeader } from "@/modules/storefront/components/site-header";

export default function CartPage() {
  return (
    <>
      <SiteHeader />
      <CartView />
      <SiteFooter />
    </>
  );
}
