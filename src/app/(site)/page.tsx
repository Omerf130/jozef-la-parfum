import { Suspense } from "react";
import { Spinner } from "@/components/Spinner";
import { Hero } from "@/features/home/Hero";
import { FeaturedProducts } from "@/features/home/FeaturedProducts";
import { CategoryTiles } from "@/features/home/CategoryTiles";
import { BestSellers } from "@/features/home/BestSellers";
import { EditorialSection } from "@/features/home/EditorialSection";
import { NewsletterStrip } from "@/features/home/NewsletterStrip";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Suspense fallback={<Spinner />}>
        <FeaturedProducts />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <CategoryTiles />
      </Suspense>
      <EditorialSection />
      <Suspense fallback={<Spinner />}>
        <BestSellers />
      </Suspense>
      <NewsletterStrip />
      <WhatsAppButton />
    </>
  );
}
