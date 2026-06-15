import type { Locale } from './locale';

export const description: Record<Locale, string> = {
  en: 'Writing about design, code, and the messy space in between.',
  zh: '记录人与技术，以及两者之间作为环境的媒介。',
};

export const role: Record<Locale, string> = {
  en: 'I eat frozen food a lot.',
  zh: '我吃很多速冻食品',
};

export const about: Record<Locale, string[]> = {
  en: [
    'This blog will probably cover three kinds of things.',
    'First, the thinking behind projects and works.',
    'Second, observations about design, media, AI, and the internet.',
    'Third, notes on workflows, tools, and explorations.',
  ],
  zh: [
    '这个博客大概会写三种东西。',
    '一是项目和作品背后的想法。',
    '二是设计、媒介、AI 和互联网相关的观察。',
    '三是一些工作流、工具和探索记录。',
  ],
};

export const nav = {
  en: { posts: 'Posts', tags: 'Tags', about: 'About' },
  zh: { posts: '文章', tags: '标签', about: '关于' },
};

export const tags = {
  Animation: { en: 'Animation', zh: '动画' },
  Automation: { en: 'Automation', zh: '自动化' },
  CLI: { en: 'CLI', zh: '命令行' },
  Experience: { en: 'Experience', zh: '经历' },
  Finance: { en: 'Finance', zh: '财务' },
  Games: { en: 'Games', zh: '游戏' },
  Info: { en: 'Info', zh: '信息' },
  'LLM-free': { en: 'LLM-free', zh: 'LLM-free' },
  Reprint: { en: 'Reprint', zh: '转载' },
  Screen: { en: 'Screen', zh: '影视' },
  Thoughts: { en: 'Thoughts', zh: '思考' },
  Tools: { en: 'Tools', zh: '工具' },
  Translated: { en: 'Translated', zh: '翻译' },
  Writing: { en: 'Writing', zh: '文字' },
  Workflow: { en: 'Workflow', zh: '工作流' },
} as const;
