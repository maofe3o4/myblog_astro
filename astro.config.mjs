// @ts-check
import { defineConfig } from 'astro/config';

// 六花 / Six Flowers 博客
export default defineConfig({
  site: 'https://fe3o4myblogastro.vercel.app',
  prefetch: { prefetchAll: false, defaultStrategy: 'viewport' },
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
    // 为 markdown 正文中的图片补上懒加载与异步解码，降低文章页首屏下载量
    rehypePlugins: [rehypeLazyImages],
    shikiConfig: {
      // 与主题协调的代码高亮配色
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});

/**
 * rehype 插件：递归遍历 hast 树，给没有显式 loading 属性的 <img>
 * 补 loading="lazy" + decoding="async"。封面图（Cover 组件）已自带 lazy，不受影响。
 */
function rehypeLazyImages() {
  const visit = (node) => {
    if (node && node.type === 'element' && node.tagName === 'img') {
      node.properties = node.properties || {};
      if (!node.properties.loading) node.properties.loading = 'lazy';
      if (!node.properties.decoding) node.properties.decoding = 'async';
    }
    if (node && Array.isArray(node.children)) node.children.forEach(visit);
  };
  return (tree) => visit(tree);
}
