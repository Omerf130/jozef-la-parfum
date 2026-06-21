import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { CategoryModel } from "@/models/Category";
import { ProductModel } from "@/models/Product";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";
import { CategoryFilters } from "@/features/category/CategoryFilters";
import { serializeProduct } from "@/lib/serializers";
import { buildProductTextSearchFilter } from "@/lib/productSearch";
import styles from "./page.module.scss";

const PAGE_SIZE = 12;

const VIRTUAL_CATEGORIES = new Map<
  string,
  { name: string; description: string; baseFilter: Record<string, unknown> }
>([
  ["all", { name: "כל הבשמים", description: "כל הבשמים באתר במקום אחד", baseFilter: {} }],
  ["budget", { name: 'בשמים עד 150 ש"ח', description: "ניחוחות יוקרתיים במחירים נגישים", baseFilter: { price: { $lte: 150 } } }],
]);

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    q?: string;
    brand?: string;
    gender?: string;
    conc?: string;
    min?: string;
    max?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const searchQuery = sp.q?.trim();

  if (slug === "all" && searchQuery && searchQuery.length >= 2) {
    return {
      title: `תוצאות חיפוש: ${searchQuery}`,
      description: `תוצאות חיפוש עבור ${searchQuery}`,
    };
  }

  const virtual = VIRTUAL_CATEGORIES.get(slug);
  if (virtual) {
    return { title: virtual.name, description: virtual.description };
  }

  try {
    await connectDB();
    const cat = await CategoryModel.findOne({ slug }).lean();
    if (!cat) return { title: "קטגוריה לא נמצאה" };
    return {
      title: cat.name,
      description: cat.description || `בשמים יוקרתיים בקטגוריית ${cat.name}`,
    };
  } catch {
    return { title: "קטגוריה" };
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  await connectDB();

  const virtual = VIRTUAL_CATEGORIES.get(slug);
  let categoryName: string;
  let categoryDescription: string | undefined;
  let aggBaseFilter: Record<string, unknown>;

  if (virtual) {
    categoryName = virtual.name;
    categoryDescription = virtual.description;
    aggBaseFilter = { isActive: true, ...virtual.baseFilter };
  } else {
    const category = await CategoryModel.findOne({ slug }).lean();
    if (!category) notFound();
    categoryName = category.name;
    categoryDescription = category.description;
    aggBaseFilter = { category: category._id, isActive: true };
  }

  const filter: Record<string, unknown> = { ...aggBaseFilter };
  if (sp.brand) filter.brand = sp.brand;
  if (sp.gender && ["male", "female", "unisex"].includes(sp.gender)) {
    filter.gender = sp.gender;
  }
  if (sp.conc && ["EDT", "EDP", "Parfum", "Cologne"].includes(sp.conc)) {
    filter.concentration = sp.conc;
  }
  const min = sp.min ? Number(sp.min) : undefined;
  const max = sp.max ? Number(sp.max) : undefined;
  if (min !== undefined || max !== undefined) {
    const priceFilter: Record<string, number> = {};
    if (min !== undefined && !Number.isNaN(min)) priceFilter.$gte = min;
    if (max !== undefined && !Number.isNaN(max)) priceFilter.$lte = max;
    if (filter.price && typeof filter.price === "object") {
      Object.assign(priceFilter, filter.price);
    }
    filter.price = priceFilter;
  }

  const searchQuery = sp.q?.trim();
  const isSearchResults = slug === "all" && !!searchQuery && searchQuery.length >= 2;
  if (isSearchResults) {
    const textFilter = buildProductTextSearchFilter(searchQuery);
    if (textFilter) {
      Object.assign(filter, textFilter);
    }
  }

  const page = Math.max(1, parseInt(sp.page || "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const [productsRaw, total, brandsAgg, priceBoundsAgg] = await Promise.all([
    ProductModel.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    ProductModel.countDocuments(filter),
    ProductModel.distinct("brand", aggBaseFilter),
    ProductModel.aggregate([
      { $match: aggBaseFilter },
      {
        $group: {
          _id: null,
          min: { $min: "$price" },
          max: { $max: "$price" },
        },
      },
    ]),
  ]);

  const products = productsRaw.map(serializeProduct);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const priceBounds = priceBoundsAgg[0] ?? { min: 0, max: 2000 };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.kicker}>{isSearchResults ? "חיפוש" : "קטגוריה"}</span>
        <h1>{isSearchResults ? `כל התוצאות עבור «${searchQuery}»` : categoryName}</h1>
        {!isSearchResults && categoryDescription ? <p>{categoryDescription}</p> : null}
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <CategoryFilters
            brands={brandsAgg.filter((b): b is string => typeof b === "string")}
            priceBounds={{
              min: Math.floor(priceBounds.min ?? 0),
              max: Math.ceil(priceBounds.max ?? 2000),
            }}
            currentParams={sp}
          />
        </aside>
        <section className={styles.content}>
          <div className={styles.toolbar}>
            <span className={styles.count}>
              {total} {total === 1 ? "פריט" : "פריטים"}
            </span>
          </div>
          {products.length === 0 ? (
            <EmptyState
              title="לא נמצאו פריטים"
              description="נסו לשנות את הסינון או לאפס את כל הפילטרים."
            />
          ) : (
            <>
              <div className={styles.grid}>
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              {totalPages > 1 ? (
                <Pagination
                  current={page}
                  total={totalPages}
                  basePath={`/category/${slug}`}
                  searchParams={sp}
                />
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function Pagination({
  current,
  total,
  basePath,
  searchParams,
}: {
  current: number;
  total: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  const linkFor = (p: number) => {
    const sp = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== "page") sp.set(k, v);
    });
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  };

  const prev = current > 1 ? linkFor(current - 1) : null;
  const next = current < total ? linkFor(current + 1) : null;

  return (
    <nav className={styles.pagination} aria-label="עמודים">
      {prev ? (
        <a href={prev} className={styles.pageLink}>
          → הקודם
        </a>
      ) : (
        <span className={`${styles.pageLink} ${styles.disabled}`}>→ הקודם</span>
      )}
      <span className={styles.pageInfo}>
        עמוד {current} מתוך {total}
      </span>
      {next ? (
        <a href={next} className={styles.pageLink}>
          הבא ←
        </a>
      ) : (
        <span className={`${styles.pageLink} ${styles.disabled}`}>הבא ←</span>
      )}
    </nav>
  );
}
