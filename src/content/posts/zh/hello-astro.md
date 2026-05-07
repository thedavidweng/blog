---
title: "用 Astro 搭建一个快速的静态博客"
locale: zh
slug: "hello-astro"
description: "一个极简的双语博客：内容托管在 Git，部署纯静态 HTML，并在构建时生成 Open Graph 图片。"
publishedDate: 2026-04-30
tags:
  - Tools
  - Writing
---

## 为什么选 Astro

对于个人博客来说，如果核心需求是速度，Astro 是一个很合适的选择。内容存放在 Markdown 文件里，仓库就是唯一的数据源，部署的站点可以完全保持静态——没有服务器，没有数据库，除非显式引入，否则不会向客户端发送任何运行时的 JavaScript。

Astro 6 是当前的主版本。它使用 Vite 作为构建引擎，内置基于 Zod Schema 校验的内容集合（Content Collections），并且默认对静态页面零 JS 输出。交互功能（评论、图片缩放、目录导航）以组件级岛屿（Islands）的形式按需加载，因此每个功能所需的最低限度 JavaScript 才会到达浏览器。

## 完整技术栈——逐个包拆解

### 核心框架

- **astro (^6.2.2)** —— 核心框架。负责路由、内容集合、静态生成，以及基于 Vite 的开发服务器。所有页面在构建时渲染为纯 HTML。开发服务器默认运行在 `localhost:4321`。
- **@astrojs/mdx (^5.0.4)** —— Astro 的 MDX 集成。允许编写 `.mdx` 文件，在 Markdown 中直接导入和使用 Astro 组件。这使得在文章内嵌入自定义交互元素（如手动链接卡片或内联演示）成为可能。

### 样式

- **tailwindcss (^4.2.4)** —— Tailwind CSS v4，实用优先的 CSS 框架。负责所有布局、间距、排版和响应式设计。Tailwind v4 采用 CSS 优先的配置方式（不需要 `tailwind.config.js`），构建速度比 v3 显著提升。
- **@tailwindcss/vite (^4.2.4)** —— Tailwind CSS v4 的 Vite 插件。将 Tailwind 直接集成到 Vite 开发服务器管道中，实现开发时的即时热更新（HMR）。
- **@tailwindcss/typography (^0.5.19)** —— 提供用于美化原始 HTML/Markdown 输出的 `prose` 类。本博客在其基础上构建了自定义的、零依赖的排版实现，以同时处理中英文双语排版，包括合适的字体栈、间距，以及丰富的 Markdown 元素样式（引用块、表格、代码块等）。

### 内容与 Markdown 处理

- **astro/loaders (glob)** —— Astro 内置的内容加载器。在构建时扫描 `src/content/posts/**/*.md`，将文件输入到内容集合中。`generateId` 选项会去掉 `.md` 扩展名，生成干净的条目 ID。
- **astro/zod** —— 集成到 Astro 内容集合中的 Zod Schema 校验。每篇文章的 frontmatter 在构建时根据 `src/content.config.ts` 中定义的 schema 进行校验。这能在问题进入生产环境之前捕获拼写错误、缺失字段和类型不匹配。例如，`draft: no`（YAML 1.2 字符串）会导致 `z.boolean()` 校验失败——必须写成 `draft: false`。
- **rehype-slug (^6.0.0)** —— Rehype 插件，自动为 Markdown 标题（`h1`–`h6`）添加 `id` 属性。这使得锚点链接（如 `#my-section`）成为可能，也是 Tocbot 滚动监听导航工作的前提条件。
- **mdast-util-to-string (^4.0.0)** —— MDAST（Markdown 抽象语法树）工具，从 Markdown AST 中提取纯文本。用于从文章内容中剥离 Markdown 格式，以便精确计算阅读时间和处理元数据。
- **unist-util-visit (^5.1.0)** —— Unified 生态系统的通用 AST 访问工具。用于在构建过程中遍历和操作 Markdown/AST 节点——例如，处理链接节点以实现链接卡片功能。
- **reading-time (^1.5.0)** —— 基于字数和平均阅读速度估算阅读时间。在每篇文章上显示"X 分钟阅读"。同时处理英文和中文分词，确保跨语言估算准确。
- **turndown (^7.2.4)** —— HTML 到 Markdown 的转换器。在构建管道中，用于将抓取的网页内容转换为 Markdown，供链接卡片功能使用。
- **sanitize-filename (^1.6.4)** —— 将字符串安全化以用于文件名。在根据文章标题生成 OG 图片和其他构建产物的文件路径时使用。

