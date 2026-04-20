/**
 * Fixerra registration status — DB-level response schema (no external API call)
 */

import { z } from 'zod';
import { FixerraRegistrationStatusEnum } from '../fixerraRegistration';

// ── Our API → Client Response ─────────────────────────────────────────────────

export const getFixerraRegistrationApiResponseSchema = z.object({
  isRegistered: z.boolean(),
  status: z.nativeEnum(FixerraRegistrationStatusEnum),
  fPartnerUserId: z.string().optional(),
  referralLink: z.string().optional(),
});

export type GetFixerraRegistrationApiResponse = z.infer<
  typeof getFixerraRegistrationApiResponseSchema
>;
