---
title: "我如何用三个 CLI 工具取代文档创建需求"
locale: zh

description: "四月的一天我突然意识到我几乎从来不需要从一张白纸开始创建最终会导出成 PDF 的文档。日常打开电脑，大部分时间我都是在填别人发来的东西。真正需要我自己从头写的并且导出的，算来算去就三样：简历、发票、求职信。"
publishedDate: 2026-04-28
tags:
  - Tools
  - Workflow
  - CLI
draft: false
---

> 本文同时发布于[少数派](https://sspai.com/post/109187)。

四月的一天我突然意识到我几乎从来不需要从一张白纸开始创建最终会导出成 PDF 的文档。

日常打开电脑，大部分时间我都是在填别人发来的东西。真正需要我自己从头写的并且导出的，算来算去就三样：简历、发票、求职信。

场景这么明确，我就想能不能把这三样东西全部自动化，从我的工作流里把创建文档这件事彻底拿掉。

## 核心原则

我的需求：**不保存 PDF，只保存生成 PDF 的源文件。**

PDF 是最终产物，但没法 diff，没法批量修改。我希望把源文件用纯文本管好，需要的时候一条命令现场生成 PDF，硬盘和脑子都清净。

## 1. 简历：JSON Resume + resumed

简历的大致内容常年不变，但是会有增添删减的需求。

我找到的方案是 [JSON Resume](https://jsonresume.org/)，一个开放的简历数据标准。简历的全部内容用 JSON 存，长这样：

```
{
  "basics": {
    "name": "David Weng",
    "email": "david@owo.lu"
  },
  "work": [
    {
      "name": "BC + AI Ecosystem",
      "position": "ContentOps & Graphic Designer",
      "startDate": "2025-11-01",
      "highlights": ["Designed 50+ branded assets..."]
    }
  ]
}
```

把简历结构化之后，内容和样式就彻底分家了。渲染用 [resumed](https://github.com/rbardini/resumed)，一个命令行工具，一条命令把 JSON 变成 HTML 或 PDF：

```
npx resumed render resume.json \
  -t @jsonresume/jsonresume-theme-consultant-polished \
  -o resume.html
```

`resume.json` 是唯一的数据源。换个主题参数，同一份数据就能输出完全不同的排版。要针对不同岗位定制简历，只需要复制一份 JSON，改几个字段，根本不用碰排版代码。

这里正好顺便说一句：为什么简历不用 Typst？因为 JSON Resume 的方案从根本上解决了「换主题不换内容」的问题。它不是排版工具，是数据结构。我可以把工作经历、技能、项目全部模块化存着，投不同公司时像搭乐高一样挑选组合，生成不同的 `resume.json`，然后用 `resumed` 一键出 PDF，做到内容和形式分离，这是 LaTeX 或 Typst 给不了的灵活度。

JSON Resume 还有个在线 Registry。我把 `resume.json` 扔到 GitHub Gist，配一个 GitHub Actions 自动同步，之后任何时候访问 `registry.jsonresume.org/thedavidweng` 看到的都是最新版。

## 2. 发票：一条命令出票

发票的需求极其单纯：填几个字段，生成一张格式标准的 PDF。

我最初用的是 [Invoify](https://github.com/al1abb/invoify)，一个浏览器里的发票生成器。它其实挺好用，填完的表单还能导出成 JSON，下次当模板导入。但它离不开浏览器，没法在终端里自动化，也就没法脚本化，每次还是要手动点几下。

后来我切到了 [maaslalani/invoice](https://github.com/maaslalani/invoice)，一个纯 CLI 的发票工具：

```
invoice generate \
  --from "David Weng" \
  --to "Client Inc." \
  --item "Consulting" --quantity 10 --rate 50 \
  --tax 0.05 \
  --note "Due within 30 days."
```

一条命令，一张发票。不用打开浏览器，不用看任何图形界面。

这下工作流就清爽了：我在 Obsidian 的笔记里，用代码块存每张发票的生成命令。硬盘里一张 PDF 都不留。需要哪张发票，复制那条命令跑一下，生成 PDF。发票的源文件就是 CLI 命令本身。

## 3. 求职信：从 LaTeX 到 Typst

### 第一次尝试：LaTeX

LaTeX 的格式控制精细到像素。用来写求职信有些大炮打蚊子。

最劝退的是体积。MacTeX 完整安装超过 4 GB，哪怕是 BasicTeX 也得好几百兆。虽然 LaTeX 的语法对 AI 不太友好，标记绕一点容易出错。

### 最终方案：Typst

后来我发现了 [Typst](https://typst.app/)，一个现代的排版系统，比 LaTeX 简单。

求职信的源文件变成了这样：

```
#set page(paper: "a4", margin: 1in)
#set text(font: "Times New Roman", size: 11pt)
#set par(justify: true)

#align(right)[
  David Weng \
  david@owo.lu \
  Vancouver, BC, Canada
  #v(0.4em)
  April 28, 2026
]

#v(1.6em)

Hiring Committee \

#v(1.5em)

Dear Hiring Committee...

#v(0.8em)
#align(right)[
  Sincerely,
  #v(0.55em)
  David Weng
]
```

可读性几乎接近纯文本，生成 PDF 同样一条命令：

```
typst compile cover-letter.typ
```

|          | LaTeX | Typst |
| -------- | ----- | ----- |
| 安装体积 | 2–4 GB | ~40 MB |
| 语法复杂度 | 高 | 接近 Markdown |
| 编译速度 | 秒级 | 毫秒级 |
| AI 友好度 | 低 | 高 |

## 技能化：把三个工具变成可复用的命令

我把这三个流程打包成了三个可复用的技能，加入了我的 Skill 仓库：[https://github.com/thedavidweng/skills/tree/main/document-generation](https://github.com/thedavidweng/skills/tree/main/document-generation)

## 最终工作流

三种文档，三个工具，三个技能，各管一摊：

| 文档 | 工具 | 源文件格式 | 生成命令 |
| --- | --- | --- | --- |
| 简历 | JSON Resume + resumed | `.json` | `npx resumed render` |
| 发票 | maaslalani/invoice | CLI 命令本身 | `invoice generate` |
| 求职信 | Typst | `.typ` | `typst compile` |

它们共享一个原则：**源文件全是纯文本。** 能用 Git 管，能用任何编辑器改，能被 AI 读写和理解。PDF 只是临时生成的编译产物，随用随扔。

这套工作流把我从「打开 Word → 手动调排版 → 导出 PDF → 存到一个忘了叫什么的文件夹」的循环里捞了出来。现在我的文档管理就是代码管理：写源文件，进对技能目录，跑命令，完事。

## 链接

- JSON Resume：[https://jsonresume.org](https://jsonresume.org/)
- resumed：[https://github.com/rbardini/resumed](https://github.com/rbardini/resumed)
- maaslalani/invoice：[https://github.com/maaslalani/invoice](https://github.com/maaslalani/invoice)
- Typst：[https://typst.app](https://typst.app/)
- 我的技能库：[https://github.com/thedavidweng/skills/tree/main/document-generation](https://github.com/thedavidweng/skills/tree/main/document-generation)
