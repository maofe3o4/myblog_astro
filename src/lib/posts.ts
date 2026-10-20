import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/** 获取已发布文章，按发布时间倒序 */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) =>
    import.meta.env.PROD ? !data.draft : true
  );
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** 随笔（按时间归档） */
export async function getEssays(): Promise<Post[]> {
  return (await getPosts()).filter((p) => p.data.type === 'essay');
}

/** 笔记（按标签 / 分类归档） */
export async function getNotes(): Promise<Post[]> {
  return (await getPosts()).filter((p) => p.data.type === 'note');
}

/** 精选文章 */
export async function getFeatured(): Promise<Post[]> {
  return (await getPosts()).filter((p) => p.data.featured);
}

/** 全部分类（来自笔记的 category 字段，空值归入「未分类」） */
export async function getCategories(): Promise<string[]> {
  const notes = await getNotes();
  const set = new Set<string>();
  for (const n of notes) set.add(n.data.category?.trim() || '未分类');
  return [...set].sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

/** 分类 → 笔记数（按数量降序，同名按拼音） */
export async function getCategoryMap(): Promise<Map<string, number>> {
  const notes = await getNotes();
  const map = new Map<string, number>();
  for (const n of notes) {
    const c = n.data.category?.trim() || '未分类';
    map.set(c, (map.get(c) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'))
    .reduce((m, [k, v]) => m.set(k, v), new Map<string, number>());
}

/** 笔记的标签 → 数量（仅统计 type=note，按数量降序） */
export async function getNoteTagMap(): Promise<Map<string, number>> {
  const notes = await getNotes();
  const map = new Map<string, number>();
  for (const p of notes) {
    for (const t of p.data.tags) map.set(t, (map.get(t) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'))
    .reduce((m, [k, v]) => m.set(k, v), new Map<string, number>());
}

/** 某分类下的笔记 */
export async function getNotesByCategory(category: string): Promise<Post[]> {
  const notes = await getNotes();
  return notes.filter((n) => (n.data.category?.trim() || '未分类') === category);
}

/** 收集全部标签及其文章数 */
export async function getTagMap(): Promise<Map<string, number>> {
  const posts = await getPosts();
  const map = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.data.tags) map.set(t, (map.get(t) ?? 0) + 1);
  }
  return map;
}

/** 全部出现过的标签（去重，按文章数降序） */
export async function getAllTags(): Promise<string[]> {
  const map = await getTagMap();
  return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
}

/**
 * 按「年 → 月」分组（倒序），用于随笔时间归档。
 * 返回 [{ year, months: [{ month, posts }] }]
 */
export async function groupEssaysByMonth(): Promise<
  { year: number; months: { month: number; posts: Post[] }[] }[]
> {
  const essays = await getEssays();
  const byYear = new Map<number, Map<number, Post[]>>();
  for (const p of essays) {
    const d = p.data.pubDate;
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    if (!byYear.has(y)) byYear.set(y, new Map());
    const months = byYear.get(y)!;
    if (!months.has(m)) months.set(m, []);
    months.get(m)!.push(p);
  }
  return [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, months]) => ({
      year,
      months: [...months.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([month, posts]) => ({ month, posts })),
    }));
}

/** 标签 → 六色星辉索引（与 global.css 的 --c1..--c6 对应） */
export function tagColorIndex(tag: string): number {
  let s = 0;
  for (const ch of tag) s += ch.charCodeAt(0);
  return (s % 6) + 1;
}

/**
 * 标签 → URL 安全 slug（显示名与路由分离）。
 * 把 + / · / 空格等会破坏动态路由的字符转成连字符，仅保留
 * 字母、数字与中文，避免 /tags/... 在 dev 与生产下 404。
 * 例：C·C++ → c-cpp，sql server → sql-server。
 */
export function slugifyTag(tag: string): string {
  return tag
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\+/g, 'p') // + -> p
    .replace(/[·•・]/g, '-') // 中间点类字符 -> -
    .replace(/\s+/g, '-') // 空白 -> -
    .replace(/[^\p{L}\p{N}-]/gu, '') // 仅保留字母/数字/连字符(含中文)
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
