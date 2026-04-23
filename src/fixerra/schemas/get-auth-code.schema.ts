/**
 * Fixerra auth code generation — request and response schemas
 */

import { z } from 'zod';

// ── Our API → Fixerra Request ─────────────────────────────────────────────────

export const fixerraGetAuthCodeRequestSchema = z.object({
  /** Encrypted mobile number of the user — do not log */
  mobile: z.string().min(1),
});

export type FixerraGetAuthCodeRequest = z.infer<
  typeof fixerraGetAuthCodeRequestSchema
>;

// ── Fixerra → Our API Response ────────────────────────────────────────────────

export const fixerraGetAuthCodeResponseSchema = z.object({
  /** Decrypted mobile number echoed back by Fixerra */
  decrypted: z.string(),
  /** Session identifier (may be empty) */
  sessionId: z.string(),
  /** Partner code used for the request */
  partner_code: z.string(),
  /** Encrypted auth code returned by Fixerra — do not log */
  authcode: z.string(),
});

export type FixerraGetAuthCodeResponse = z.infer<
  typeof fixerraGetAuthCodeResponseSchema
>;

// ── Our API → Client Response ─────────────────────────────────────────────────

export const getAuthCodeApiResponseSchema = z.object({
  /** Expiry timestamp exposed to client */
  expiresAt: z.string(),
});

export type GetAuthCodeApiResponse = z.infer<typeof getAuthCodeApiResponseSchema>;
