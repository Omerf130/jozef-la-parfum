import Image from "next/image";
import { formatILS } from "@/lib/format";
import { AdminStatusBadge } from "@/features/admin/ui/AdminStatusBadge";
import { AdminStockDisplay } from "@/features/admin/ui/AdminStockDisplay";
import {
  buildProductEditUrl,
  type ProductsListParams,
} from "@/features/admin/products/buildProductsListUrl";
import { ProductEditLink } from "@/features/admin/products/ProductsListScrollRestore";
import type { AdminProductRow } from "@/features/admin/products/serializeAdminProductRow";
import listStyles from "@/features/admin/ui/admin-list.module.scss";
import styles from "./admin-products.module.scss";

interface AdminProductTableProps {
  products: AdminProductRow[];
  listParams: ProductsListParams;
}

function PriceCell({ price, salePrice }: { price: number; salePrice?: number }) {
  const onSale =
    typeof salePrice === "number" && salePrice > 0 && salePrice < price;

  if (onSale) {
    return (
      <td className={styles.priceCell}>
        <span className={styles.salePrice}>{formatILS(salePrice)}</span>
        <span className={styles.regularPriceStruck}>{formatILS(price)}</span>
      </td>
    );
  }

  return <td className={styles.priceCell}>{formatILS(price)}</td>;
}

export function AdminProductTable({ products, listParams }: AdminProductTableProps) {
  const page = listParams.page ?? 1;

  return (
    <div className={`${listStyles.desktopOnly} ${styles.tableWrap}`}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col" aria-label="תמונה" />
            <th scope="col">שם</th>
            <th scope="col" className={styles.colBrand}>
              יצרן
            </th>
            <th scope="col">קטגוריה</th>
            <th scope="col">מחיר</th>
            <th scope="col">מלאי</th>
            <th scope="col">סטטוס</th>
            <th scope="col" aria-label="פעולות" />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr
              key={p._id}
              className={!p.isActive ? styles.inactiveRow : undefined}
            >
              <td>
                <div className={styles.thumb}>
                  {p.images[0] ? (
                    <Image src={p.images[0]} alt="" fill sizes="48px" />
                  ) : (
                    <div className={styles.thumbPlaceholder} aria-hidden="true">
                      ✦
                    </div>
                  )}
                </div>
              </td>
              <td>
                <ProductEditLink
                  href={buildProductEditUrl(p._id, listParams)}
                  className={styles.name}
                  listQ={listParams.q}
                  listPage={page}
                >
                  {p.name}
                </ProductEditLink>
                {p.isFeatured ? (
                  <AdminStatusBadge variant="featured" className={styles.inlineBadge} />
                ) : null}
              </td>
              <td className={styles.colBrand}>{p.brand}</td>
              <td>{p.categoryName}</td>
              <PriceCell price={p.price} salePrice={p.salePrice} />
              <td>
                <AdminStockDisplay totalStock={p.totalStock} />
              </td>
              <td>
                <AdminStatusBadge variant={p.isActive ? "active" : "inactive"} />
              </td>
              <td>
                <ProductEditLink
                  href={buildProductEditUrl(p._id, listParams)}
                  className={styles.editBtn}
                  listQ={listParams.q}
                  listPage={page}
                >
                  ערוך
                </ProductEditLink>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface AdminProductCardListProps {
  products: AdminProductRow[];
  listParams: ProductsListParams;
}

function CardPrice({ price, salePrice }: { price: number; salePrice?: number }) {
  const onSale =
    typeof salePrice === "number" && salePrice > 0 && salePrice < price;

  if (onSale) {
    return (
      <span className={styles.cardPrice}>
        {formatILS(salePrice)}{" "}
        <span className={styles.regularPriceStruck}>{formatILS(price)}</span>
      </span>
    );
  }

  return <span className={styles.cardPrice}>{formatILS(price)}</span>;
}

export function AdminProductCardList({ products, listParams }: AdminProductCardListProps) {
  const page = listParams.page ?? 1;

  return (
    <ul className={`${listStyles.mobileOnly} ${styles.cardList}`}>
      {products.map((p) => (
        <li key={p._id} className={styles.card}>
          <div className={styles.thumb}>
            {p.images[0] ? (
              <Image src={p.images[0]} alt="" fill sizes="48px" />
            ) : (
              <div className={styles.thumbPlaceholder} aria-hidden="true">
                ✦
              </div>
            )}
          </div>
          <div className={styles.cardBody}>
            <div className={styles.cardHead}>
              <h3 className={styles.cardTitle}>{p.name}</h3>
              {p.isFeatured ? (
                <AdminStatusBadge variant="featured" />
              ) : null}
              <AdminStatusBadge variant={p.isActive ? "active" : "inactive"} />
            </div>
            <div className={styles.cardMeta}>
              <span>{p.brand}</span>
              <span>{p.categoryName}</span>
              <span>
                מלאי: <AdminStockDisplay totalStock={p.totalStock} />
              </span>
            </div>
            <div className={styles.cardFooter}>
              <CardPrice price={p.price} salePrice={p.salePrice} />
              <div className={styles.cardActions}>
                <ProductEditLink
                  href={buildProductEditUrl(p._id, listParams)}
                  className={styles.editBtn}
                  listQ={listParams.q}
                  listPage={page}
                >
                  ערוך
                </ProductEditLink>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

interface AdminProductsListProps {
  products: AdminProductRow[];
  listParams: ProductsListParams;
}

export function AdminProductsList({ products, listParams }: AdminProductsListProps) {
  return (
    <>
      <AdminProductTable products={products} listParams={listParams} />
      <AdminProductCardList products={products} listParams={listParams} />
    </>
  );
}
