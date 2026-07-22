import { z } from 'zod';

/** Request body for PATCH /community-goals/groups/:id/background */
export const UpdateGroupBackgroundSchema = z.object({
  backgroundImageUrl: z.string().max(1024).nullable(),
});
export type UpdateGroupBackground = z.infer<typeof UpdateGroupBackgroundSchema>;

export const UpdateGroupBackgroundResponseSchema = z.object({
  id: z.string(),
  backgroundImageUrl: z.string().nullable(),
  updatedAt: z.coerce.date(),
});
export type UpdateGroupBackgroundResponse = z.infer<typeof UpdateGroupBackgroundResponseSchema>;
