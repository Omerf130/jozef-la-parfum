export const SECTION_EYEBROW = "COLLECTIONS";

export const CAMPAIGN_CATEGORIES = [
  {
    slug: "women",
    label: "WOMEN",
    titleFallback: "לאישה",
    objectPosition: "center 42%",
  },
  {
    slug: "men",
    label: "MEN",
    titleFallback: "לגבר",
    objectPosition: "center 42%",
  },
  {
    slug: "unisex",
    label: "UNISEX",
    titleFallback: "יוניסקס",
    objectPosition: "center 42%",
  },
] as const;

export type CampaignCategorySlug = (typeof CAMPAIGN_CATEGORIES)[number]["slug"];

export function getCampaignObjectPosition(slug: CampaignCategorySlug): string {
  const entry = CAMPAIGN_CATEGORIES.find((c) => c.slug === slug);
  return entry?.objectPosition ?? "center 42%";
}
