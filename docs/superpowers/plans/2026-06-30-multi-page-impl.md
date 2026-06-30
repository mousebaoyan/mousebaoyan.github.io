# 实施计划：多页面架构改造

**设计文档**: `docs/superpowers/specs/2026-06-30-multi-page-design.md`  
**日期**: 2026-06-30

## 任务列表

### 阶段一：内容基础设施

- [ ] **1.1** 创建 `src/content/config.ts`，定义 `tools` 和 `experiences` 两个 collection 的 schema
- [ ] **1.2** 创建 `src/content/tools/` 目录，添加 2-3 个示例工具 Markdown 文件
- [ ] **1.3** 创建 `src/content/experiences/` 目录，添加 2-3 个示例经验贴 Markdown 文件

### 阶段二：导航系统

- [ ] **2.1** 更新 `src/site.config.ts`：将 `navLinks` 从锚点链接改为页面路由链接
- [ ] **2.2** 重构 `src/components/Nav.astro`：添加当前页面高亮逻辑（`Astro.url.pathname`）

### 阶段三：新建页面和组件

- [ ] **3.1** 创建 `src/components/PageHeader.astro` — 通用页面头部
- [ ] **3.2** 创建 `src/components/Breadcrumb.astro` — 面包屑导航
- [ ] **3.3** 创建 `src/components/ToolCard.astro` — 工具卡片
- [ ] **3.4** 创建 `src/components/ExperienceCard.astro` — 经验贴卡片
- [ ] **3.5** 创建 `src/pages/tools/index.astro` — 工具列表页
- [ ] **3.6** 创建 `src/pages/tools/[slug].astro` — 工具详情页（含 `getStaticPaths`）
- [ ] **3.7** 创建 `src/pages/experiences/index.astro` — 经验贴列表页
- [ ] **3.8** 创建 `src/pages/experiences/[slug].astro` — 经验贴详情页（含 `getStaticPaths`）

### 阶段四：迁移独立内容页

- [ ] **4.1** 创建 `src/pages/timeline.astro`，引入现有 `Timeline.astro` 组件
- [ ] **4.2** 创建 `src/pages/faq.astro`，引入现有 `Faq.astro` 组件
- [ ] **4.3** 创建 `src/pages/join.astro`，引入现有 `JoinUs.astro` 组件

### 阶段五：重构首页

- [ ] **5.1** 创建 `src/components/FeaturedTools.astro` — 精选工具（从 collection 过滤 featured）
- [ ] **5.2** 创建 `src/components/FeaturedExperiences.astro` — 精选经验贴
- [ ] **5.3** 重写 `src/pages/index.astro`：门户首页（Hero + 精选内容 + 快速导航 + CTA）

### 阶段六：收尾

- [ ] **6.1** 创建 `src/pages/404.astro` — 自定义 404 页面
- [ ] **6.2** 安装 `@astrojs/sitemap` 并配置
- [ ] **6.3** 测试所有路由、导航链接、动态路由生成
- [ ] **6.4** 检查移动端导航显示

## 注意事项

- `icon` 字段暂定为字符串（emoji 或 URL），实施时根据实际情况决定
- 示例内容文件中的数据应真实反映社群实际情况，不要用 lorem ipsum
- 详情页的"相关推荐"（`RelatedContent.astro`）可以在基础功能完成后作为后续优化
