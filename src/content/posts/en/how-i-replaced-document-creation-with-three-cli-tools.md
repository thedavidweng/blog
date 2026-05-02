---
title: "How I Replaced Document Creation with Three CLI Tools"
locale: en
slug: "cli-tools-replace-document-creation"
description: "One day in April, I realized I almost never need to create a PDF-bound document from scratch. Most of the time I'm just filling out something someone else sent me. The things I actually need to write and export from scratch boil down to three: resume, invoice, and cover letter."
publishedDate: 2026-04-28
tags:
  - Tools
  - Workflow
  - CLI
draft: false
---

> This article is also published on [SSPAI](https://sspai.com/post/109187).

One day in April, I realized I almost never need to create a PDF-bound document from scratch. Most of the time I'm just filling out something someone else sent me. The things I actually need to write and export from scratch boil down to three: resume, invoice, and cover letter.

With such clear use cases, I wondered if I could automate all three and completely remove "document creation" from my workflow.

## Core Principle

My requirement: **Don't save PDFs. Only save the source files that generate PDFs.**

PDF is a final artifact, but you can't diff it, and you can't batch-modify it. I want to manage source files as plain text, and generate PDFs on demand with a single command. Clean disk, clean mind.

## 1. Resume: JSON Resume + resumed

The core content of a resume stays largely the same, but you occasionally need to add or remove items.

I found [JSON Resume](https://jsonresume.org/), an open resume data standard. All resume content is stored in JSON, like this:

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

Once the resume is structured, content and styling are completely separated. Rendering is handled by [resumed](https://github.com/rbardini/resumed), a command-line tool that turns JSON into HTML or PDF with a single command:

```
npx resumed render resume.json \
  -t @jsonresume/jsonresume-theme-consultant-polished \
  -o resume.html
```

`resume.json` is the single source of truth. Change the theme parameter and the same data outputs a completely different layout. To customize a resume for different positions, just duplicate the JSON, tweak a few fields, and you never have to touch layout code.

A side note: why not Typst for resumes? Because the JSON Resume approach fundamentally solves the "swap themes without touching content" problem. It's not a layout tool—it's a data structure. I can store work experience, skills, and projects as modular blocks, then assemble them like LEGO for different companies, generate different `resume.json` files, and use `resumed` to output a PDF with one click. This separation of content and form is something LaTeX or Typst can't match.

JSON Resume also has an online Registry. I dump my `resume.json` to a GitHub Gist, set up a GitHub Action to auto-sync, and from then on, visiting `registry.jsonresume.org/thedavidweng` always shows the latest version.

## 2. Invoice: One Command, One Invoice

The invoice need is dead simple: fill in a few fields, generate a properly formatted PDF.

I started with [Invoify](https://github.com/al1abb/invoify), a browser-based invoice generator. It's actually quite good—you can export the filled form as JSON and import it as a template next time. But it requires a browser and can't be automated in the terminal, which means no scripting. You still have to click a few buttons each time.

Later I switched to [maaslalani/invoice](https://github.com/maaslalani/invoice), a pure CLI invoice tool:

```
invoice generate \
  --from "David Weng" \
  --to "Client Inc." \
  --item "Consulting" --quantity 10 --rate 50 \
  --tax 0.05 \
  --note "Due within 30 days."
```

One command, one invoice. No browser, no GUI.

Now the workflow is clean: in my Obsidian notes, I store each invoice's generation command in a code block. Not a single PDF on my disk. Need an invoice? Copy the command, run it, get the PDF. The source file is the CLI command itself.

## 3. Cover Letter: From LaTeX to Typst

### First Attempt: LaTeX

LaTeX gives you pixel-level formatting control. Using it for a cover letter is using a sledgehammer to crack a nut.

The most discouraging part is the size. A full MacTeX installation is over 4 GB; even BasicTeX is several hundred MB. And LaTeX syntax isn't very AI-friendly—the markup is a bit twisty and error-prone.

### Final Solution: Typst

Then I discovered [Typst](https://typst.app/), a modern typesetting system that's much simpler than LaTeX.

A cover letter source file now looks like this:

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

Readability is almost like plain text, and generating a PDF is still one command:

```
typst compile cover-letter.typ
```

|                     | LaTeX    | Typst   |
| ------------------- | -------- | ------- |
| Installation size    | 2–4 GB  | ~40 MB  |
| Syntax complexity   | High     | Close to Markdown |
| Compilation speed   | Seconds  | Milliseconds |
| AI-friendliness     | Low      | High    |

## Skill-ifying: Turning Three Tools into Reusable Commands

I packaged these three workflows into three reusable skills and added them to my skill repository: [https://github.com/thedavidweng/skills/tree/main/document-generation](https://github.com/thedavidweng/skills/tree/main/document-generation)

## Final Workflow

Three document types, three tools, three skills, each handling its own lane:

| Document | Tool | Source Format | Generate Command |
| -------- | ---- | ------------- | ---------------- |
| Resume | JSON Resume + resumed | `.json` | `npx resumed render` |
| Invoice | maaslalani/invoice | CLI command itself | `invoice generate` |
| Cover Letter | Typst | `.typ` | `typst compile` |

They share one principle: **all source files are plain text.** They can be managed with Git, edited with any editor, and read/written/understood by AI. PDF is just a temporarily generated build artifact—generate when needed, discard after use.

This workflow pulled me out of the loop of "open Word → manually adjust layout → export PDF → save to a folder you'll forget the name of." Now my document management is just code management: write the source file, navigate to the skill directory, run the command, done.

## Links

- JSON Resume: [https://jsonresume.org](https://jsonresume.org/)
- resumed: [https://github.com/rbardini/resumed](https://github.com/rbardini/resumed)
- maaslalani/invoice: [https://github.com/maaslalani/invoice](https://github.com/maaslalani/invoice)
- Typst: [https://typst.app](https://typst.app/)
- My skill repository: [https://github.com/thedavidweng/skills/tree/main/document-generation](https://github.com/thedavidweng/skills/tree/main/document-generation)
