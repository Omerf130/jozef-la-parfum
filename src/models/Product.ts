import mongoose, { Schema, model, models, type Model } from "mongoose";
import slugify from "slugify";

export interface ProductSizeDoc {
  ml: number;
  price: number;
  stock: number;
}

export interface ProductNotesDoc {
  top: string[];
  middle: string[];
  base: string[];
}

export interface ProductDoc {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  brand: string;
  description: string;
  price: number;
  salePrice?: number;
  category: mongoose.Types.ObjectId;
  gender: "male" | "female" | "unisex";
  concentration: "EDT" | "EDP" | "Parfum" | "Cologne";
  sizes: ProductSizeDoc[];
  notes: ProductNotesDoc;
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SizeSchema = new Schema<ProductSizeDoc>(
  {
    ml: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false },
);

const NotesSchema = new Schema<ProductNotesDoc>(
  {
    top: { type: [String], default: [] },
    middle: { type: [String], default: [] },
    base: { type: [String], default: [] },
  },
  { _id: false },
);

const ProductSchema = new Schema<ProductDoc>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    brand: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    gender: {
      type: String,
      enum: ["male", "female", "unisex"],
      required: true,
      index: true,
    },
    concentration: {
      type: String,
      enum: ["EDT", "EDP", "Parfum", "Cologne"],
      required: true,
      index: true,
    },
    sizes: { type: [SizeSchema], default: [] },
    notes: { type: NotesSchema, default: () => ({ top: [], middle: [], base: [] }) },
    images: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

ProductSchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true, locale: "he" });
  }
  next();
});

ProductSchema.index({ name: "text", brand: "text", description: "text" });

export const ProductModel: Model<ProductDoc> =
  (models.Product as Model<ProductDoc>) || model<ProductDoc>("Product", ProductSchema);
