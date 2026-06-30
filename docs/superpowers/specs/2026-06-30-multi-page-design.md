# 多页面架构设计 — 四非保研鼠群官网

**日期**: 2026-06-30  
**状态**: 待实施

## 背景

当前网站是单页面应用，所有内容（关于、时间线、工具、经验贴、FAQ）以锚点形式组织在首页。需要改造为多页面架构，每个内容板块拥有独立 URL，支持更丰富的内容展示。

## 核心决策

- 每个页面有独立 URL（非 SPA 路由）
- 所有页面共享统一顶部导航栏
- 首页改为门户/介绍页，不再堆砌所有内容
- 内容使用 Astro Content Collections 管理（Markdown 文件）

## 站点路由结构

```
/                    → 门户首页
/tools               → 工具推荐列表页
/tools/[slug]        → 单个工具详情页
/experiences         → 经验贴列表页
/experiences/[slug]  → 单篇经验贴详情页
/timeline            → 保研时间线页面
/faq                 → FAQ 页面
/join                → 加入我们页面
```

## 文件结构

### 路由文件

```
src/pages/
  index.astro
  tools/
    index.astro
    [slug].astro
  experiences/
    index.astro
    [slug].astro
  timeline.astro
  faq.astro
  join.astro
```

### Content Collections

```
src/content/
  config.ts
  tools/
    *.md
  experiences/
    *.md
```

## Content Collections Schema

### Tools

```typescript
{
  name: string
  description: string
  category: string       // 信息收集 | 简历制作 | 面试准备 | 其他
  link: string
  icon?: string
  featured?: boolean     // 是否在首页展示
  tags: string[]
}
```

### Experiences

```typescript
{
  title: string
  author: string         // 昵称
  date: Date
  school: string         // 本科学校
  target: string         // 录取学校
  major?: string
  excerpt: string        // 摘要，用于列表页
  featured?: boolean     // 是否在首页推荐
  tags: string[]         // 夏令营 | 预推免 | 九推
}
```

## 页面设计

### 门户首页 (`/`)

- Hero：社群介绍、核心价值主张
- 精选工具卡片（featured: true，展示 2-3 个）
- 热门经验贴卡片（featured: true，展示 2-3 篇）
- 快速导航入口
- 加入我们 CTA

### 列表页 (`/tools`, `/experiences`)

- 页面标题和描述
- 按 category/tags 筛选
- 卡片式网格布局
- 卡片内容：标题、摘要、标签、"查看详情"链接

### 详情页 (`/tools/[slug]`, `/experiences/[slug]`)

- 完整内容渲染
- 面包屑导航：首页 > 工具推荐 > [名称]
- 相关推荐
- 上一篇/下一篇导航

### 单一内容页 (`/timeline`, `/faq`, `/join`)

- 直接展示完整内容，从现有组件迁移

## 组件规划

### 需要重构

| 现有组件 | 操作 |
|---------|------|
| `Nav.astro` | 锚点链接 → 页面路由链接，添加当前页高亮 |
| `Tools.astro` | 拆分为 `ToolsList.astro` + `ToolCard.astro` |
| `Experiences.astro` | 拆分为 `ExperiencesList.astro` + `ExperienceCard.astro` |
| `Timeline.astro` | 移至 `/timeline` 页面，保持不变 |
| `Faq.astro` | 移至 `/faq` 页面，保持不变 |
| `JoinUs.astro` | 移至 `/join` 页面，保持不变 |

### 新增组件

- `Breadcrumb.astro` — 面包屑导航
- `FeaturedTools.astro` — 首页精选工具
- `FeaturedExperiences.astro` — 首页精选经验贴
- `PageHeader.astro` — 通用页面头部（标题 + 描述）
- `RelatedContent.astro` — 详情页相关推荐

### 保持不变

- `BaseLayout.astro`
- `Footer.astro`
- `site.config.ts`（更新 navLinks 为页面路由）

## 技术实现

### 动态路由

详情页使用 `getStaticPaths()` 预生成静态页面：

```astro
export async function getStaticPaths() {
  const tools = await getCollection('tools');
  return tools.map(tool => ({
    params: { slug: tool.slug },
    props: { tool },
  }));
}
```

### 数据获取模式

- 列表页：`getCollection('tools')`
- 首页精选：`getCollection('tools', ({ data }) => data.featured)`
- 详情页：通过 props 接收，`getStaticPaths` 传入

### SEO

- 每页独立 title 和 meta description
- Open Graph 标签
- 自动 sitemap（`@astrojs/sitemap`）

## 实施顺序

1. 配置 Content Collections（`src/content/config.ts`）
2. 创建示例内容文件（tools/ 和 experiences/ 各 2-3 个）
3. 改造导航系统（Nav 组件 + site.config.ts）
4. 创建列表页和详情页模板
5. 重构首页为门户页
6. 迁移 timeline、faq、join 到独立页面
7. 测试所有路由和链接

## 边界情况

- 空状态：collection 无内容时显示友好提示
- 404 页面：`src/pages/404.astro` 引导用户返回首页
- 外部链接：`target="_blank" rel="noopener noreferrer"`
