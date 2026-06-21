import mongoose, { Schema, model, models, type Model } from "mongoose";

export type CouponDiscountType = "percent" | "fixed";
export type CouponAppliesTo = "products" | "shipping";

export interface CouponDoc {
  _id: mongoose.Types.ObjectId;
  code: string;
  appliesTo: CouponAppliesTo;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  maxUsesPerCustomer?: number;
  usedCount: number;
  expiresAt?: Date;
  isActive: boolean;
  isPublic: boolean;
  description?: string;
  /** Empty = all products; non-empty = discount only on these products */
  productIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<CouponDoc>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    appliesTo: {
      type: String,
      enum: ["products", "shipping"],
      default: "products",
      required: true,
    },
    discountType: {
      type: String,
      enum: ["percent", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, min: 0 },
    maxUses: { type: Number, min: 1 },
    maxUsesPerCustomer: { type: Number, min: 1, default: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
    isPublic: { type: Boolean, default: false, index: true },
    description: { type: String },
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true },
);

CouponSchema.index({ isActive: 1, isPublic: 1, expiresAt: 1 });

CouponSchema.pre("validate", function () {
  if (this.code) {
    this.code = this.code.trim().toUpperCase();
  }
});

export const CouponModel: Model<CouponDoc> =
  (models.Coupon as Model<CouponDoc>) || model<CouponDoc>("Coupon", CouponSchema);
