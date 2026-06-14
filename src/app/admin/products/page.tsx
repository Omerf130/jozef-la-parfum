import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import "@/models/Category";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { formatILS } from "@/lib/format";
import styles from "./page.module.scss";

export default async function AdminProductsPage() {
  await connectDB();
  const products = await ProductModel.find()
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1>מוצרים</h1>
          <p>{products.length} מוצרים בסה&quot;כ</p>
        </div>
        <Link href="/admin/products/new">
          <Button variant="secondary">+ הוסף מוצר</Button>
        </Link>
      </header>

      {products.length === 0 ? (
        <EmptyState
          title="אין מוצרים"
          description="התחל מהוספת המוצר הראשון."
          action={
            <Link href="/admin/products/new">
              <Button>הוסף מוצר</Button>
            </Link>
          }
        />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th></th>
                <th>שם</th>
                <th>יצרן</th>
                <th>קטגוריה</th>
                <th>מחיר</th>
                <th>מלאי</th>
                <th>סטטוס</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const totalStock = p.sizes.reduce((acc, s) => acc + s.stock, 0);
                const cat = p.category as unknown as { name?: string } | undefined;
                return (
                  <tr key={String(p._id)} className={!p.isActive ? styles.inactive : ""}>
                    <td>
                      <div className={styles.thumb}>
                        {p.images[0] ? (
                          <Image src={p.images[0]} alt={p.name} fill sizes="60px" />
                        ) : (
                          <div className={styles.thumbPlaceholder}>✦</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <Link href={`/admin/products/${String(p._id)}`} className={styles.name}>
                        {p.name}
                      </Link>
                      {p.isFeatured ? <span className={styles.featured}>מומלץ</span> : null}
                    </td>
                    <td>{p.brand}</td>
                    <td>{cat?.name ?? "—"}</td>
                    <td>{formatILS(p.price)}</td>
                    <td>{totalStock}</td>
                    <td>
                      <span className={p.isActive ? styles.active : styles.disabled}>
                        {p.isActive ? "פעיל" : "מושבת"}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/admin/products/${String(p._id)}`}
                        className={styles.editLink}
                      >
                        ערוך
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
