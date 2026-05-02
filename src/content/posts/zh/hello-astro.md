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

对于个人博客来说，如果核心需求是速度，Astro 是一个很合适的选择。内容存放在 Markdown 文件里，仓库就是唯一的数据源，部署的站点可以完全保持静态。

这个方案刻意保持了简洁的技术栈：

- Markdown 文件撰写文章
- 文章、标签、Feed 和元数据均使用静态路由
- 构建时生成 Open Graph 图片
- 通过 Cloudflare Pages 部署

最终得到的网站易于阅读、托管成本低廉、维护起来也非常直接。
