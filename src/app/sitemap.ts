import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import { CategoryModel } from "@/models/Category";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.5 },
  ];

  try {
    await connectDB();
    const [categories, products] = await Promise.all([
      CategoryModel.find().select("slug updatedAt").lean(),
      ProductModel.find({ isActive: true }).select("slug updatedAt").lean(),
    ]);

    const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${SITE_URL}/category/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
    const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticEntries, ...categoryEntries, ...productEntries];
  } catch {
    return staticEntries;
  }
}
