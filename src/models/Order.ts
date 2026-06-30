import mongoose, { Schema, model, models, type Model } from "mongoose";
import type { CouponAppliesTo } from "@/models/Coupon";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus = "new" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItemDoc {
  productId: mongoose.Types.ObjectId;
  name: string;
  ml: number;
  quantity: number;
  unitPrice: number;
}

export interface OrderDoc {
  _id: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    floor?: string;
    apartment?: string;
    city: string;
    zip: string;
    country: string;
  };
  items: OrderItemDoc[];
  subtotal: number;
  shippingPrice: number;
  discountAmount: number;
  couponId?: mongoose.Types.ObjectId;
  couponCode?: string;
  couponAppliesTo?: CouponAppliesTo;
  total: number;
  paymentStatus: PaymentStatus;
  paymentProvider: "payplus";
  paymentTransactionId?: string;
  payplusPageUid?: string;
  orderStatus: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItemDoc>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    ml: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const ShippingAddressSchema = new Schema(
  {
    street: { type: String, required: true },
    floor: { type: String },
    apartment: { type: String },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, default: "IL" },
  },
  { _id: false },
);

const OrderSchema = new Schema<OrderDoc>(
  {
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    customerPhone: { type: String, required: true },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shippingPrice: { type: Number, required: true, min: 0, default: 0 },
    discountAmount: { type: Number, required: true, min: 0, default: 0 },
    couponId: { type: Schema.Types.ObjectId, ref: "Coupon" },
    couponCode: { type: String },
    couponAppliesTo: { type: String, enum: ["products", "shipping"] },
    total: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    paymentProvider: {
      type: String,
      enum: ["payplus"],
      default: "payplus",
    },
    paymentTransactionId: { type: String },
    payplusPageUid: { type: String, index: true },
    orderStatus: {
      type: String,
      enum: ["new", "processing", "shipped", "delivered", "cancelled"],
      default: "new",
      index: true,
    },
  },
  { timestamps: true },
);

export const OrderModel: Model<OrderDoc> =
  (models.Order as Model<OrderDoc>) || model<OrderDoc>("Order", OrderSchema);
