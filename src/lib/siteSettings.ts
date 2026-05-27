import { connectDB } from "@/lib/db";
import {
  SITE_SETTINGS_SINGLETON_KEY,
  SiteSettingsModel,
  DEFAULT_SHIPPING_PRICE_ILS,
  DEFAULT_FREE_SHIPPING_THRESHOLD,
} from "@/models/SiteSettings";

type LeanSettings = {
  heroImages?: string[];
  heroImagesDesktop?: string[];
  heroImagesMobile?: string[];
} | null;

function resolveDesktopFromDoc(doc: LeanSettings): string[] {
  if (!doc) return [];
  const d = doc.heroImagesDesktop;
  if (Array.isArray(d) && d.length) return [...d];
  const legacy = doc.heroImages;
  if (Array.isArray(legacy) && legacy.length) return [...legacy];
  return [];
}

function resolveMobileFromDoc(doc: LeanSettings): string[] {
  if (!doc) return [];
  const m = doc.heroImagesMobile;
  if (Array.isArray(m) && m.length) return [...m];
  return [];
}

export async function getHeroBackgroundImages(): Promise<{
  desktop: string[];
  mobile: string[];
}> {
  await connectDB();
  const doc = await SiteSettingsModel.findOne({
    singletonKey: SITE_SETTINGS_SINGLETON_KEY,
  }).lean();
  return {
    desktop: resolveDesktopFromDoc(doc),
    mobile: resolveMobileFromDoc(doc),
  };
}

export async function getSiteSettingsForAdmin(): Promise<{
  heroImagesDesktop: string[];
  heroImagesMobile: string[];
  shippingPriceILS: number;
  freeShippingThreshold: number;
}> {
  await connectDB();
  let doc = await SiteSettingsModel.findOne({
    singletonKey: SITE_SETTINGS_SINGLETON_KEY,
  }).lean();

  if (!doc) {
    const created = await SiteSettingsModel.create({
      singletonKey: SITE_SETTINGS_SINGLETON_KEY,
      heroImagesDesktop: [],
      heroImagesMobile: [],
    });
    doc = created.toObject();
  }

  return {
    heroImagesDesktop: resolveDesktopFromDoc(doc),
    heroImagesMobile: resolveMobileFromDoc(doc),
    shippingPriceILS: doc.shippingPriceILS ?? DEFAULT_SHIPPING_PRICE_ILS,
    freeShippingThreshold: doc.freeShippingThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD,
  };
}

export async function getShippingConfig(): Promise<{
  shippingPriceILS: number;
  freeShippingThreshold: number;
}> {
  await connectDB();
  const doc = await SiteSettingsModel.findOne({
    singletonKey: SITE_SETTINGS_SINGLETON_KEY,
  }).lean();
  return {
    shippingPriceILS: doc?.shippingPriceILS ?? DEFAULT_SHIPPING_PRICE_ILS,
    freeShippingThreshold: doc?.freeShippingThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD,
  };
}
