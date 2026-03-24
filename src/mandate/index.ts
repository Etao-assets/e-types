import { z } from 'zod';

export const MandateActionsSchema = z.object({
  cancel: z.boolean().optional(),
});
export type MandateActions = z.infer<typeof MandateActionsSchema>;

export const MandateActionResultSchema = z.object({
  cancel: z
    .object({
      canCancel: z.boolean(),
      visible: z.boolean(),
    })
    .optional(),
});
export type MandateActionResult = z.infer<typeof MandateActionResultSchema>;
