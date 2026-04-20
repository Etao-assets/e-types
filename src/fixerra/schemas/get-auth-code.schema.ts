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
  /** Encrypted auth code returned by Fixerra — do not log */
  auth_code: z.string(),
  /** ISO 8601 expiry timestamp */
  expires_at: z.string(),
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
