import Link from "next/link";
import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import "@/models/Category";
import { buildProductTextSearchFilter } from "@/lib/productSearch";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { ADMIN_PRODUCTS_PAGE_SIZE } from "@/features/admin/constants";
import { AdminToolbar } from "@/features/admin/ui/AdminToolbar";
import { AdminPagination } from "@/features/admin/ui/AdminPagination";
import { AdminProductsList } from "@/features/admin/products/AdminProductsList";
import { ProductsListScrollRestore } from "@/features/admin/products/ProductsListScrollRestore";
import { serializeAdminProductRow } from "@/features/admin/products/serializeAdminProductRow";
import styles from "./page.module.scss";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const requestedPage = Math.max(1, Number(sp.page) || 1);

  await connectDB();

  const filter: Record<string, unknown> = {};
  if (q.length >= 2) {
    const textFilter = buildProductTextSearchFilter(q);
    if (textFilter) Object.assign(filter, textFilter);
  }

  const totalCount = await ProductModel.countDocuments(filter);

  const totalPages = Math.max(1, Math.ceil(totalCount / ADMIN_PRODUCTS_PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const docs = await ProductModel.find(filter)
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .skip((page - 1) * ADMIN_PRODUCTS_PAGE_SIZE)
    .limit(ADMIN_PRODUCTS_PAGE_SIZE)
    .lean();

  const listParams = { q: q || undefined, page };
  const products = docs.map(serializeAdminProductRow);

  const hasSearch = q.length >= 2;

  return (
    <div className={styles.page}>
      <ProductsListScrollRestore q={q} page={page} />

      <header className={styles.head}>
        <h1>מוצרים</h1>
      </header>

      <AdminToolbar q={q} totalCount={totalCount} />

      {products.length === 0 ? (
        hasSearch ? (
          <EmptyState
            title="לא נמצאו מוצרים"
            description={`אין תוצאות עבור "${q}".`}
            action={
              <Link href="/admin/products">
                <Button variant="ghost">נקה חיפוש</Button>
              </Link>
            }
          />
        ) : (
          <EmptyState
            title="אין מוצרים"
            description="התחל מהוספת המוצר הראשון."
            action={
              <Link href="/admin/products/new">
                <Button>הוסף מוצר</Button>
              </Link>
            }
          />
        )
      ) : (
        <>
          <AdminProductsList products={products} listParams={listParams} />
          <AdminPagination page={page} totalPages={totalPages} q={q || undefined} />
        </>
      )}
    </div>
  );
}
