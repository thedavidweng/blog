---
title: "lyric-romanizer: Stop Reinventing the Wheel"
locale: en
slug: "stop-reinventing-the-wheel-lyric-romanizer"
description: "OpenKara needed CJK lyric romanization. While researching, I found a ready-made engine inside the Spotify Karaoke Chrome extension. One GitHub Issue later, I extracted it into a standalone npm package — lyric-romanizer — supporting 12 native scripts and 4 API-based scripts."
publishedDate: 2026-05-06
tags:
  - Tools
  - Thoughts
  - Workflow
draft: false
related:
  - "how-i-replaced-document-creation-with-three-cli-tools"
---

[OpenKara](https://github.com/thedavidweng/OpenKara) is an open-source karaoke app I'm building with Tauri 2 + React + TypeScript. The core feature is separating vocals from a track and displaying synchronized lyrics. Recently I've been working on: CJK Transliteration.

Karaoke is most popular in Chinese, Japanese, and Korean-speaking parts of Asia. Romanizing those lyrics sounds simple — but the ecosystem has plenty of libraries, each covering only a slice of the problem, and quality varies widely.

## Research

Perplexity helped me survey the main options.

<figure>
  <img src="/posts/stop-reinventing-the-wheel-lyric-romanizer/stop-reinventing-the-wheel-lyric-romanizer-library-comparison.avif" alt="Comparison table of CJK romanization libraries: pinyin, pinyin-pro, kuroshiro, transliteration, any-ascii" />
  <figcaption>A comparison of major romanization libraries — each strong in one area, none covering them all</figcaption>
</figure>

[pinyin](https://github.com/hotoo/pinyin) is the classic choice for Chinese, clean API, but no tone marks. [pinyin-pro](https://github.com/zh-lx/pinyin-pro) adds tones, but only covers Mandarin. [kuroshiro](https://github.com/hexenq/kuroshiro) handles Japanese (hiragana, katakana, romaji), but it's a plugin system rather than a standalone library. [transliteration](https://github.com/nickclaw/transliteration) and [any-ascii](https://github.com/anyascii/anyascii) go broad, but with lower quality or no language-aware rules.

Each library handles one piece. I wanted good quality across multiple languages, so I decided to build a routing layer.

## An Unexpected Find

Just as I was about to build a routing aggregator, I came across a Chrome extension: [Spotify Karaoke](https://github.com/haroldalan/spotify-karaoke).

The extension adds karaoke-style lyrics to the Spotify desktop client. It supports three lyric modes: Original, Romanized, and Translated.

<figure>
  <img src="/posts/stop-reinventing-the-wheel-lyric-romanizer/stop-reinventing-the-wheel-lyric-romanizer-spotify-karaoke-lyrics-modes.avif" alt="Spotify Karaoke extension showing four lyric display modes: Original, Romanized, Translated, and Dual Lyrics" />
  <figcaption>Spotify Karaoke's four lyric modes — Dual Lyrics (right) shows original and romanized simultaneously</figcaption>
</figure>

What caught my eye: it had a built-in romanization engine supporting 16 scripts — Japanese (kuroshiro + kuromoji), Mandarin (pinyin-pro), Korean, Cyrillic, Tamil, Thai, Hindi, and more. The approach was exactly what I had in mind: detect the script type, route to the appropriate library.

## A Conversation

I filed a [GitHub Issue](https://github.com/haroldalan/spotify-karaoke/issues/3) with [Spotify Karaoke](https://github.com/haroldalan/spotify-karaoke) author Harold Alan, proposing to extract the romanization engine as a standalone npm package.

<figure>
  <img src="/posts/stop-reinventing-the-wheel-lyric-romanizer/stop-reinventing-the-wheel-lyric-romanizer-github-issue-proposal.avif" alt="GitHub Issue #3 screenshot: proposing to extract the romanization engine from Spotify Karaoke into an independent npm package" />
  <figcaption>Issue #3: proposing to spin out the engine — Harold responded with support and an invitation to PR</figcaption>
</figure>

A few days later he replied positively and invited a PR. I asked about structure: monorepo or polyrepo? His answer was direct: polyrepo, publish it yourself, maintain full control, and he'd pull it in as a dependency. That surprised me.

## Shipping

I extracted the routing logic from Spotify Karaoke's codebase and packaged it as a general-purpose npm module.

The result is [lyric-romanizer](https://github.com/thedavidweng/lyric-romanizer) — 12 native scripts, 4 API-based scripts. No need to know which library handles which script; it routes automatically.

<figure>
  <img src="/posts/stop-reinventing-the-wheel-lyric-romanizer/stop-reinventing-the-wheel-lyric-romanizer-github-issue-resolved.avif" alt="GitHub Issue #3 closed: lyric-romanizer published" />
  <figcaption>Issue closed: lyric-romanizer shipped</figcaption>
</figure>

## Retrospective

Three things stood out.

**Research is underrated.** I spent more time researching than writing code — and it was worth it. Without finding Spotify Karaoke, I'd have built something nearly identical from scratch.

**Reaching out is underrated.** The default in open source is to fork and wait. Not everyone actively contacts the author and proposes mutual benefit. The recent [OpenCLI](https://github.com/jackwener/opencli) incident is an imperfect but related example.

**Vibe Coding has made reinventing the wheel nearly free.** Stacks for indie hackers, boilerplate for every domain — now almost every area has a scattered set of uneven implementations. From a systems perspective, it's a real waste of resources.
