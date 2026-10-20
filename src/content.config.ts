import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * 文章集合：所有 Markdown 文章放在 src/content/blog/ 下。
 * 文件名（不含扩展名）即文章 slug。
 *
 * 内容类型（type）：
 *  - essay 随笔：按时间归档
 *  - note  笔记：按标签 / 分类归档
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    type: z.enum(['essay', 'note']).default('essay'),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
