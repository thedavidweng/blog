import { getCollection } from 'astro:content';
import type { Locale } from './locale';
import {
  collectTags,
  pairPostsBySlug,
  publishedPosts,
  translatedPairs,
  type TranslatedPostPair,
} from './posts';

export async function getPublishedPosts(locale?: Locale) {
  return publishedPosts(await getCollection('posts'), locale);
}

export async function assertTranslatedPostPairs(): Promise<TranslatedPostPair[]> {
  return translatedPairs(pairPostsBySlug(await getPublishedPosts()));
}

export async function getTags(locale: Locale) {
  return collectTags(await getPublishedPosts(locale));
}
