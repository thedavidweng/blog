# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]


### Add

- 撸卡社区黑话入门 (bilingual) + US Bank $450 开户奖时间线 (bilingual)
- BOA 无年费无FTF 3%自选卡 (bilingual)

### Add

- Grocery-tracker-automation post (zh + en) with Notion/Monarch/Walmart automation images

### Blog

- Publish AMEX Checking 00 bonus timeline + fix image naming convention
- Dotfiles rewrite, AI spending post, chezmoi migration article

### Cleanup

- Remove leftover temp files from en directory

### Cod4-2026

- Sync zh content changes to en, publish (draft: false)

### Content

- **zh**: Update dotfiles-setup-with-dotbot post

### Convert

- Amex-us-rewards-checking images to AVIF (approved, card-shipped-to-canada, dd-7500-earn-300-offer)

### Locale-routing

- Extract shared helpers to eliminate en/zh page duplication

### Remark-link-card

- Extract testable seam behind LinkCardFetcher interface

### Style

- Add responsive layout styles for remark-link-card preview components

### Sync

- Lyric-romanizer Pt.2 zh/en — add GitHub links for rime-cantonese, inject-jyutping, to-jyutping

### Turkish-apple-id-itunes

- New bilingual post on Turkish Apple ID for iTunes purchases

### Us-financial-services

- New bilingual post + update content-contract test

### ♻️ Refactoring

- Organize blog assets by relocating images and updating post content and styles
- **posts**: Rename maza asset folder and slug to maza
- Reorganize scripts into dedicated directory and add image format enforcement check
- Migrate Kamen Rider cosplay post to MDX, add custom components, and update media assets
- Update personal role description and adjust mobile toolbar and back-to-top button positioning

### ✨ New Features

- Modularize prose styles, add social link divider, and update site configuration
- **post**: Figure captions from alt; Astro/rehype cosplay post tweaks
- Add reading progress bar, table of contents support, and remark reading time integration
- Add canvaskit-wasm dependency, update pnpm config, and improve documentation and testing
- Add rehype-slug for anchor links and refactor Table of Contents component with image asset updates
- Add blog post about replacing document creation workflows with CLI tools
- Add GEO optimization files (llms.txt, llms-full.txt, IndexNow)
- Add agent-ready features (Content Signals, Link headers, skills index)
- Add AI agent discovery (llms.txt, _headers, HTML-to-Markdown middleware)
- Add English translation + normalize filenames to match slugs
- Add Pt. 1 / Pt. 2 to lyric-romanizer series titles
- Enable Astro ViewTransitions for SPA-like client-side navigation
- **seo**: 添加 JSON-LD Schema 并优化 alt text
- Add AMEX Checking 00 bonus timeline (draft)

### 🐛 Bug Fixes

- **a11y**: Toolbar role, focus rings, reduced motion, Shiki dual theme
- **posts**: Rename Untitled/spaced assets, align paths, fix ITIN typo
- Rename file to avoid special characters in filename
- Use boolean false for draft field in frontmatter
- Add .md extension to Chinese US Bank article
- Use related frontmatter instead of manual links; update AGENTS.md
- Update sidebar aria-current on client-side navigation
- Restore TOC and BackToTop, fix Safari toolbar occlusion
- Disable tocbot smooth scroll to avoid conflict with html scroll-behavior
- Remove Disallow rules for GPTBot, ClaudeBot, and Google-Extended
- **aeo**: Dynamic llms.txt, fix robots.txt sitemap, Person schema, domain fixes
- **deps**: Resolve dependabot security vulnerabilities
- Derive alternate locale dynamically instead of hardcoding
- Sync dotfiles articles with sspai, remove slug frontmatter, rename AI article to match en slug

### 📝 Documentation

- Add AGENTS.md for agent onboarding
- Expand hello-astro post with full tech stack breakdown
- Simplify AGENTS.md, add agent skills config

### 🔧 Chores

- Remove ITIN post pair and static assets (intentional)
- Migrate to pnpm, add mdast-util-to-string dependency, and configure dependabot automation
- Kebab-case post images, captions, expressiveCode order
- Checkpoint existing content changes
- Update dependencies to latest
- **deps**: Bump astro-expressive-code from 0.41.7 to 0.42.0
- **deps**: Bump probe-image-size from 7.2.3 to 7.3.0
- **deps**: Bump astro from 6.2.1 to 6.2.2
- **deps**: Bump astro from 6.2.1 to 6.2.2
- Add .commandcode/ to .gitignore
- **deps**: Upgrade astro, tailwindcss, wrangler to latest
- **deps**: Remove resolved fast-* pnpm overrides
- **deps-dev**: Bump wrangler from 4.90.0 to 4.92.0
- **deps**: Bump devalue (via audit fix)
- **deps-dev**: Bump tsx from 4.21.0 to 4.22.3
- **deps**: Bump @astrojs/mdx from 5.0.4 to 5.0.6
- **deps**: Bump @lucide/astro from 1.14.0 to 1.16.0
- **deps**: Bump tocbot from 4.36.6 to 4.36.8
- **deps**: Bump astro from 6.3.1 to 6.3.7

### 🧪 Tests

- Add .mdx support, slug/image validation, and translation consistency checks to content contract and update siteConfig tags
- Validate YAML booleans in content frontmatter

