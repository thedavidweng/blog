export const defaultLocale = 'en' as const;
export const locales = ['en', 'zh'] as const;

export type Locale = (typeof locales)[number];

export const siteConfig = {
  name: 'David Blog',
  author: 'David',
  handle: '@thedavidweng',
  description: {
    en: 'Writing about design, code, and the messy space in between.',
    zh: '记录设计、代码，以及两者之间不整洁但真实的空间。'
  },
  role: {
    en: 'Design Technologist',
    zh: '设计技术人'
  },
  nav: {
    en: {
      posts: 'Posts',
      tags: 'Tags',
      about: 'About'
    },
    zh: {
      posts: '文章',
      tags: '标签',
      about: '关于'
    }
  },
  tags: {
    Animation: {
      en: 'Animation',
      zh: '动画'
    },
    Experience: {
      en: 'Experience',
      zh: '经历'
    },
    Finance: {
      en: 'Finance',
      zh: '金钱'
    },
    Games: {
      en: 'Games',
      zh: '游戏'
    },
    Info: {
      en: 'Info',
      zh: '信息'
    },
    'LLM-free': {
      en: 'LLM-free',
      zh: 'LLM-free'
    },
    Reprint: {
      en: 'Reprint',
      zh: '转载'
    },
    Screen: {
      en: 'Screen',
      zh: '影视'
    },
    Thoughts: {
      en: 'Thoughts',
      zh: '思考'
    },
    Tools: {
      en: 'Tools',
      zh: '工具'
    },
    Translated: {
      en: 'Translated',
      zh: '翻译'
    },
    Writing: {
      en: 'Writing',
      zh: '文字'
    }
  },
  social: [
    {
      label: 'GitHub',
      href: 'https://github.com/thedavidweng',
      icon: 'github'
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/thedavidweng/',
      icon: 'linkedin'
    },
    {
      label: 'Portfolio',
      href: 'https://davidweng.eu.org/',
      icon: 'portfolio'
    },
    {
      label: 'Homepage',
      href: 'https://thedavidweng.github.io/',
      icon: 'home'
    }
  ]
} as const;

export function getBaseUrl() {
  return process.env.PUBLIC_SITE_URL || process.env.CF_PAGES_URL || 'http://localhost:4321';
}

export function getLocaleBase(locale: Locale) {
  return locale === defaultLocale ? '' : `/${locale}`;
}

export function localizedPath(locale: Locale, path = '/') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (locale === defaultLocale) return cleanPath;
  return `${getLocaleBase(locale)}${cleanPath === '/' ? '/' : cleanPath}`;
}

export function absoluteUrl(path = '/') {
  return new URL(path, getBaseUrl()).toString();
}
