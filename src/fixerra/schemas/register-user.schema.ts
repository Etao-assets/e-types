/**
 * Fixerra user registration — request and response schemas
 */

import { z } from 'zod';

// ── Our API → Fixerra Request ─────────────────────────────────────────────────

export const fixerraRegisterUserRequestSchema = z.object({
  /** Mobile number of the user */
  mobile: z.string().min(10).max(15),
});

export type FixerraRegisterUserRequest = z.infer<
  typeof fixerraRegisterUserRequestSchema
>;

// ── Fixerra → Our API Response ────────────────────────────────────────────────

export const fixerraRegisterUserResponseSchema = z.object({
  /** Unique partner user identifier issued by Fixerra */
  f_partner_user_id: z.string(),
  /** Our global partner ID as acknowledged by Fixerra */
  f_partner_id: z.string(),
  /** Optional referral / deep-link URL returned by Fixerra */
  referral_link: z.string().optional(),
});

export type FixerraRegisterUserResponse = z.infer<
  typeof fixerraRegisterUserResponseSchema
>;

// ── Our API → Client Response ─────────────────────────────────────────────────

export const registerUserApiResponseSchema = z.object({
  /** The platform user ID */
  userId: z.string(),
  /** Mobile number of the user */
  mobile: z.string(),
  /** Unique partner user identifier issued by Fixerra */
  fPartnerUserId: z.string(),
  /** Our global partner ID as acknowledged by Fixerra */
  fPartnerId: z.string(),
  referralLink: z.string().optional(),
  /** true if the user was registered during this call, false if already REGISTERED */
  isNewRegistration: z.boolean(),
});

export type RegisterUserApiResponse = z.infer<typeof registerUserApiResponseSchema>;
