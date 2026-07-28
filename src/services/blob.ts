import { put, del } from "@vercel/blob";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export async function uploadImage(file: File, prefix = "products"): Promise<string> {
  if (!TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }
  const filename = `${prefix}/${Date.now()}-${sanitize(file.name)}`;
  const blob = await put(filename, file, {
    access: "public",
    token: TOKEN,
    contentType: file.type || "application/octet-stream",
  });
  return blob.url;
}

export async function deleteBlob(url: string): Promise<void> {
  if (!TOKEN) return;
  try {
    await del(url, { token: TOKEN });
  } catch (e) {
    console.warn("[blob] delete failed", e);
  }
}

/** Vercel Blob URLs uploaded under the products/ prefix (safe to delete when unshared). */
export function isDeletableProductBlobUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.endsWith(".public.blob.vercel-storage.com") &&
      parsed.pathname.includes("/products/")
    );
  } catch {
    return false;
  }
}

function isBlobNotFoundError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /not found|404|does not exist/i.test(message);
}

/** Deletes a blob or throws. Missing blobs are treated as already deleted. */
export async function deleteBlobStrict(url: string): Promise<void> {
  if (!TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }
  try {
    await del(url, { token: TOKEN });
  } catch (error) {
    if (isBlobNotFoundError(error)) return;
    throw error;
  }
}

function sanitize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
