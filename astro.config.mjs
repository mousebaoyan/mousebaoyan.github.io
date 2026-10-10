// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  markdown: {
    shikiConfig: { theme: 'github-light' },
  },
  // 悬停或聚焦链接时预取页面，点击后几乎立即打开
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
