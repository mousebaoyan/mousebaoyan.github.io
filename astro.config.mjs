// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  vite: {
    optimizeDeps: {
      exclude: [], // 排除不需要预构建的包
    },
    server: {
      fs: {
        strict: false, // 减少文件系统检查
      },
    },
  },
});
