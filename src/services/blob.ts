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

function sanitize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
