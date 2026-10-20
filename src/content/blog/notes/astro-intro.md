---
title: 从零写一篇笔记并发布到这个博客的完整流程
description: 手把手走一遍在本站新增一篇笔记并正式发布的全流程——从建文件、写 frontmatter、插图，到本地预览与构建。
pubDate: 2026-10-17
type: note
category: 前端
tags: [前端, Astro, 教程, 建站]
featured: true
---

这篇笔记不讲"怎么从零做一个博客"，而是讲**怎么往这个已经搭好的博客里，从零写一篇笔记并正式发布出去**。跟着走完一遍，你就能独立更新这个站点了。

本站基于 Astro 5 的 Content Collections，文章就是 `src/content/blog/` 下的 Markdown 文件，构建后自动生成列表、分类、标签与分页。

## 一、笔记放在哪

所有笔记都放在 `src/content/blog/notes/` 目录，按分类分子文件夹更清爽：

```
src/content/blog/
├── notes/                ← 笔记（type: note）
│   ├── 前端/
│   │   └── your-note.md
│   ├── 数据库/
│   └── ...
└── essays/               ← 随笔（type: essay）
```

> 文件名就是文章的 slug（网址路径）。**务必用全小写、ASCII 安全的名字**（如 `docker-basic.md`），避免 `+()#?` 与大写字母——它们会被净化或导致链接 404。中文文件名可用，但建议也用小写。

## 二、Frontmatter 字段

每篇 `.md` 顶部用三道短横线包裹一组字段：

```md
---
title: 文章标题
description: 一句话摘要，会显示在卡片与 SEO 描述里
pubDate: 2026-10-17          # 发布日期，YYYY-MM-DD
type: note                  # note=笔记 / essay=随笔（决定归档方式）
category: 前端               # 笔记分类（缺省归「未分类」）
tags: [前端, Astro, 教程]    # 多标签
featured: false             # 是否进入首页精选栏
cover: ""    # 封面图（留空则按文章 id 从 public/covers 确定性随机取一张）
draft: false                # true=草稿，生产构建不发布，仅供本地预览
updatedDate: 2026-10-18     # 可选，更新时间
---

正文从这里开始……
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | ✅ | 标题 |
| `pubDate` | ✅ | 发布日期 |
| `type` | ✅ | `note` 或 `essay` |
| `category` | 推荐 | 笔记分类，用于「笔记」页的分类筛选 |
| `tags` | 推荐 | 标签数组，自动生成标签归档页 |
| `featured` | 否 | 是否精选 |
| `cover` | 否 | 封面路径，留空用占位图 |
| `draft` | 否 | 草稿标记 |

## 三、写一篇笔记

新建文件 `src/content/blog/notes/前端/my-first-note.md`，填入 frontmatter 和正文：

```md
---
title: 我的第一篇笔记
description: 记录一次上手体验。
pubDate: 2026-10-18
type: note
category: 前端
tags: [Astro, 入门]
---

## 背景

想记点东西，于是开了这个博客。

## 过程

1. 在 `notes/` 下建了文件
2. 填好 frontmatter
3. 写正文

> 提醒：用完即走，别让草稿堆积。
```

保存后，它会自动出现在「笔记」列表、对应分类与标签下——**不需要手动登记任何路由**。

## 四、图片怎么放

所有图片统一放在 `public/images/`（不是跟着 md 走），正文用绝对路径引用：

```md
![示意图](/images/my-first-note-diagram.png.webp)
```

- 把图片文件直接丢进 `public/images/` 即可，构建时会原样拷贝到站点根目录。
- 引用一律写 `/images/文件名`，不要写相对路径 `./xxx.png`。
- 封面同理：`cover: /images/xxx.png.webp`。
- 文件名也建议小写、无空格，避免编码问题。

## 五、本地预览与发布

```bash
npm run dev      # 本地预览，默认 http://localhost:4321
npm run build    # 生产构建，产物在 dist/，会自动排除 draft: true 的草稿
```

- 开发时 `draft: true` 的文章也能在 `/notes` 里看到，方便校对；但 `npm run build` 不会把它发布出去。
- 改完 frontmatter 或新增文件，dev 会热更新；若页面没刷新，重启 `npm run dev` 即可。
- 要上线时，把 `dist/` 部署到任意静态托管（如 Vercel / Netlify / GitHub Pages），记得在 `astro.config.mjs` 把 `site` 改成真实域名。

## 六、记住这几条约定

1. **slug 用小写 ASCII**：文件名决定网址，`MYSQL.md`/`C++入门.md` 这类会出 404。
2. **加 `draft: true` 当草稿**：写完想先藏着就标草稿，发布时去掉。
3. **图片进 `public/images/`**：永远用 `/images/...` 引用。
4. **标签别带 `/`**：`C/C++` 会拆路由，改成 `C·C++` 之类。
5. **`type` 别写错**：笔记是 `note`，随笔是 `essay`，归档与首页展示据此分流。

到此，你就拥有了这个博客的完整写作—发布能力。下一篇，就从你最想记的东西开始。
