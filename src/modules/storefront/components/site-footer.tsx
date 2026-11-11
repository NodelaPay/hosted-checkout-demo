import Link from "next/link";
import { AtSign, Camera, Globe, Music2 } from "lucide-react";
import { Logo } from "./site-header";

export function SiteFooter() {
  return (
    <footer className="bg-[#181313] text-white">
      <div className="mx-auto grid max-w-[1120px] gap-6 px-8 py-[49px] md:grid-cols-[2fr_1fr_1fr] md:gap-10 md:py-20 lg:px-0 lg:py-[104px]">
        <div>
          <Logo inverse />
          <p className="mt-4 max-w-[390px] text-[14px] leading-7 text-[#b6b2b2] md:mt-6">
            Explore phones, computers, wearables, and the accessories that make
            every day better in our demo technology storefront.
          </p>
          <div className="mt-8 flex gap-8 text-white md:mt-14">
            <Globe size={17} />
            <AtSign size={17} />
            <Music2 size={17} />
            <Camera size={17} />
          </div>
        </div>
        <div>
          <h2 className="mb-5 text-base font-semibold">Services</h2>
          <ul className="space-y-2 text-sm text-[#b6b2b2] md:space-y-3">
            {[
              "Bonus program",
              "Gift cards",
              "Credit and payment",
              "Service contracts",
              "Non-cash account",
              "Payment",
            ].map((item) => (
              <li key={item}>
                <Link href="/contact" className="hover:text-white">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-5 text-base font-semibold">
            Assistance to the buyer
          </h2>
          <ul className="space-y-2 text-sm text-[#b6b2b2] md:space-y-3">
            {[
              "Find an order",
              "Terms of delivery",
              "Exchange and return of goods",
              "Guarantee",
              "Frequently asked questions",
              "Terms of use",
            ].map((item) => (
              <li key={item}>
                <Link href="/contact" className="hover:text-white">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
