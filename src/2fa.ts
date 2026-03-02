import { z } from "zod";

export const TwoFALinkResultSchema = z.object({
  '2fa_url': z.string(),
});

export type TwoFALinkResult = z.infer<typeof TwoFALinkResultSchema>;