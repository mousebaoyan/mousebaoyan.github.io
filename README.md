# mousebaoyan.github.io

鼠保研社区网站，基于 Astro 构建。

## 本地开发

```sh
npm install
npm run dev
```

## 构建与部署

```sh
npm run build   # 产出在 dist/
```

推送到 `main` 分支后，GitHub Actions 自动部署到 GitHub Pages（需在仓库设置中将 Pages source 设为 GitHub Actions）。

---

## 如何投稿

推荐使用网站上的「我要投稿」或「我要推荐资源」按钮提交 GitHub Issue。
管理员可以先编辑投稿，再添加 **「审核通过」** 标签，系统会自动生成内容、构建并部署网站。
发布成功后，Issue 会收到文章链接并自动关闭。

管理员操作、首次配置、更新文章和失败重试见 [投稿审核指南](docs/submission-review.md)。

也可以按下面的方式直接提交 Markdown 文件。

### 添加经验贴

1. 在 `src/content/experiences/` 新建一个 `.md` 文件，文件名用英文或拼音（如 `my-camp-story.md`）
2. 复制 `src/content/experiences/example-experience.md` 的 frontmatter，填写以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | 字符串 | 经验贴标题 |
| `author` | 字符串 | 署名，可匿名 |
| `date` | 日期 `YYYY-MM-DD` | 投稿日期 |
| `school` | 字符串 | 本科院校及专业，如 `某 985 · 计算机科学` |
| `target` | 字符串 | 目标院校及学院 |
| `major` | 字符串（选填） | 目标方向 |
| `excerpt` | 字符串 | 摘要，显示在列表页，建议 50 字以内 |
| `featured` | 布尔 | 是否在首页精选展示，默认 `false` |
| `tags` | 字符串数组 | 如 `[夏令营, 逆袭]` |

3. frontmatter 下方用 Markdown 写正文内容
4. 提交 PR，标题格式：`feat: 添加经验贴 - <标题>`

### 添加推荐工具

1. 在 `src/content/resources/` 新建一个 `.md` 文件
2. 复制 `src/content/resources/example-tool.md` 的 frontmatter，填写以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | 字符串 | 工具名称 |
| `description` | 字符串 | 一句话描述，显示在卡片上 |
| `category` | 枚举 | 只能是：`官方` `情报` `材料` `技巧` `备考` `选校` `工具` `其他` |
| `link` | URL | 工具的访问链接 |
| `featured` | 布尔 | 是否在首页精选展示，默认 `false` |
| `tags` | 字符串数组 | 如 `[简历, 必备]` |

3. frontmatter 下方可用 Markdown 写详细介绍
4. 提交 PR，标题格式：`feat: 添加工具 - <工具名>`

---

示例文件：
- `src/content/experiences/example-experience.md`
- `src/content/resources/example-tool.md`

复制示例文件时，请将 `draft: true` 改为 `draft: false` 才会显示在列表中。
