// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages 会把不带结尾斜杠的目录地址 301 到带斜杠的版本，多一次往返；
  // 开发时也要求带斜杠，漏写会直接看到提示页
  trailingSlash: 'always',
  // 样式直接写进 HTML：预取到的页面无需再下载样式表就能显示
  build: {
    inlineStylesheets: 'always',
  },
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
