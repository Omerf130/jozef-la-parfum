import mongoose, { type ClientSession } from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import { CouponModel } from "@/models/Coupon";
import { CategoryModel } from "@/models/Category";
import { SiteSettingsModel, SITE_SETTINGS_SINGLETON_KEY } from "@/models/SiteSettings";
import {
  deleteBlobStrict,
  isDeletableProductBlobUrl,
} from "@/services/blob";

export interface AdminAuditIdentity {
  id?: string;
  email?: string | null;
}

export interface SkippedBlobUrl {
  url: string;
  reason: "external" | "shared";
}

export interface PermanentDeleteResult {
  productId: string;
  productName: string;
  deletedBlobUrls: string[];
  skippedBlobUrls: SkippedBlobUrl[];
  usedTransaction: boolean;
}

function isTransactionNotSupportedError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /replica set|Transaction numbers are only allowed|not support transactions/i.test(
    message,
  );
}

async function findSharedBlobUrls(
  urls: string[],
  excludeProductId: mongoose.Types.ObjectId,
): Promise<Set<string>> {
  if (urls.length === 0) return new Set();

  const [otherProducts, categories, settings] = await Promise.all([
    ProductModel.find({ _id: { $ne: excludeProductId }, images: { $in: urls } })
      .select("images")
      .lean(),
    CategoryModel.find({ image: { $in: urls } }).select("image").lean(),
    SiteSettingsModel.findOne({ singletonKey: SITE_SETTINGS_SINGLETON_KEY })
      .select("heroImages heroImagesDesktop heroImagesMobile")
      .lean(),
  ]);

  const shared = new Set<string>();
  for (const product of otherProducts) {
    for (const image of product.images) {
      if (urls.includes(image)) shared.add(image);
    }
  }
  for (const category of categories) {
    if (category.image && urls.includes(category.image)) shared.add(category.image);
  }
  if (settings) {
    const heroUrls = [
      ...(settings.heroImages ?? []),
      ...(settings.heroImagesDesktop ?? []),
      ...(settings.heroImagesMobile ?? []),
    ];
    for (const heroUrl of heroUrls) {
      if (urls.includes(heroUrl)) shared.add(heroUrl);
    }
  }
  return shared;
}

async function runProductDbDeletion(
  productObjectId: mongoose.Types.ObjectId,
  session?: ClientSession,
): Promise<void> {
  const opts = session ? { session } : {};
  await CouponModel.updateMany(
    { productIds: productObjectId },
    { $pull: { productIds: productObjectId } },
    opts,
  );
  const deleted = await ProductModel.findByIdAndDelete(productObjectId, opts);
  if (!deleted) {
    throw new Error("Product not found during delete");
  }
}

async function deleteProductFromDb(
  productObjectId: mongoose.Types.ObjectId,
): Promise<boolean> {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await runProductDbDeletion(productObjectId, session);
    });
    return true;
  } catch (error) {
    if (!isTransactionNotSupportedError(error)) throw error;
    console.warn(
      "[admin] MongoDB transactions unavailable; falling back to sequential DB deletes",
      error,
    );
    await runProductDbDeletion(productObjectId);
    return false;
  } finally {
    await session.endSession();
  }
}

function logPermanentProductDelete(
  productId: string,
  productName: string,
  admin: AdminAuditIdentity,
): void {
  console.info("[admin] permanent product delete", {
    productId,
    productName,
    adminId: admin.id ?? null,
    adminEmail: admin.email ?? null,
  });
}

export async function deleteProductPermanently(
  productId: string,
  admin: AdminAuditIdentity,
): Promise<PermanentDeleteResult> {
  if (!mongoose.isValidObjectId(productId)) {
    throw new Error("Invalid product id");
  }

  await connectDB();
  const productObjectId = new mongoose.Types.ObjectId(productId);
  const product = await ProductModel.findById(productObjectId).lean();
  if (!product) {
    throw new Error("Product not found");
  }

  const uniqueImages = [...new Set(product.images.filter(Boolean))];
  const deletableCandidates = uniqueImages.filter(isDeletableProductBlobUrl);
  const sharedUrls = await findSharedBlobUrls(deletableCandidates, productObjectId);

  const skippedBlobUrls: SkippedBlobUrl[] = [];
  const blobsToDelete: string[] = [];

  for (const url of uniqueImages) {
    if (!isDeletableProductBlobUrl(url)) {
      skippedBlobUrls.push({ url, reason: "external" });
      continue;
    }
    if (sharedUrls.has(url)) {
      skippedBlobUrls.push({ url, reason: "shared" });
      continue;
    }
    blobsToDelete.push(url);
  }

  const deletedBlobUrls: string[] = [];
  for (const url of blobsToDelete) {
    await deleteBlobStrict(url);
    deletedBlobUrls.push(url);
  }

  let usedTransaction: boolean;
  try {
    usedTransaction = await deleteProductFromDb(productObjectId);
  } catch (error) {
    console.error("[admin] permanent product delete: DB failed after blob deletion", {
      productId,
      deletedBlobUrls,
      error,
    });
    throw error;
  }

  logPermanentProductDelete(productId, product.name, admin);
  revalidatePath("/", "layout");

  return {
    productId,
    productName: product.name,
    deletedBlobUrls,
    skippedBlobUrls,
    usedTransaction,
  };
}
