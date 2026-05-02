---
title: "Building a fast static blog with Astro"
locale: en
slug: "hello-astro"
description: "A minimal bilingual blog that keeps content in Git, ships static HTML, and generates Open Graph images at build time."
publishedDate: 2026-04-30
tags:
  - Tools
  - Writing
---

Astro is a practical fit for a personal blog when the core requirement is speed. The content lives in Markdown, the repository is the source of truth, and the deployed site can stay entirely static.

This example keeps the stack intentionally small:

- Markdown files for articles
- Static routes for posts, tags, feeds, and metadata
- Build-time Open Graph images
- Cloudflare Pages for deployment

The result is a site that is easy to read, cheap to host, and straightforward to maintain.
