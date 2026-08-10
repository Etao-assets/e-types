import { z } from 'zod';

/**
 * A single admin-published story as served to the mobile app by GET /api/stories.
 *
 * v1 is image-only: no caption, no call-to-action. The CTA was deferred pending
 * a decision on whether stories may link to internal app routes only or to
 * arbitrary external URLs.
 */
export const StorySchema = z.object({
  id: z.string(),
  /** Fully-qualified S3 URL. The database stores the key; the API hydrates it. */
  imageUrl: z.string().url(),
  /** Display position, ascending. */
  order: z.number().int(),
  /** ISO-8601 instant at which the story became visible. */
  publishedAt: z.string(),
  /** ISO-8601 instant at which the story stops being served (publishedAt + 24h). */
  expiresAt: z.string(),
});

export type Story = z.infer<typeof StorySchema>;
