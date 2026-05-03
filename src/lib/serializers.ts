import type { ProductDoc } from "@/models/Product";
import type { CategoryDoc } from "@/models/Category";
import type { OrderDoc } from "@/models/Order";
import type {
  ProductDTO,
  CategoryDTO,
  OrderDTO,
} from "@/types";

type Lean<T> = Omit<T, "_id"> & { _id: { toString(): string } | string };

function idToString(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof (value as { toString?: () => string }).toString === "function") {
    return (value as { toString: () => string }).toString();
  }
  return String(value);
}

export function serializeProduct(doc: Lean<ProductDoc> & {
  category?: Lean<CategoryDoc> | unknown;
}): ProductDTO {
  const cat = doc.category as unknown;
  const categoryOut =
    cat && typeof cat === "object" && "name" in (cat as Record<string, unknown>)
      ? {
          _id: idToString((cat as unknown as Lean<CategoryDoc>)._id),
          name: (cat as unknown as Lean<CategoryDoc>).name,
          slug: (cat as unknown as Lean<CategoryDoc>).slug,
        }
      : idToString(cat);

  return {
    _id: idToString(doc._id),
    name: doc.name,
    slug: doc.slug,
    brand: doc.brand,
    description: doc.description,
    price: doc.price,
    salePrice: doc.salePrice ?? undefined,
    category: categoryOut,
    gender: doc.gender,
    concentration: doc.concentration,
    sizes: (doc.sizes ?? []).map((s) => ({
      ml: s.ml,
      price: s.price,
      stock: s.stock,
    })),
    notes: {
      top: doc.notes?.top ?? [],
      middle: doc.notes?.middle ?? [],
      base: doc.notes?.base ?? [],
    },
    images: doc.images ?? [],
    isFeatured: !!doc.isFeatured,
    isActive: !!doc.isActive,
    createdAt: (doc.createdAt instanceof Date
      ? doc.createdAt.toISOString()
      : String(doc.createdAt)) ?? "",
    updatedAt: (doc.updatedAt instanceof Date
      ? doc.updatedAt.toISOString()
      : String(doc.updatedAt)) ?? "",
  };
}

export function serializeCategory(doc: Lean<CategoryDoc>): CategoryDTO {
  return {
    _id: idToString(doc._id),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    image: doc.image,
    createdAt:
      doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.createdAt as unknown as string | undefined),
    updatedAt:
      doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : (doc.updatedAt as unknown as string | undefined),
  };
}

export function serializeOrder(doc: Lean<OrderDoc>): OrderDTO {
  return {
    _id: idToString(doc._id),
    customerName: doc.customerName,
    customerEmail: doc.customerEmail,
    customerPhone: doc.customerPhone,
    shippingAddress: {
      street: doc.shippingAddress.street,
      city: doc.shippingAddress.city,
      zip: doc.shippingAddress.zip,
      country: doc.shippingAddress.country,
    },
    items: doc.items.map((it) => ({
      productId: idToString(it.productId),
      name: it.name,
      ml: it.ml,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
    })),
    subtotal: doc.subtotal,
    shippingPrice: doc.shippingPrice,
    total: doc.total,
    paymentStatus: doc.paymentStatus,
    paymentProvider: doc.paymentProvider,
    paymentTransactionId: doc.paymentTransactionId,
    payplusPageUid: doc.payplusPageUid,
    orderStatus: doc.orderStatus,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt),
  };
}
