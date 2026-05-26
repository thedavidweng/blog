---
title: "lyric-romanizer Pt. 1：别造轮子"
locale: zh

description: "OpenKara 需要支持中日韩歌词罗马化，调研途中发现了 Spotify Karaoke 扩展里的现成引擎。一次 GitHub Issue 之后，我把它拆成了独立 npm 包 lyric-romanizer，支持 12 种本地语言罗马化和 4 种在线语言罗马化。"
publishedDate: 2026-05-06
tags:
  - Tools
  - Thoughts
  - Workflow
draft: false
---

[OpenKara](https://github.com/thedavidweng/OpenKara) 是我用 Tauri 2 + React + TypeScript 写的一个开源卡拉 OK 应用。核心功能是把一首歌的人声分离出来，然后显示同步歌词。最近在做的功能是：CJK Transliteration，也就是罗马化歌词显示。

卡拉 OK 文化最流行的亚洲地区的中文、日文、韩文的歌词，把原文转写成拉丁字母这事听起来简单，实际做的时候发现市面上虽然有大量罗马化库，但质量参差不齐。

## 调研阶段

Perplexity 帮我整理了主流的几个方案。

<figure>
  <img src="/posts/stop-reinventing-the-wheel-lyric-romanizer/stop-reinventing-the-wheel-lyric-romanizer-library-comparison.avif" alt="主流 CJK 罗马化库对比表格，列出 pinyin、pinyin-pro、kuroshiro、transliteration、any-ascii 的特性与局限" />
  <figcaption>主流罗马化库横向对比：各库在语言覆盖、声调支持、输出格式上各有取舍</figcaption>
</figure>

[pinyin](https://github.com/hotoo/pinyin) 是最早期的选择，纯 Node 环境可用，API 简洁，但不支持声调标记。[pinyin-pro](https://github.com/zh-lx/pinyin-pro) 解决了这个问题，输出带声调，但只覆盖中文。[kuroshiro](https://github.com/hexenq/kuroshiro) 和 kuroshiro-analyzer 组合能处理日文，支持平假名、片假名、罗马字之间的转换，局限在于它实际上是 kuroshiro 的附加插件，不是独立库。[transliteration](https://github.com/nickclaw/transliteration) 和 [any-ascii](https://github.com/anyascii/anyascii) 走的是通用路线，前者支持多种语言但质量一般，后者只做字符替换不考虑语言规则。

这些库各管一段，我希望要支持多语言且要效果好，所以打算整一套路由逻辑。

## 意外的发现

我正打算自己写一个聚合路由的时候，翻到了一个 Chrome 扩展：[Spotify Karaoke](https://github.com/haroldalan/spotify-karaoke)。

这个扩展的功能是为 Spotify 桌面端添加卡拉 OK 歌词显示。它支持三种歌词模式：Original（原文）、Romanized（罗马化）、Translated（翻译）。

<figure>
  <img src="/posts/stop-reinventing-the-wheel-lyric-romanizer/stop-reinventing-the-wheel-lyric-romanizer-spotify-karaoke-lyrics-modes.avif" alt="Spotify Karaoke 扩展的四种歌词显示模式：Original、Romanized、Translated、Dual Lyrics" />
  <figcaption>Spotify Karaoke 的四种歌词模式，右侧 Dual Lyrics 可同时显示原文与罗马化</figcaption>
</figure>

最关键的是，它内置了一套罗马化引擎，支持 16 种脚本，包括日文（[kuroshiro](https://github.com/hexenq/kuroshiro) + kuromoji）、中文普通话（[pinyin-pro](https://github.com/zh-lx/pinyin-pro)）、韩文、俄文的西里尔字母，还有泰米尔语、泰语、印地语等。思路和我想的一样：检测输入文字的脚本类型，然后路由到对应的转换库。

## 一次沟通

我给 [Spotify Karaoke](https://github.com/haroldalan/spotify-karaoke) 作者 Harold Alan 发了一条 [GitHub Issue](https://github.com/haroldalan/spotify-karaoke/issues/3)，提议把这个罗马化引擎拆出来做成独立的 npm 包。

<figure>
  <img src="/posts/stop-reinventing-the-wheel-lyric-romanizer/stop-reinventing-the-wheel-lyric-romanizer-github-issue-proposal.avif" alt="GitHub Issue #3 截图：向 Spotify Karaoke 作者 Harold Alan 提议将罗马化引擎拆为独立 npm 包" />
  <figcaption>Issue #3：提议将罗马化引擎独立为 npm 包，Harold 表示支持并邀请提交 PR</figcaption>
</figure>

几天后他回复了，明确表示支持，还邀请我提交 PR。我追问了一下：是 monorepo 还是 polyrepo？他的回答很干脆：polyrepo 更好，建议我自己发布，这样我有完全的控制权，他再把包作为依赖引进去，这个回复让我挺意外的。

## 交付

我把这部分罗马化路由逻辑从 Spotify Karaoke 的代码里剥离出来，做成了一个通用的 npm 包。

最终产出是 [lyric-romanizer](https://github.com/thedavidweng/lyric-romanizer)，支持 12 种本地语言罗马化和 4 种在线语言罗马化，你不需要关心底层用哪个库，它自动路由。

<figure>
  <img src="/posts/stop-reinventing-the-wheel-lyric-romanizer/stop-reinventing-the-wheel-lyric-romanizer-github-issue-resolved.avif" alt="GitHub Issue #3 关闭截图：lyric-romanizer 发布" />
  <figcaption>Issue 关闭：lyric-romanizer 发布</figcaption>
</figure>

## 复盘

回头看这个过程，有几点值得说。

第一，调研的时间成本往往被低估。我在调研阶段花的时间比写代码还多，但这是值得的。如果不是翻到了 Spotify Karaoke，我会写一个和它思路一模一样的库重复造轮子。

第二，沟通的收益被低估了。开源社区有一种默认的默契：你想用别人的代码就 fork 一下，不是所有人都主动联系作者、表达合作意愿。前段时间的 [OpenCLI](https://github.com/jackwener/opencli) 事件是一个不太恰当的例子。

第三，Vibe Coding 让造轮子的成本变得无限降低，从独立开发者三件套变成了几乎能想到的所有领域都有水平参差不齐的各种实现，从一个整体的角度看实在是一种对资源的浪费。
