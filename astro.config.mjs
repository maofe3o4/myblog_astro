// @ts-check
import { defineConfig } from 'astro/config';

// 六花 / Six Flowers 博客
// 正式部署时请将 site 改为你的域名，便于生成正确的 RSS / sitemap 绝对链接
export default defineConfig({
  site: 'https://sixflowers.example.com',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  vite: {
    build: {
      emitAssets: true,
    },
  },
  markdown: {
    shikiConfig: {
      // 与主题协调的代码高亮配色
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
