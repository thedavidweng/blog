---
title: "lyric-romanizer Pt. 2：我放弃了粤语自动检测"
locale: zh
slug: "support-explicit-over-auto-detection-lyric-romanizer"
description: "给歌词罗马化工具加粤语支持的过程中，我走了一圈自动检测的弯路，最终选择显式参数。"
publishedDate: 2026-05-06
tags:
  - Tools
  - Thoughts
  - Workflow
draft: false
related:
  - stop-reinventing-the-wheel-lyric-romanizer
---

完成了从 [Spotify Karaoke](https://github.com/haroldalan/spotify-karaoke) 抽取出 [lyric-romanizer](https://github.com/thedavidweng/lyric-romanizer) 的过程。

我的下一步计划是给 [lyric-romanizer](https://github.com/thedavidweng/lyric-romanizer) 加上粤语支持。

「[香港語言學學會粵語拼音方案](https://jyutping.org/jyutping/)」，簡稱「粵拼」（Jyutping）。同拼音一样是一套标准的罗马化方案

Jyutping 转换本身不是问题，[to-jyutping](https://github.com/CanCLID/to-jyutping) 已经做了。我遇到的难题是怎么低成本的区分粤语歌和国语歌。

## 一、最初的想法：做一个粤语版 pinyin-pro

一开始的想法是构建一个类似 [pinyin-pro](https://github.com/zh-lx/pinyin-pro) 的库，但服务对象是粤语，把中文文本快速转换成 Jyutping。我本身不是粤语使用者，所以希望复用权威标准，做出一个像 pinyin-pro 一样快速通用的基础设施。

我把找到的 [rime-cantonese](https://github.com/rime/rime-cantonese) 和 [inject-jyutping](https://github.com/CanCLID/inject-jyutping) 浏览器插件的源码都附上，问 ChatGPT：

> pinyin-pro 是基于一套词库工作的吗？能否用相同逻辑映射来实现粤语 Jyutping 的效果？rime-cantonese 和 inject-jyutping 有已经做好的词库吗？可以直接用吗？这两个解决方案背后的原理相同吗？有明显更好的一个吗？

结论是：pinyin-pro 的核心确实是词库 + 匹配逻辑，不是语言理解推理。rime-cantonese 有现成的字表和词表，数据质量够用。而 inject-jyutping 实际依赖的是 [to-jyutping](https://github.com/CanCLID/to-jyutping) 库。

如果要做一个 pinyin-pro 风格的 Jyutping 库，rime-cantonese 的数据可以作为底层词库。

## 二、评估 to-jyutping：直接用还是重新造轮子？

既然已经有 to-jyutping，到底应该直接用它，还是用 rime-cantonese 数据重新做一个更像 pinyin-pro 的库？

> to-jyutping 的源码，请你思考并评估我应该直接用，还是按 pinyin-pro 的逻辑用 rime-cantonese 的数据再造一个轮子是有价值的。请你客观回答。

分析结论是：to-jyutping 已经做了压缩 trie、最长匹配和默认读音选择。数据源和 rime-cantonese 有继承关系，足够做"快速转换"。它的问题在于默认只选最高频读音，缺少更复杂的上下文概率选择。

这个阶段我决定：先集成 to-jyutping，不重新造轮子。

## 三、问题浮出水面：繁体中文 ≠ 粤语

繁体中文不等于粤语。

很多 Mandarin 歌曲歌词是繁体字，台湾、香港的数据源都是繁体。粤语歌也用繁体字。光看"繁体中文"无法决定该用拼音还是 Jyutping。

> 有什么好办法可以区分繁体中文的 Mandarin 跟粤语的繁体中文？因为我要把这个 to-jyutping 库和 pinyin-pro 库一起用来做歌词插件，有些歌曲来自台湾，或者说它的数据源是繁体中文群体的所以虽然歌曲是 Mandarin，但是标的歌词是繁体字。我需要把这个和粤语歌曲区分开来，该用拼音的用拼音，该用 Jyutping 的用 Jyutping。

第一反应是：加个自动检测。

ChatGPT 的建议是利用粤语专用字做启发式检测，"唔、冇、佢、嘅、咗、喺"等。如果这些字出现，就很可能是粤语。再结合语言识别模型如 fastlangid 作为补充。

Perplexity 的建议更详细：做一个两阶段判定，先判"是不是明显粤语书面语"，再决定走 to-jyutping 还是 pinyin-pro。具体方案是：

1. 元数据优先：歌手地区、专辑地区、语言标签、来源站点 locale
2. 强特征词表：命中"佢/咗/嘅/喺/哋/冇/啲/嚟/咩/嗰/而家"等词达到阈值直接判 cantonese
3. 弱特征打分：句末语气词、粤语常用功能词频次累加
4. 默认走 Mandarin：没有足够粤语证据时优先 pinyin-pro

## 四、fastlangid 会不会太重？

在这个阶段，我已经在考虑用 NLP 场景的方案了。
[fastlangid](https://github.com/currentslab/fastlangid) 是一个基于 FastText 的语言检测库，我的主要问题是：

> fastlangid 重吗？有性能开销吗？加进歌词插件会不会太重？

fastlangid 是最直接匹配的轻量级库，支持 zh-hans、zh-hant、zh-yue，模型文件小，推理快。备选方案有 CLD3（极轻但不区分粤语）、Unicode 规则库（零模型但覆盖有限）。

## 五、写第一版开发计划

这时我决定在 lyric-romanizer 里加入 to-jyutping，让 ChatGPT 写一份可以直接给 Coding Agent 执行的开发计划：

> lyric-romanizer 是我的歌词项目。请你写出开发计划，包含加入 to-jyutping 来补全缺失的粤语部分，怎么判断该使用 to-jyutping 还是 pinyin-pro，计划一定写得好，这样 codex 就可以完美的执行。

计划要求：加入 to-jyutping，增加 cantonese-detector.ts，通过粤语专用字表判断是否用 Jyutping，保留 dialect 参数作为覆盖选项。使用 pnpm，README 要链接到 to-jyutping。

## 六、Coding Agent 读完方案后的反馈

Coding Agent 根据计划阅读了完整代码库，反馈了一组很具体的问题：

- `romanizeLines` 已经逐行调用 `romanizeLine`，不需要 bulk 的 `isCantoneseLines` 决策
- `dialect` 参数需要明确类型和优先级
- to-jyutping 懒加载方式应该和现有 Kuroshiro 风格保持一致
- `RomanizeResult.dialect` 是否新增需要明确
- to-jyutping 是否带类型定义需要检查
- `src/index.ts` 需要更新导出
- Cantonese 失败 fallback 应该回退到 Pinyin，而不是 transliterate
- 测试里需要 mock 动态 import

我的决策是：
- `dialect?: 'mandarin' | 'cantonese'` 放在 `RomanizeOptions`
- `romanizeLine` 负责逐行判断
- `RomanizeResult` 不新增 dialect
- to-jyutping 失败时在 Chinese branch 中回退到 Pinyin
- to-jyutping 自带类型，不需要 shim

这个阶段的方向还是：保留自动检测，辅以显式参数。

## 七、《皇后大道東》

这套方案的试金石是罗大佑的《皇后大道東》，因为这是让我意识到 lyric-romanizer 缺少了粤语支持的歌：

> 你写的这个逻辑能识别这个歌词用哪个库吗？

《皇后大道東》是标准粤语歌曲，但歌词文本几乎完全由标准繁体书面汉字组成，没有一个"唔"、没有"冇"、没有"佢"。整首歌的粤语口语字出现次数是零。按逻辑会误判被判为普通话，然后调用 pinyin-pro。

## 八、增强检测的尝试：字典方案

> 所以你的逻辑要增强，调研一下有没有字典可以用来拓展特征表，如果字典+特征表方案最后比 fastlangid 重，那么就要考虑用 fastlangid 方案。

调研了一圈粤文 NLP 资源：粤文建议用字表、常用字表、粤语本字表、香港特殊词语、hardmaru/cantonese-list、rime-cantonese 词表。

结论是：200-500 条高辨识度 marker 体积小但不够用。完整字典体积大，而且很多汉字是普通话和粤语共用的。

Perplexity 上我也问了更系统的问题：

> 我要做一个判断文本是 mandarin 还是 cantonese 的功能，目前想到的方案是字表启发，有没有成熟的字典/库可以做到？

得到的建议是做一个两阶段方案，是之前两个方案的融合：规则打分 + 统计分类兜底。第一层用粤语特征词、虚词、句末助词做高精度判断；第二层用 fastText/fastlangid 补判。重点看这些特征：

- 粤语专属字：佢 哋 嘅 咗 喺 冇 唔 乜 嘢 嚟
- 多字词：有冇、係咪、做咩、點解、而家
- 普通话对照：的 了 在 没 什么 为什么

但是单靠字表很难把"书面粤语 vs 书面普通话"做稳，尤其遇到共用汉字、正式文体、短文本时误判会明显上升。

## 九、Node 版 fastLangID vs Python 版 fastlangid

> 能用别人写的就不要自己造轮子

> pnpm add fastLangID 的 Node 版 fastLangID 好像和 python 那个不是一个项目。我应该让 lyric-romanizer 同时用 node 和 python，还是把 fastLangID 移植过去？

Node 版 fastLangID 是另一个项目，基于 fastText.js，返回普通语言码。Currents Lab 的 Python 版才有第二阶段模型和 zh-yue 支持。

即使假设可以移植，Python 仍更适合。要移植意味着在 Node/TypeScript 中复现 fastText 推断、第二阶段模型、特征工程和模型加载。这项工作接近重新开发一个语言识别库。

把 Python fastlangid 直接塞进 lyric-romanizer 运行时的想法到这里已经基本放弃了。一个 NPM 包依赖 Python runtime，会带来跨平台安装、CI、Electron、serverless 和浏览器兼容问题。

## 十、fastlangid 实测：《皇后大道東》仍然失败

我决定实际测试 fastlangid：

> 这首罗大佑的《皇后大道东》歌词，fastlangid 库没能正确识别为粤语。

结果：
- zh-hant（繁体中文）：98.18%
- zh-yue（粤语）：1.82%
- zh-hans（简体中文）：~0.005%

即使专门支持粤语识别的 fastlangid，也无法稳定识别书面化粤语歌词。因为《皇后大道東》的文本层面太像繁体中文，文字没有足够的粤语口语 marker。

## 十一、开始怀疑自动检测这条路

> 我在想是否要允许用户手动标注歌词的语言。但是这样的话，不可能允许他们分行标注语言，只能标注整首歌的语言。但这样的话就会导致：如果一首歌里出现多种语言，就没法被正确识别。

建议是保留整首歌级别的 dialect 显式覆盖，混合语言场景可以通过歌词块或上层调用方拆分处理。

> 我还是觉得加入口语化的粤语专用字和香港独有词会是一个很不准确的判断方法，fastlangid 对粤语书面语效果也不行，手动让用户来判断可能还更精准一点。你觉得完全交给怎么样接入 lyric-romanizer 的软件来选择拼音还是 jyutping 怎么样？

原来我想让 lyric-romanizer 自己判断文本是 Mandarin 还是 Cantonese。现在我开始倾向于：lyric-romanizer 只负责转换，不负责做高风险语言判断。上层应用、歌词插件、播放器或数据源更了解歌曲语言。它们可以根据歌曲 metadata、用户选择、歌手信息或平台语言标签来决定调用 pinyin-pro 还是 to-jyutping。

## 十二、外部调研：正确的检测接近另一个项目

我又换到 Perplexity 做外部研究，把调研结果发给 ChatGPT：

> 针对这个自动检测逻辑怎么处理的问题我做了一些研究。

那份研究提出了一套更完整的方案：用 PyCantonese、Cifu、awesome-cantonese-nlp、fastlangid、OpenCC 等资源构建规则打分 + 统计分类系统。用粤语专属字、多字词、普通话对照词、句式特征、分词、权重、阈值、unknown/mixed 输出等方式来判断。建议 Python 仅用于离线生成词表，NPM 运行时只带 JSON 和 TypeScript 推理代码。

我意识到这套方案已经不再是给 lyric-romanizer 加一个功能，而是在做一个"中文语言变体检测器"，已经偏离了初衷。

## 最终决定：显式参数

> 这样好复杂啊，感觉完全在做一个别的项目了，要不就在 lyric-romanizer 调用的时候默认用拼音。

> 给我写个 prompt 给现在的 lyric-romanizer 加一个用 to-jyutping 的参数，并把目前简陋的识别规则去掉。

最终方案：

```typescript
// 普通话（默认）
romanizer.romanizeLine('床前明月光')
// 'chuáng qián míng yuè guāng'

// 粤语，显式开启
romanizer.romanizeLine('床前明月光', { dialect: 'cantonese' })
// 'cong4 cin4 ming4 jyut6 gwong1'
```

删掉 cantonese-detector.ts。删掉自动检测逻辑。保留 dialect 参数。

## 这次探索给我的结论

给 lyric-romanizer 加粤语功能，难点完全不在 Jyutping 转换，而在书面语和发音系统之间的错位。

普通话、日语、韩语、罗马字语言之间的判断相对清楚，字符集差异很明显。Mandarin 和 Cantonese 共用大量汉字，尤其在正式歌词、书面歌词、港台繁体歌词里，光看文本很难判断到底应该按普通话读还是按粤语读。

我经历了几个方向变化：

1. 一开始，我想构建一个完整的粤语版 pinyin-pro
2. 后来，我发现可以直接用 to-jyutping
3. 再后来，我想自动判断繁体中文属于 Mandarin 还是 Cantonese
4. 然后我尝试字表启发、fastlangid、词典扩展、规则引擎
5. 接着我发现这些方案都会在书面粤语歌词上失败或变复杂
6. 最后，我决定把判断权交给调用方

粤语和普通话的界限不在字符层面，而在语音层面。书面粤语大量使用标准汉字，看字无法区分。要准确识别，得做完整的语言模型分析。lyric-romanizer 是歌词罗马化工具，不是语言识别研究项目。
