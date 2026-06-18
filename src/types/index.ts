export type Gender = "male" | "female" | "unisex";
export type Concentration = "EDT" | "EDP" | "Parfum" | "Cologne";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus = "new" | "processing" | "shipped" | "delivered" | "cancelled";
export type CouponDiscountType = "percent" | "fixed";
export type CouponAppliesTo = "products" | "shipping";

export interface ProductSize {
  ml: number;
  price: number;
  stock: number;
}

export interface ProductNotes {
  top: string[];
  middle: string[];
  base: string[];
}

export interface ProductDTO {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  price: number;
  salePrice?: number;
  category: { _id: string; name: string; slug: string } | string;
  gender: Gender;
  concentration: Concentration;
  sizes: ProductSize[];
  notes: ProductNotes;
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDTO {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  image?: string;
  ml: number;
  unitPrice: number;
  quantity: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  zip: string;
  country: string;
}

export interface OrderItemDTO {
  productId: string;
  name: string;
  ml: number;
  quantity: number;
  unitPrice: number;
}

export interface CouponDTO {
  _id: string;
  code: string;
  appliesTo: CouponAppliesTo;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  maxUsesPerCustomer?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  isPublic: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDTO {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItemDTO[];
  subtotal: number;
  shippingPrice: number;
  discountAmount: number;
  couponId?: string;
  couponCode?: string;
  couponAppliesTo?: CouponAppliesTo;
  total: number;
  paymentStatus: PaymentStatus;
  paymentProvider: "payplus";
  paymentTransactionId?: string;
  payplusPageUid?: string;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
}
