# AGENTS.md - Agent Guide for This Project

## 项目概览

Astro 静态博客，Cloudflare Pages 部署。
源码：https://github.com/thedavidweng/blog

```
src/content/posts/   ← 文章（en/ zh/ 两个子目录，.md 文件）
public/posts/<slug>/ ← 文章配图
src/                 ← 站点代码（Astro + TypeScript）
tests/               ← 契约测试
```

## 常用命令

```bash
pnpm dev              # 本地开发服务器
pnpm build           # 构建（CI 也会跑这个）
pnpm check           # astro check + 全部测试（提交前必跑）
pnpm test:content   # 内容契约测试（frontmatter 校验）
pnpm test:source    # 源码契约测试
pnpm test:dist      # 构建产物契约测试
```

## 文章规范

- 每篇文章有 en 和 zh 两个版本，slug 必须一致（用于双语配对）。
- Frontmatter schema 在 `src/content.config.ts` 定义。
- **YAML 1.2 布尔值坑**：只有 `true`/`false`/`True`/`False`/`TRUE`/`FALSE` 是布尔值。`no`/`yes`/`on`/`off` 是字符串，会导致 `z.boolean()` 校验失败。**写 `draft: false`，不要写 `draft: no`**。
- `draft: true` 的文章不会参与翻译配对校验。
-  tags 必须在 `src/site.config.ts` 的 `siteConfig.tags` 里注册。

## 代码风格

- 中文与英文/数字之间加半角空格
- 中文标点用全角，英文用半角
- 专有名词保持正确大小写（SafePal、Wealthsimple 等）

## 部署

推送到 `main` 即触发 Cloudflare Pages 自动部署。
构建命令：`pnpm build`，输出目录：`dist`。
