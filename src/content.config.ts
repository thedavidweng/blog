import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { postSchema } from './schemas/post';

const posts = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/posts',
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, ''),
  }),
  schema: postSchema,
});

export const collections = { posts };
