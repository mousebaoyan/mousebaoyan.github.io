<div align="center">
  <img src="public/logo.jpg" alt="四非保研鼠群标志" width="88" height="88" />
  <h1>四非保研鼠群</h1>
  <p>计算机保研信息 · 保研资源 · 经验分享</p>
  <p>面向四非院校计算机相关专业同学的信息交流与互助网站。</p>
  <p>
    <a href="https://mousebaoyan.github.io/">访问网站</a> ·
    <a href="https://mousebaoyan.github.io/resources/">保研资源</a> ·
    <a href="https://mousebaoyan.github.io/experiences/">保研经验</a> ·
    <a href="https://mousebaoyan.github.io/join/">加入鼠群</a>
  </p>
  <p>
    <a href="https://github.com/mousebaoyan/mousebaoyan.github.io/actions/workflows/deploy.yml"><img src="https://github.com/mousebaoyan/mousebaoyan.github.io/actions/workflows/deploy.yml/badge.svg" alt="GitHub Pages 部署状态" /></a>
    <a href="https://astro.build/"><img src="https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white" alt="Astro 7" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%E2%89%A5%2022.19-417E38?logo=nodedotjs&logoColor=white" alt="Node.js ≥ 22.19" /></a>
  </p>
</div>

---

## 网站内容

