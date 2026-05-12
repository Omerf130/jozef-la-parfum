import mongoose, { Schema, model, models, type Model } from "mongoose";

export const SITE_SETTINGS_SINGLETON_KEY = "default";

export interface SiteSettingsDoc {
  _id: mongoose.Types.ObjectId;
  singletonKey: string;
  /** @deprecated use heroImagesDesktop; kept for legacy DB documents */
  heroImages?: string[];
  heroImagesDesktop: string[];
  heroImagesMobile: string[];
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
  },
  { timestamps: true },
);

export const SiteSettingsModel: Model<SiteSettingsDoc> =
  (models.SiteSettings as Model<SiteSettingsDoc>) ||
  model<SiteSettingsDoc>("SiteSettings", SiteSettingsSchema);