### 代码块

- **astro-expressive-code (^0.42.0)** —— Expressive Code 的 Astro 集成，一个语法高亮引擎。提供美观的代码块，带有 Mac 风格的窗口控制按钮（红/黄/绿圆点）、复制到剪贴板按钮、行高亮，以及支持数十种主题。零客户端 JavaScript——所有高亮都在构建时完成。

### 富链接预览

- **remark-link card** —— 一个 Remark 插件，自动检测 Markdown 内容中的原始 URL，并将其转换为类似 Notion 风格的富链接预览卡片。每张卡片包含页面标题、描述和缩略图，数据来自目标页面的 Open Graph 元数据。
- **open-graph-scraper (^6.11.0)** —— 从 URL 抓取 Open Graph 元数据（标题、描述、图片）。在构建时被链接卡片系统使用，获取外部链接的预览数据。
- **probe-image-size (^7.3.0)** —— 无需下载完整文件即可探测远程图片的尺寸。与 open-graph-scraper 配合使用，验证和测量链接预览图片。
- **image-size (^2.0.2)** —— 读取本地图片文件的尺寸。用于处理 `public/posts/` 目录中的文章图片。
- **he (^1.2.0)** —— HTML 实体编解码器。在 OG 图片生成及其他需要处理 HTML 实体的场景中用于安全编码文本。

### 交互体验（客户端 Islands）

这些是唯一发送到浏览器的 JavaScript。每个仅在需要的页面上加载。

- **giscus** —— 基于 GitHub Discussions 的评论系统。轻量、无数据库、支持主题切换。评论存储为博客仓库的 GitHub Discussions，无需维护独立数据库。支持跨语言统一评论线程——文章的中英文版本通过 `data-lang` 映射共享同一个讨论帖。
- **medium-zoom (^1.1.0)** —— 一个原生 JavaScript、零依赖的库，提供 Medium 风格的图片灯箱缩放效果。点击文章中的任意图片即可平滑动画放大。无框架、无依赖，约 3KB gzipped。
- **tocbot (^4.36.6)** —— 一个原生 JS 库，自动从页面中的标题元素生成粘性目录（Table of Contents）。包含滚动监听（滚动时高亮当前章节），并与 `rehype-slug` 添加的标题 ID 配合工作。在桌面端渲染为侧边栏，在移动端自动折叠。

### 自动化资源

- **astro-og-canvas (^0.11.1)** —— Astro 集成，使用 Canvas API 在构建时生成 Open Graph 图片。为每篇文章渲染一张 1200×630 的 PNG，包含文章标题、描述和品牌标识。
- **canvaskit-wasm (^0.41.1)** —— Google Skia 图形引擎的 WebAssembly 构建版本。作为 `astro-og-canvas` 的渲染后端。支持高级文本渲染和多语言字体加载——特别是 Noto Sans SC 用于中文字符，确保 CJK 文本在 OG 图片中正确渲染，而不会回退到系统字体。

### 图标

- **@fortawesome/free-brands-svg-icons (^7.2.0)** —— Font Awesome 的品牌图标（GitHub、LinkedIn、X/Twitter 等）。用于社交链接组件和页脚。
- **@lucide/astro (^1.14.0)** —— 以 Astro 组件形式提供的 Lucide 图标。用于整个网站的 UI 图标（导航、按钮、功能开关）。支持 tree-shaking——只有实际使用的图标才会被包含在构建中。

