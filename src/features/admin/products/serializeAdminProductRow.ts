export interface AdminProductRow {
  _id: string;
  name: string;
  brand: string;
  price: number;
  salePrice?: number;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  categoryName: string;
  totalStock: number;
}

export function serializeAdminProductRow(doc: {
  _id: unknown;
  name: string;
  brand: string;
  price: number;
  salePrice?: number;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  sizes: { stock: number }[];
  category?: unknown;
}): AdminProductRow {
  const cat = doc.category as { name?: string } | undefined;
  return {
    _id: String(doc._id),
    name: doc.name,
    brand: doc.brand,
    price: doc.price,
    salePrice: doc.salePrice,
    images: doc.images,
    isActive: doc.isActive,
    isFeatured: doc.isFeatured,
    categoryName: cat?.name ?? "—",
    totalStock: doc.sizes.reduce((acc, s) => acc + s.stock, 0),
  };
}
