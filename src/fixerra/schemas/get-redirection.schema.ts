/**
 * Fixerra redirection URL retrieval — request and response schemas
 */

import { z } from 'zod';

// ── Our API → Fixerra Request (query params) ──────────────────────────────────

export const fixerraGetRedirectionRequestSchema = z.object({
  /** Encrypted auth code used as the `authCode` query parameter */
  authCode: z.string().min(1),
});

export type FixerraGetRedirectionRequest = z.infer<
  typeof fixerraGetRedirectionRequestSchema
>;

// ── Fixerra → Our API Response ────────────────────────────────────────────────

export const fixerraGetRedirectionResponseSchema = z.object({
  /** Deep-link or web URL to redirect the user into the Fixerra app */
  link: z.string().url(),
});

export type FixerraGetRedirectionResponse = z.infer<
  typeof fixerraGetRedirectionResponseSchema
>;

// ── Our API → Client Response ─────────────────────────────────────────────────

export const getRedirectionApiResponseSchema = z.object({
  link: z.string().url(),
});

export type GetRedirectionApiResponse = z.infer<
  typeof getRedirectionApiResponseSchema
>;
