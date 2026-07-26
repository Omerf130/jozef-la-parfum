export interface ProductsListParams {
  q?: string;
  page?: number;
}

export function buildProductsListUrl(params: ProductsListParams = {}): string {
  const search = new URLSearchParams();
  const q = params.q?.trim();
  if (q) search.set("q", q);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return qs ? `/admin/products?${qs}` : "/admin/products";
}

export function buildProductEditUrl(
  productId: string,
  listParams: ProductsListParams = {},
): string {
  const search = new URLSearchParams();
  const q = listParams.q?.trim();
  if (q) search.set("listQ", q);
  if (listParams.page && listParams.page > 1) search.set("listPage", String(listParams.page));
  const qs = search.toString();
  return qs
    ? `/admin/products/${productId}?${qs}`
    : `/admin/products/${productId}`;
}

export function parseListReturnParams(searchParams: {
  listQ?: string;
  listPage?: string;
}): ProductsListParams {
  const page = Number(searchParams.listPage);
  return {
    q: searchParams.listQ?.trim() || undefined,
    page: page > 1 ? page : undefined,
  };
}
