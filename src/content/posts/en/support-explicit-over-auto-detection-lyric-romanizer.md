---
title: "lyric-romanizer Pt. 2: I Gave Up on Cantonese Auto-Detection"
locale: en
slug: support-explicit-over-auto-detection-lyric-romanizer
description: "While adding Cantonese support to the lyric romanization tool, I went in circles with auto-detection and finally settled on explicit parameters."
publishedDate: 2026-05-06
tags:
  - Tools
  - Thoughts
  - Workflow
draft: false
related:
  - stop-reinventing-the-wheel-lyric-romanizer
---

I extracted [lyric-romanizer](https://github.com/thedavidweng/lyric-romanizer) from [Spotify Karaoke](https://github.com/haroldalan/spotify-karaoke).

My next step was to add Cantonese support to [lyric-romanizer](https://github.com/thedavidweng/lyric-romanizer).

"[The Linguistic Society of Hong Kong Cantonese Romanization Scheme](https://jyutping.org/jyutping/)", abbreviated as "Jyutping" (粵拼). Like Pinyin, it is a standard romanization scheme.

Jyutping conversion itself is not the problem — [to-jyutping](https://github.com/CanCLID/to-jyutping) already handles it. The real challenge was how to distinguish Cantonese songs from Mandarin songs at low cost.

## 1. Initial Idea: Build a Cantonese Version of pinyin-pro

The initial idea was to build a library similar to [pinyin-pro](https://github.com/zh-lx/pinyin-pro), but targeting Cantonese — quickly converting Chinese text to Jyutping. I'm not a Cantonese speaker myself, so I wanted to reuse an authoritative standard and build fast, general-purpose infrastructure like pinyin-pro.

I attached the source code of [rime-cantonese](https://github.com/rime/rime-cantonese) and [inject-jyutping](https://github.com/CanCLID/inject-jyutping) browser extension, and asked ChatGPT:

> Is pinyin-pro based on a dictionary? Can the same logic be mapped to achieve Jyutping output for Cantonese? Do rime-cantonese and inject-jyutping have ready-made dictionaries? Can they be used directly? Do these two solutions share the same underlying principle? Is one clearly better?

Conclusion: The core of pinyin-pro is indeed dictionary + matching logic, not language understanding or inference. rime-cantonese has ready-made character tables and word lists with decent data quality. inject-jyutping is more like a browser extension — what it actually depends on is to-jyutping.

If building a pinyin-pro-style Jyutping library, rime-cantonese's data can serve as the underlying dictionary.

## 2. Evaluating to-jyutping: Use It Directly or Reinvent the Wheel?

Since to-jyutping already exists, should I use it directly, or use rime-cantonese's data to build a new wheel more like pinyin-pro?

> Please think about and evaluate the to-jyutping source code — should I use it directly, or would it be valuable to reinvent a wheel following pinyin-pro's logic using rime-cantonese's data? Please answer objectively.

Analysis conclusion: to-jyutping already implements compressed trie, longest match, and default pronunciation selection. The data source has an inheritance relationship with rime-cantonese, which is good enough for "fast conversion". Its problem is that it only selects the highest-frequency reading by default, lacking more sophisticated contextual probability selection.

At this stage, I decided: integrate to-jyutping first, don't reinvent the wheel.

## 3. The Real Problem Surfaces: Traditional Chinese ≠ Cantonese

Traditional Chinese is not the same as Cantonese.

Many Mandarin song lyrics are written in Traditional Chinese characters — Taiwan and Hong Kong data sources both use Traditional Chinese. Cantonese songs also use Traditional Chinese characters. You can't tell whether to use Pinyin or Jyutping just by looking at "Traditional Chinese".

> Is there a good way to distinguish Mandarin written in Traditional Chinese from Cantonese written in Traditional Chinese? Because I want to use the to-jyutping library together with the pinyin-pro library for a lyric plugin. Some songs are from Taiwan, or their data source comes from Traditional Chinese communities, so although the song is Mandarin, the lyrics are written in Traditional Chinese characters. I need to distinguish this from Cantonese songs — use Pinyin where it belongs, use Jyutping where it belongs.

First reaction: add auto-detection.

ChatGPT's suggestion was to use Cantonese-specific characters for heuristic detection, such as "唔、冇、佢、嘅、咗、喺". If these characters appear, it's likely Cantonese. Then use a language identification model like fastlangid as a supplement.

Perplexity's suggestion was more detailed: implement a two-stage judgment, first determine "whether it's obviously Cantonese written language", then decide whether to use to-jyutping or pinyin-pro. The specific plan:

1. Metadata first: singer region, album region, language tags, source site locale
2. Strong feature word list: if "佢/咗/嘅/喺/哋/冇/啲/嚟/咩/嗰/而家" etc. hit a threshold, directly judge as Cantonese
3. Weak feature scoring: sentence-final particles, Cantonese common function word frequency accumulation
4. Default to Mandarin: when there's not enough Cantonese evidence, prefer pinyin-pro

## 4. Is fastlangid Too Heavy?

At this stage, I was already considering solutions from the NLP domain.

[fastlangid](https://github.com/currentslab/fastlangid) is a language detection library based on FastText. My main questions were:

> Is fastlangid heavy? Is there performance overhead? Would adding it to a lyric plugin be too heavy?

fastlangid is the most directly matching lightweight library, supporting zh-hans, zh-hant, and zh-yue, with small model files and fast inference. Alternative solutions include CLD3 (extremely light but doesn't distinguish Cantonese) and Unicode rule library (zero model but limited coverage).

## 5. Writing the First Version of the Development Plan

At this point, I decided to add to-jyutping to lyric-romanizer, and asked ChatGPT to write a development plan that could be directly executed by a Coding Agent:

> lyric-romanizer is my lyric project. Please write a development plan that includes adding to-jyutping to complete the missing Cantonese part, and how to determine whether to use to-jyutping or pinyin-pro. The plan must be well-written so that codex can execute it perfectly.

Plan requirements: add to-jyutping, add cantonese-detector.ts, use Cantonese-specific character table to determine whether to use Jyutping, retain the dialect parameter as an override option. Use pnpm, README should link to to-jyutping.

## 6. Coding Agent's Feedback After Reading the Plan

The Coding Agent read the complete codebase according to the plan and gave feedback with specific questions:

- `romanizeLines` already calls `romanizeLine` line by line, no need for bulk `isCantoneseLines` decision
- `dialect` parameter needs clear type and priority
- to-jyutping lazy loading should be consistent with existing Kuroshiro style
- Whether to add `RomanizeResult.dialect` needs to be clarified
- Whether to-jyutping comes with type definitions needs to be checked
- `src/index.ts` needs export updates
- to-jyutping failure fallback should go back to Pinyin, not transliterate
- Tests need to mock dynamic import

My decisions:

- `dialect?: 'mandarin' | 'cantonese'` goes in `RomanizeOptions`
- `romanizeLine` is responsible for per-line judgment
- `RomanizeResult` does not add dialect
- to-jyutping failure falls back to Pinyin in the Chinese branch
- to-jyutping comes with its own types, no shim needed

At this stage, the direction was still: keep auto-detection, supplemented by explicit parameters.

## 7. "Queen's Road East"

The touchstone for this scheme is Lo Da-Yu's "Queen's Road East", because this is the song that made me realize lyric-romanizer was missing Cantonese support:

> Can the logic you wrote identify which library to use for this lyric?

"Queen's Road East" is a standard Cantonese song, but the lyric text is almost entirely composed of standard Traditional Chinese written characters — not a single "唔", no "冇", no "佢". The count of Cantonese spoken characters in the entire song is zero. By the logic, it would be misjudged as Mandarin, and then pinyin-pro would be called.

## 8. Attempting to Enhance Detection: Dictionary Approach

> So your logic needs to be enhanced. Research whether there are dictionaries that can be used to expand the feature table. If the dictionary + feature table approach ends up heavier than fastlangid, then consider using the fastlangid approach.

Researched Cantonese NLP resources: Cantonese suggested character tables, common character tables, Cantonese original character tables, Hong Kong special terms, hardmaru/cantonese-list, rime-cantonese word lists.

Conclusion: 200–500 high-distinctiveness markers are small but not enough. Complete dictionaries are large, and many Chinese characters are shared between Mandarin and Cantonese.

On Perplexity, I also asked more systematic questions:

> I want to build a function to determine whether text is Mandarin or Cantonese. The current approach I thought of is character table heuristics. Are there mature dictionaries/libraries that can do this?

The suggestion was to implement a two-stage approach, a fusion of the previous two schemes: rule scoring + statistical classification fallback. The first layer uses Cantonese feature words, function words, and sentence-final particles for high-precision judgment; the second layer uses fastText/fastlangid for supplementary judgment. Focus on these features:

- Cantonese exclusive characters: 佢 哋 嘅 咗 喺 冇 唔 乜 嘢 嚟
- Multi-character words: 有冇 係咪 做咩 點解 而家
- Mandarin comparison: 的 了 在 没 什么 为什么

But relying solely on character tables makes it hard to stabilize "written Cantonese vs. written Mandarin", especially when encountering shared Chinese characters, formal writing styles, and short texts — the misjudgment rate rises noticeably.

## 9. Node Version fastLangID vs Python Version fastlangid

> If someone else has already written it, don't reinvent the wheel

> `pnpm add fastLangID` — the Node version of fastLangID seems to be a different project from the Python one. Should I make lyric-romanizer use both Node and Python, or port fastLangID over?

The Node version fastLangID is a different project, based on fastText.js, returning ordinary language codes. Only the Currents Lab Python version has the second-stage model and zh-yue support.

Even assuming porting is possible, Python is still more suitable. Porting would mean reproducing fastText inference, second-stage models, feature engineering, and model loading in Node/TypeScript. This work is close to developing a language identification library from scratch.

The idea of stuffing Python fastlangid directly into the lyric-romanizer runtime has been basically abandoned at this point. An NPM package depending on Python runtime would bring cross-platform installation, CI, Electron, serverless, and browser compatibility issues.

## 10. fastlangid Actual Test: "Queen's Road East" Still Fails

I decided to actually test fastlangid:

> For this Lo Da-Yu "Queen's Road East" lyric, the fastlangid library failed to correctly identify it as Cantonese.

Results:

- zh-hant (Traditional Chinese): 98.18%
- zh-yue (Cantonese): 1.82%
- zh-hans (Simplified Chinese): ~0.005%

Even fastlangid, which specifically supports Cantonese identification, cannot stably identify written Cantonese lyrics. Because the text of "Queen's Road East" is too similar to standard Traditional Chinese — the text doesn't have enough Cantonese spoken markers.

## 11. Starting to Doubt the Auto-Detection Approach

> I'm thinking about whether to allow users to manually label the language of lyrics. But if so, it's impossible to allow them to label the language line by line — they can only label the language of the entire song. But this would lead to: if multiple languages appear in one song, they cannot be correctly identified.

The suggestion was to retain song-level dialect explicit override, and mixed-language scenarios could be handled by splitting at the lyric block level or by the upper-layer caller.

> I still think adding Cantonese-specific characters and Hong Kong-unique words would be a very inaccurate judgment method. fastlangid's effect on written Cantonese is also not good. Having users manually judge might be more accurate. What do you think about completely handing over to the software that accesses lyric-romanizer to choose Pinyin or Jyutping?

Originally I wanted lyric-romanizer to judge whether text is Mandarin or Cantonese by itself. Now I'm leaning toward: lyric-romanizer is only responsible for conversion, not for high-risk language judgment. Upper-layer applications, lyric plugins, players, or data sources understand the song language better. They can decide whether to call pinyin-pro or to-jyutping based on song metadata, user selection, singer information, or platform language tags.

## 12. External Research: Correct Detection Approaches a Separate Project

I switched to Perplexity for external research and sent the research results to ChatGPT:

> I did some research on how to handle this auto-detection logic.

That research proposed a more complete solution: using PyCantonese, Cifu, awesome-cantonese-nlp, fastlangid, OpenCC and other resources to build a rule scoring + statistical classification system. Use Cantonese exclusive characters, multi-character words, Mandarin comparison words, sentence pattern features, word segmentation, weights, thresholds, unknown/mixed output, etc. to make the judgment. The recommendation is to use Python only for offline generation of word lists, and the NPM runtime only carries JSON and TypeScript inference code.

I realized this solution is no longer about adding a feature to lyric-romanizer — it's about building a "Chinese language variant detector", which has deviated from the original intention.

## Final Decision: Explicit Parameters

> This is too complex. It feels like doing a completely separate project. How about just defaulting to Pinyin when calling lyric-romanizer.

> Write me a prompt to add a to-jyutping parameter to the current lyric-romanizer, and remove the current primitive recognition rules.

Final solution:

```typescript
// Mandarin (default)
romanizer.romanizeLine('床前明月光')
// 'chuáng qián míng yuè guāng'

// Cantonese, explicitly enabled
romanizer.romanizeLine('床前明月光', { dialect: 'cantonese' })
// 'cong4 cin4 ming4 jyut6 gwong1'
```

Delete cantonese-detector.ts. Delete auto-detection logic. Keep the dialect parameter.

## What This Exploration Taught Me

Adding Cantonese support to lyric-romanizer — the difficulty lies completely not in Jyutping conversion, but in the mismatch between written language and pronunciation systems.

The distinction between Mandarin, Japanese, Korean, and Romanized languages is relatively clear — character set differences are obvious. Mandarin and Cantonese share a large number of Chinese characters, especially in formal lyrics, written lyrics, and Hong Kong/Taiwan Traditional Chinese lyrics — just looking at the text, it's hard to tell whether to read it as Mandarin or as Cantonese.

I went through several direction changes:

1. At the beginning, I wanted to build a complete Cantonese version of pinyin-pro
2. Later, I found I could directly use to-jyutping
3. Then, I wanted to automatically determine whether Traditional Chinese belongs to Mandarin or Cantonese
4. Then I tried character table heuristics, fastlangid, dictionary expansion, rules engines
5. Then I found these solutions would all fail or become overly complex on written Cantonese lyrics
6. Finally, I decided to hand over the judgment to the caller

The boundary between Cantonese and Mandarin is not at the character level, but at the pronunciation level. Written Cantonese uses standard Chinese characters extensively — you can't distinguish by looking at the characters. To accurately identify, you need to do complete language model analysis. lyric-romanizer is a lyric romanization tool, not a language identification research project.
