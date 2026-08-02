import { getHeroBackgroundImages } from "@/lib/siteSettings";
import { HeroExperience } from "./HeroExperience";

export async function Hero() {
  const { desktop, mobile } = await getHeroBackgroundImages();
  const mobileForDeck = mobile.length ? mobile : desktop;

  return <HeroExperience desktopImages={desktop} mobileImages={mobileForDeck} />;
}
