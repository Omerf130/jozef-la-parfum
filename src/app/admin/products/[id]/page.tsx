import Link from "next/link";
import mongoose from "mongoose";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import { CategoryModel } from "@/models/Category";
import { serializeProduct, serializeCategory } from "@/lib/serializers";
import { ProductForm } from "@/features/admin/ProductForm";
import { AdminBreadcrumbs } from "@/features/admin/ui/AdminBreadcrumbs";
import {
  buildProductsListUrl,
  parseListReturnParams,
} from "@/features/admin/products/buildProductsListUrl";
import styles from "../page.module.scss";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ listQ?: string; listPage?: string }>;
}

export default async function EditProductPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  if (!mongoose.isValidObjectId(id)) notFound();

  const returnTo = buildProductsListUrl(parseListReturnParams(sp));

  await connectDB();
  const [doc, cats] = await Promise.all([
    ProductModel.findById(id).populate("category", "name slug").lean(),
    CategoryModel.find().sort({ name: 1 }).lean(),
  ]);
  if (!doc) notFound();

  const product = serializeProduct(doc);
  const categories = cats.map(serializeCategory);

  return (
    <div className={styles.page}>
      <AdminBreadcrumbs
        items={[
          { label: "ניהול", href: "/admin" },
          { label: "מוצרים", href: returnTo },
          { label: "עריכת מוצר" },
        ]}
      />
      <header className={styles.editHead}>
        <Link href={returnTo} className={styles.backLink}>
          → חזרה למוצרים
        </Link>
        <h1>עריכת מוצר</h1>
        <p>
          {product.brand} — {product.name}
        </p>
      </header>
      <ProductForm categories={categories} initial={product} returnTo={returnTo} />
    </div>
  );
}
