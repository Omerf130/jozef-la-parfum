export function buildProductTextSearchFilter(q: string): Record<string, unknown> | null {
  const trimmed = q.trim();
  if (trimmed.length < 2) return null;

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return {
    $or: [
      { name: { $regex: escaped, $options: "i" } },
      { brand: { $regex: escaped, $options: "i" } },
    ],
  };
}
