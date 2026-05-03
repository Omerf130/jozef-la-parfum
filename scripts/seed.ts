/* eslint-disable @typescript-eslint/no-require-imports */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import slugify from "slugify";
import { AdminModel } from "../src/models/Admin";
import { CategoryModel } from "../src/models/Category";
import { ProductModel } from "../src/models/Product";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  await mongoose.connect(uri);
  console.log("[seed] connected");

  // ---- Admin ----
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe!2026";

  const existingAdmin = await AdminModel.findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log(`[seed] admin already exists: ${adminEmail}`);
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await AdminModel.create({ email: adminEmail, passwordHash, role: "admin" });
    console.log(`[seed] created admin: ${adminEmail} (password from SEED_ADMIN_PASSWORD)`);
  }

  // ---- Categories ----
  const categoriesSeed = [
    { name: "לאישה", slug: "women", description: "בשמים מעודנים לאישה" },
    { name: "לגבר", slug: "men", description: "בשמים בעלי אופי לגבר" },
    { name: "יוניסקס", slug: "unisex", description: "ניחוחות לכל" },
    { name: "מהדורות מוגבלות", slug: "limited", description: "ניחוחות נדירים במהדורה מוגבלת" },
  ];

  const categoryMap: Record<string, mongoose.Types.ObjectId> = {};
  for (const c of categoriesSeed) {
    const slug = c.slug || slugify(c.name, { lower: true, strict: true, locale: "he" });
    const existing = await CategoryModel.findOne({ slug });
    if (existing) {
      categoryMap[slug] = existing._id;
    } else {
      const created = await CategoryModel.create({ ...c, slug });
      categoryMap[slug] = created._id;
      console.log(`[seed] created category: ${c.name}`);
    }
  }

  // ---- Products ----
  const productsSeed = [
    {
      name: "Eau de Lumière",
      brand: "Maison Aurélie",
      slug: "eau-de-lumiere",
      description:
        "ניחוח עוטף של ורד דמשק, פטשולי ועץ אובן. מהדורת בוטיק יוקרתית.",
      price: 690,
      salePrice: 620,
      categorySlug: "women",
      gender: "female" as const,
      concentration: "EDP" as const,
      sizes: [
        { ml: 50, price: 620, stock: 10 },
        { ml: 100, price: 890, stock: 6 },
      ],
      notes: {
        top: ["ברגמוט", "פלפל ורוד"],
        middle: ["ורד דמשק", "פיוני"],
        base: ["פטשולי", "עץ אובן", "מושק"],
      },
      images: [],
      isFeatured: true,
    },
    {
      name: "Noir Absolu",
      brand: "Maison Aurélie",
      slug: "noir-absolu",
      description: "ניחוח עוצמתי של עוד, עור ועשן ארומטי. נוכחות אצילית.",
      price: 980,
      categorySlug: "men",
      gender: "male" as const,
      concentration: "Parfum" as const,
      sizes: [
        { ml: 50, price: 980, stock: 4 },
        { ml: 100, price: 1390, stock: 3 },
      ],
      notes: {
        top: ["סופרן", "כמון"],
        middle: ["עור", "טבק"],
        base: ["עוד", "וניל", "אמברה"],
      },
      images: [],
      isFeatured: true,
    },
    {
      name: "Mer du Sud",
      brand: "Costa Riviera",
      slug: "mer-du-sud",
      description: "טוויסט ים-תיכוני קלאסי – יסמין לבן, לבנדר וברגמוט קלברי.",
      price: 540,
      categorySlug: "unisex",
      gender: "unisex" as const,
      concentration: "EDT" as const,
      sizes: [
        { ml: 75, price: 540, stock: 12 },
        { ml: 125, price: 720, stock: 8 },
      ],
      notes: {
        top: ["ברגמוט קלברי", "מנדרינה"],
        middle: ["יסמין", "לבנדר"],
        base: ["מושק לבן", "ארז"],
      },
      images: [],
      isFeatured: true,
    },
    {
      name: "Velours Rouge",
      brand: "Atelier Saint-Cloud",
      slug: "velours-rouge",
      description: "אדום קטיפתי – שזיף אדום, פטשולי ושוקולד מר.",
      price: 760,
      categorySlug: "women",
      gender: "female" as const,
      concentration: "EDP" as const,
      sizes: [
        { ml: 50, price: 760, stock: 7 },
        { ml: 100, price: 1090, stock: 4 },
      ],
      notes: {
        top: ["שזיף", "ליצ'י"],
        middle: ["ורד טורקי"],
        base: ["פטשולי", "שוקולד מר", "וניל"],
      },
      images: [],
      isFeatured: false,
    },
    {
      name: "Cèdre Sauvage",
      brand: "Atelier Saint-Cloud",
      slug: "cedre-sauvage",
      description: "ארז סובלימי, רוזמרין ועוז יער ערפילי.",
      price: 690,
      categorySlug: "men",
      gender: "male" as const,
      concentration: "EDP" as const,
      sizes: [
        { ml: 50, price: 690, stock: 8 },
        { ml: 100, price: 980, stock: 5 },
      ],
      notes: {
        top: ["ברגמוט", "רוזמרין"],
        middle: ["ארז וירג'יני", "אירוס"],
        base: ["וטיבר", "מושק"],
      },
      images: [],
      isFeatured: false,
    },
    {
      name: "Lune d'Or",
      brand: "Maison Aurélie",
      slug: "lune-dor",
      description: "אורות זהובים, סאפרון ועוד אצילי במהדורה מוגבלת.",
      price: 1490,
      categorySlug: "limited",
      gender: "unisex" as const,
      concentration: "Parfum" as const,
      sizes: [
        { ml: 75, price: 1490, stock: 2 },
      ],
      notes: {
        top: ["סאפרון", "מנדרינה אדומה"],
        middle: ["ורד טאיף", "כורכום"],
        base: ["עוד מאסארי", "אמברה לבנה"],
      },
      images: [],
      isFeatured: true,
    },
  ];

  for (const p of productsSeed) {
    const existing = await ProductModel.findOne({ slug: p.slug });
    const categoryId = categoryMap[p.categorySlug];
    if (!categoryId) continue;

    const payload = {
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      description: p.description,
      price: p.price,
      salePrice: (p as { salePrice?: number }).salePrice,
      category: categoryId,
      gender: p.gender,
      concentration: p.concentration,
      sizes: p.sizes,
      notes: p.notes,
      images: p.images,
      isFeatured: p.isFeatured,
      isActive: true,
    };

    if (existing) {
      await ProductModel.updateOne({ _id: existing._id }, payload);
      console.log(`[seed] updated product: ${p.name}`);
    } else {
      await ProductModel.create(payload);
      console.log(`[seed] created product: ${p.name}`);
    }
  }

  await mongoose.disconnect();
  console.log("[seed] done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
