import type { Locale } from '../lib/locale';

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

const en = {
  dateLocale: 'en-US',
  homeTitle: 'Blog',
  aboutTitle: 'About',
  tagsTitle: 'Tags',
  tagsDescription: 'Browse posts by tag.',
  tagsHero: 'Browse posts by topic.',
  tagEyebrow: 'Tag',
  articleTags: 'Article tags',
  postNav: 'Post navigation',
  prevPost: 'Previous',
  nextPost: 'Next',
  relatedHeading: 'Related Posts',
  relatedLabel: 'Related posts',
  skipToContent: 'Skip to content',
  navLandmark: 'Primary navigation',
  socialLandmark: 'External links',
  toolbarLandmark: 'Theme and language',
  themeToggle: 'Toggle light or dark theme',
  switchLocale: 'Switch to Chinese',
  tocTitle: 'Table of Contents',
  backToTop: 'Back to top',
  aboutName: (author: string) => `About ${author}`,
  aboutDescription: (author: string) => `About ${author}.`,
  taggedDescription: (label: string) => `Posts tagged ${label}.`,
  publishedOn: (date: string) => `Published on ${date}`,
  readingTime: (minutes: number) => ` · ${minutes} min read`,
};

export const ui: Record<Locale, typeof en> = {
  en,
  zh: {
    dateLocale: 'zh-CN',
    homeTitle: '博客',
    aboutTitle: '关于',
    tagsTitle: '标签',
    tagsDescription: '按标签浏览文章。',
    tagsHero: '按主题浏览文章。',
    tagEyebrow: '标签',
    articleTags: '文章标签',
    postNav: '文章导航',
    prevPost: '上一篇',
    nextPost: '下一篇',
    relatedHeading: '相关文章',
    relatedLabel: '相关文章',
    skipToContent: '跳到正文',
    navLandmark: '主导航',
    socialLandmark: '外部链接',
    toolbarLandmark: '主题与语言',
    themeToggle: '切换浅色或深色主题',
    switchLocale: 'Switch to English',
    tocTitle: '目录',
    backToTop: '回到顶部',
    aboutName: (author: string) => `关于 ${author}`,
    aboutDescription: (author: string) => `关于 ${author}。`,
    taggedDescription: (label: string) => `标签 ${label} 下的文章。`,
    publishedOn: (date: string) => `发布于 ${date}`,
    readingTime: (minutes: number) => ` · 约 ${minutes} 分钟阅读`,
  },
};

export const t = (locale: Locale) => ui[locale];

export function publishedLabel(locale: Locale, date: Date) {
  const formatted = date.toLocaleDateString(ui[locale].dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
  return ui[locale].publishedOn(formatted);
}

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

export function tagLabel(locale: Locale, tag: string) {
  const labels = tags[tag as keyof typeof tags];
  if (!labels) {
    throw new Error(`Unknown tag "${tag}". Add it to the tags table in src/config/i18n.ts.`);
  }
  return labels[locale];
}
