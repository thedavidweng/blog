import { z } from 'zod';

export const postSchema = z.object({
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
});

export type PostFrontmatter = z.infer<typeof postSchema>;
