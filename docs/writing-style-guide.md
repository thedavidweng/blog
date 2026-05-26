# Writing Style Guide

A concise guide for bilingual (Chinese/English) technical and analytical writing.

---

## 1. Core Voice

- Direct, no fluff.
- Cold humor only as rare accent — never forced.
- Use first person primarily; "you" for direct address sparingly. Avoid "we" / "everyone".
- Not academic, not bureaucratic, not ingratiating.
- Express emotion through facts, not adjectives.
- **Explain just enough**: one or two sentences per term/concept. No tangents, no showing off.

**Attitude boundaries**:
- Criticize, question, satirize — but only with factual basis.
- No vague negativity; anger needs a specific target.
- No personal attacks, no blanket statements about groups.

---

## 2. Structure & Flow

**Opening**:
- Get to the point immediately. No filler introductions.

**Headings**:
- Keep hierarchy shallow (`##` mainly, `###` sparingly).
- Use objective nouns or short phrases ("Background", "Process", "Results").
- Within an article, sequence sections in parallel: basics → advanced, or background → process → outcome.

**Paragraphs**:
- Short paragraphs (1–3 sentences) for scanability.
- Leave blank lines between sections; no blank line between heading and body.

**Data points / timelines**:
- Each entry records only **action** and **result**. No judgement, no explanation of reasoning, no commentary.
- Background section lists only conditions essential to reproduction. Omit the rest.
- Cite external sources with a direct link; do not explain what the source is.
- End immediately after the final result. No summary, no展望, no evaluation.

---

## 3. Sentence-Level Rules

**Rhythm**:
- Prefer short sentences. Medium occasionally. Long rarely.
- Use commas to join clauses. **No em dashes (—)**, no dashes joining clauses. Sentences stand independently.
- No semicolons as connectors.

**Bilingual spacing**:
- Half-width space between Chinese and English/digits: `通过 Global Transfer 转账` ✓
- Space between number and unit: `A$9,000` ✓
- On first use, gloss foreign terms: `DD（Direct Deposit，直接存款）`

**Colloquialism**:
- No cheesy sign-offs ("hope this helps", "happy to help").
- No fake familiarity ("大家", "小伙伴们", "folks").
- No filler phrases ("简单来说", "顾名思义", "这里给大家解释一下").
- Mild colloquialism is fine for logical flow ("而", "但", "因此", "so", "but"). Not for decoration.
- No overused internet slang, no performative interjections.

**Data & references**:
- Be specific: numbers, names, dates, thresholds.
- Qualify uncertainty with "据称" / "in most cases".
- Inline links (not footnotes). Use standard Markdown `[text](URL)` format.

---

## 4. Typography & Punctuation

### Spacing

- Chinese/English mixed: add half-width space between them.
- Chinese/number mixed: add half-width space.
- Number/unit: add space (`458 ppi`, `625 cd/m²`).
- Operators: add space around them (`20 ± 2%`, `p < 0.01`).
- No space: currency symbol next to number (`￥10`), percent next to number (`5%`), inside brackets/parentheses.

### Chinese Punctuation (use full-width)

- Period `。`, comma `，`, question `？`, exclamation `！`, colon `：`, semicolon `；`, parentheses `（）`, quotation marks `「」`, book-title marks `《》`, ellipsis `……`, dash `——`
- Use full-width parentheses for Chinese text with English annotations: `The Beatles（1968）`
- Period goes outside parenthetical at end of sentence: `（见第 26 页）。`
- Use `「」` for quotation marks in Chinese.
- Use `《》` for book/film/article titles.

### English Punctuation (use half-width)

- Period `.`, comma `,`, question `?`, exclamation `!`, colon `:`, semicolon `;`, parentheses `()`, quotation marks `""`, ellipsis `...`, hyphen `-`
- Complete English sentences embedded in Chinese use half-width punctuation: `乔布斯说过：「Stay hungry, stay foolish.」`
- English list items: use comma for enumeration (no顿号 in English).
- English book/film titles: use *italics*, not 《》.

### Exclamation Marks

- Use sparingly. Prefer calm, rational expression.

### Ellipsis

- Chinese: `……` (six dots, two characters). Do not combine with "等" / "etc."
- English: `...` (three dots). Space before and after.

### Enumerations

- Use 顿号 `、` for parallel adjectives in Chinese.
- Use comma `,` for parallel items in English.
- Do not mix them.

### Number Ranges

- Prefer "至" / "to" over 浪纹号 `～` or tilde `~`.
- `亩产 1000 公斤至 1500 公斤` ✓

### Lists

- Bullet items: no trailing punctuation unless each item is a full sentence.
- Ordered lists: space after the period (`1. item`).

### Prohibited

- **No em dash (—)** for joining clauses. Rewrite as separate sentences.
- **No semicolons** as clause connectors.
- **No double exclamation** `!!` or repeated punctuation.
- **No the Oxford comma** in Chinese contexts—use 顿号 instead.

---

## 5. Vocabulary & Style

- Respect proper noun capitalization: `GitHub`, `iOS`, `macOS`, `Wi-Fi`, `App Store`.
- Use "你" for general address; use "您" only for specific individuals in formal contexts.
- Do not call readers "粉丝" / "fans". Use "用户" / "users" or "读者" / "readers".
- Use `的`/`地`/`得` correctly.
- Prefer active voice.
- Prefer affirmative sentences over negative ones.
- Avoid weak verbs like "造成" / "进行" — use stronger direct verbs.
- Avoid compound sentences when simple or coordinate sentences suffice.
- Minimize conjunctions; let logical flow speak for itself.

---

## 6. Anti-Patterns (Blacklist)

| Category | Examples |
|---|---|
| Cheesy endings | "希望这篇对你有帮助", "最后祝大家……" |
| False familiarity | "大家", "小伙伴们", "朋友们" |
| Filler phrases | "简单来说", "顾名思义", "这里给大家解释一下" |
| Overdone metaphors | Only use established jargon; do not coin new metaphors |
| Concluding remarks | "以上就是……", "至此，你已经掌握了……" |
| Process commentary | "不是盲猜", "过程顺利", "确认有效" |
| Tool explanations | When citing a source, just link — don't explain what it is |
| Summary after results | End. Do not summarize,展望, or evaluate |

---

## 7. Revision Checklist

- [ ] Does every opening sentence get to the point immediately?
- [ ] Are paragraphs short (1–3 sentences)?
- [ ] Are there any em dashes or semicolons? Remove them.
- [ ] Is spacing correct: Chinese/English, Chinese/number, number/unit?
- [ ] Are proper nouns capitalized correctly?
- [ ] Any cheesy endings, filler phrases, or false familiarity? Delete or neutralize.
- [ ] Do data/timeline entries contain only action and result? No commentary?
- [ ] Does the article end immediately after the final result? No summary or展望?
