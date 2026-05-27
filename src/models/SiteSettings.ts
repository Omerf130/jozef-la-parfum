import mongoose, { Schema, model, models, type Model } from "mongoose";

export const SITE_SETTINGS_SINGLETON_KEY = "default";

export const DEFAULT_SHIPPING_PRICE_ILS = 30;
export const DEFAULT_FREE_SHIPPING_THRESHOLD = 499;

export interface SiteSettingsDoc {
  _id: mongoose.Types.ObjectId;
  singletonKey: string;
  /** @deprecated use heroImagesDesktop; kept for legacy DB documents */
  heroImages?: string[];
  heroImagesDesktop: string[];
  heroImagesMobile: string[];
  shippingPriceILS: number;
  freeShippingThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<SiteSettingsDoc>(
  {
    singletonKey: {
      type: String,
      required: true,
      unique: true,
      default: SITE_SETTINGS_SINGLETON_KEY,
      index: true,
    },
    heroImages: { type: [String], default: undefined },
    heroImagesDesktop: { type: [String], default: [] },
    heroImagesMobile: { type: [String], default: [] },
    shippingPriceILS: { type: Number, default: DEFAULT_SHIPPING_PRICE_ILS, min: 0 },
    freeShippingThreshold: { type: Number, default: DEFAULT_FREE_SHIPPING_THRESHOLD, min: 0 },
  },
  { timestamps: true },
);

export const SiteSettingsModel: Model<SiteSettingsDoc> =
  (models.SiteSettings as Model<SiteSettingsDoc>) ||
  model<SiteSettingsDoc>("SiteSettings", SiteSettingsSchema);
