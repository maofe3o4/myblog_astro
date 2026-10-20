/**
 * 轻量分页工具：复刻 Astro 官方 paginate 的行为，但采用 `/base/page/N` 路由方案，
 * 使第 1 页落在 `/base`，其余页落在 `/base/page/N`，从而避免与 `[slug]` 等动态路由冲突。
 * 不依赖 astro 内部导出，零风险。
 */

export interface Page<T> {
  data: T[];
  start: number;
  end: number;
  size: number;
  total: number;
  currentPage: number;
  lastPage: number;
  url: {
    current: string;
    next?: string;
    prev?: string;
    first?: string;
    last?: string;
  };
}

export interface PaginateResult<T> {
  params: Record<string, string | undefined>;
  props: { page: Page<T> };
}

export function paginate<T>(
  data: T[],
  opts: { pageSize?: number; params?: Record<string, string>; base: string }
): PaginateResult<T>[] {
  const pageSize = opts.pageSize ?? 10;
  const additional = opts.params ?? {};
  const base = opts.base;
  const lastPage = Math.max(1, Math.ceil(data.length / pageSize));

  return Array.from({ length: lastPage }, (_, i) => {
    const pageNum = i + 1;
    const start = (pageNum - 1) * pageSize;
    const end = Math.min(start + pageSize, data.length);

    const current = pageNum === 1 ? base : `${base}/page/${pageNum}`;
    const next = pageNum < lastPage ? `${base}/page/${pageNum + 1}` : undefined;
    const prev = pageNum > 1 ? (pageNum === 2 ? base : `${base}/page/${pageNum - 1}`) : undefined;
    const first = pageNum === 1 ? undefined : base;
    const last = pageNum === lastPage ? undefined : `${base}/page/${lastPage}`;

    const params: Record<string, string | undefined> =
      pageNum === 1 ? { ...additional } : { ...additional, page: String(pageNum) };

    return {
      params,
      props: {
        page: {
          data: data.slice(start, end),
          start,
          end: end - 1,
          size: pageSize,
          total: data.length,
          currentPage: pageNum,
          lastPage,
          url: { current, next, prev, first, last },
        },
      },
    };
  });
}
