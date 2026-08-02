import { Suspense } from "react";
import { Spinner } from "@/components/Spinner";
import { Hero } from "@/features/home/Hero";
import { CategoryTiles } from "@/features/home/CategoryTiles";
import { FeaturedProducts } from "@/features/home/FeaturedProducts";
import { DiscoverMood } from "@/features/home/DiscoverMood";
import { NewsletterStrip } from "@/features/home/NewsletterStrip";
import { PublicCoupons } from "@/features/home/PublicCoupons";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<Spinner />}>
        <Hero />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <CategoryTiles />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <FeaturedProducts />
      </Suspense>
      <DiscoverMood />
      <PublicCoupons />
      <NewsletterStrip />
      <WhatsAppButton />
    </>
  );
}
