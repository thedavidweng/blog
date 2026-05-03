import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/posts',
    generateId: ({ entry }) => entry.replace(/\.md$/, '')
  }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    publishedDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string().min(1)).min(1),
    draft: z.boolean().default(false),
    slug: z.string().optional(),
    locale: z.enum(['en', 'zh']).optional(),
    /** When true, figure images are capped (e.g. product/card photos). */
    narrowFigures: z.boolean().optional(),
    /** Slugs of related posts to display at the bottom. */
    related: z.array(z.string()).optional()
  })
});

export const collections = { posts };