### SEO 与订阅

- **@astrojs/rss (^4.0.18)** —— 生成 RSS 订阅源。生成两个 feed：`/rss.xml` 用于英文文章，`/zh/rss.xml` 用于中文文章。每个 feed 包含完整文章内容、发布日期和正确的元数据。
- **@astrojs/sitemap (^3.7.2)** —— 在 `/sitemap-index.xml` 生成站点地图索引。包含所有已发布文章（中英文双语），并为 SEO 提供正确的 `hreflang` 替代链接。自动排除草稿文章。

### 部署与基础设施

- **Cloudflare Pages** —— 托管平台。构建命令为 `pnpm build`，输出目录为 `dist`。Node 版本通过 `.nvmrc` 固定为 `25.9.0`。推送到 `main` 分支触发自动部署。免费层包含无限带宽、自动 SSL 和全球 CDN。
- **wrangler (^4.87.0)** —— Cloudflare 的 CLI 工具。用于手动部署（`pnpm deploy`）和本地测试 Cloudflare Pages 行为。

### 开发工具

- **typescript (^6.0.3)** —— 为 Astro 组件、配置文件和构建脚本提供类型安全的 TypeScript 支持。
- **@astrojs/check (^0.9.9)** —— 运行 Astro 内置的类型检查（`astro check`）。校验内容集合 Schema、组件属性和整个项目的 TypeScript 类型。
- **tsx (^4.21.0)** —— TypeScript 执行器。用于直接运行测试文件（`tests/*.test.ts`），无需单独的编译步骤。

## 内容架构

文章存放在成对的 Markdown 文件中：

```
src/content/posts/en/<slug>.md
src/content/posts/zh/<slug>.md
```

每个已发布的 slug 必须同时存在于两种语言中。slug 用于配对翻译——文章的中英文版本通过共享的 slug 相互关联。文章图片存放在 `public/posts/<slug>/`。

Frontmatter 在构建时通过 Zod 进行校验。Schema 强制要求：title（字符串）、description（字符串）、publishedDate（日期）、tags（非空字符串数组，从预定义集合中选择），以及可选字段如 updatedDate、draft、slug、locale、narrowFigures 和 related。

标签在 `src/site.config.ts` 中定义，带有本地化标签（例如 `Tools` → `工具`）。`related` 字段接受一个 slug 数组，用于在每篇文章底部显示相关文章。

## 静态输出

构建产物包括：

| 输出 | 路径 |
|------|------|
| 英文 RSS | `/rss.xml` |
| 中文 RSS | `/zh/rss.xml` |
| 站点地图索引 | `/sitemap-index.xml` |
| LLM 摘要 | `/llms.txt` |
| OG 图片（英文） | `/og/<slug>.png` |
| OG 图片（中文） | `/zh/og/<slug>.png` |

## 环境变量

需要一个环境变量：

- `PUBLIC_SITE_URL` —— 生产环境的站点 URL（例如 `https://blog.blahaj.uk`）。用于为 OG 图片、规范链接和站点地图生成绝对 URL。未设置时，所有 URL 默认为 `http://localhost:4321`，社交媒体平台将无法获取 OG 图片。在 Cloudflare Pages → Settings → Environment variables（Production）中设置。

## 最终效果

- **快速** —— 纯静态 HTML，默认零 JS，最小化的客户端岛屿
- **低成本** —— 托管在 Cloudflare Pages 免费层，带宽无限
- **易维护** —— 内容在 Git 中，frontmatter 构建时校验，资源自动生成
- **双语** —— 完整的中英文支持，成对的文章、本地化订阅源、支持 CJK 的 OG 图片
- **可读性** —— 双语自定义排版、阅读时间估算、进度条、目录导航
- **社交友好** —— 自动生成 OG 图片、富链接预览卡片、双语 RSS 订阅
- **按需交互** —— 通过 GitHub Discussions 评论、图片缩放、粘性目录——仅在需要时加载
