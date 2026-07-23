# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Grocery-tracker-automation post (bilingual) with Notion/Monarch/Walmart automation images
- 撸卡社区黑话入门 (bilingual) + US Bank $450 开户奖时间线 (bilingual)
- BOA 无年费无FTF 3%自选卡 (bilingual)
- Turkish Apple ID iTunes post (bilingual)
- US financial services Canadian number VoIP support post (bilingual)
- Cod4-2026 post (bilingual)
- AMEX Checking $300 bonus timeline (bilingual)
- Dotfiles rewrite, AI spending post, chezmoi migration article

### Changed

- Deepen Locale module: consolidate locale-aware URL generation into `src/lib/locale.ts`
- Deduplicate pages: extract shared page components, make zh/ routes thin wrappers
- Deduplicate OG image routes: extract shared `ogImageOptions` config to `src/lib/og.ts`
- Extract middleware HTML-to-Markdown logic to testable `src/lib/markdown-response.ts`
- Replace string-matching source contract tests with behavioural tests
- Add RSS helper module (`src/lib/rss.ts`) to eliminate RSS route duplication
- Modularize prose styles, add social link divider
- Migrate Kamen Rider cosplay post to MDX with custom components
- Enable Astro ViewTransitions for SPA-like client-side navigation

### Fixed

- Fix image naming convention for AMEX Checking post
- Sync zh content changes to en for cod4-2026
- Update dotfiles-setup-with-dotbot zh content
- Convert AMEX checking images to AVIF
- Add GitHub links for rime-cantonese, inject-jyutping, to-jyutping in lyric-romanizer Pt.2
- Remove leftover temp files from en directory
- Derive alternate locale dynamically instead of hardcoding
- Sync dotfiles articles with sspai, remove slug frontmatter
- Rename maza asset folder and slug to maza
- Update personal role description and adjust mobile toolbar/back-to-top positioning

### 🧪 Tests

- Add markdown-response tests for middleware HTML-to-Markdown conversion
- Add .mdx support, slug/image validation, and translation consistency checks to content contract
- Validate YAML booleans in content frontmatter

