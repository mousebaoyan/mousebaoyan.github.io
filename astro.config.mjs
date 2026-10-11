// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  markdown: {
    // 代码高亮同时生成浅色与深色配色，由页面主题决定使用哪一套
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },
  },
  // 悬停或聚焦链接时预取页面，点击后几乎立即打开
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