| 页面 | 内容 |
| --- | --- |
| [首页](https://mousebaoyan.github.io/) | 鼠群介绍、精选资源、近期经验贴与入群入口 |
| [保研资源](https://mousebaoyan.github.io/resources/) | 按类别整理保研相关网站、工具与参考资料 |
| [保研经验](https://mousebaoyan.github.io/experiences/) | 按发布日期倒序浏览保研经历，每页 6 篇；文章支持目录定位、阅读进度、字号切换与图片放大 |
| [常见问题](https://mousebaoyan.github.io/faq/) | 入群范围、收费说明、资料获取与交流规则 |
| [加入鼠群](https://mousebaoyan.github.io/join/) | 入群条件、入群步骤、群号复制与 QQ 入群链接 |

网站适配桌面和手机，使用 Markdown 管理文章与资源，通过 GitHub Pages 发布。

经验贴与资源详情页下方提供 Giscus 评论区，使用 GitHub 账号参与讨论，评论存储在本仓库的 Discussions 中。

顶部搜索支持经验贴、资源介绍和常见问题的全文检索，可按内容类型筛选、查看关键词高亮摘要，并跳转到对应章节或展开具体问题。点击搜索按钮，或使用 `⌘ K` / `Ctrl K` 打开。

## 加入鼠群

**QQ 群号：`752140536`** · [查看入群指南](https://mousebaoyan.github.io/join/) · [打开 QQ 入群链接](https://qm.qq.com/q/20geYjRZlq)

- **入群范围**：面向四非院校的计算机相关专业同学，不限制年级，已保研的同学也可以加入。
- **申请信息**：请提供年级和本科院校。
- **交流规则**：友好交流、尊重他人，禁止广告与无关链接。
- **费用说明**：入群和日常交流免费。鼠群不提供付费辅导。群友以个人名义提供的付费服务与鼠群无关。

## 投稿与资源推荐

无需搭建开发环境，使用 GitHub 表单即可提交：

| 投稿类型 | 提交入口 | 建议内容 |
| --- | --- | --- |
| 经验贴 | [分享经验](https://github.com/mousebaoyan/mousebaoyan.github.io/issues/new?template=experience-submission.yml) | 保研年份与背景、准备过程、面试经历、录取去向和经验总结 |
| 资源 | [推荐资源](https://github.com/mousebaoyan/mousebaoyan.github.io/issues/new?template=resource-submission.yml) | 资源用途、适用场景、有效链接，以及付费或注册等使用条件 |

**提交表单 → 管理员审核 → 发布到网站 → 在 Issue 评论中查看文章或资源链接**

经验贴和资源推荐均支持审核后自动发布。提交后如需补充或修改，请编辑原 Issue；已发布内容也需重新审核后同步到网站。经验贴正文支持 Markdown，可直接向 Issue 上传图片。

> **公开信息提示**：Issue 及其附件公开可见。经验贴可用昵称或“匿名”署名，本科院校可不填写，但这不会隐藏 GitHub 账号。提交前请检查正文、截图和链接中的个人信息。

熟悉 Git 的贡献者也可以提交 Markdown 文件和 Pull Request，字段说明见下方“内容维护”。

## 本地开发

需要 **Node.js ≥ 22.19.0** 和 npm。

```sh
git clone https://github.com/mousebaoyan/mousebaoyan.github.io.git
cd mousebaoyan.github.io
npm ci
npm run dev -- --background
```

默认访问 [http://localhost:4321](http://localhost:4321)，实际地址以命令输出为准。

| 命令 | 用途 |
| --- | --- |
| `npm run dev -- --background` | 在后台启动 Astro 开发服务 |
| `npm run astro -- dev status` | 查看后台服务状态 |
| `npm run astro -- dev logs` | 查看开发日志 |
| `npm run astro -- dev stop` | 停止后台服务 |
| `npm test` | 运行投稿流程与全文搜索测试 |
| `npm run test:site` | 构建后检查草稿隔离、搜索索引及章节链接、站内链接与静态资源 |
| `npm run build` | 构建静态网站，输出到 `dist/` |
| `npm run preview` | 本地预览已构建的网站 |

提交代码前执行：

```sh
npm test
npm run build
npm run test:site
```

## 项目结构

```text
src/
├── components/              # 导航、卡片、目录、分页等组件
├── content/
│   ├── experiences/         # 经验贴 Markdown
│   └── resources/           # 保研资源 Markdown
├── layouts/                 # 页面基础布局
├── lib/                     # 经验贴排序与分页配置
├── pages/                   # 首页、列表页、详情页和入群指南
├── styles/                  # 全局样式与文章阅读样式
├── content.config.ts        # 内容字段校验
└── site.config.ts           # 网站名称、群号、入群链接与导航
.github/
├── ISSUE_TEMPLATE/          # 经验贴与资源投稿表单
└── workflows/               # 审核发布和 GitHub Pages 部署
scripts/
├── submissions/            # 投稿解析、发布逻辑与测试
└── site.test.mjs            # 构建产物、草稿隔离与站内链接检查
docs/submission-review.md    # 管理员审核与维护指南
public/                     # Logo 等静态文件
```

## 内容维护

站点名称、群号和导航入口在 [`src/site.config.ts`](src/site.config.ts) 中配置。内容字段以 [`src/content.config.ts`](src/content.config.ts) 为准。

直接添加内容时，复制对应示例到同一目录，使用新的英文或拼音文件名，填写 frontmatter 与 Markdown 正文，再提交 Pull Request。

<details>
<summary><strong>经验贴字段与示例</strong></summary>

目录：[`src/content/experiences/`](src/content/experiences/) · [示例文件](src/content/experiences/example-experience.md)

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | 字符串 | 文章标题 |
| `author` | 字符串 | 作者署名，可填写昵称或“匿名” |
| `date` | 日期 | `YYYY-MM-DD` 格式，用于列表排序 |
| `school` | 字符串 | 本科背景，可使用匿名描述 |
| `target` | 字符串 | 录取院校及学院 |
| `major` | 字符串，可选 | 研究方向 |
| `excerpt` | 字符串 | 列表摘要，建议一至两句话 |
| `tags` | 字符串数组 | 内容标签，如 `[夏令营, 计算机保研]` |
| `featured` | 布尔，可选 | 是否在首页优先展示，默认 `false` |
| `draft` | 布尔，可选 | 是否为草稿；不展示且不生成详情页，默认 `false` |

首页最多展示 3 篇非草稿经验贴，优先展示 `featured: true` 的文章，再按日期倒序补足。列表每页 6 篇，可在 [`src/lib/experiences.ts`](src/lib/experiences.ts) 中调整；第二页起使用 `/experiences/page/2/` 等独立地址。

</details>

<details>
<summary><strong>保研资源字段与示例</strong></summary>

目录：[`src/content/resources/`](src/content/resources/) · [示例文件](src/content/resources/example-tool.md)

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | 字符串 | 资源名称 |
| `description` | 字符串 | 资源用途的简要说明 |
| `category` | 枚举 | `官方`、`情报`、`材料`、`技巧`、`备考`、`选校`、`工具`、`其他` |
| `link` | URL | 资源访问地址 |
| `tags` | 字符串数组 | 内容标签，如 `[选校, 信息收集]` |
| `featured` | 布尔，可选 | 是否在首页精选中展示，默认 `false` |
| `draft` | 布尔，可选 | 是否为草稿；不展示且不生成详情页，默认 `false` |

首页最多展示 3 项 `featured: true` 且非草稿的资源，资源列表展示全部非草稿内容。frontmatter 下方可用 Markdown 补充详细介绍和使用建议。

</details>

示例文件带有 `draft: true`，复制后请改为 `draft: false` 才会出现在列表中。草稿不会生成详情页；但本仓库公开，草稿源文件仍可在 GitHub 上查看，请勿写入私人信息。

通过 Issue 自动发布的内容使用 `submission-<Issue 编号>.md` 命名。后续修改应以原 Issue 为来源，重新审核会更新同一文件和页面；直接修改生成文件的内容可能被后续审核覆盖。

## 全文搜索

搜索索引由 [`src/pages/search-index.json.ts`](src/pages/search-index.json.ts) 生成，开发服务和静态构建均可使用。仅收录已发布的经验贴、资源及 [`src/data/faq.ts`](src/data/faq.ts) 中的常见问题；导航、评论和草稿不参与搜索。

索引在首次打开搜索时下载，检索在浏览器内完成，不依赖第三方搜索服务。支持中文子串、英文大小写及全角字符匹配；空格分隔的关键词需全部匹配，标题匹配优先。结果使用实际生成的章节锚点，更新内容后重新构建即可更新索引。

[`SiteSearch.astro`](src/components/SiteSearch.astro) 负责弹窗与交互，[`src/lib/search.ts`](src/lib/search.ts) 负责排序和摘要。常见问题与搜索共用数据源，无需维护两份答案。

## 评论区

经验贴与资源详情页共用 [`Comments.astro`](src/components/Comments.astro)。评论临近视口时加载，支持回复与 Markdown；阅读评论无需登录，发表评论需要 GitHub 账号。网络加载失败时保留重试和 GitHub 讨论入口。

- **仓库设置**：开启 Discussions，并为本仓库安装 [Giscus App](https://github.com/apps/giscus/installations/new)。仅授权本仓库即可，无需个人访问令牌。
- **讨论分类**：使用 `Announcements`（公告类型），由 Giscus 创建页面讨论，访客可在讨论下评论。公开仓库 ID、分类 ID 集中在 [`src/site.config.ts`](src/site.config.ts)；更换仓库或分类时应一并更新。
- **页面关联**：使用带前后斜杠的固定路径（如 `/experiences/submission-1/`），开启严格匹配。改标题不会改变关联；更换文章文件名或路径会产生新关联，请先安排旧讨论迁移。首次评论时才创建对应 Discussion。
- **样式**：[`public/giscus/mouse-light.css`](public/giscus/mouse-light.css) 是 iframe 内的独立主题，包含本站字体、灰白底色、蓝紫按钮和圆角。正式站点通过 HTTPS 加载主题；本地 HTTP 预览由页面读取同一 CSS，再通过 Giscus 的主题更新接口传入，避免 HTTPS iframe 无法读取本地 HTTP 样式的问题。无需安装额外服务。
- **来源限制**：根目录 [`giscus.json`](giscus.json) 允许正式域名和本地调试地址，推送到默认分支后生效。更换域名时同时更新该文件及 `site.url`，后者用于讨论的正式页面回链。
- **管理评论**：在 GitHub Discussions 中处理评论、锁定讨论或限制用户。评论和 GitHub 身份公开可见，请勿提交个人隐私信息。

## 审核与部署

有仓库 **Write / Maintain / Admin** 权限的审核者检查投稿后，添加 **`审核通过`** 标签即可触发发布。首次使用需在默认分支启用工作流、创建该标签，并将 **Settings → Pages → Source** 设置为 **GitHub Actions**。

| 工作流 | 触发方式 | 执行内容 |
| --- | --- | --- |
| [审核发布](.github/workflows/publish-submission.yml) | Issue 新增 `审核通过` 标签 | 校验权限与投稿内容、生成 Markdown、构建检查、提交内容、调用部署并反馈结果 |
| [网站部署](.github/workflows/deploy.yml) | 推送到 `main`、手动触发或审核流程调用 | 安装依赖、运行测试、构建网站并部署到 GitHub Pages |

发布流程使用 GitHub 提供的 `GITHUB_TOKEN`，无需额外配置个人访问令牌。部署成功后，系统会在投稿 Issue 下回复页面链接并自动关闭 Issue；失败时保留 Issue 并说明原因。

首次配置、发布后修改、下架及失败重试，请参阅 **[投稿审核与自动发布指南](docs/submission-review.md)**。

---

由鼠群志愿者维护。保研经验与资源仅供参考，招生条件、时间安排及录取要求以院校官方通知为准。
