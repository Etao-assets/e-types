import { z } from 'zod';
import { TwoFAEvents } from './bse/enums/v2Events2fa';

export const TwoFARequestBodySchema = z.object({
  eventType: z.nativeEnum(TwoFAEvents),
  bseMandateReqId: z.string().optional(), // Optional, only needed for certain event types
  bseSxpId: z.string().optional(), // Optional, only needed for SxP event types
});

export type TwoFARequestBody = z.infer<typeof TwoFARequestBodySchema>;

export const TwoFALinkResultSchema = z.object({
  '2fa_url': z.string(),
});

export type TwoFALinkResult = z.infer<typeof TwoFALinkResultSchema>;

