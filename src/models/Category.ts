import mongoose, { Schema, model, models, type Model } from "mongoose";
import slugify from "slugify";

export interface CategoryDoc {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<CategoryDoc>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String },
    image: { type: String },
  },
  { timestamps: true },
);

CategorySchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true, locale: "he" });
  }
  next();
});

export const CategoryModel: Model<CategoryDoc> =
  (models.Category as Model<CategoryDoc>) || model<CategoryDoc>("Category", CategorySchema);
