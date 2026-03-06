import { z } from 'zod';
import { TwoFAEvents } from './bse/enums/v2Events2fa';

export const TwoFARequestBodySchema = z.object({
  eventType: z.nativeEnum(TwoFAEvents),
});

export type TwoFARequestBody = z.infer<typeof TwoFARequestBodySchema>;

export const TwoFALinkResultSchema = z.object({
  '2fa_url': z.string(),
});

export type TwoFALinkResult = z.infer<typeof TwoFALinkResultSchema>;
